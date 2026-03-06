import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Lock, Unlock, Star, Clock, Calendar } from 'lucide-react';
import { contentService } from '@/services/contentService';
import { authService } from '@/services/authService';

interface UnlockedVideo {
  id: number;
  entertainment_id?: number;
  name: string;
  description: string;
  poster_image: string;
  backdrop_image?: string;
  rating?: string;
  imdb_rating?: string;
  duration?: string;
  year?: string;
  type?: string;
  genres?: string[];
}

interface UnlockedContentResponse {
  status: boolean;
  data: {
    movies: any[];
    tvshows: any[];
    videos: any[];
    seasons: any[];
    episodes: any[];
  };
}

export default function UnlockedVideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<UnlockedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnlockedVideos();
  }, []);

  const fetchUnlockedVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authService.isAuthenticated()) {
        navigate('/auth');
        return;
      }

      const response: UnlockedContentResponse = await contentService.getUnlockedContent();
      
      if (response.status && response.data) {
        // Combine all content types into a single array
        const allContent: UnlockedVideo[] = [
          ...response.data.movies.map((item: any) => ({
            id: item.id,
            entertainment_id: item.id,
            name: item.name || item.title,
            description: item.description,
            poster_image: item.poster_image || item.poster_url,
            backdrop_image: item.backdrop_image,
            rating: item.rating,
            imdb_rating: item.imdb_rating,
            duration: item.duration,
            year: item.year,
            type: 'movie',
            genres: item.genres
          })),
          ...response.data.tvshows.map((item: any) => ({
            id: item.id,
            entertainment_id: item.id,
            name: item.name || item.title,
            description: item.description,
            poster_image: item.poster_image || item.poster_url,
            backdrop_image: item.backdrop_image,
            rating: item.rating,
            imdb_rating: item.imdb_rating,
            duration: item.duration,
            year: item.year,
            type: 'tvshow',
            genres: item.genres
          })),
          ...response.data.videos.map((item: any) => ({
            id: item.id,
            entertainment_id: item.id,
            name: item.name || item.title,
            description: item.description,
            poster_image: item.poster_image || item.poster_url,
            backdrop_image: item.backdrop_image,
            rating: item.rating,
            imdb_rating: item.imdb_rating,
            duration: item.duration,
            year: item.year,
            type: 'video',
            genres: item.genres
          }))
        ];
        
        setVideos(allContent);
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      console.error('Error fetching unlocked videos:', err);
      setError(err.response?.data?.message || 'Failed to load unlocked videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (video: UnlockedVideo) => {
    navigate(`/movie/${video.entertainment_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 animate-pulse">Loading Unlocked Videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-20">
      {/* Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-20">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAB308]/10 flex items-center justify-center">
              <Unlock className="w-6 h-6 text-[#EAB308]" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Unlocked Videos
              </h1>
              <p className="text-white/50 text-lg mt-1">
                {videos.length} {videos.length === 1 ? 'video' : 'videos'} purchased
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
        {!loading && videos.length === 0 && !error && (
          <div className="glass rounded-3xl p-16 text-center border border-white/5 animate-slide-up">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Content Purchased Yet</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              You haven't unlocked any videos yet. Browse our collection and unlock premium content to watch anytime.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="px-8 py-4 bg-[#EAB308] text-black font-bold rounded-xl hover:bg-[#FACC15] transition-all duration-300 hover:scale-105"
            >
              Browse Content
            </button>
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="group relative glass rounded-2xl overflow-hidden border border-white/5 hover:border-[#EAB308]/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#EAB308]/10"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={video.poster_image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80'}
                    alt={video.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Unlocked Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#EAB308]/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg">
                    <Unlock className="w-4 h-4 text-black" />
                    <span className="text-black text-xs font-bold uppercase tracking-wider">
                      Unlocked
                    </span>
                  </div>

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handlePlay(video)}
                      className="w-16 h-16 rounded-full bg-[#EAB308] flex items-center justify-center hover:bg-[#FACC15] transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <Play className="w-7 h-7 text-black fill-black ml-1" />
                    </button>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                      {video.name}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      {video.year && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{video.year}</span>
                        </div>
                      )}
                      {video.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{video.duration}</span>
                        </div>
                      )}
                      {video.imdb_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-semibold">{video.imdb_rating}</span>
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
