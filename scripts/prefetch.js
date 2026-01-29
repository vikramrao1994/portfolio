import { Database } from "bun:sqlite";
import fs from "node:fs";
import https from "node:https";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const unzipper = require("unzipper");

const url = "https://alpha-dog-9ce25.firebaseio.com/.json";
const assetsUrl =
  "https://firebasestorage.googleapis.com/v0/b/alpha-dog-9ce25.appspot.com/o/assets.zip?alt=media";
const dest = "./src/data/data.json";
const assetsZipPath = "./public/assets.zip";
const dbPath = path.join(process.cwd(), "data", "portfolio.db");

// Check if database already has data
let shouldFetchJson = true;

if (fs.existsSync(dbPath)) {
  try {
    const db = new Database(dbPath);
    const result = db.query("SELECT COUNT(*) as count FROM heading").get();
    db.close();

    if (result.count > 0 && process.env.FORCE_DB_IMPORT !== "true") {
      console.log("⏭️  Database already has data, skipping JSON fetch");
      console.log("   To force re-fetch, set FORCE_DB_IMPORT=true");
      shouldFetchJson = false;
    }
  } catch (_err) {
    // Database exists but schema might not be ready yet, continue with full prefetch
    console.log("📥 Database schema not ready, proceeding with full prefetch...");
  }
}

if (shouldFetchJson) {
  console.log("🌐 Fetching data from Firebase...");
}
console.log("📦 Downloading assets...");

fs.mkdirSync("./src/data", { recursive: true });
fs.mkdirSync("./public", { recursive: true });

function fetchZip(url, outPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const file = fs.createWriteStream(outPath);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

function fetchJson(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            fs.writeFileSync(dest, JSON.stringify(json, null, 2));
            console.log("✅ site.json pretty-printed and saved locally for build");
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

const fetchPromises = [fetchZip(assetsUrl, assetsZipPath)];
if (shouldFetchJson) {
  fetchPromises.push(fetchJson(url, dest));
}

Promise.all(fetchPromises)
  .then(() => {
    unzipper.Open.file(assetsZipPath)
      .then((d) =>
        Promise.all(
          d.files.map((file) => {
            const outPath = `./public/${file.path}`;

            if (file.type === "Directory") {
              if (!fs.existsSync(outPath)) {
                fs.mkdirSync(outPath, { recursive: true });
                console.log(`📁 Created directory: ${file.path}`);
              }
              return Promise.resolve();
            }

            const dir = outPath.substring(0, outPath.lastIndexOf("/"));
            if (dir && !fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            return new Promise((resolve, reject) => {
              file
                .stream()
                .pipe(fs.createWriteStream(outPath))
                .on("finish", () => {
                  console.log(`✅ Extracted: ${file.path}`);
                  resolve();
                })
                .on("error", reject);
            });
          }),
        ),
      )
      .then(() => {
        fs.unlinkSync(assetsZipPath);
        console.log("✅ All assets extracted to public/");
      })
      .catch((err) => {
        console.error("❌ Error extracting assets.zip:", err);
      });
  })
  .catch((err) => {
    console.error("❌ Error fetching assets:", err);
  });
