import CryptoJS from 'crypto-js';

async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };

  // Fetch Goodshort latest
  const gsRes = await fetch("https://drama.sansekai.my.id/api/goodshort/latest", { headers });
  if (!gsRes.ok) return;
  const gsData = await gsRes.json();
  const gsRaw = JSON.parse(CryptoJS.AES.decrypt(gsData.data, secretKey).toString(CryptoJS.enc.Utf8));
  
  if (!gsRaw.data || !gsRaw.data.length) return;
  const bookId = gsRaw.data[0].bookId || gsRaw.data[0].id; // check keys

  console.log('bookid', bookId);

  // Check endpoints
  const eps = [
    `https://drama.sansekai.my.id/api/goodshort/episode?bookId=${bookId}&episodeNumber=1`,
    `https://drama.sansekai.my.id/api/goodshort/detail?bookId=${bookId}`
  ];

  for (let u of eps) {
    const dRes = await fetch(u, { headers });
    console.log(u, "status", dRes.status);
  }
}
testFetch();
