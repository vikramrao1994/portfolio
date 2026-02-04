/** biome-ignore-all lint/suspicious/noExplicitAny: testing */
import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "portfolio.db");
const JSON_PATH = path.join(process.cwd(), "src", "data", "data.json"); // your prefetch writes here

const db = new Database(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

// Check if database already has data
const existingData = db.query("SELECT COUNT(*) as count FROM heading").get() as { count: number };
const forceImport = process.env.FORCE_DB_IMPORT === "true";

if (existingData.count > 0 && !forceImport) {
  console.log("⏭️  Database already has data, skipping import");
  console.log("   To force re-import, set FORCE_DB_IMPORT=true");
  db.close();
  process.exit(0);
}

console.log(
  forceImport ? "🔄 Force re-importing database..." : "📥 Seeding database for the first time...",
);

const raw = fs.readFileSync(JSON_PATH, "utf8");
const json = JSON.parse(raw);

const runImport = db.transaction(() => {
  // Wipe in dependency order (only if force importing)
  db.exec(`
    DELETE FROM experience_summary;
    DELETE FROM experience_tech;
    DELETE FROM experience_tech_icon;
    DELETE FROM experience;

    DELETE FROM education;
    DELETE FROM about_me;
    DELETE FROM executive_summary;

    DELETE FROM skills_item;
    DELETE FROM skills_group;

    DELETE FROM personal_project_summary;
    DELETE FROM personal_project_skill;
    DELETE FROM personal_project;

    DELETE FROM hobbies;
    DELETE FROM heading;
  `);

  // heading
  const h = json.heading;
  db.prepare(`
    INSERT INTO heading (
      id, name,
      subheadline_en, subheadline_de,
      headline_en, headline_de,
      address_en, address_de,
      email, phone, website, linkedin, github, instagram,
      age, years_of_experience, open_to_opportunities
    ) VALUES (
      1, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `).run(
    h.name ?? "",
    h.subheadline?.en ?? "",
    h.subheadline?.de ?? "",
    h.headline?.en ?? "",
    h.headline?.de ?? "",
    h.address?.en ?? "",
    h.address?.de ?? "",
    h.email ?? null,
    h.phone ?? null,
    h.website ?? null,
    h.linkedin ?? null,
    h.github ?? null,
    h.instagram ?? null,
    h.age ?? null,
    h.years_of_experience ?? null,
    h.open_to_oppertunities ? 1 : 0,
  );

  // about_me
  const aboutStmt = db.prepare("INSERT INTO about_me (sort_order, en, de) VALUES (?, ?, ?)");
  (json.about_me ?? []).forEach((p: any, i: number) => {
    aboutStmt.run(i, p.en ?? "", p.de ?? "");
  });

  // education
  const eduStmt = db.prepare(`
    INSERT INTO education (
      sort_order, school, degree, duration,
      course_en, course_de,
      location_en, location_de,
      logo, certificate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  (json.education ?? []).forEach((e: any, i: number) => {
    eduStmt.run(
      i,
      e.school ?? "",
      e.degree ?? "",
      e.duration ?? "",
      e.course?.en ?? "",
      e.course?.de ?? "",
      e.location?.en ?? "",
      e.location?.de ?? "",
      e.logo ?? null,
      e.certificate ?? null,
    );
  });

  // executive_summary
  const execStmt = db.prepare(
    "INSERT INTO executive_summary (sort_order, en, de) VALUES (?, ?, ?)",
  );
  (json.executive_summary ?? []).forEach((s: any, i: number) => {
    execStmt.run(i, s.en ?? "", s.de ?? "");
  });

  // experience + children
  const expStmt = db.prepare(`
    INSERT INTO experience (
      sort_order, company, duration, exact_duration,
      title_en, title_de,
      type_en, type_de,
      location_en, location_de,
      logo, link, certificate, meta_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const expSummaryStmt = db.prepare(`
    INSERT INTO experience_summary (experience_id, sort_order, en, de)
    VALUES (?, ?, ?, ?)
  `);

  const expTechStmt = db.prepare(`
    INSERT INTO experience_tech (experience_id, sort_order, name)
    VALUES (?, ?, ?)
  `);

  const expIconStmt = db.prepare(`
    INSERT INTO experience_tech_icon (experience_id, sort_order, tech_id, title)
    VALUES (?, ?, ?, ?)
  `);

  (json.experience ?? []).forEach((e: any, i: number) => {
    const meta = {
      location_picture: e.location_picture ?? null,
      sub_title: e.sub_title ?? null,
    };

    const r = expStmt.run(
      i,
      e.company ?? "",
      e.duration ?? "",
      e.exact_duration ?? null,
      e.title?.en ?? "",
      e.title?.de ?? "",
      e.type?.en ?? "",
      e.type?.de ?? "",
      e.location?.en ?? "",
      e.location?.de ?? "",
      e.logo ?? null,
      e.link ?? null,
      e.certificate ?? null,
      JSON.stringify(meta),
    );

    const expId = Number(r.lastInsertRowid);

    (e.summary ?? []).forEach((s: any, idx: number) => {
      expSummaryStmt.run(expId, idx, s.en ?? "", s.de ?? "");
    });

    (e.tech_stack ?? []).forEach((t: string, idx: number) => {
      expTechStmt.run(expId, idx, t);
    });

    (e.tech_stack_icons ?? []).forEach((t: any, idx: number) => {
      expIconStmt.run(expId, idx, t.id ?? "", t.title ?? "");
    });
  });

  // skills
  const groupStmt = db.prepare(
    "INSERT INTO skills_group (sort_order, key_en, key_de) VALUES (?, ?, ?)",
  );
  const itemStmt = db.prepare(
    "INSERT INTO skills_item (group_id, sort_order, bucket, name) VALUES (?, ?, ?, ?)",
  );

  (json.skills ?? []).forEach((g: any, i: number) => {
    const r = groupStmt.run(i, g.key?.en ?? "", g.key?.de ?? "");
    const groupId = Number(r.lastInsertRowid);

    (g.most_used_skills ?? []).forEach((name: string, idx: number) => {
      itemStmt.run(groupId, idx, "most_used", name);
    });

    (g.skills ?? []).forEach((name: string, idx: number) => {
      itemStmt.run(groupId, idx, "other", name);
    });
  });

  // personal_projects
  const projStmt = db.prepare(`
    INSERT INTO personal_project (sort_order, link, logo, project_en, project_de)
    VALUES (?, ?, ?, ?, ?)
  `);
  const projSumStmt = db.prepare(`
    INSERT INTO personal_project_summary (project_id, sort_order, en, de)
    VALUES (?, ?, ?, ?)
  `);
  const projSkillStmt = db.prepare(`
    INSERT INTO personal_project_skill (project_id, sort_order, name)
    VALUES (?, ?, ?)
  `);

  (json.personal_projects ?? []).forEach((p: any, i: number) => {
    const r = projStmt.run(
      i,
      p.link ?? null,
      p.logo ?? null,
      p.project?.en ?? "",
      p.project?.de ?? "",
    );
    const projectId = Number(r.lastInsertRowid);

    (p.summary ?? []).forEach((s: any, idx: number) => {
      projSumStmt.run(projectId, idx, s.en ?? "", s.de ?? "");
    });

    (p.skills_used ?? []).forEach((name: string, idx: number) => {
      projSkillStmt.run(projectId, idx, name);
    });
  });

  // hobbies
  const hobbyStmt = db.prepare("INSERT INTO hobbies (sort_order, en, de) VALUES (?, ?, ?)");
  (json.hobbies ?? []).forEach((h: any, i: number) => {
    hobbyStmt.run(i, h.en ?? "", h.de ?? "");
  });
});

runImport();
db.close();
console.log("✅ Database seeded successfully from src/data/data.json");
