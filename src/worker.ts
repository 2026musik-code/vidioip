import { Hono } from 'hono';

const app = new Hono();
const api = new Hono().basePath('/api');

let memoryCache: Record<string, { time: number, data: any }> = {};

function bikinIPPalsu() {
  const acak = () => Math.floor(Math.random() * 255) + 1;
  return `${acak()}.${acak()}.${acak()}.${acak()}`;
}

api.get('/ips', async (c) => {
  try {
    const resp = await fetch('https://raw.githubusercontent.com/FoolVPN-ID/Nautica/main/proxyList.txt');
    const text = await resp.text();
    const ips = text.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes(','))
      .map(line => {
        const [ip, port, country, isp] = line.split(',');
        return { ip, port, country, isp };
      });
    return c.json({ success: true, data: ips });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
});

api.get('/list', async (c) => {
  const cacheKey = 'list_all';
  const now = Date.now();
  const spoofIpParam = c.req.query('spoofIp');
  const ipPalsu = spoofIpParam || bikinIPPalsu();
  
  if (!spoofIpParam && memoryCache[cacheKey] && now - memoryCache[cacheKey].time < 3600 * 1000) {
    return c.json({ success: true, source: "Memory Cache", data: memoryCache[cacheKey].data });
  }

  try {
    const requests = [];
    const fetchParams = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
        "Accept": "application/json",
        "X-Forwarded-For": ipPalsu,
        "X-Real-IP": ipPalsu,
        "Client-IP": ipPalsu
      }
    };

    for (let i = 1; i <= 5; i++) {
        requests.push(fetch(`https://api.sansekai.my.id/api/dramabox/foryou?page=${i}`, fetchParams));
    }

    const responses = await Promise.all(requests);
    let rawData: any[] = [];
    
    for (const response of responses) {
      if (response.ok) {
        const data = await response.json();
        if (data && data.message && data.message.toLowerCase().includes('limit')) {
          throw new Error('Limit IP: ' + data.message);
        }
        if (Array.isArray(data)) {
          rawData = rawData.concat(data);
        }
      } else if (response.status === 429) {
        throw new Error('Limit API terlampaui (429)! Silakan ganti IP.');
      } else {
        // It might be a 500 error if limited, just in case
      }
    }

    if (rawData.length === 0) throw new Error("Server target down atau IP terkena Limit");

    const cleanData = rawData.map((item: any) => ({
      id: item.bookId,
      title: item.bookName,
      cover: item.coverWap,
      episodes: item.chapterCount,
      desc: item.introduction,
      provider: 'dramabox',
      isIndonesian: item.bookName && item.bookName.toLowerCase().includes("sulih suara")
    }));

    const uniqueData = Array.from(new Map(cleanData.map(item => [item.id, item])).values());

    if (!spoofIpParam) {
      memoryCache[cacheKey] = { time: now, data: uniqueData };
    }

    return c.json({ success: true, source: "Live Fetch", data: uniqueData });
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

api.get('/search', async (c) => {
  try {
    const q = c.req.query('q') || '';
    const listCache = memoryCache['list_all'];
    if (!listCache) {
      return c.json({ success: true, total: 0, data: [] });
    }

    let data = listCache.data;
    if (q) {
      const lowerQ = q.toLowerCase();
      data = data.filter((s: any) => 
        s.title && s.title.toLowerCase().includes(lowerQ)
      );
    }

    return c.json({ success: true, total: data.length, data: data });
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

api.get('/proxy-video', async (c) => {
  const url = c.req.query('url');
  if (!url) {
    return new Response('URL is required', { status: 400 });
  }

  try {
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://drama.sansekai.my.id/",
        "Accept": "*/*",
      };

      const range = c.req.header('range');
      if (range) headers['Range'] = range;

      const response = await fetch(url, { headers });

      const resHeaders = new Headers();
      response.headers.forEach((val, key) => {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          resHeaders.set(key, val);
        }
      });

      return new Response(response.body, {
        status: response.status,
        headers: resHeaders
      });
  } catch (error) {
      console.error("Proxy error:", error);
      return new Response('Proxy Server Error', { status: 500 });
  }
});

api.get('/details/:provider/:id', async (c) => {
    const id = c.req.param('id');
    const url = `https://api.sansekai.my.id/api/dramabox/detail?bookId=${id}`;
    const spoofIpParam = c.req.query('spoofIp');
    const ipPalsu = spoofIpParam || bikinIPPalsu();

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "X-Forwarded-For": ipPalsu,
          "X-Real-IP": ipPalsu,
          "Client-IP": ipPalsu
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
           return c.json({ success: false, message: "Limit API terlampaui (429)! Silakan ganti IP." }, 429);
        }
        return c.json({ success: false, message: "Detail tidak ditemukan di sumber penyedia." }, response.status as any);
      }

      const rawData = await response.json();
      if (rawData && rawData.message && rawData.message.toLowerCase().includes('limit')) {
        throw new Error('Limit IP: ' + rawData.message);
      }

      return c.json({
        success: true,
        data: {
          id: rawData.bookId,
          title: rawData.bookName,
          desc: rawData.introduction,
          total_episodes: rawData.chapterCount,
          cover: rawData.coverWap,
        }
      });
    } catch (e: any) {
      return c.json({ success: false, message: e.message }, 500);
    }
});

api.get('/play/:provider/:id/:ep', async (c) => {
    const id = c.req.param('id');
    const ep = c.req.param('ep');
    const cacheKey = `play_${id}_${ep}`;
    const now = Date.now();
    const spoofIpParam = c.req.query('spoofIp');
    const ipPalsu = spoofIpParam || bikinIPPalsu();
    
    if (!spoofIpParam && memoryCache[cacheKey] && now - memoryCache[cacheKey].time < 300 * 1000) {
      return c.json(memoryCache[cacheKey].data);
    }

    try {
      let videoUrl = "";

      const listResponse = await fetch(`https://api.sansekai.my.id/api/dramabox/allepisode?bookId=${id}`, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
          "X-Forwarded-For": ipPalsu,
          "X-Real-IP": ipPalsu,
          "Client-IP": ipPalsu
        }
      });

      if (!listResponse.ok) {
        if (listResponse.status === 429) {
           return c.json({ success: false, message: "Limit API terlampaui (429)! Silakan ganti IP." }, 429);
        }
        return c.json({ success: false, message: "Gagal mengambil daftar episode dari sumber penyedia." }, listResponse.status as any);
      }

      const epsData = await listResponse.json();
      if (epsData && epsData.message && epsData.message.toLowerCase().includes('limit')) {
        throw new Error('Limit IP: ' + epsData.message);
      }
      const targetEp = parseInt(ep, 10);
      
      const epData = epsData.find((e: any) => e.chapterIndex === targetEp - 1 || e.chapterName === `EP ${targetEp}` || e.chapterName === `Episode ${targetEp}`);

      if (!epData || !epData.cdnList || !epData.cdnList[0]) {
        throw new Error("Episode " + targetEp + " tidak ditemukan");
      }

      // Try to find 720p or fallback to the first available quality
      const vPaths = epData.cdnList[0].videoPathList;
      const bestPath = vPaths.find((v: any) => v.quality <= 720)?.videoPath || vPaths[0].videoPath;

      if (!bestPath) {
        throw new Error("Video URL tidak tersedia untuk episode ini");
      }

      videoUrl = `https://api.sansekai.my.id/api/dramabox/decrypt-stream?url=${encodeURIComponent(bestPath)}`;

      const responseData = {
        success: true,
        title: `Episode ${ep}`,
        videoUrl: videoUrl,
        rawUrl: videoUrl,
      };

      if (!spoofIpParam) {
        memoryCache[cacheKey] = { time: now, data: responseData };
      }

      return c.json(responseData);
    } catch (error: any) {
      return c.json({ success: false, error: "Gagal memproses video. " + error.message }, 500);
    }
});

app.route('/', api);

app.get('*', async (c) => {
  return (c.env as any).ASSETS.fetch(new Request(new URL('/', c.req.url)));
});

export default app;
