import CryptoJS from 'crypto-js';

async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  
  const eps = [
    'https://drama.sansekai.my.id/api/dramabox',
    'https://drama.sansekai.my.id/api/dramabox/?action=latest',
    'https://drama.sansekai.my.id/api/dramabox/detail'
  ];
  for (let u of eps) {
    const dRes = await fetch(u, { headers });
    console.log(u, "status", dRes.status);
    console.log(u, "body", (await dRes.text()).substring(0, 100));
  }
}
testFetch();
