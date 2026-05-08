import CryptoJS from 'crypto-js';
async function testFetch() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  const dRes = await fetch("https://drama.sansekai.my.id/api/goodshort/latest", { headers });
  const data = await dRes.json();
  const raw = JSON.parse(CryptoJS.AES.decrypt(data.data, secretKey).toString(CryptoJS.enc.Utf8));
  console.log('keys', Object.keys(raw));
  console.log('raw.data type', typeof raw.data);
  if (Array.isArray(raw.data)) {
    console.log('raw.data[0]', raw.data[0]);
  }
}
testFetch();
