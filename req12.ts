import CryptoJS from 'crypto-js';

async function test(u: string) {
  const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const dec = bytes.toString(CryptoJS.enc.Utf8);
        console.log(u, "=> len:", JSON.parse(dec)?.length || JSON.parse(dec)?.results?.length);
     }
  } else {
     console.log(u, res.status);
  }
}

test('https://drama.sansekai.my.id/api/dramabox/search?title=cinta');
test('https://drama.sansekai.my.id/api/dramabox/search?q=cinta');
test('https://drama.sansekai.my.id/api/pinedrama/search?title=cinta');
test('https://drama.sansekai.my.id/api/pinedrama/search?q=cinta');
test('https://drama.sansekai.my.id/api/dramabox/trending');
test('https://drama.sansekai.my.id/api/pinedrama/categories');
