import CryptoJS from 'crypto-js';
async function testEP(u: string) {
  const url = u;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        console.log(u, "=> len:", JSON.parse(bytes.toString(CryptoJS.enc.Utf8)).length);
     }
  }
}
testEP('https://drama.sansekai.my.id/api/dramabox/latest?tag=Modern');
testEP('https://drama.sansekai.my.id/api/pinedrama/trending?category=Modern');
testEP('https://drama.sansekai.my.id/api/pinedrama/home');
