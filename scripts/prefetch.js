// scripts/prefetch.js
import fs from "fs";
import https from "https";


const url = "https://alpha-dog-9ce25.firebaseio.com/.json";
const backgroundPicUrl = "https://firebasestorage.googleapis.com/v0/b/alpha-dog-9ce25.appspot.com/o/images%2Fbackground.webp?alt=media&token=d9fe754b-51e6-4138-841d-53a528c63136";
const profilePicUrl = "https://firebasestorage.googleapis.com/v0/b/alpha-dog-9ce25.appspot.com/o/images%2Fprofilepic.webp?alt=media&token=4864fbac-64c4-4ab9-b032-0e4dc9a108d0";
const dest = "./src/data/data.json";

// Ensure the directories exist
fs.mkdirSync('./src/data', { recursive: true });
fs.mkdirSync('./public', { recursive: true });

function fetchImage(url, outPath) {
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

// Fetch images and JSON data
Promise.all([
  fetchImage(backgroundPicUrl, './public/background.webp'),
  fetchImage(profilePicUrl, './public/portrait.webp'),
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
  console.log('✅ All assets fetched and saved');
}).catch((err) => {
  console.error('❌ Error fetching assets:', err);
});
