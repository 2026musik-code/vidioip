import CryptoJS from 'crypto-js';
async function testSearchPinedrama(keyword: string) {
  const url = `https://drama.sansekai.my.id/api/pinedrama/search?keyword=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const dec = bytes.toString(CryptoJS.enc.Utf8);
        console.log("pinedrama", keyword, JSON.parse(dec));
     }
  } else {
     console.log("pinedrama error:", res.status);
  }
}
testSearchPinedrama('menantu');
testSearchPinedrama('istri');
testSearchPinedrama('suami');
testSearchPinedrama('bos');
testSearchPinedrama('cinta');
testSearchPinedrama('romansa');
