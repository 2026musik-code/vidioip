const url1 = "https://drama.sansekai.my.id/api/dramabox/detail?id=42000010858";
const url2 = "https://drama.sansekai.my.id/api/kalosv/detail?id=42000010858"; // another provider?
const url3 = "https://drama.sansekai.my.id/api/dramabox/info?bookId=42000010858";
const url4 = "https://drama.sansekai.my.id/api/dramabox/detail?bookId=42000010858";

async function run() {
  for (let u of [url1, url2, url3, url4]) {
    const res = await fetch(u, { headers: {"User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/"}});
    console.log(u, res.status);
  }
}
run();
