import CryptoJS from 'crypto-js';

async function test(provider: string, id: string, ep: string) {
  const url = provider === 'dramabox' ? 
    `https://drama.sansekai.my.id/api/dramabox/episode?bookId=${id}&episodeNumber=${ep}` : 
    `https://drama.sansekai.my.id/api/pinedrama/episode?collection_id=${id}&episodeNumber=${ep}`;
  console.log('fetching', url);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://drama.sansekai.my.id/" } });
  
  if (res.ok) {
     const data = await res.json();
     if (data.data) {
        const bytes = CryptoJS.AES.decrypt(data.data, "Sansekai-SekaiDrama");
        const dec = bytes.toString(CryptoJS.enc.Utf8);
        console.log(provider, "=> ok, m3u8 len:", JSON.parse(dec)?.m3u8?.length);
     }
  } else {
     console.log(provider, res.status);
  }
}

test('dramabox', '30006', '1');
test('pinedrama', '50012', '1');
