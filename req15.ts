import CryptoJS from 'crypto-js';

async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  
  // get 1 dramabox video
  const res = await fetch('https://drama.sansekai.my.id/api/dramabox/latest', { headers });
  const data = await res.json();
  const dramaboxList = JSON.parse(CryptoJS.AES.decrypt(data.data, secretKey).toString(CryptoJS.enc.Utf8));
  
  const dId = dramaboxList[0].bookId || dramaboxList[0].id;
  console.log("using dramabox id", dId);
  const dEpRes = await fetch(`https://drama.sansekai.my.id/api/dramabox/episode?bookId=${dId}&episodeNumber=1`, { headers });
  if (dEpRes.ok) {
     const epData = await dEpRes.json();
     if (epData.data) {
        const dec = CryptoJS.AES.decrypt(epData.data, secretKey).toString(CryptoJS.enc.Utf8);
        console.log("dramabox ep success, dec len:", dec.length, dec.substring(0, 100));
     }
  } else {
     console.log("dramabox error:", dEpRes.status);
  }

  // pinedrama
  const resP = await fetch('https://drama.sansekai.my.id/api/pinedrama/trending', { headers });
  const dataP = await resP.json();
  const pineData = JSON.parse(CryptoJS.AES.decrypt(dataP.data, secretKey).toString(CryptoJS.enc.Utf8));
  const pId = pineData.collections[0].collection_id;
  console.log("using pinedrama id", pId);

  const pEpRes = await fetch(`https://drama.sansekai.my.id/api/pinedrama/episode?collection_id=${pId}&episodeNumber=1`, { headers });
  if (pEpRes.ok) {
     const epData = await pEpRes.json();
     if (epData.data) {
        const dec = CryptoJS.AES.decrypt(epData.data, secretKey).toString(CryptoJS.enc.Utf8);
        console.log("pinedrama ep success, dec len:", dec.length, dec.substring(0, 100));
     }
  } else {
     console.log("pinedrama error:", pEpRes.status);
  }
}
testFetch();
