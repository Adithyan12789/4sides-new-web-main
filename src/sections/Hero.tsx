import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Movie } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppSelector } from '@/hooks/useRedux';
import { subscriptionService } from '@/services/subscriptionService';
import VideoModal from '@/components/VideoModal';
import UnifiedVideoPlayer from '@/components/UnifiedVideoPlayer';

interface HeroProps {
  movies: Movie[];
}

export default function Hero({ movies }: HeroProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | undefined>(undefined);

  const movie = movies[currentIndex];
  const hasTrailer = !!movie.trailerUrl;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsLoaded(false);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % movies.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + movies.length) % movies.length);
  };

  useEffect(() => {
    setIsLoaded(true);
  }, [currentIndex]);

  useEffect(() => {
    setIsLoaded(true);
  }, [currentIndex]);

  const handlePlayNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to watch movies');
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

      // User is subscribed, play the video
      setActiveVideoUrl(movie.videoUrl);
      setIsVideoModalOpen(true);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      toast.error('Failed to play video');
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[700px] max-h-[1080px] overflow-hidden bg-black"
    >
      {/* Background Video or Image */}
      <div className="absolute inset-0">
        {hasTrailer ? (
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: isLoaded ? 1 : 0 }}
          >
            <UnifiedVideoPlayer
              url={movie.trailerUrl!}
              isBackground={true}
              autoPlay={true}
              muted={true}
              loop={true}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: isLoaded ? 1 : 0 }}
          >
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title)}&size=1920&background=1a1a1a&color=EAB308&bold=true`;
                setIsLoaded(true);
              }}
            />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* Navigation Arrows - Premium Style */}
      {movies.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 group"
            aria-label="Previous slide"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#EAB308] group-hover:border-[#EAB308] group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#EAB308]/50">
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform group-hover:scale-110" />
            </div>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 group"
            aria-label="Next slide"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#EAB308] group-hover:border-[#EAB308] group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#EAB308]/50">
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform group-hover:scale-110" />
            </div>
          </button>
        </>
      )}

      {/* Content Container */}
      <div className="relative h-full flex items-center">
        <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-12 lg:px-20 xl:px-28 2xl:px-36">
          <div
            className={`max-w-3xl transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Featured Badge */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6 animate-fade-in">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#EAB308] to-[#FACC15] rounded-full">
                <span className="text-black text-xs font-black uppercase tracking-wider">Featured</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
                <Star className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" />
                <span className="text-white font-bold text-sm">{movie.imdbRating}</span>
                <span className="text-white/50 text-xs">IMDb</span>
              </div>
            </div>

            {/* Title with Glow Effect */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 leading-[0.95] tracking-tighter drop-shadow-2xl animate-fade-in-up">
              {movie.title}
            </h1>

            {/* Meta Information - Enhanced */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6 animate-fade-in-up">
              <span className="text-white font-bold text-base sm:text-lg">{movie.year}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
              <span className="text-white/90 text-base sm:text-lg font-medium">{movie.duration}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
              <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-white font-bold text-xs sm:text-sm">{movie.rating}</span>
              </div>
            </div>

            {/* Description - Enhanced with better mobile spacing */}
            <div className="mb-4 sm:mb-6 animate-fade-in-up">
              <p className="text-white/90 text-base sm:text-lg lg:text-xl leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl font-light pr-16 sm:pr-0">
                {movie.description}
              </p>
            </div>

            {/* Genres - Premium Pills */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-8 sm:mb-10 animate-fade-in-up">
              {movie.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white/80 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-[#EAB308]/50 hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Action Buttons - Premium Design */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-3 sm:gap-4 animate-fade-in-up pb-20 sm:pb-0">
              <button
                onClick={handlePlayNow}
                className="group relative flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-black font-black rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#EAB308]/50 overflow-hidden w-full sm:w-auto justify-center sm:justify-start"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15] to-[#EAB308] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black relative z-10 transition-transform group-hover:scale-110" />
                <span className="text-base sm:text-lg relative z-10">{t('playNow')}</span>
              </button>

              <button
                onClick={() => {
                  navigate(`/movie/${movie.id}`);
                }}
                className="group flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-5 bg-white/10 backdrop-blur-xl text-white font-bold rounded-xl sm:rounded-2xl border-2 border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 w-full sm:w-auto justify-center sm:justify-start"
              >
                <Info className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-base sm:text-lg">More Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Indicators - Premium Design */}
      {/* {movies.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group relative"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? 'w-12 bg-gradient-to-r from-[#EAB308] to-[#FACC15] shadow-lg shadow-[#EAB308]/50'
                    : 'w-2 bg-white/30 group-hover:bg-white/60 group-hover:w-8'
                }`}
              />
            </button>
          ))}
        </div>
      )} */}

      {/* Bottom Fade - Enhanced */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoTitle={movie?.title}
        videoUrl={activeVideoUrl}
        posterUrl={movie?.backdropUrl || movie?.posterUrl}
      />
    </section>
  );
}
