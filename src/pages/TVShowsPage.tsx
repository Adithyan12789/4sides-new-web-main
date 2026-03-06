/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, SlidersHorizontal, ChevronDown, Grid, List, Star, Play, Clock, Calendar, Tv } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAppSelector } from '@/hooks/useRedux';
import { useProfile } from '@/contexts/ProfileContext';
import { subscriptionService } from '@/services/subscriptionService';
import type { Movie } from '@/types';

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'az', label: 'A-Z' },
];

export default function TVShowsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useDashboard();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isChildProfile } = useProfile();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // 24 shows per page

  const handleWatchNow = async (show: Movie) => {
    if (!isAuthenticated) {
      toast.error('Please login to watch TV shows');
      navigate('/auth');
      return;
    }

    try {
      // Check if user has active subscription
      const subscriptionResponse = await subscriptionService.checkUserSubscription();
      
      if (!subscriptionResponse.hasActiveSubscription) {
        toast.error('Please subscribe to watch this content');
        navigate('/subscription');
        return;
      }

      // User is subscribed, redirect to detail page with autoplay
      navigate(`/movie/${show.id}?autoplay=true`);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      toast.error('Failed to play video');
    }
  };

  const handleWatchTrailer = (show: Movie) => {
    navigate(`/movie/${show.id}?trailer=true`);
  };

  const shows: Movie[] = useMemo(() => {
    if (!data) return [];

    const allContent: Movie[] = [];
    Object.values(data).forEach((section: any) => {
      if (section?.movies) {
        allContent.push(...section.movies);
      }
    });

    // Filter for tvshows and remove duplicates
    let allShows = allContent.filter(m => m.type === 'tvshow');
    
    // Filter out 18+ content if parental control OR child profile is enabled
    const shouldFilter = user?.is_parental_lock_enable === 1 || isChildProfile;
    if (shouldFilter) {
      allShows = allShows.filter(s => !s.isRestricted);
    }
    
    return Array.from(new Map(allShows.map(m => [m.id, m])).values());
  }, [data, user, isChildProfile]);

  const filteredShows = useMemo(() => {
    let filtered = [...shows];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.genres.some(g => g.toLowerCase().includes(query))
      );
    }

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(s => s.genres.includes(selectedGenre));
    }

    if (selectedYear !== 'All') {
      filtered = filtered.filter(s => s.year.toString() === selectedYear);
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
  }, [searchQuery, selectedGenre, selectedYear, sortBy, shows]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredShows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedShows = filteredShows.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  const genres = useMemo(() => {
    const allGenres = shows.flatMap(s => s.genres);
    return ['All', ...Array.from(new Set(allGenres))].sort();
  }, [shows]);

  const years = useMemo(() => {
    const allYears = shows.map(s => s.year.toString());
    return ['All', ...Array.from(new Set(allYears))].sort((a, b) => b.localeCompare(a));
  }, [shows]);

  const activeFiltersCount = [
    selectedGenre !== 'All',
    selectedYear !== 'All',
  ].filter(Boolean).length;

  const featuredShow = shows[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data || shows.length === 0) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white">
        <p>No TV shows available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Dynamic Hero */}
      {featuredShow && (
        <div className="relative h-[500px] sm:h-[600px] overflow-hidden">
          <img
            src={featuredShow.backdropUrl || featuredShow.posterUrl}
            alt={featuredShow.title}
            className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-12">
            <div className="max-w-[1920px] mx-auto">
              <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                <span className="px-3 py-1 bg-[#F5C518] text-black text-xs font-bold rounded-full uppercase tracking-wider">
                  Featured
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-xs font-bold">{featuredShow.imdbRating}</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-4 animate-fade-in-up delay-100 tracking-tight">
                {featuredShow.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-white/80 animate-fade-in-up delay-200">
                <span className="font-bold text-white">{featuredShow.rating}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>{featuredShow.year}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>{featuredShow.duration}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex gap-2">
                  {featuredShow.genres.slice(0, 3).map(g => (
                    <span key={g} className="px-2 py-0.5 bg-white/5 rounded text-xs border border-white/5">{g}</span>
                  ))}
                </div>
              </div>

              <p className="text-white/70 max-w-2xl mb-8 line-clamp-3 text-lg animate-fade-in-up delay-300 leading-relaxed">
                {featuredShow.description}
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-in-up delay-400">
                <button
                  onClick={() => handleWatchNow(featuredShow)}
                  className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-[#FACC15] transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-black" />
                  </div>
                  Watch Now
                </button>

                <button
                  onClick={() => handleWatchTrailer(featuredShow)}
                  className="group flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10 backdrop-blur-md"
                >
                  <Tv className="w-5 h-5 text-[#F5C518]" />
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="pt-8 pb-16">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Discover TV Shows</h2>
              <p className="text-white/50 text-sm">
                Explore {filteredShows.length} shows across your favorite genres
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group flex-1 min-w-[260px] sm:min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#F5C518] transition-colors" />
                <input
                  type="text"
                  placeholder="Titles, actors, genres..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    resetPagination();
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518] focus:bg-white/10 transition-all text-sm sm:text-base"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    resetPagination();
                  }}
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
                        onClick={() => {
                          setSelectedGenre(genre);
                          resetPagination();
                        }}
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

                <div>
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]" />
                    By Year
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          resetPagination();
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${selectedYear === year
                          ? 'bg-[#F5C518] text-black'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedGenre('All');
                      setSelectedYear('All');
                      resetPagination();
                    }}
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
              {paginatedShows.map((show, index) => (
                <div
                  key={show.id}
                  onClick={() => navigate(`/movie/${show.id}`)}
                  className="group cursor-pointer relative"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-2xl">
                    <img
                      src={show.posterUrl}
                      alt={show.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    {/* Hover Content */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#F5C518] text-black text-[10px] font-black rounded uppercase">
                          {show.rating}
                        </span>
                        <div className="flex items-center gap-1 text-[#F5C518]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold">{show.imdbRating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{show.year}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <Clock className="w-3 h-3" />
                        <span>{show.duration}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-base truncate group-hover:text-[#F5C518] transition-colors duration-300">
                    {show.title}
                  </h3>
                  <p className="text-white/40 text-xs font-medium mt-1 truncate">
                    {show.genres.join(' • ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedShows.map((show, index) => (
                <div
                  key={show.id}
                  onClick={() => navigate(`/movie/${show.id}`)}
                  className="group flex gap-6 p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative w-32 sm:w-48 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 shadow-xl">
                    <img
                      src={show.posterUrl}
                      alt={show.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-2xl group-hover:text-[#F5C518] transition-colors">
                        {show.title}
                      </h3>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/5">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-bold">{show.imdbRating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-4 font-medium">
                      <span className="text-[#F5C518] font-black">{show.rating}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {show.year}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {show.duration}
                      </span>
                    </div>

                    <p className="text-white/50 text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 max-w-4xl">
                      {show.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {show.genres.map(genre => (
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

          {filteredShows.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Search className="w-12 h-12 text-white/20" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">No TV shows found</h3>
              <p className="text-white/40 max-w-md mx-auto">
                We couldn't find any shows matching your current filters. Try adjusting your search or resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('All');
                  setSelectedYear('All');
                  resetPagination();
                }}
                className="mt-8 text-[#F5C518] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredShows.length > 0 && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 border border-white/10 hover:border-[#F5C518]/50"
                aria-label="Previous page"
              >
                <ChevronDown className="w-5 h-5 text-white rotate-90" />
              </button>

              <div className="flex items-center gap-2">
                {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                  let page: number;
                  
                  if (totalPages <= 7) {
                    page = index + 1;
                  } else if (currentPage <= 4) {
                    page = index + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + index;
                  } else {
                    page = currentPage - 3 + index;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`min-w-[44px] h-11 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-[#F5C518] to-[#FACC15] text-black shadow-lg shadow-[#F5C518]/30'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-[#F5C518]/50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 border border-white/10 hover:border-[#F5C518]/50"
                aria-label="Next page"
              >
                <ChevronDown className="w-5 h-5 text-white -rotate-90" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
