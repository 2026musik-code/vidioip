async function run() {
  const res = await fetch("https://drama.sansekai.my.id/", { headers: {"User-Agent": "Mozilla/5.0"}});
  const text = await res.text();
  console.log(text.substring(0, 1000));
}
run();
