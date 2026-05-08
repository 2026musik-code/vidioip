import fs from 'fs';
async function run() {
  const fRes = await fetch("https://drama.sansekai.my.id/_next/static/chunks/7d8584d58b0ba128.js");
  const fText = await fRes.text();
  const apiMatches = fText.match(/\/api\/[a-zA-Z0-9./_\-]+/g);
  if (apiMatches) {
    const unique = [...new Set(apiMatches)];
    console.log(unique.filter(u => u.includes('dramabox')));
  }
}
run();
