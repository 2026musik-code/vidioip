import CryptoJS from 'crypto-js';

async function testFetch(p: string, u: string) {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  
  const dRes = await fetch(`https://drama.sansekai.my.id/api/${p}/${u}`, { headers });
  if (dRes.ok) {
     const j = await dRes.json();
     if (j.data) {
       try {
         const d = CryptoJS.AES.decrypt(j.data, secretKey).toString(CryptoJS.enc.Utf8);
         const dec = JSON.parse(d);
         console.log(p, u, "=> type", Array.isArray(dec) ? "array" : typeof dec);
         if (Array.isArray(dec)) console.log("sample 1:", Object.keys(dec[0]));
         else console.log("keys:", Object.keys(dec));
       } catch(e) { }
     }
  } 
}
async function run() {
  await testFetch('goodshort', 'latest');
  await testFetch('shortmax', 'latest');
}
run();
