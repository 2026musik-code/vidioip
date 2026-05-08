import CryptoJS from 'crypto-js';
async function testSearch(provider: string, keyword: string) {
  const url = `https://drama.sansekai.my.id/api/${provider}/search`;
  
  // Try sending as json body
  const res = await fetch(url, { 
    method: 'POST',
    headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/", "Content-Type": "application/json" },
    body: JSON.stringify({ keyword })
  });
  
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const dec = bytes.toString(CryptoJS.enc.Utf8);
        console.log(provider, "POST json length:", JSON.parse(dec)?.length);
     }
  } else {
     console.log(provider, "POST json:", res.status);
  }

  // Try urlencoded
  const res2 = await fetch(url, { 
    method: 'POST',
    headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/", "Content-Type": "application/x-www-form-urlencoded" },
    body: `keyword=${keyword}`
  });
  if (res2.ok) {
     const data2 = await res2.json();
     if (data2.data) {
        const bytes2 = CryptoJS.AES.decrypt(data2.data, "Sansekai-SekaiDrama");
        const dec2 = bytes2.toString(CryptoJS.enc.Utf8);
        console.log(provider, "POST urlencoded length:", JSON.parse(dec2)?.length);
     }
  } else {
     console.log(provider, "POST urlencoded:", res2.status);
  }
}
testSearch('dramabox', 'ceo');
