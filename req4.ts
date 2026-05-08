import CryptoJS from 'crypto-js';
async function testSearch(provider: string, keyword: string) {
  const url = `https://drama.sansekai.my.id/api/${provider}/search?keyword=${keyword}`;
  console.log('fetching', url);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        console.log(provider, JSON.stringify(JSON.parse(decrypted)).substring(0, 200));
     }
  } else {
     console.log(provider, res.status);
  }
}
testSearch('dramabox', 'suami');
testSearch('pinedrama', 'suami');
