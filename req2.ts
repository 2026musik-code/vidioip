const endpoints = [
  'api/kalosv/tags',
  'api/dramabox/tags',
  'api/dramabox/category',
  'api/pinedrama/categories',
  'api/pinedrama/category',
];
async function test() {
  for (const ep of endpoints) {
    const res = await fetch('https://drama.sansekai.my.id/' + ep, {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" }
    });
    console.log(ep, res.status);
  }
}
test();
