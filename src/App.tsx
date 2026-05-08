import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Home, Compass, Film, User, Play, ChevronLeft, MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, Loader2, Download, List, Search, Settings, ShieldAlert, CheckCircle2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

function getApiUrl(base: string) {
  const ip = localStorage.getItem('spoofIp');
  if (!ip) return base;
  return base.includes('?') ? `${base}&spoofIp=${ip}` : `${base}?spoofIp=${ip}`;
}

// MOCK DATA for Video Feed
const MOCK_VIDEOS = [
  {
    id: '1',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Cinta Sang Miliarder - Eps 1',
    description: 'Awal pertemuan yang tidak terduga...',
    likes: '12K',
    comments: '458',
    series: 'Miliarder Sombong'
  },
  {
    id: '2',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    title: 'Cinta Sang Miliarder - Eps 2',
    description: 'Kesalahpahaman dimulai.',
    likes: '8.5K',
    comments: '320',
    series: 'Miliarder Sombong'
  }
];

const MOCK_SERIES = [
  { id: '1', title: 'Istri Pengganti', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', eps: 99, views: '1.2M' },
  { id: '2', title: 'Cinta Tak Direstui', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80', eps: 50, views: '800K' },
  { id: '3', title: 'Miliarder Menyamar', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', eps: 80, views: '3M' },
  { id: '4', title: 'Pembalasan Sang Mantan', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', eps: 120, views: '500K' },
];

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 w-full md:max-w-md bg-black/90 backdrop-blur-md border-t border-slate-800 text-slate-400 z-50 px-6 py-3 flex justify-between items-center safe-area-bottom">
      <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${path === '/' ? 'text-red-500' : 'hover:text-white'}`}>
        <Home size={24} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link to="/discover" className={`flex flex-col items-center gap-1 transition-colors ${path === '/discover' ? 'text-red-500' : 'hover:text-white'}`}>
        <Compass size={24} />
        <span className="text-[10px] font-medium">Discover</span>
      </Link>
      <Link to="/watch/feed" className={`flex flex-col items-center gap-1 transition-colors ${path.startsWith('/watch') ? 'text-red-500' : 'hover:text-white'}`}>
        <Play size={24} />
        <span className="text-[10px] font-medium">Shorts</span>
      </Link>
      <Link to="/library" className={`flex flex-col items-center gap-1 transition-colors ${path === '/library' ? 'text-red-500' : 'hover:text-white'}`}>
        <Film size={24} />
        <span className="text-[10px] font-medium">Library</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center gap-1 transition-colors ${path === '/profile' ? 'text-red-500' : 'hover:text-white'}`}>
        <User size={24} />
        <span className="text-[10px] font-medium">Me</span>
      </Link>
    </nav>
  );
}

function Header({ pageTitle, onSearch }: { pageTitle: string, onSearch: (q: string) => void }) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-slate-800 z-40 px-4 py-2.5 flex items-center justify-between transition-all">
      {!isSearching ? (
        <>
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">
            {pageTitle}
          </h1>
          <button onClick={() => setIsSearching(true)} className="text-slate-300 hover:text-white transition-colors p-1.5 -mr-1">
            <Search size={22} />
          </button>
        </>
      ) : (
        <div className="flex w-full items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
          <button onClick={() => { setIsSearching(false); setQuery(''); onSearch(''); }} className="text-slate-300 hover:text-white -ml-1">
            <ChevronLeft size={24} />
          </button>
          <input
            autoFocus
            type="text"
            placeholder="Cari drama..."
            className="flex-1 bg-slate-800/50 text-white placeholder-slate-400 border border-slate-700 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-slate-500 transition-colors"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
          />
        </div>
      )}
    </header>
  );
}

function HomePage() {
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [filterRegion, setFilterRegion] = useState<'Indonesia' | 'China'>('Indonesia');
  
  const routerLocation = useLocation();
  const location = routerLocation.pathname;

  let pageTitle = "DRAMA INDO";
  if (location === "/discover") pageTitle = "Discover";
  if (location === "/library") pageTitle = "Library";
  if (location === "/profile") pageTitle = "Profile";

  const fetchTrending = () => {
    setLoading(true);
    fetch(getApiUrl('/api/list'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllSeries(data.data);
          setSeries(data.data);
          // Extract categories organically from the source feed
          const cats = Array.from(new Set(data.data.flatMap((s: any) => s.tags || []))).filter(Boolean) as string[];
          setCategories(cats);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setActiveCategory(null);
    fetchSearch(q);
  };

  const handleCategorySelect = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setSearchQuery("");
      setSeries(allSeries); // revert to latest
    } else {
      setActiveCategory(category);
      setSearchQuery("");
      fetchSearch(category);
    }
  };
  
  const fetchSearch = (q: string) => {
    if (!q) {
      setSeries(allSeries);
      return;
    }
    setLoading(true);
    fetch(getApiUrl(`/api/search?q=${encodeURIComponent(q)}`))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSeries(data.data || []);
        } else {
          setSeries([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const filteredSeries = (series || []).filter(s => filterRegion === 'Indonesia' ? s.isIndonesian : !s.isIndonesian);

  return (
    <div className="pb-20 min-h-screen">
      <Header pageTitle={pageTitle} onSearch={handleSearch} />

      {location === "/discover" && categories.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.slice(0, 15).map((cat: any, i) => (
            <button 
              key={i} 
              onClick={() => handleCategorySelect(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${activeCategory === cat ? 'bg-red-600 text-white border-red-600' : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-red-500" size={32} />
        </div>
      ) : (
        <main className="px-4 space-y-6 mt-3">
          {/* Banner */}
          {series.length > 0 && (
            <section>
              <div className="w-full aspect-[4/5] sm:aspect-video bg-slate-800 rounded-xl overflow-hidden relative group cursor-pointer shadow-lg shadow-black">
                <img src={series[0].cover} alt="Featured" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                  <span className="bg-red-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded w-fit mb-2">Baru Rilis</span>
                  <h2 className="text-xl font-bold text-white mb-1 line-clamp-1">{series[0].title}</h2>
                  <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">{series[0].desc}</p>
                  <Link to={`/watch/feed?id=${series[0].id}&provider=${series[0].provider || 'dramabox'}`} className="mt-3 bg-white text-black text-sm font-semibold py-2 px-4 rounded-full flex items-center justify-center gap-2 w-fit">
                    <Play size={16} fill="currentColor" /> Tonton Sekarang
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Trending Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-white leading-none">Rilisan Terbaru</h3>
              <span className="text-[13px] text-red-500 font-medium cursor-pointer">Lihat Semua</span>
            </div>
            <div className="grid grid-rows-1 grid-flow-col gap-3 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth">
              {series.slice(1, 10).map((item) => (
                <Link key={item.id} to={`/watch/feed?id=${item.id}&provider=${item.provider || 'dramabox'}`} className="w-28 sm:w-32 snap-start shrink-0 group">
                  <div className="aspect-[3/4] rounded-md overflow-hidden relative mb-1.5 shadow-sm shadow-black/50">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm font-medium">
                      {item.episodes} Eps
                    </div>
                  </div>
                  <h4 className="text-[13px] font-medium text-slate-100 line-clamp-1 leading-tight">{item.title}</h4>
                </Link>
              ))}
            </div>
          </section>

          {/* Region Tabs */}
          <section className="pt-2">
            <div className="flex gap-4 border-b border-slate-800 mb-4 pb-2">
              <button 
                onClick={() => setFilterRegion('Indonesia')}
                className={`font-bold transition-colors ${filterRegion === 'Indonesia' ? 'text-white border-b-2 border-red-500 pb-2 -mb-[9px]' : 'text-slate-400'}`}
              >
                INDONESIA (DUB)
              </button>
              <button 
                onClick={() => setFilterRegion('China')}
                className={`font-bold transition-colors ${filterRegion === 'China' ? 'text-white border-b-2 border-red-500 pb-2 -mb-[9px]' : 'text-slate-400'}`}
              >
                CHINA SUB INDO
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {filteredSeries.map((item, idx) => (
                <Link key={`fy-${item.id}-${idx}`} to={`/watch/feed?id=${item.id}&provider=${item.provider || 'dramabox'}`} className="group">
                  <div className="aspect-[3/4] rounded-md overflow-hidden relative mb-1.5 shadow-sm shadow-black/50">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm font-medium">
                      {item.episodes} Eps
                    </div>
                  </div>
                  <h4 className="text-[13px] font-medium text-slate-100 line-clamp-2 leading-tight">{item.title}</h4>
                </Link>
              ))}
              {filteredSeries.length === 0 && (
                <div className="col-span-3 text-center py-10 text-slate-400">
                  Belum ada drama di kategori ini.
                </div>
              )}
            </div>
          </section>
        </main>
      )}
      <BottomNav />
    </div>
  );
}

function VideoFeedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get('id');
  const provider = searchParams.get('provider') || 'dramabox';
  
  const [videos, setVideos] = useState<any[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showEps, setShowEps] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  
  // Fetch details to get total episodes
  useEffect(() => {
    if (!collectionId) return;
    fetch(getApiUrl(`/api/details/${provider}/${collectionId}`))
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTotalEpisodes(data.data.total_episodes || 0);
        }
      })
      .catch(console.error);
  }, [collectionId, provider]);

  useEffect(() => {
    if (!collectionId) return;
    setLoading(true);
    
    // Fetch episode currentEpisode
    fetch(getApiUrl(`/api/play/${provider}/${collectionId}/${currentEpisode}`))
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Gagal memproses video. Format tidak valid.");
        }
        if (!res.ok || !data.success) {
          throw new Error(data.error || data.message || "Gagal memuat video");
        }
        return data;
      })
      .then(data => {
        if (data.videoUrl) {
          setVideos([{
            id: currentEpisode.toString(),
            url: data.videoUrl,
            rawUrl: data.rawUrl,
            title: data.title || `Episode ${currentEpisode}`,
            description: '',
            likes: '10K',
            comments: '120',
            series: 'SekaiDrama'
          }]);
        }
        setLoading(false);
        setErrorMsg(null);
      })
      .catch(err => {
        console.error(err);
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [collectionId, provider, currentEpisode]);

  if (loading && videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 text-white flex justify-center items-center">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 text-white">
      {/* Header Overlays */}
      <div className="absolute top-0 w-full z-50 bg-gradient-to-b from-black/60 to-transparent px-4 py-4 flex justify-between items-center pointer-events-none">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-white/80 hover:text-white pointer-events-auto cursor-pointer">
          <ChevronLeft size={28} />
        </button>
        <div className="flex bg-black/40 backdrop-blur border border-white/10 rounded-full px-4 py-1 text-sm font-medium text-white/90 pointer-events-auto cursor-pointer" onClick={() => setShowEps(true)}>
          Eps {currentEpisode} {totalEpisodes > 0 && `/ ${totalEpisodes}`}
        </div>
        <button className="p-2 -mr-2 text-white/80 hover:text-white pointer-events-auto cursor-pointer" onClick={() => setShowEps(true)}>
          <List size={24} />
        </button>
      </div>

      {loading && videos.length > 0 && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
           <Loader2 className="animate-spin text-red-500" size={32} />
         </div>
      )}

      {/* Video */}
      <div className="w-full h-full relative">
        {videos.length > 0 && !errorMsg ? (
          <VideoItem key={videos[0].id} video={videos[0]} isActive={true} />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center gap-4 px-6 text-center">
            <p className="text-slate-400">{errorMsg || "Video tidak ditemukan."}</p>
            <button onClick={() => navigate(-1)} className="bg-red-600 px-6 py-2 rounded-full font-medium">Kembali</button>
          </div>
        )}
      </div>

      {/* Episodes Bottom Sheet */}
      {showEps && (
        <div className="absolute inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEps(false)} />
          <div className="w-full h-3/5 bg-slate-900 rounded-t-2xl relative z-10 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Pilih Episode</h3>
              <button onClick={() => setShowEps(false)} className="text-slate-400 p-2">Tutup</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900 grid grid-cols-5 gap-3 content-start">
              {Array.from({ length: totalEpisodes || 10 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentEpisode(i + 1);
                    setShowEps(false);
                  }}
                  className={`aspect-square rounded-lg flex justify-center items-center font-bold text-lg transition-colors ${
                    currentEpisode === i + 1 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoItem({ video, isActive }: { key?: string | number | null; video: any; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let playPromise: Promise<void> | undefined;

    if (isActive && videoRef.current) {
      playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (e.name !== "AbortError") {
            setIsPlaying(false);
          }
        });
      }
      setIsPlaying(true);
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (e.name !== 'AbortError') setIsPlaying(false);
        });
      }
      setIsPlaying(true);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href,
      });
    } catch (e) {
      console.log('Error sharing', e);
    }
  };

  return (
    <div className="w-full h-full snap-start relative bg-slate-900 flex items-center justify-center">
      {/* Actual Video Element */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover"
        loop
        playsInline
        referrerPolicy="no-referrer"
        onClick={togglePlay}
      />
      
      {/* Play/Pause Overlay indicator (optional, usually TikTok hides it when playing) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="bg-black/40 p-4 rounded-full backdrop-blur-md">
            <Play size={40} className="text-white opacity-80" fill="white" />
          </div>
        </div>
      )}

      {/* Info Overlay (Bottom Left) */}
      <div className="absolute bottom-6 left-4 right-16 z-10 flex flex-col gap-2 drop-shadow-md pointer-events-none">
        <h3 className="font-bold text-lg">{video.series}</h3>
        <p className="text-sm text-white/90 font-medium">{video.title}</p>
        <p className="text-xs text-white/70 line-clamp-2">{video.description}</p>
      </div>

      {/* Actions (Bottom Right) */}
      <div className="absolute bottom-6 right-4 z-10 flex flex-col items-center gap-6 drop-shadow-md">
        <div className="flex flex-col items-center gap-1">
          <div 
            className="bg-black/40 p-2.5 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors"
            onClick={() => setLiked(!liked)}
          >
            <Heart size={24} className={liked ? "text-red-500" : "text-white"} fill={liked ? "currentColor" : "none"} />
          </div>
          <span className="text-xs font-medium text-white/90">{liked ? '10K' : video.likes}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors">
            <MessageCircle size={24} className="text-white" />
          </div>
          <span className="text-xs font-medium text-white/90">{video.comments}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div 
            className="bg-black/40 p-2.5 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors"
            onClick={() => setSaved(!saved)}
          >
            <Bookmark size={24} className={saved ? "text-yellow-400" : "text-white"} fill={saved ? "currentColor" : "none"} />
          </div>
          <span className="text-xs font-medium text-white/90">Save</span>
        </div>
        <div className="flex flex-col items-center gap-1" onClick={handleShare}>
          <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors">
            <Share2 size={24} className="text-white" />
          </div>
          <span className="text-xs font-medium text-white/90">Share</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <a
            href={video.rawUrl || video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black/40 p-2.5 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors flex items-center justify-center"
          >
            <Download size={24} className="text-white" />
          </a>
          <span className="text-xs font-medium text-white/90">Unduh</span>
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ size }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function ProfilePage() {
  const [ips, setIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIp, setCurrentIp] = useState(localStorage.getItem('spoofIp') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/ips')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIps(data.data || []);
        } else {
          setError('Gagal memuat list IP proxy');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectIp = (ip: string) => {
    if (ip) {
      localStorage.setItem('spoofIp', ip);
    } else {
      localStorage.removeItem('spoofIp');
    }
    setCurrentIp(ip);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-slate-800 z-40 px-4 py-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings size={22} className="text-red-500" /> Pengaturan Anti-Limit
        </h1>
      </header>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            <ShieldAlert size={18} className="text-yellow-500" /> Status IP Saat Ini
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Jika kamu mengalami error limit (API error / video tidak bisa diputar), silakan ganti IP kamu.
          </p>
          <div className="flex items-center gap-2 p-3 bg-black rounded-lg border border-slate-800">
            {currentIp ? (
              <><CheckCircle2 size={18} className="text-green-500" /> <span className="text-green-500 font-mono text-sm">{currentIp}</span></>
            ) : (
              <><span className="text-slate-400 font-mono text-sm">Otomatis (Acak)</span></>
            )}
          </div>
          <button 
            onClick={() => handleSelectIp('')}
            className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset ke Otomatis
          </button>
        </div>

        <h3 className="font-semibold text-white mb-3 px-1">Pilih Server Proxy Baru</h3>
        {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-500" size={32} /></div>}
        {error && <div className="text-red-500 text-sm p-4 bg-red-500/10 rounded-lg mb-4">{error}</div>}
        
        <div className="space-y-2">
          {ips.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleSelectIp(item.ip)}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${currentIp === item.ip ? 'bg-red-500/20 border-red-500' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}
            >
              <div>
                <div className="font-mono text-sm text-white">{item.ip}</div>
                <div className="text-xs text-slate-500 mt-1">{item.country} • {item.isp}</div>
              </div>
              {currentIp === item.ip && <CheckCircle2 size={20} className="text-red-500" />}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans md:max-w-md md:mx-auto md:border-x md:border-slate-800 shadow-2xl relative overflow-x-hidden">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<HomePage />} />
          <Route path="/library" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/watch/feed" element={<VideoFeedPage />} />
        </Routes>
      </Router>
    </div>
  );
}

