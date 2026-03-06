import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ThumbsUp, ChevronDown, Star, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { contentService } from '@/services/contentService';
import { subscriptionService } from '@/services/subscriptionService';
import { useAppSelector } from '@/hooks/useRedux';
import type { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  onClick?: (movie: Movie) => void;
  variant?: 'default' | 'continue-watching';
}

export default function MovieCard({
  movie,
  index = 0,
  onClick,
  variant = 'default',
}: MovieCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const rafRef = useRef<number | null>(null);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to like movies');
      navigate('/auth');
      return;
    }

    try {
      setIsLiked(!isLiked);
      await contentService.likeContent(movie.id, 'movie');
      toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
    } catch (error) {
      setIsLiked(isLiked); // Revert on error
      console.error('Failed to like content:', error);
    }
  };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

      // Navigate to movie detail page to play
      navigate(`/movie/${movie.id}`);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      toast.error('Failed to play video');
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const { clientX, clientY } = e;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -12;
      const rotateY = (x - 0.5) * 12;
      setTransform({ rotateX, rotateY });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (variant === 'continue-watching') {
    return (
      <div
        ref={cardRef}
        className="relative flex-shrink-0 w-[85vw] sm:w-[320px] cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={() => onClick?.(movie)}
        style={{
          animationDelay: `${index * 0.05}s`,
        }}
      >
        <div
          className="relative rounded-lg overflow-hidden transition-all duration-300"
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(1.02)`
              : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title)}&size=400&background=1a1a1a&color=EAB308&bold=true`;
              }}
            />

            {/* Paid Badge for Continue Watching */}
            {movie.isPaid && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-yellow-500/30 text-[#F5C518]">
                <Crown className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Premium</span>
              </div>
            )}

            {/* 18+ Badge for Continue Watching */}
            {movie.isRestricted && (
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-red-600/90 backdrop-blur-md rounded-md border border-red-500/30 text-white">
                <span className="text-[10px] font-black tracking-wider">18+</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full progress-bar-animated"
              style={{ width: `${movie.progress}%` }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-3">
          <h3 className="text-white font-semibold text-sm truncate group-hover:text-[#EAB308] transition-colors">
            {movie.title}
          </h3>
          <p className="text-white/50 text-xs mt-1">{movie.episodeInfo}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] cursor-pointer optimize-gpu"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={() => onClick?.(movie)}
      style={{
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div
        className="relative rounded-lg overflow-hidden transition-all duration-500 ease-out optimize-gpu"
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(1.15)`
            : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
          transformStyle: 'preserve-3d',
          zIndex: isHovered ? 50 : 1,
          boxShadow: isHovered
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(234, 179, 8, 0.2)'
            : 'none',
        }}
      >
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
            onError={(e) => {
              const target = e.currentTarget;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title)}&size=600&background=1a1a1a&color=EAB308&bold=true`;
            }}
          />

          {/* Paid Badge */}
          {movie.isPaid && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 bg-[#F5C518]/90 backdrop-blur-sm rounded-md shadow-lg text-black border border-white/20">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-black tracking-wider uppercase">Premium</span>
            </div>
          )}

          {/* 18+ Badge */}
          {movie.isRestricted && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-red-600/90 backdrop-blur-sm rounded-md shadow-lg text-white border border-red-500/30">
              <span className="text-[10px] font-black tracking-wider">18+</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0.3 }}
          />

          {/* Hover Content */}
          <div
            className="absolute inset-0 flex flex-col justify-end p-4 transition-all duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mb-3">
              <button
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
                onClick={handlePlay}
                title="Play"
              >
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              </button>

              <button
                className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center border transition-colors ${
                  isLiked 
                    ? 'bg-[#EAB308] border-[#EAB308] text-white' 
                    : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                }`}
                onClick={handleLike}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
              </button>
              <button
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(movie);
                }}
                title="More Info"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Movie Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[#EAB308] font-semibold text-xs">
                  {movie.rating}
                </span>
                <span className="text-white/60 text-xs">{movie.duration}</span>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-white/80 text-xs">{movie.imdbRating}</span>
                </div>
              </div>
              <p className="text-white/70 text-xs line-clamp-2">
                {movie.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {movie.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-[10px] text-white/50 px-1.5 py-0.5 bg-white/10 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title (visible when not hovered) */}
      <div
        className="mt-2 transition-opacity duration-300"
        style={{ opacity: isHovered ? 0 : 1 }}
      >
        <h3 className="text-white/80 text-sm font-medium truncate">
          {movie.title}
        </h3>
      </div>
    </div>
  );
}
