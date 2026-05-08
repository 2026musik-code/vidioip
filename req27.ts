import fs from 'fs';
async function run() {
  const fRes = await fetch("https://drama.sansekai.my.id/_next/static/chunks/7d8584d58b0ba128.js");
  let fText = await fRes.text();
  // grep for "/api/dramabox"
  let lines = fText.split("\n").filter(l => l.includes("/api/dramabox") || l.includes("fetch("));
  console.log("Lines containing /api/dramabox:");
  
  let i = fText.indexOf("/api/dramabox");
  if (i !== -1) {
    console.log(fText.substring(i - 200, i + 500));
  }
}
run();
