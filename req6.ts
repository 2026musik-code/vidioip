import CryptoJS from 'crypto-js';

async function testEP(u: string) {
  const url = u;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        console.log(u, "=> ok, len:", JSON.parse(decrypted).length || JSON.parse(decrypted)?.results?.length);
     } else {
        console.log(u, "=> no data.data");
     }
  } else {
     console.log(u, "=>", res.status);
  }
}

async function run() {
  await testEP('https://drama.sansekai.my.id/api/dramabox/search?keyword=cinta');
  await testEP('https://drama.sansekai.my.id/api/dramabox/search?q=cinta');
  await testEP('https://drama.sansekai.my.id/api/pinedrama/search?keyword=cinta');
  await testEP('https://drama.sansekai.my.id/api/kalosv/search?keyword=cinta');

  await testEP('https://drama.sansekai.my.id/api/dramabox/categoryList');
  await testEP('https://drama.sansekai.my.id/api/pinedrama/tags');
  await testEP('https://drama.sansekai.my.id/api/dramabox/latest?tag=Boss');
  await testEP('https://drama.sansekai.my.id/api/dramabox/latest?tag=Cinta');
  await testEP('https://drama.sansekai.my.id/api/pinedrama/trending?tag=Cinta');
}
run();
