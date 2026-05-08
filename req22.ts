import CryptoJS from 'crypto-js';

async function testFetch(p: string) {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  
  const eps = ['latest', 'trending', 'foryou', 'search'];
  for (let u of eps) {
    const dRes = await fetch(`https://drama.sansekai.my.id/api/${p}/${u}`, { headers });
    if (dRes.ok) {
       const j = await dRes.json();
       if (j.data) {
         try {
           const dec = JSON.parse(CryptoJS.AES.decrypt(j.data, secretKey).toString(CryptoJS.enc.Utf8));
           console.log(p, u, "=> len", dec.length || dec.results?.length || dec.collections?.length);
         } catch(e) { console.log(p, u, "=> non json"); }
       }
    } else {
       console.log(p, u, "error:", dRes.status);
    }
  }
}
async function run() {
  await testFetch('goodshort');
  await testFetch('shortmax');
  await testFetch('netshort');
  await testFetch('melolo');
  await testFetch('freereels');
}
run();
