/** biome-ignore-all lint/suspicious/noExplicitAny: testing*/
import { getDb } from "@/server/db";

export type Lang = "en" | "de";

const pick = <T>(lang: Lang, en: T, de: T) => {
  return lang === "de" ? de : en;
};

export const getHeading = (lang: Lang) => {
  const db = getDb();
  const row = db
    .query(
      `SELECT
        name,
        subheadline_en, subheadline_de,
        headline_en, headline_de,
        address_en, address_de,
        email, phone, website, linkedin, github, instagram,
        age, years_of_experience, open_to_opportunities
      FROM heading
      WHERE id = 1`,
    )
    .get() as any;

  if (!row) return null;

  return {
    name: row.name,
    subheadline: pick(lang, row.subheadline_en, row.subheadline_de),
    headline: pick(lang, row.headline_en, row.headline_de),
    address: pick(lang, row.address_en, row.address_de),
    email: row.email,
    phone: row.phone,
    website: row.website,
    linkedin: row.linkedin,
    github: row.github,
    instagram: row.instagram,
    age: row.age,
    yearsOfExperience: row.years_of_experience,
    openToOpportunities: Boolean(row.open_to_opportunities),
  };
};

export const getAboutMe = (lang: Lang) => {
  const db = getDb();
  const rows = db
    .query(
      `SELECT sort_order, en, de
       FROM about_me
       ORDER BY sort_order ASC`,
    )
    .all() as any[];

  return rows.map((r) => ({
    text: pick(lang, r.en, r.de),
  }));
};

export const getEducation = (lang: Lang) => {
  const db = getDb();
  const rows = db
    .query(
      `SELECT
        sort_order, school, degree, duration,
        course_en, course_de,
        location_en, location_de,
        logo, certificate
      FROM education
      ORDER BY sort_order ASC`,
    )
    .all() as any[];

  return rows.map((r) => ({
    school: r.school,
    degree: r.degree,
    duration: r.duration,
    course: pick(lang, r.course_en, r.course_de),
    location: pick(lang, r.location_en, r.location_de),
    logo: r.logo,
    certificate: r.certificate,
  }));
};

export const getExecutiveSummary = (lang: Lang) => {
  const db = getDb();
  const rows = db
    .query(
      `SELECT sort_order, en, de
       FROM executive_summary
       ORDER BY sort_order ASC`,
    )
    .all() as any[];

  return rows.map((r) => pick(lang, r.en, r.de));
};

export const getExperience = (lang: Lang) => {
  const db = getDb();

  const experiences = db
    .query(
      `SELECT
        id, sort_order, company, duration, exact_duration,
        title_en, title_de,
        type_en, type_de,
        location_en, location_de,
        logo, link, certificate, meta_json
      FROM experience
      ORDER BY sort_order ASC`,
    )
    .all() as any[];

  const summaryStmt = db.query(
    `SELECT sort_order, en, de
     FROM experience_summary
     WHERE experience_id = ?
     ORDER BY sort_order ASC`,
  );

  const techStmt = db.query(
    `SELECT sort_order, name
     FROM experience_tech
     WHERE experience_id = ?
     ORDER BY sort_order ASC`,
  );

  const iconStmt = db.query(
    `SELECT sort_order, tech_id, title
     FROM experience_tech_icon
     WHERE experience_id = ?
     ORDER BY sort_order ASC`,
  );

  return experiences.map((e) => {
    const meta = e.meta_json ? JSON.parse(e.meta_json) : {};

    const summaryRows = summaryStmt.all(e.id) as any[];
    const techRows = techStmt.all(e.id) as any[];
    const iconRows = iconStmt.all(e.id) as any[];

    return {
      company: e.company,
      duration: e.duration,
      exactDuration: e.exact_duration,
      title: pick(lang, e.title_en, e.title_de),
      type: pick(lang, e.type_en, e.type_de),
      location: pick(lang, e.location_en, e.location_de),
      logo: e.logo,
      link: e.link,
      certificate: e.certificate,
      meta,
      summary: summaryRows.map((s) => pick(lang, s.en, s.de)),
      techStack: techRows.map((t) => t.name),
      techIcons: iconRows.map((t) => ({ id: t.tech_id, title: t.title })),
    };
  });
};

export const getSkills = (lang: Lang) => {
  const db = getDb();

  const groups = db
    .query(
      `SELECT id, sort_order, key_en, key_de
       FROM skills_group
       ORDER BY sort_order ASC`,
    )
    .all() as any[];

  const itemsStmt = db.query(
    `SELECT sort_order, bucket, name
     FROM skills_item
     WHERE group_id = ?
     ORDER BY bucket ASC, sort_order ASC`,
  );

  return groups.map((g) => {
    const items = itemsStmt.all(g.id) as any[];

    return {
      key: pick(lang, g.key_en, g.key_de),
      mostUsed: items.filter((i) => i.bucket === "most_used").map((i) => i.name),
      other: items.filter((i) => i.bucket === "other").map((i) => i.name),
    };
  });
};
