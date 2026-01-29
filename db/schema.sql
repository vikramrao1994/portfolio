PRAGMA foreign_keys = ON;

-- Single-row table
CREATE TABLE IF NOT EXISTS heading (
  id INTEGER PRIMARY KEY CHECK (id = 1),

  name TEXT NOT NULL,

  subheadline_en TEXT NOT NULL,
  subheadline_de TEXT NOT NULL,

  headline_en TEXT NOT NULL,
  headline_de TEXT NOT NULL,

  address_en TEXT NOT NULL,
  address_de TEXT NOT NULL,

  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  github TEXT,
  instagram TEXT,

  age TEXT,
  years_of_experience TEXT,

  open_to_opportunities INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS about_me (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  en TEXT NOT NULL,
  de TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  duration TEXT NOT NULL,

  course_en TEXT NOT NULL,
  course_de TEXT NOT NULL,

  location_en TEXT NOT NULL,
  location_de TEXT NOT NULL,

  logo TEXT,
  certificate TEXT
);

CREATE TABLE IF NOT EXISTS executive_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  en TEXT NOT NULL,
  de TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,

  company TEXT NOT NULL,
  duration TEXT NOT NULL,
  exact_duration TEXT,

  title_en TEXT NOT NULL,
  title_de TEXT NOT NULL,

  type_en TEXT NOT NULL,
  type_de TEXT NOT NULL,

  location_en TEXT NOT NULL,
  location_de TEXT NOT NULL,

  logo TEXT,
  link TEXT,
  certificate TEXT,

  meta_json TEXT
);

CREATE TABLE IF NOT EXISTS experience_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experience_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  en TEXT NOT NULL,
  de TEXT NOT NULL,
  FOREIGN KEY (experience_id) REFERENCES experience(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experience_tech (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experience_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (experience_id) REFERENCES experience(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experience_tech_icon (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experience_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  tech_id TEXT NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (experience_id) REFERENCES experience(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills_group (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  key_en TEXT NOT NULL,
  key_de TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skills_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  bucket TEXT NOT NULL CHECK (bucket IN ('most_used', 'other')),
  name TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES skills_group(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS personal_project (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  link TEXT,
  logo TEXT,
  project_en TEXT NOT NULL,
  project_de TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS personal_project_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  en TEXT NOT NULL,
  de TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES personal_project(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS personal_project_skill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES personal_project(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hobbies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  en TEXT NOT NULL,
  de TEXT NOT NULL
);
