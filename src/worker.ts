import { Hono } from 'hono';

const app = new Hono();
const api = new Hono().basePath('/api');

let memoryCache: Record<string, { time: number, data: any }> = {};
let blockedIps = new Set<string>();

function bikinIPPalsu() {
  const acak = () => Math.floor(Math.random() * 255) + 1;
  let ip: string;
  do {
    ip = `${acak()}.${acak()}.${acak()}.${acak()}`;
  } while (blockedIps.has(ip));
  return ip;
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
  
  if (!spoofIpParam && memoryCache[cacheKey] && now - memoryCache[cacheKey].time < 3600 * 1000) {
    return c.json({ success: true, source: "Memory Cache", data: memoryCache[cacheKey].data });
  }

  try {
    let rawData: any[] = [];
    let attempts = 0;
    let success = false;
    let lastError: any = null;

    while (attempts < 5 && !success) {
      attempts++;
      const currentIp = spoofIpParam || bikinIPPalsu();
      const fetchParams = {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
          "Accept": "application/json",
          "X-Forwarded-For": currentIp,
          "X-Real-IP": currentIp,
          "Client-IP": currentIp
        }
      };

      let currentData: any[] = [];
      let isLimited = false;

      for (let i = 1; i <= 15; i++) {
        const response = await fetch(`https://api.sansekai.my.id/api/dramabox/foryou?page=${i}`, fetchParams);
        if (response.ok) {
          const data = await response.json();
          if (data && data.message && data.message.toLowerCase().includes('limit')) {
            blockedIps.add(currentIp);
            isLimited = true;
            lastError = new Error('Limit IP: ' + data.message);
            break;
          }
          if (Array.isArray(data)) {
            currentData = currentData.concat(data);
          }
        } else if (response.status === 429) {
          blockedIps.add(currentIp);
          isLimited = true;
          lastError = new Error('Limit API terlampaui (429)! Silakan ganti IP.');
          break;
        }
      }

      if (isLimited) {
        if (spoofIpParam) break;
        continue;
      }

      if (currentData.length === 0) {
        lastError = new Error("Server target down atau tidak ada data");
        if (spoofIpParam) break;
        continue;
      }

      rawData = currentData;
      success = true;
    }

    if (!success) {
      throw lastError || new Error("Server target down atau IP terkena Limit setelah beberapa percobaan");
    }

    const cleanData = rawData.map((item: any) => ({
      id: item.bookId,
      title: item.bookName,
      cover: item.coverWap,
      episodes: item.chapterCount,
      desc: item.introduction,
      provider: 'dramabox',
      isIndonesian: item.bookName && item.bookName.toLowerCase().includes("sulih suara"),
      tags: item.tags || []
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
        (s.title && s.title.toLowerCase().includes(lowerQ)) ||
        (s.tags && s.tags.some((tag: string) => tag.toLowerCase().includes(lowerQ)))
      );
    }

    return c.json({ success: true, total: data.length, data: data });
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, message: error.message }, 500);
  }
});



api.get('/details/:provider/:id', async (c) => {
    const id = c.req.param('id');
    const url = `https://api.sansekai.my.id/api/dramabox/detail?bookId=${id}`;
    const spoofIpParam = c.req.query('spoofIp');
    
    let attempts = 0;
    let success = false;
    let lastError: any = null;
    let rawData: any = null;
    let finalStatus = 500;

    while (attempts < 5 && !success) {
      attempts++;
      const currentIp = spoofIpParam || bikinIPPalsu();

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "X-Forwarded-For": currentIp,
            "X-Real-IP": currentIp,
            "Client-IP": currentIp
          }
        });
        
        if (!response.ok) {
          if (response.status === 429) {
             blockedIps.add(currentIp);
             lastError = new Error("Limit API terlampaui (429)! Silakan ganti IP.");
             finalStatus = 429;
             if (spoofIpParam) break;
             continue;
          }
          lastError = new Error("Detail tidak ditemukan di sumber penyedia.");
          finalStatus = response.status;
          break; // Don't retry on other errors like 404
        }

        const data = await response.json();
        if (data && data.message && data.message.toLowerCase().includes('limit')) {
          blockedIps.add(currentIp);
          lastError = new Error('Limit IP: ' + data.message);
          finalStatus = 429;
          if (spoofIpParam) break;
          continue;
        }

        rawData = data;
        success = true;
      } catch (e: any) {
        lastError = e;
        if (spoofIpParam) break;
      }
    }

    if (!success || !rawData) {
      return c.json({ success: false, message: lastError?.message || "Gagal mengambil data setelah beberapa percobaan" }, finalStatus as any);
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
});

api.get('/play/:provider/:id/:ep', async (c) => {
    const id = c.req.param('id');
    const ep = c.req.param('ep');
    const cacheKey = `play_${id}_${ep}`;
    const now = Date.now();
    const spoofIpParam = c.req.query('spoofIp');
    
    if (!spoofIpParam && memoryCache[cacheKey] && now - memoryCache[cacheKey].time < 300 * 1000) {
      return c.json(memoryCache[cacheKey].data);
    }

    let attempts = 0;
    let success = false;
    let lastError: any = null;
    let epData: any = null;
    let finalStatus = 500;

    while (attempts < 5 && !success) {
      attempts++;
      const currentIp = spoofIpParam || bikinIPPalsu();

      try {
        const listResponse = await fetch(`https://api.sansekai.my.id/api/dramabox/allepisode?bookId=${id}`, {
          headers: { 
            "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
            "X-Forwarded-For": currentIp,
            "X-Real-IP": currentIp,
            "Client-IP": currentIp
          }
        });

        if (!listResponse.ok) {
          if (listResponse.status === 429) {
             blockedIps.add(currentIp);
             lastError = new Error("Limit API terlampaui (429)! Silakan ganti IP.");
             finalStatus = 429;
             if (spoofIpParam) break;
             continue;
          }
          lastError = new Error("Gagal mengambil daftar episode dari sumber penyedia.");
          finalStatus = listResponse.status;
          break; // Don't retry on other errors
        }

        const epsData = await listResponse.json();
        if (epsData && epsData.message && epsData.message.toLowerCase().includes('limit')) {
          blockedIps.add(currentIp);
          lastError = new Error('Limit IP: ' + epsData.message);
          finalStatus = 429;
          if (spoofIpParam) break;
          continue;
        }

        const targetEp = parseInt(ep, 10);
        const episodeInfo = epsData.find((e: any) => e.chapterIndex === targetEp - 1 || e.chapterName === `EP ${targetEp}` || e.chapterName === `Episode ${targetEp}`);

        if (!episodeInfo || !episodeInfo.cdnList || !episodeInfo.cdnList[0]) {
          lastError = new Error("Episode " + targetEp + " tidak ditemukan");
          finalStatus = 404;
          break; // Don't retry if episode not found
        }

        epData = episodeInfo;
        success = true;
      } catch (e: any) {
        lastError = e;
        if (spoofIpParam) break;
      }
    }

    if (!success || !epData) {
      return c.json({ success: false, message: lastError?.message || "Gagal mengambil episode setelah beberapa percobaan" }, finalStatus as any);
    }

    try {
      // Try to find 720p or fallback to the first available quality
      const vPaths = epData.cdnList[0].videoPathList;
      const bestPath = vPaths.find((v: any) => v.quality <= 720)?.videoPath || vPaths[0].videoPath;

      if (!bestPath) {
        throw new Error("Video URL tidak tersedia untuk episode ini");
      }

      const videoUrl = `https://api.sansekai.my.id/api/dramabox/decrypt-stream?url=${encodeURIComponent(bestPath)}`;

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
