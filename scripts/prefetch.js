// scripts/prefetch.js
import fs from "fs";
import https from "https";

const url = "https://alpha-dog-9ce25.firebaseio.com/.json";
const dest = "./src/data/data.json";

// Ensure the directory exists
fs.mkdirSync('./src/data', { recursive: true });

https.get(url, (res) => {
  if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
  let data = "";
  res.on("data", chunk => {
    data += chunk;
  });
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      fs.writeFileSync(dest, JSON.stringify(json, null, 2));
      console.log("✅ site.json pretty-printed and saved locally for build");
    } catch (err) {
      console.error("Failed to parse or write JSON:", err);
    }
  });
});
