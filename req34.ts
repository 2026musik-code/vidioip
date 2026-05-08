import CryptoJS from 'crypto-js';

async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };

  const id = "31001380494";
  const dRes = await fetch(`https://drama.sansekai.my.id/api/goodshort/allepisode?bookId=${id}`, { headers });
  const j = await dRes.json();
  const d = JSON.parse(CryptoJS.AES.decrypt(j.data, secretKey).toString(CryptoJS.enc.Utf8));
  
  if (d.data && d.data.length > 0) {
     console.log("first ep:", Object.keys(d.data[0]), d.data[0].videoUrl);
     console.log(d.data[0]);
  }
}
testFetch();
