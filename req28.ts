import fs from 'fs';
async function run() {
  const fRes = await fetch("https://drama.sansekai.my.id/_next/static/chunks/7d8584d58b0ba128.js");
  const fText = await fRes.text();
  let regex = /dramabox\/(.*?)"/g;
  let matches = [...fText.matchAll(regex)];
  console.log("matches", [...new Set(matches.map(m => m[1]))]);
}
run();
