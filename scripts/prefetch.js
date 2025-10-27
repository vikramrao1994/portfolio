// scripts/prefetch.js
import fs from "fs";
import https from "https";


const url = "https://alpha-dog-9ce25.firebaseio.com/.json";
const assetsUrl = "https://firebasestorage.googleapis.com/v0/b/alpha-dog-9ce25.appspot.com/o/assets.zip?alt=media";
const dest = "./src/data/data.json";
const assetsZipPath = "./public/assets.zip";

// Ensure the directories exist
fs.mkdirSync('./src/data', { recursive: true });
fs.mkdirSync('./public', { recursive: true });

function fetchZip(url, outPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(outPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', reject);
    }).on('error', reject);
  });
}


// Download assets.zip and extract to public/
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const unzipper = require("unzipper");

Promise.all([
  fetchZip(assetsUrl, assetsZipPath),
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = "";
      res.on("data", chunk => {
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
    }).on('error', reject);
  })
]).then(() => {
  // Extract assets.zip with directory handling
  unzipper.Open.file(assetsZipPath)
    .then(d => Promise.all(d.files.map(file => {
      const outPath = `./public/${file.path}`;
      const dir = outPath.substring(0, outPath.lastIndexOf("/"));
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return new Promise((resolve, reject) => {
        file.stream()
          .pipe(fs.createWriteStream(outPath))
          .on('finish', () => {
            console.log(`✅ Extracted: ${file.path}`);
            resolve();
          })
          .on('error', reject);
      });
    })))
    .then(() => {
      fs.unlinkSync(assetsZipPath);
      console.log("✅ All assets extracted to public/");
    })
    .catch(err => {
      console.error("❌ Error extracting assets.zip:", err);
    });
}).catch((err) => {
  console.error('❌ Error fetching assets:', err);
});
