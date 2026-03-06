import { X, Play, ThumbsUp, Share2, Star, Clock, Calendar, Globe, Film } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/types';
import VideoModal from './VideoModal';
import { subscriptionService } from '@/services/subscriptionService';
import { authService } from '@/services/authService';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieModal({ movie, isOpen, onClose }: MovieModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const handleWatchNow = async () => {
    if (!movie) return;
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      onClose();
      return;
    }

    // Check subscription status
    const subscriptionStatus = await subscriptionService.checkUserSubscription();
    
    if (!subscriptionStatus.hasActiveSubscription) {
      navigate('/subscription');
      onClose();
      return;
    }

    // User is subscribed, play the video
    setActiveVideoUrl(movie.videoUrl);
    setIsVideoModalOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#181818] rounded-2xl overflow-hidden animate-scale-in shadow-2xl shadow-black/50"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Section */}
        <div className="relative h-[300px] sm:h-[400px]">
          {/* Background Image */}
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/60 to-transparent" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleWatchNow}
              className="group w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 hover:bg-white/30 hover:scale-110 transition-all duration-300"
            >
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </button>
          </div>

          {/* Title & Meta */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 text-shadow-lg">
              {movie.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-[#EAB308] font-semibold">{movie.rating}</span>
              <span className="text-white/40">|</span>
              <span className="text-white/70">{movie.year}</span>
              <span className="text-white/40">|</span>
              <span className="text-white/70">{movie.duration}</span>
              <span className="text-white/40">|</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">{movie.imdbRating}</span>
                <span className="text-white/50">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleWatchNow}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
            >
              <Play className="w-5 h-5 fill-black" />
              Play Now
            </button>

            <button
              onClick={() => {
                setActiveVideoUrl(movie.trailerUrl);
                setIsVideoModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              <Film className="w-5 h-5 text-[#F5C518]" />
              Watch Trailer
            </button>



            <button className="flex items-center gap-2 px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10">
              <ThumbsUp className="w-5 h-5" />
              Rate
            </button>

            <button className="flex items-center gap-2 px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Description */}
          <div>
            <p className="text-white/80 text-base leading-relaxed">
              {movie.description}
            </p>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="px-4 py-2 text-sm text-white/80 bg-white/10 rounded-full border border-white/10 hover:bg-white/20 hover:border-[#EAB308]/50 transition-colors cursor-pointer"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Year</p>
                <p className="text-white text-sm font-medium">{movie.year}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Duration</p>
                <p className="text-white text-sm font-medium">{movie.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Rating</p>
                <p className="text-white text-sm font-medium">{movie.imdbRating}/10</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Language</p>
                <p className="text-white text-sm font-medium">English</p>
              </div>
            </div>
          </div>

          {/* More Like This */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">More Like This</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 cursor-pointer hover:ring-2 hover:ring-[#EAB308]/50 transition-all"
                >
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=300&q=80`}
                    alt={`Similar movie ${i}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoTitle={movie?.title || ''}
        videoUrl={activeVideoUrl}
        posterUrl={movie?.backdropUrl || movie?.posterUrl}
      />
    </div>
  );
}
