import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Calendar, DollarSign, Film, Tv, Video, Play } from 'lucide-react';
import { authService } from '@/services/authService';
import { api } from '@/lib/api';

interface PayPerViewItem {
  id: number;
  movie_id: number;
  type: string;
  amount: number;
  purchase_type: string;
  created_at: string;
  view_expiry_date?: string;
  movie?: {
    id: number;
    name: string;
    poster_image: string;
    duration?: string;
  };
  episode?: {
    id: number;
    name: string;
    poster_image: string;
  };
  video?: {
    id: number;
    name: string;
    poster_image: string;
  };
}

export default function PayPerViewHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PayPerViewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authService.isAuthenticated()) {
        navigate('/auth');
        return;
      }

      const response = await api.get('/transaction-history', {
        params: {
          user_id: user?.id,
          per_page: 100
        }
      });
      
      if (response.data.status && response.data.data) {
        setHistory(response.data.data);
      } else {
        setHistory([]);
      }
    } catch (err: any) {
      console.error('Error fetching pay-per-view history:', err);
      setError(err.response?.data?.message || 'Failed to load purchase history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'movie') return <Film className="w-4 h-4" />;
    if (type === 'episode' || type === 'tvshow') return <Tv className="w-4 h-4" />;
    return <Video className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    if (type === 'movie') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (type === 'episode' || type === 'tvshow') return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    return 'text-green-400 bg-green-500/10 border-green-500/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContentDetails = (item: PayPerViewItem) => {
    if (item.movie) return item.movie;
    if (item.episode) return item.episode;
    if (item.video) return item.video;
    return null;
  };

  const handlePlay = (item: PayPerViewItem) => {
    navigate(`/movie/${item.movie_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 animate-pulse">Loading Purchase History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-20">
      {/* Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAB308]/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#EAB308]" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Purchase History
              </h1>
              <p className="text-white/50 text-lg mt-1">
                {history.length} {history.length === 1 ? 'purchase' : 'purchases'} found
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="glass rounded-2xl p-8 border border-red-500/20 mb-8">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && history.length === 0 && !error && (
          <div className="glass rounded-3xl p-16 text-center border border-white/5 animate-slide-up">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Purchases Yet</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              You haven't purchased any content yet. Browse our collection to find something you'll love.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="px-8 py-4 bg-[#EAB308] text-black font-bold rounded-xl hover:bg-[#FACC15] transition-all duration-300 hover:scale-105"
            >
              Browse Content
            </button>
          </div>
        )}

        {/* History Grid */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
            {history.map((item, index) => {
              const content = getContentDetails(item);
              return (
                <div
                  key={item.id}
                  className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-[#EAB308]/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-4 p-4">
                    {/* Poster */}
                    <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={content?.poster_image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&q=80'}
                        alt={content?.name || 'Content'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Play Button Overlay */}
                      <button
                        onClick={() => handlePlay(item)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#EAB308] flex items-center justify-center">
                          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                        </div>
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white truncate mb-1">
                          {content?.name || 'Unknown Content'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold border ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {item.type}
                          </span>
                          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-white/5 text-white/70 border border-white/10 capitalize">
                            {item.purchase_type}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-[#EAB308]" />
                          <span className="text-white font-bold">${item.amount}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-white/60">Purchased: {formatDate(item.created_at)}</span>
                        </div>

                        {item.view_expiry_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-red-400" />
                            <span className="text-white/60">Expires: {formatDate(item.view_expiry_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
