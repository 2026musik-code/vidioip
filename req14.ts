import CryptoJS from 'crypto-js';

async function testFetch() {
  // get 1 dramabox video
  const res = await fetch('https://drama.sansekai.my.id/api/dramabox/latest', { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  const data = await res.json();
  const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
  const dramaboxList = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  
  const id = dramaboxList[0].bookId || dramaboxList[0].id;
  console.log("using dramabox id", id);
  
  const url = `https://drama.sansekai.my.id/api/dramabox/episode?bookId=${id}&episodeNumber=1`;
  const epRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  if (epRes.ok) {
     const epData = await epRes.json();
     if (epData.data) {
        const epBytes = CryptoJS.AES.decrypt(epData.data, "Sansekai-SekaiDrama");
        const dec = epBytes.toString(CryptoJS.enc.Utf8);
        console.log("dramabox success, keys:", Object.keys(JSON.parse(dec)));
     }
  } else {
     console.log("dramabox error:", epRes.status);
     const text = await epRes.text();
     console.log("body:", text);
  }
}
testFetch();
