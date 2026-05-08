import fs from 'fs';
async function run() {
  const res = await fetch("https://drama.sansekai.my.id/", { headers: {"User-Agent": "Mozilla/5.0"}});
  const text = await res.text();
  const matches = text.match(/_next\/static\/chunks\/[a-zA-Z0-9.\-_]+\.js/g);
  if (matches) {
    for (const file of matches) {
      if (file.includes('polyfills') || file.includes('webpack') || file.includes('framework')) continue;
      const fRes = await fetch("https://drama.sansekai.my.id/" + file);
      const fText = await fRes.text();
      // extract strings that look like /api/
      const apiMatches = fText.match(/\/api\/[a-zA-Z0-9./_\-]+/g);
      if (apiMatches) {
        const unique = [...new Set(apiMatches)];
        console.log("Found in", file, unique);
      }
    }
  }
}
run();
