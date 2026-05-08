import CryptoJS from 'crypto-js';

async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  
  const dRes = await fetch(`https://drama.sansekai.my.id/api/dramabox?id=42000010858`, { headers });
  if (dRes.ok) {
     console.log('body is:', await dRes.text());
  } else {
     console.log("error:", dRes.status);
  }
}
testFetch();
