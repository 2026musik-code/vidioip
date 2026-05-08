import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import CryptoJS from "crypto-js";

// In-memory cache to simulate Cloudflare cache behavior for speed
const cache: Record<string, { time: number, data: any }> = {};

function bikinIPPalsu() {
  const acak = () => Math.floor(Math.random() * 255) + 1;
  return `${acak()}.${acak()}.${acak()}.${acak()}`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON parsing middleware
  app.use(express.json());

  // Proxy / Spoofed IP endpoint
  app.get('/api/ips', async (req, res) => {
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
      return res.json({ success: true, data: ips });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // API routing

  // Endpoint 1: Daftar Drama (Cache 1 Jam)
  app.get('/api/list', async (req, res) => {
    const cacheKey = 'list_all';
    const now = Date.now();
    const spoofIpParam = Array.isArray(req.query.spoofIp) ? req.query.spoofIp[0] : req.query.spoofIp;
    const ipPalsu = (spoofIpParam as string) || bikinIPPalsu();
    
    // Server from cache ONLY IF NOT passing a custom spoofIp or if cache is valid AND we are not testing a new IP
    if (!spoofIpParam && cache[cacheKey] && now - cache[cacheKey].time < 3600 * 1000) {
      return res.json({ success: true, source: "Memory Cache", data: cache[cacheKey].data });
    }

    try {
      // Fetch multiple pages to ensure we have enough videos for both Indonesian and China categories
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

      // Clean the data and add custom flags for the frontend
      const cleanData = rawData.map((item: any) => ({
        id: item.bookId,
        title: item.bookName,
        cover: item.coverWap,
        episodes: item.chapterCount,
        desc: item.introduction,
        provider: 'dramabox',
        isIndonesian: item.bookName && item.bookName.toLowerCase().includes("sulih suara")
      }));

      // Remove duplicates by id
      const uniqueData = Array.from(new Map(cleanData.map(item => [item.id, item])).values());

      // Cache it
      if (!spoofIpParam) {
        cache[cacheKey] = { time: now, data: uniqueData };
      }

      return res.json({ success: true, source: "Live Fetch", data: uniqueData });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // Keep search endpoint working locally from cache
  app.get("/api/search", async (req, res) => {
    try {
      const q = req.query.q as string || '';
      const listCache = cache['list_all'];
      if (!listCache) {
        return res.json({ success: true, total: 0, data: [] });
      }

      let data = listCache.data;
      if (q) {
        const lowerQ = q.toLowerCase();
        data = data.filter((s: any) => 
          s.title && s.title.toLowerCase().includes(lowerQ)
        );
      }

      return res.json({ success: true, total: data.length, data: data });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get('/api/proxy-video', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).send('URL is required');
    }

    try {
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://drama.sansekai.my.id/",
        "Accept": "*/*",
      };

      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }

      const response = await fetch(url, { headers });

      res.status(response.status);
      response.headers.forEach((val, key) => {
        // Must exclude certain headers
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, val);
        }
      });

      if (response.body) {
        const { Readable } = await import('stream');
        const nodeStream = Readable.fromWeb(response.body as any);
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).end();
    }
  });

  app.get('/api/details/:provider/:id', async (req, res) => {
    // Currently only supporting the dramabox backend per user request
    const id = req.params.id;
    const url = `https://api.sansekai.my.id/api/dramabox/detail?bookId=${id}`;
    const spoofIpParam = Array.isArray(req.query.spoofIp) ? req.query.spoofIp[0] : req.query.spoofIp;
    const ipPalsu = (spoofIpParam as string) || bikinIPPalsu();

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
           return res.status(response.status).json({ success: false, message: "Limit API terlampaui (429)! Silakan ganti IP." });
        }
        return res.status(response.status).json({ success: false, message: "Detail tidak ditemukan di sumber penyedia." });
      }

      const rawData = await response.json();
      if (rawData && rawData.message && rawData.message.toLowerCase().includes('limit')) {
        throw new Error('Limit IP: ' + rawData.message);
      }

      res.json({
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
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // Endpoint 2: Ambil Link Video (Cache 5 Menit)
  app.get('/api/play/:provider/:id/:ep', async (req, res) => {
    const id = req.params.id;
    const ep = req.params.ep;
    const cacheKey = `play_${id}_${ep}`;
    const now = Date.now();
    const spoofIpParam = Array.isArray(req.query.spoofIp) ? req.query.spoofIp[0] : req.query.spoofIp;
    const ipPalsu = (spoofIpParam as string) || bikinIPPalsu();
    
    // Using 5 minutes (300 seconds) cache strategy as requested
    if (!spoofIpParam && cache[cacheKey] && now - cache[cacheKey].time < 300 * 1000) {
      return res.json(cache[cacheKey].data);
    }

    try {
      let videoUrl = "";

      // We use allepisode and decrypt-stream because /api/dramabox/episode doesn't exist
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
           return res.status(listResponse.status).json({ success: false, message: "Limit API terlampaui (429)! Silakan ganti IP." });
        }
        return res.status(listResponse.status).json({ success: false, message: "Gagal mengambil daftar episode dari sumber penyedia." });
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
        cache[cacheKey] = { time: now, data: responseData };
      }

      return res.json(responseData);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: "Gagal memproses video. " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Fallback to index.html for SPA router
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
