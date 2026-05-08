import fs from 'fs';
async function run() {
  const fRes = await fetch("https://drama.sansekai.my.id/_next/static/chunks/7d8584d58b0ba128.js");
  const fText = await fRes.text();
  // search anywhere for "dramabox"
  let lines = fText.slice(0, 10000000).match(/.{1,100}dramabox.{1,100}/g);
  if (lines) console.log(lines.join("\n").substring(0, 5000));
}
run();
