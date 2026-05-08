import CryptoJS from 'crypto-js';

async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  
  const eps = [
    'https://drama.sansekai.my.id/api/dramabox/latest',
  ];
  for (let u of eps) {
    const dRes = await fetch(u, { headers });
    console.log(u, "status", dRes.status);
  }
}
testFetch();
