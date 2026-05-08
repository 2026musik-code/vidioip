import CryptoJS from 'crypto-js';

async function trySearch(provider: string, keyword: string) {
  const url = `https://drama.sansekai.my.id/api/${provider}/search?keyword=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        console.log(provider, keyword, "=>", JSON.parse(decrypted).length || JSON.parse(decrypted)?.results?.length, "results");
     }
  } else {
     console.log(provider, res.status);
  }
}

async function run() {
  await trySearch('pinedrama', 'menantu');
  await trySearch('pinedrama', 'cinta');
  await trySearch('dramabox', 'suami');
  await trySearch('dramabox', 'istri');
}
run();
