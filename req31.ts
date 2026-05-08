import CryptoJS from 'crypto-js';
async function run() {
  const secretKey = "Sansekai-SekaiDrama";
  const headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" };
  const dRes = await fetch("https://drama.sansekai.my.id/api/goodshort/latest", { headers });
  const data = await dRes.json();
  const raw = JSON.parse(CryptoJS.AES.decrypt(data.data, secretKey).toString(CryptoJS.enc.Utf8));
  console.log(raw.data);
}
run();
