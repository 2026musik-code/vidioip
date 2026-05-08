import CryptoJS from 'crypto-js';
async function testEP(u: string) {
  const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        console.log(u, "=> len:", JSON.parse(bytes.toString(CryptoJS.enc.Utf8)).length);
     }
  } else {
     console.log(u, res.status);
  }
}
testEP('https://drama.sansekai.my.id/api/dramabox/searchAll?keyword=cinta');
testEP('https://drama.sansekai.my.id/api/pinedrama/searchAll?keyword=cinta');
testEP('https://drama.sansekai.my.id/api/dramabox/list?keyword=cinta');
testEP('https://drama.sansekai.my.id/api/dramabox/query?keyword=cinta');
