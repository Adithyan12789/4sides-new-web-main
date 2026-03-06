import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ThumbsUp, Share2, Star, Clock, Calendar, Globe, ArrowLeft, Film, Plus, Link as LinkIcon, Check, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { contentService } from '@/services/contentService';
import { subscriptionService } from '@/services/subscriptionService';
import { authService } from '@/services/authService';
import MovieCard from '@/components/MovieCard';
import UnifiedVideoPlayer from '@/components/UnifiedVideoPlayer';
import type { Movie, Season, Episode } from '@/types';
import { toast } from 'sonner';


export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useDashboard();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | undefined>(undefined);
  const [isLiked, setIsLiked] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  // Season and Episode states
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  
  // More Like This scroll state
  const moreLikeThisRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position for More Like This
  const checkScrollPosition = () => {
    if (moreLikeThisRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = moreLikeThisRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollMoreLikeThis = (direction: 'left' | 'right') => {
    if (moreLikeThisRef.current) {
      const scrollAmount = moreLikeThisRef.current.clientWidth * 0.8;
      moreLikeThisRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleWatchNow = async () => {
    if (!movie) return;

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      toast.error('Please login to watch content');
      navigate('/auth');
      return;
    }

    // Check subscription status
    const subscriptionStatus = await subscriptionService.checkUserSubscription();
    
    if (!subscriptionStatus.hasActiveSubscription) {
      toast.error('Please subscribe to watch this content');
      navigate('/subscription');
      return;
    }

    // Handle TV Show Playback
    if (movie.type === 'tvshow') {
      if (seasons && seasons.length > 0) {
        // Find the first season with episodes
        const firstSeasonWithEpisodes = seasons.find(s => s.episodes && s.episodes.length > 0);
        if (firstSeasonWithEpisodes && firstSeasonWithEpisodes.episodes?.[0]?.videoUrl) {
          setActiveVideoUrl(firstSeasonWithEpisodes.episodes[0].videoUrl);
          setIsVideoPlaying(true);
        } else {
          toast.error('No episodes available to play right now.');
        }
      } else {
        toast.error('Season information is still loading or unavailable.');
      }
      return;
    }

    // Handle Movie Playback
    if (movie.videoUrl) {
      setActiveVideoUrl(movie.videoUrl);
      setIsVideoPlaying(true);
    } else {
      toast.error('Movie video is unavailable.');
    }
  };

  const handleWatchTrailer = () => {
    setActiveVideoUrl(movie?.trailerUrl);
    setIsVideoPlaying(true);
  };

  const handleCloseVideo = () => {
    setIsVideoPlaying(false);
    setActiveVideoUrl(undefined);
  };

  const handleLike = async () => {
    if (!movie) return;
    
    try {
      await contentService.likeContent(movie.id, movie.type || 'movie');
      setIsLiked(!isLiked);
    } catch (e) {
      console.error('Failed to like content:', e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await contentService.shareContent(movie?.id || '', movie?.type || 'movie');
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
        setIsShareMenuOpen(false);
      }, 2000);
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  const handleShareFacebook = async () => {
    try {
      await contentService.shareContent(movie?.id || '', movie?.type || 'movie');
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
      setIsShareMenuOpen(false);
    } catch (e) {
      console.error('Failed to share on Facebook:', e);
    }
  };

  const handleShareX = async () => {
    try {
      await contentService.shareContent(movie?.id || '', movie?.type || 'movie');
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out ${movie?.title || 'this movie'}!`);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
      setIsShareMenuOpen(false);
    } catch (e) {
      console.error('Failed to share on X:', e);
    }
  };

  const handleSubmitRating = async () => {
    if (!movie || rating === 0) return;
    
    try {
      setIsSubmittingRating(true);
      // Call your rating API here
      // await contentService.rateContent(movie.id, rating, reviewText);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset and close
      setIsRatingModalOpen(false);
      setRating(0);
      setReviewText('');
      
      // Show success message (you can use toast here)
      console.log('Rating submitted:', { rating, reviewText });
    } catch (e) {
      console.error('Failed to submit rating:', e);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const movie = useMemo(() => {
    if (!data) return null;

    // Find movie in any section of the dashboard
    for (const section of Object.values(data) as any[]) {
      const found = section.movies.find((m: Movie) => m.id === id);
      if (found) return found;
    }
    return null;
  }, [data, id]);

  const similarMovies = useMemo(() => {
    if (!data || !movie) return [];
    // Just grab some movies from the same category or a random section
    const allMovies: Movie[] = [];
    for (const section of Object.values(data) as any[]) {
      allMovies.push(...section.movies);
    }
    return allMovies
      .filter(m => m.id !== id)
      .slice(0, 6);
  }, [data, movie, id]);

  // Update scroll buttons when similarMovies changes
  useEffect(() => {
    const container = moreLikeThisRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [similarMovies]);

  // Check URL parameters for autoplay
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const autoplay = searchParams.get('autoplay');
    const trailer = searchParams.get('trailer');

    if (movie) {
      if (autoplay === 'true') {
        // Auto-play the main video
        setActiveVideoUrl(movie.videoUrl);
        setIsVideoPlaying(true);
        // Clean up URL
        window.history.replaceState({}, '', `/movie/${id}`);
      } else if (trailer === 'true') {
        // Auto-play the trailer
        setActiveVideoUrl(movie.trailerUrl);
        setIsVideoPlaying(true);
        // Clean up URL
        window.history.replaceState({}, '', `/movie/${id}`);
      }
    }
  }, [movie, id]);

  // Fetch seasons and episodes for TV shows
  useEffect(() => {
    const fetchSeasonData = async () => {
      if (movie && movie.type === 'tvshow' && id) {
        setLoadingSeasons(true);
        try {
          // First, check if the movie object already has seasons data
          if (movie.seasons && Array.isArray(movie.seasons) && movie.seasons.length > 0) {
            setSeasons(movie.seasons);
            setExpandedSeason(1);
            setLoadingSeasons(false);
            return;
          }

          // Try to fetch from API
          try {
            const response = await contentService.getTvShowDetails(id);
            
            // Handle different possible response structures
            let seasonsData = null;
            
            if (response.data?.tvShowLinks) {
              seasonsData = response.data.tvShowLinks;
            } else if (response.tvShowLinks) {
              seasonsData = response.tvShowLinks;
            } else if (response.data?.seasons) {
              seasonsData = response.data.seasons;
            } else if (response.seasons) {
              seasonsData = response.seasons;
            } else if (Array.isArray(response.data)) {
              seasonsData = response.data;
            } else if (Array.isArray(response)) {
              seasonsData = response;
            }
            
            if (seasonsData && Array.isArray(seasonsData) && seasonsData.length > 0) {
              // Map the API response to our Season interface
              const mappedSeasons = seasonsData.map((season: any, index: number) => ({
                id: season.id || season.season_id || `season-${season.season_number || index + 1}`,
                seasonNumber: season.season_number || season.seasonNumber || index + 1,
                title: season.title || season.name || `Season ${season.season_number || season.seasonNumber || index + 1}`,
                episodeCount: season.episode_count || season.episodeCount || season.total_episodes || season.episodes?.length || 0,
                releaseYear: season.release_year || season.releaseYear || season.year,
                episodes: (season.episodes || []).map((episode: any, epIndex: number) => ({
                  id: episode.id || episode.episode_id || `episode-${episode.episode_number || epIndex + 1}`,
                  title: episode.title || episode.name || `Episode ${episode.episode_number || episode.episodeNumber || epIndex + 1}`,
                  episodeNumber: episode.episode_number || episode.episodeNumber || epIndex + 1,
                  duration: episode.duration || episode.runtime || '',
                  description: episode.description || episode.short_desc || episode.overview || '',
                  thumbnailUrl: episode.thumbnail_url || episode.thumbnailUrl || episode.poster_image || episode.image || episode.still_path || '',
                  videoUrl: episode.video_url || episode.videoUrl || episode.video_url_input || episode.stream_url || '',
                  releaseDate: episode.release_date || episode.releaseDate || episode.air_date
                }))
              }));
              
              setSeasons(mappedSeasons);
              if (mappedSeasons.length > 0) {
                setExpandedSeason(1); // Auto-expand first season
              }
            }
          } catch (apiError: any) {
            // Silently handle API errors - endpoint may not be implemented yet
            // Only log in development
            if (import.meta.env.DEV) {
              console.warn('TV show details endpoint not available:', apiError.response?.status);
            }
          }
        } catch (error) {
          // Silently handle errors
          if (import.meta.env.DEV) {
            console.error('Failed to fetch TV show details:', error);
          }
        } finally {
          setLoadingSeasons(false);
        }
      }
    };

    fetchSeasonData();
  }, [movie, id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset video player state when movie changes
    setIsVideoPlaying(false);
    setActiveVideoUrl(undefined);
    // Reset seasons state
    setSeasons([]);
    setSelectedSeason(1);
    setExpandedSeason(null);
    setLoadingSeasons(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F5C518] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 animate-pulse">Loading Cinematic Experience...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#F5C518] text-black font-bold rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] selection:bg-[#F5C518] selection:text-black">
      {/* Background Grain/Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Navigation Guard (Fade top) */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0F0F0F] to-transparent z-40 pointer-events-none"></div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-28 left-4 sm:left-12 z-50 p-4 rounded-full glass hover:bg-[#F5C518] hover:text-black text-white transition-all duration-500 hover:scale-110 active:scale-95 group shadow-2xl"
      >
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Hero Section - Immersive Backdrop */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {isVideoPlaying && activeVideoUrl ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 lg:p-12 animate-fade-in">
            {/* Dark Backdrop with high blur */}
            <div 
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
              onClick={handleCloseVideo}
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 animate-scale-in">
              {/* Unified Player */}
              <UnifiedVideoPlayer
                url={activeVideoUrl}
                title={movie?.title}
                poster={movie?.backdropUrl || movie?.posterUrl}
                autoPlay={true}
                onClose={handleCloseVideo}
                className="w-full h-full"
              />

              {/* Persistent Header with Close Button (Always visible on top of player) */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={handleCloseVideo}
                  className="p-3 bg-black/40 hover:bg-[#EAB308] rounded-full transition-all text-white hover:text-black backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
                  aria-label="Close player"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Original Hero Content */
          <>
            <div className="absolute inset-0 optimize-gpu">
              {/* Base Backdrop Image - Always rendered as fallback/transition layer */}
              <img
                src={movie.backdropUrl || movie.posterUrl}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
              />

              {/* Background Trailer - Layered on top if available */}
              {movie.trailerUrl && (
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <UnifiedVideoPlayer
                    url={movie.trailerUrl}
                    isBackground={true}
                    autoPlay={true}
                    muted={true}
                    loop={true}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Lighter overlays for better video visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
            </div>

            {/* Hero Content - Elevated for better visibility */}
            <div className="absolute inset-0 flex items-end pb-20 sm:pb-22">
              <div className="max-w-[1920px] mx-auto w-full px-6 sm:px-12 lg:px-20">
                <div className="max-w-5xl space-y-6 animate-slide-up optimize-gpu">
                  {/* High-Impact Meta Tags */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#EAB308] text-black font-black rounded-xl shadow-lg shadow-[#EAB308]/30">
                      <Star className="w-4 h-4 fill-black" />
                      <span className="text-sm">{movie.imdbRating}</span>
                    </div>
                    <div className="px-4 py-2 glass-light rounded-xl text-white/90 border border-white/10 text-sm font-semibold">
                      {movie.rating}
                    </div>
                    <div className="px-4 py-2 glass-light rounded-xl text-white/90 border border-white/10 text-sm font-semibold">
                      {movie.year}
                    </div>
                    <div className="px-4 py-2 glass-light rounded-xl text-white/90 border border-white/10 text-sm font-semibold">
                      {movie.duration}
                    </div>
                  </div>

                  {/* Cinematic Title */}
                  <h1 className="text-5xl sm:text-6xl lg:text-5xl font-black text-white tracking-tight leading-[0.95] drop-shadow-2xl">
                    {movie.title}
                  </h1>

                  {/* Description Preview */}
                  <p className="text-lg sm:text-xl lg:text-base text-white/80 leading-relaxed max-w-3xl line-clamp-3">
                    {movie.description}
                  </p>

                  {/* Visual Genres */}
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.slice(0, 4).map((genre: string) => (
                      <span
                        key={genre}
                        className="px-4 py-1.5 text-xs font-bold text-white/70 bg-white/5 border border-white/10 rounded-full hover:border-[#EAB308]/50 hover:text-white transition-all cursor-default backdrop-blur-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Action Suite */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={handleWatchNow}
                      className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#EAB308] to-yellow-600 hover:from-yellow-600 hover:to-[#EAB308] text-black font-black rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#EAB308]/30"
                    >
                      <Play className="w-5 h-5 fill-black" />
                      <span className="text-sm tracking-wider">WATCH NOW</span>
                    </button>

                    <button
                      onClick={handleWatchTrailer}
                      className="group flex items-center gap-3 px-6 py-4 glass-light text-white font-bold rounded-xl hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10"
                    >
                      <Film className="w-5 h-5 text-[#EAB308]" />
                      <span className="text-sm tracking-wider">TRAILER</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleLike}
                        className={`p-4 glass-light rounded-xl transition-all duration-300 border hover:scale-110 active:scale-95 ${
                          isLiked 
                            ? 'text-[#EAB308] border-[#EAB308] bg-[#EAB308]/10' 
                            : 'text-white hover:text-[#EAB308] border-white/10'
                        }`}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-[#EAB308]' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => setIsShareMenuOpen(true)}
                        className="p-4 glass-light rounded-xl text-white hover:text-[#EAB308] transition-all duration-300 border border-white/10 hover:scale-110 active:scale-95"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={async () => {
                          try {
                            await contentService.saveToWatchlist(movie.id, movie.type || 'movie');
                            navigate('/my-watchlist');
                          } catch (e) {
                            alert('Failed to add to watchlist');
                          }
                        }}
                        className="p-4 glass-light rounded-xl text-white hover:text-[#EAB308] transition-all duration-300 border border-white/10 hover:scale-110 active:scale-95"
                        title="Add to Watchlist"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setIsRatingModalOpen(true)}
                        className="p-4 glass-light rounded-xl text-white hover:text-[#EAB308] transition-all duration-300 border border-white/10 hover:scale-110 active:scale-95"
                        title="Rate"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="relative z-20 max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-20 py-16">
        {/* Conditional Layout: Grid with sidebar if TV show has seasons, otherwise single column */}
        <div className={movie.type === 'tvshow' && (loadingSeasons || seasons.length > 0) ? "grid grid-cols-1 lg:grid-cols-3 gap-12" : "max-w-5xl"}>
          {/* Main Column */}
          <div className={movie.type === 'tvshow' && (loadingSeasons || seasons.length > 0) ? "lg:col-span-2 space-y-16" : "space-y-16"}>

            {/* Story & Description Section */}
            <section className="animate-slide-up">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-[#EAB308] rounded-full"></div>
                  <h2 className="text-2xl lg:text-xl font-black text-white">Storyline</h2>
                </div>
                <p className="text-white/70 text-base lg:text-sm leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </section>

            {/* Seasons & Episodes Section - Only for TV Shows */}
            {movie.type === 'tvshow' && (
              <section className="animate-slide-up [animation-delay:100ms]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-[#EAB308] rounded-full"></div>
                    <h2 className="text-2xl lg:text-xl font-black text-white">Seasons & Episodes</h2>
                  </div>

                  {loadingSeasons ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-12 h-12 border-4 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : seasons.length > 0 ? (
                    <div className="space-y-4">
                      {/* Season Selector */}
                      <div className="flex flex-wrap gap-2">
                        {seasons.map((season) => (
                          <button
                            key={season.id}
                            onClick={() => {
                              setSelectedSeason(season.seasonNumber);
                              setExpandedSeason(season.seasonNumber);
                            }}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                              selectedSeason === season.seasonNumber
                                ? 'bg-[#EAB308] text-black'
                                : 'glass-light text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            Season {season.seasonNumber}
                          </button>
                        ))}
                      </div>

                      {/* Episodes List */}
                      {seasons.map((season) => (
                        season.seasonNumber === selectedSeason && (
                          <div key={season.id} className="space-y-3">
                            {/* Season Header */}
                            <button
                              onClick={() => setExpandedSeason(expandedSeason === season.seasonNumber ? null : season.seasonNumber)}
                              className="w-full flex items-center justify-between p-4 glass-light rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#EAB308]/20 flex items-center justify-center">
                                  <Film className="w-6 h-6 text-[#EAB308]" />
                                </div>
                                <div className="text-left">
                                  <h3 className="text-white font-bold text-lg">
                                    {season.title || `Season ${season.seasonNumber}`}
                                  </h3>
                                  <p className="text-white/60 text-sm">
                                    {season.episodeCount} Episodes
                                    {season.releaseYear && ` • ${season.releaseYear}`}
                                  </p>
                                </div>
                              </div>
                              {expandedSeason === season.seasonNumber ? (
                                <ChevronUp className="w-5 h-5 text-white/60" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-white/60" />
                              )}
                            </button>

                            {/* Episodes Grid */}
                            {expandedSeason === season.seasonNumber && season.episodes && season.episodes.length > 0 && (
                              <div className="grid grid-cols-1 gap-3 animate-slide-up">
                                {season.episodes.map((episode: Episode) => (
                                  <div
                                    key={episode.id}
                                    className="group glass-light rounded-xl border border-white/10 hover:border-[#EAB308]/50 transition-all overflow-hidden cursor-pointer"
                                    onClick={async () => {
                                      if (!episode.videoUrl) return;
                                      
                                      // Check if user is authenticated
                                      if (!authService.isAuthenticated()) {
                                        navigate('/auth');
                                        return;
                                      }

                                      // Check subscription status
                                      const subscriptionStatus = await subscriptionService.checkUserSubscription();
                                      
                                      if (!subscriptionStatus.hasActiveSubscription) {
                                        navigate('/subscription');
                                        return;
                                      }

                                      // User is subscribed, play the episode
                                      setActiveVideoUrl(episode.videoUrl);
                                      setIsVideoPlaying(true);
                                    }}
                                  >
                                    <div className="flex gap-4 p-4">
                                      {/* Episode Thumbnail */}
                                      <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                                        {episode.thumbnailUrl ? (
                                          <>
                                            <img
                                              src={episode.thumbnailUrl}
                                              alt={episode.title}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                // Hide image on error and show placeholder
                                                e.currentTarget.style.display = 'none';
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                          </>
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                                            <Film className="w-8 h-8 text-white/30" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Episode Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-[#EAB308] font-bold text-sm">
                                                Episode {episode.episodeNumber}
                                              </span>
                                              {episode.duration && (
                                                <>
                                                  <span className="text-white/30">•</span>
                                                  <span className="text-white/60 text-sm">{episode.duration}</span>
                                                </>
                                              )}
                                            </div>
                                            <h4 className="text-white font-bold text-base group-hover:text-[#EAB308] transition-colors line-clamp-1">
                                              {episode.title}
                                            </h4>
                                          </div>
                                        </div>
                                        {episode.description && (
                                          <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                                            {episode.description}
                                          </p>
                                        )}
                                        {episode.releaseDate && (
                                          <p className="text-white/40 text-xs mt-2">
                                            Released: {new Date(episode.releaseDate).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="glass-light rounded-xl p-8 border border-white/10 text-center">
                      <Film className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 mb-2">Season and episode information not available</p>
                      <p className="text-white/40 text-sm">This feature may not be supported by the backend yet</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Details Section - Show inline when no seasons/episodes */}
            {(!movie.type || movie.type !== 'tvshow' || (!loadingSeasons && seasons.length === 0)) && (
              <section className="animate-slide-up [animation-delay:100ms]">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-[#EAB308] rounded-full"></div>
                    <h2 className="text-2xl lg:text-xl font-black text-white">Details</h2>
                  </div>

                  <div className="glass-light rounded-2xl p-8 border border-white/10 space-y-8">
                    {/* Movie Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { icon: Calendar, label: 'Release Year', value: movie.year },
                        { icon: Clock, label: 'Duration', value: movie.duration },
                        { icon: Globe, label: 'Language', value: movie.language || 'English' },
                        { icon: Star, label: 'IMDb Rating', value: `${movie.imdbRating}/10` }
                      ].map((item, idx) => (
                        <div key={idx} className="text-center space-y-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#EAB308]/20 to-[#EAB308]/5 flex items-center justify-center mx-auto border border-[#EAB308]/20">
                            <item.icon className="w-6 h-6 text-[#EAB308]" />
                          </div>
                          <div>
                            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-white text-base font-bold">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Genres */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-white/60 uppercase tracking-wider flex items-center gap-2">
                        <Film className="w-4 h-4 text-[#EAB308]" />
                        Genres
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre: string) => (
                          <span
                            key={genre}
                            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg hover:border-[#EAB308]/50 hover:from-[#EAB308]/20 hover:to-[#EAB308]/5 transition-all cursor-default"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Type Badge for TV Shows */}
                    {movie.type === 'tvshow' && (
                      <>
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        <div className="flex items-center justify-center">
                          <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EAB308]/20 to-[#FACC15]/20 border border-[#EAB308]/30">
                            <p className="text-[#EAB308] font-bold text-sm flex items-center gap-2">
                              <Film className="w-4 h-4" />
                              TV Series
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Section - Only show when TV show has seasons */}
          {movie.type === 'tvshow' && (loadingSeasons || seasons.length > 0) && (
            <aside className="lg:col-span-1 space-y-8 animate-slide-up [animation-delay:100ms]">
              <div className="glass-light rounded-3xl p-8 border border-white/10 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAB308]/10 flex items-center justify-center">
                    <Film className="w-5 h-5 text-[#EAB308]" />
                  </div>
                  <h3 className="text-xl font-black text-white">Details</h3>
                </div>

                {/* Movie Info */}
                <div className="space-y-4">
                  {[
                    { icon: Calendar, label: 'Release Year', value: movie.year },
                    { icon: Clock, label: 'Duration', value: movie.duration },
                    { icon: Globe, label: 'Language', value: movie.language || 'English' },
                    { icon: Star, label: 'IMDb Rating', value: `${movie.imdbRating}/10` },
                    ...(seasons.length > 0 ? [
                      { icon: Film, label: 'Seasons', value: seasons.length.toString() },
                      { icon: Film, label: 'Episodes', value: seasons.reduce((total, s) => total + s.episodeCount, 0).toString() }
                    ] : [])
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EAB308]/20 to-[#EAB308]/5 flex items-center justify-center border border-[#EAB308]/20 group-hover:border-[#EAB308]/40 transition-colors">
                        <item.icon className="w-5 h-5 text-[#EAB308]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                        <p className="text-white text-sm font-bold mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                {/* Genres */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-white/60 uppercase tracking-wider flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#EAB308]" />
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg hover:border-[#EAB308]/50 hover:from-[#EAB308]/20 hover:to-[#EAB308]/5 transition-all cursor-default"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TV Series Badge */}
                <div className="pt-4">
                  <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#EAB308]/20 to-[#FACC15]/20 border border-[#EAB308]/30 text-center">
                    <p className="text-[#EAB308] font-bold text-sm flex items-center justify-center gap-2">
                      <Film className="w-4 h-4" />
                      TV Series
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* More Like This Section - Full Width */}
        {similarMovies.length > 0 && (
          <section className="mt-16 animate-slide-up">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-[#EAB308] rounded-full"></div>
                <h2 className="text-2xl lg:text-xl font-black text-white">More Like This</h2>
              </div>
              
              {/* Horizontal Scrollable Container */}
              <div className="relative group">
                {/* Left Navigation Button */}
                {canScrollLeft && (
                  <button
                    onClick={() => scrollMoreLikeThis('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-[#EAB308] hover:text-black hover:border-[#EAB308] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Scrollable Movies Container */}
                <div
                  ref={moreLikeThisRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {similarMovies.map((similar, index) => (
                    <div key={similar.id} className="flex-shrink-0 w-[280px]">
                      <MovieCard
                        movie={similar}
                        index={index}
                        onClick={(movie) => navigate(`/movie/${movie.id}`)}
                      />
                    </div>
                  ))}
                </div>

                {/* Right Navigation Button */}
                {canScrollRight && (
                  <button
                    onClick={() => scrollMoreLikeThis('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-[#EAB308] hover:text-black hover:border-[#EAB308] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Main Video Player Modal - Portaled to root */}
      {/* Removed - Video now plays inline */}

      {/* Share Modal */}
      {isShareMenuOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-3xl p-8 max-w-md w-full border border-white/10 animate-scale-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#EAB308]/20 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-[#EAB308]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Share This Movie</h3>
              <p className="text-white/60 text-sm">{movie?.title}</p>
            </div>

            {/* Share Options */}
            <div className="space-y-3 mb-6">
              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="w-full flex items-center gap-4 px-6 py-4 glass rounded-xl text-white hover:bg-white/10 transition-all duration-300 border border-white/10 group hover:scale-[1.02] active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">Facebook</div>
                  <div className="text-xs text-white/50">Share on Facebook</div>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* X (Twitter) */}
              <button
                onClick={handleShareX}
                className="w-full flex items-center gap-4 px-6 py-4 glass rounded-xl text-white hover:bg-white/10 transition-all duration-300 border border-white/10 group hover:scale-[1.02] active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">X (Twitter)</div>
                  <div className="text-xs text-white/50">Share on X</div>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 px-6 py-4 glass rounded-xl text-white hover:bg-white/10 transition-all duration-300 border border-white/10 group hover:scale-[1.02] active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EAB308] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {linkCopied ? (
                    <Check className="w-6 h-6 text-black" />
                  ) : (
                    <LinkIcon className="w-6 h-6 text-black" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">
                    {linkCopied ? 'Link Copied!' : 'Copy Link'}
                  </div>
                  <div className="text-xs text-white/50">
                    {linkCopied ? 'Link copied to clipboard' : 'Copy link to clipboard'}
                  </div>
                </div>
                {linkCopied ? (
                  <Check className="w-5 h-5 text-[#EAB308]" />
                ) : (
                  <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsShareMenuOpen(false)}
              className="w-full px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-3xl p-8 max-w-lg w-full border border-white/10 animate-scale-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EAB308] to-[#FACC15] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#EAB308]/30">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Rate This Movie</h3>
              <p className="text-white/60 text-sm">{movie?.title}</p>
            </div>

            {/* Star Rating */}
            <div className="mb-8">
              <p className="text-white/80 text-sm mb-4 text-center">How would you rate this movie?</p>
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all duration-300 hover:scale-125 active:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 transition-all duration-300 ${
                        star <= (hoverRating || rating)
                          ? 'text-[#EAB308] fill-[#EAB308] drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                          : 'text-white/30 hover:text-white/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-4 text-[#EAB308] font-bold text-lg animate-fade-in">
                  {rating === 1 && '⭐ Poor'}
                  {rating === 2 && '⭐⭐ Fair'}
                  {rating === 3 && '⭐⭐⭐ Good'}
                  {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                  {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-semibold mb-3">
                Share your thoughts (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us what you think about this movie..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#EAB308] transition-colors resize-none"
                maxLength={500}
              />
              <p className="text-white/40 text-xs mt-2 text-right">
                {reviewText.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRatingModalOpen(false);
                  setRating(0);
                  setReviewText('');
                  setHoverRating(0);
                }}
                disabled={isSubmittingRating}
                className="flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0 || isSubmittingRating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#EAB308]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingRating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 fill-black" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
