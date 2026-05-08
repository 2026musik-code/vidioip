import CryptoJS from 'crypto-js';

async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  
  const id = "42000010858";
  
  const dDetRes = await fetch(`https://drama.sansekai.my.id/api/dramabox/detail?bookId=${id}`, { headers });
  if (dDetRes.ok) {
     const epData = await dDetRes.json();
     if (epData.data) {
        const dec = CryptoJS.AES.decrypt(epData.data, secretKey).toString(CryptoJS.enc.Utf8);
        console.log("detail ok:", JSON.parse(dec));
     }
  } else {
     console.log("detail error:", dDetRes.status);
  }
}
testFetch();
