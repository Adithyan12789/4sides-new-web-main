import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, Grid, List, Star, Calendar, Clock } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import type { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'az', label: 'A-Z' },
];

export default function CategoryViewAllPage() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useDashboard();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Get movies from the specific category
  const categoryData = useMemo(() => {
    if (!data || !categoryKey) return null;
    return data[categoryKey];
  }, [data, categoryKey]);

  const movies: Movie[] = useMemo(() => {
    if (!categoryData?.movies) return [];
    return categoryData.movies;
  }, [categoryData]);

  const filteredMovies = useMemo(() => {
    let filtered = [...movies];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.genres.some(g => g.toLowerCase().includes(query))
      );
    }

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(m => m.genres.includes(selectedGenre));
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.year - b.year);
        break;
      case 'rating':
        filtered.sort((a, b) => b.imdbRating - a.imdbRating);
        break;
      case 'az':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedGenre, sortBy, movies]);

  const genres = useMemo(() => {
    const allGenres = movies.flatMap(m => m.genres);
    return ['All', ...Array.from(new Set(allGenres))].sort();
  }, [movies]);

  const activeFiltersCount = [selectedGenre !== 'All'].filter(Boolean).length;

  // Get category title
  const categoryTitle = categoryKey?.replace(/-/g, ' ') || 'Movies';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data || movies.length === 0) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white">
        <p>No movies available in this category.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Content Section */}
      <div className="pt-32 pb-16">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight capitalize">{categoryTitle}</h2>
              <p className="text-white/50 text-sm">
                Explore {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group flex-1 min-w-[260px] sm:min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#F5C518] transition-colors" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518] focus:bg-white/10 transition-all text-sm sm:text-base"
                />
              </div>

              <div className="relative">
                <select
                  aria-label="Sort movies"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-10 text-white focus:outline-none focus:border-[#F5C518] cursor-pointer hover:bg-white/10 transition-all font-medium"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0f0f0f] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl border transition-all font-bold ${showFilters || activeFiltersCount > 0
                  ? 'bg-[#F5C518] border-[#F5C518] text-black'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-black text-[#F5C518] text-xs font-black px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#F5C518] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#F5C518] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]" />
                    By Genre
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${selectedGenre === genre
                          ? 'bg-[#F5C518] text-black'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setSelectedGenre('All')}
                    className="text-white/40 hover:text-[#F5C518] text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Area */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
              {filteredMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="group cursor-pointer relative animate-fade-in"
                >
                  <MovieCard movie={movie} index={index} onClick={() => navigate(`/movie/${movie.id}`)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="group flex gap-6 p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all duration-300 animate-fade-in"
                >
                  <div className="relative w-32 sm:w-48 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 shadow-xl">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-2xl group-hover:text-[#F5C518] transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/5">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-bold">{movie.imdbRating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-4 font-medium">
                      <span className="text-[#F5C518] font-black">{movie.rating}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {movie.year}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {movie.duration}
                      </span>
                    </div>

                    <p className="text-white/50 text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 max-w-4xl">
                      {movie.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map(genre => (
                        <span
                          key={genre}
                          className="px-3 py-1 text-xs font-bold text-white/70 bg-white/5 border border-white/5 rounded-lg"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredMovies.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Search className="w-12 h-12 text-white/20" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">No movies found</h3>
              <p className="text-white/40 max-w-md mx-auto">
                We couldn't find any movies matching your current filters. Try adjusting your search or resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('All');
                }}
                className="mt-8 text-[#F5C518] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Recommended Movies Section */}
          {filteredMovies.length > 0 && (
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">You might also like</h3>
                <button
                  onClick={() => navigate('/movies')}
                  className="text-[#F5C518] hover:text-[#F5C518]/80 font-semibold text-sm transition-colors"
                >
                  View All Movies →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {data?.trending?.movies?.slice(0, 6).map((movie: Movie, index: number) => (
                  <div
                    key={movie.id}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    className="group cursor-pointer relative"
                  >
                    <MovieCard movie={movie} index={index} onClick={() => navigate(`/movie/${movie.id}`)} />
                  </div>
                )) || []}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
