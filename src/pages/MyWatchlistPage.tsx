import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Play, Film, Tv, Clock, Star, Heart } from 'lucide-react';
import { contentService } from '@/services/contentService';
import { authService } from '@/services/authService';

interface WatchlistItem {
  id: number;
  entertainment_id: number;
  entertainment_type: 'movie' | 'tvshow';
  name: string;
  description: string;
  poster_image: string;
  backdrop_image?: string;
  rating?: string;
  imdb_rating?: string;
  duration?: string;
  year?: string;
  genres?: string[];
  is_watch_list?: boolean;
}

export default function MyWatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authService.isAuthenticated()) {
        navigate('/auth');
        return;
      }

      const response = await contentService.getWatchlist(100);
      
      if (response.status && response.data) {
        setWatchlist(response.data);
      } else {
        setWatchlist([]);
      }
    } catch (err: any) {
      console.error('Error fetching watchlist:', err);
      setError(err.response?.data?.message || 'Failed to load watchlist');
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (entertainmentId: number) => {
    try {
      setRemovingId(entertainmentId);
      const response = await contentService.removeFromWatchlist(entertainmentId);
      
      if (response.status) {
        setWatchlist(prev => prev.filter(item => item.entertainment_id !== entertainmentId));
      }
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      alert('Failed to remove from watchlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handlePlay = (item: WatchlistItem) => {
    navigate(`/movie/${item.entertainment_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 animate-pulse">Loading Your Watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-20">
      {/* Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Gradient Background Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#EAB308]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-10 animate-slide-up flex flex-col items-center justify-center text-center">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-[#EAB308]/20 blur-xl rounded-full" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EAB308] to-[#FACC15] flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-black fill-black" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text mb-1">
            My Watchlist
          </h1>
          <p className="text-white/50 text-sm mt-1 mb-4 font-medium">
            {watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'} saved for later
          </p>
          
          {watchlist.length > 0 && (
            <button
              onClick={() => navigate('/movies')}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white font-semibold rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20 text-sm"
            >
              + Add More
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="glass rounded-2xl p-6 border border-red-500/20 bg-red-500/5 mb-8 animate-slide-up">
            <p className="text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && watchlist.length === 0 && !error && (
          <div className="glass rounded-3xl p-12 sm:p-16 text-center border border-white/5 animate-slide-up max-w-2xl mx-auto">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#EAB308]/10 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                <Heart className="w-12 h-12 text-white/30" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Nothing Here Yet</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
              Start building your collection by adding movies and shows you want to watch
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="px-8 py-4 bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#EAB308]/20 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Start Exploring
            </button>
          </div>
        )}

        {/* Modern Watchlist Grid */}
        {watchlist.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 animate-slide-up">
            {watchlist.map((item, index) => (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:z-10"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Card Container */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#EAB308]/50 transition-all duration-300">
                  {/* Poster Image */}
                  <img
                    src={item.poster_image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-1.5">
                      {item.entertainment_type === 'movie' ? (
                        <Film className="w-3 h-3 text-[#EAB308]" />
                      ) : (
                        <Tv className="w-3 h-3 text-[#EAB308]" />
                      )}
                      <span className="text-white text-[10px] font-bold uppercase tracking-wide">
                        {item.entertainment_type === 'movie' ? 'Movie' : 'Series'}
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  {item.imdb_rating && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-yellow-500/30">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-xs font-bold">{item.imdb_rating}</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay with Actions */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4">
                    <button
                      onClick={() => handlePlay(item)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#EAB308] to-[#FACC15] flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#EAB308]/30"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-black fill-black ml-0.5" />
                    </button>
                    
                    <button
                      onClick={() => handleRemove(item.entertainment_id)}
                      disabled={removingId === item.entertainment_id}
                      className="px-4 py-2 rounded-lg bg-red-500/90 hover:bg-red-600 text-white text-xs font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {removingId === item.entertainment_id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Removing...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1.5 line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/60">
                      {item.year && (
                        <span className="font-medium">{item.year}</span>
                      )}
                      {item.duration && item.year && (
                        <span>•</span>
                      )}
                      {item.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
