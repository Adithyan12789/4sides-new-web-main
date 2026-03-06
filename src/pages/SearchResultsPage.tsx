import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAppSelector } from '@/hooks/useRedux';
import { useProfile } from '@/contexts/ProfileContext';
import type { Movie } from '@/types';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, loading } = useDashboard();
  const { user } = useAppSelector((state) => state.auth);
  const { isChildProfile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');

  // Read search query from URL
  useEffect(() => {
    const urlSearch = searchParams.get('q');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Get all content and filter by search
  const searchResults: Movie[] = useMemo(() => {
    if (!data || !searchQuery.trim()) return [];

    const allContent: Movie[] = [];
    Object.values(data).forEach((section: any) => {
      if (section?.movies) {
        allContent.push(...section.movies);
      }
    });

    // Filter out 18+ content if needed
    const shouldFilter = user?.is_parental_lock_enable === 1 || isChildProfile;
    let filtered = shouldFilter 
      ? allContent.filter(m => !m.isRestricted)
      : allContent;

    // Search in title, description, and genres
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query) ||
      m.genres.some(g => g.toLowerCase().includes(query))
    );

    // Remove duplicates
    return Array.from(new Map(filtered.map(m => [m.id, m])).values());
  }, [data, searchQuery, user, isChildProfile]);

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#EAB308]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pt-24 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#EAB308]/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-[#EAB308]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Search Results
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {searchQuery ? `Showing results for "${searchQuery}"` : 'Enter a search query'}
              </p>
            </div>
          </div>

          {searchResults.length > 0 && (
            <p className="text-white/40 text-sm">
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {/* Results Grid */}
        {!searchQuery.trim() ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Search className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-2">Start Searching</h3>
            <p className="text-white/40 max-w-md mx-auto">
              Use the search bar in the navigation to find movies and TV shows
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {searchResults.map((movie, index) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="group cursor-pointer relative animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-2xl">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase border border-white/20">
                      {movie.type === 'tvshow' ? 'TV Show' : 'Movie'}
                    </span>
                  </div>

                  {/* Hover Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#EAB308] text-black text-[10px] font-black rounded uppercase">
                        {movie.rating}
                      </span>
                      <div className="flex items-center gap-1 text-[#EAB308]">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{movie.imdbRating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{movie.year}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <Clock className="w-3 h-3" />
                      <span>{movie.duration}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-bold text-base truncate group-hover:text-[#EAB308] transition-colors duration-300">
                  {movie.title}
                </h3>
                <p className="text-white/40 text-xs font-medium mt-1 truncate">
                  {movie.genres.join(' • ')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Search className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-2">No Results Found</h3>
            <p className="text-white/40 max-w-md mx-auto mb-6">
              We couldn't find any movies or TV shows matching "{searchQuery}"
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#EAB308] text-black font-bold rounded-xl hover:bg-[#FACC15] transition-colors"
            >
              Browse All Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
