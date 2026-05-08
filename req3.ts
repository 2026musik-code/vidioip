import CryptoJS from 'crypto-js';
async function testSearch(provider: string, keyword: string) {
  const url = `https://drama.sansekai.my.id/api/${provider}/search`;
  const res = await fetch(url, { 
    method: 'POST',
    headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/", "Content-Type": "application/json" },
    body: JSON.stringify({ keyword })
  });
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        console.log(provider, "Search response:", JSON.stringify(JSON.parse(decrypted)).substring(0, 100));
     }
  } else {
     console.log(provider, res.status);
  }
}
testSearch('dramabox', 'ceo');
testSearch('pinedrama', 'ceo');
