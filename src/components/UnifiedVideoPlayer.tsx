import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, X, Gauge, Loader2 } from 'lucide-react';

interface UnifiedVideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onClose?: () => void;
  className?: string;
  showControls?: boolean;
  isBackground?: boolean;
}

export default function UnifiedVideoPlayer({
  url,
  title,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  onClose,
  className = "",
  showControls: forceShowControls,
  isBackground = false
}: UnifiedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  // Handle YouTube embed URL transformation
  const getYouTubeEmbedUrl = useCallback((rawUrl: string) => {
    let embedUrl = rawUrl;
    if (rawUrl.includes('watch?v=')) {
      embedUrl = rawUrl.replace('watch?v=', 'embed/');
    } else if (rawUrl.includes('youtu.be/')) {
      embedUrl = rawUrl.replace('youtu.be/', 'youtube.com/embed/');
    }
    
    const params = new URLSearchParams();
    if (autoPlay || isBackground) params.append('autoplay', '1');
    if (muted || isBackground) params.append('mute', '1');
    if (loop || isBackground) {
      params.append('loop', '1');
      const videoId = embedUrl.split('/').pop()?.split('?')[0];
      if (videoId) params.append('playlist', videoId);
    }
    if (isBackground) {
      params.append('controls', '0');
      params.append('showinfo', '0');
      params.append('rel', '0');
      params.append('iv_load_policy', '3');
      params.append('modestbranding', '1');
    }

    const queryString = params.toString();
    return queryString ? `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}${queryString}` : embedUrl;
  }, [autoPlay, muted, isBackground, loop]);

  // Video controls logic
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => setControlsVisible(false), 3000);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
        setIsBuffering(false);
        setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
    };
  }, [isYouTube]);

  // Handle autoplay for background mode
  useEffect(() => {
    if (isBackground && videoRef.current) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay prevented:", error);
        });
      }
    }
  }, [isBackground, url]);

  if (isYouTube) {
    return (
      <div className={`relative w-full h-full bg-black ${className}`}>
        <iframe
          className={`w-full h-full ${isBackground ? 'pointer-events-none scale-110' : ''}`}
          src={getYouTubeEmbedUrl(url)}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {onClose && !isBackground && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-black/60 hover:bg-[#EAB308] text-white hover:text-black transition-all backdrop-blur-md border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group bg-black overflow-hidden flex items-center justify-center ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        autoPlay={autoPlay || isBackground}
        muted={muted || isBackground}
        loop={loop || isBackground}
        playsInline
        className={`w-full h-full ${isBackground ? 'object-cover' : 'object-contain cursor-pointer'}`}
        onClick={!isBackground ? togglePlay : undefined}
      />

      {/* Loading Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-[#EAB308] animate-spin" />
        </div>
      )}

      {/* Overlay Controls */}
      {!isBackground && (forceShowControls !== false) && (
        <div 
          className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-500 bg-gradient-to-t from-black/80 via-transparent to-black/40 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-start">
            <div className="space-y-1">
              {title && <h3 className="text-white font-bold text-lg drop-shadow-md">{title}</h3>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-black/20 hover:bg-[#EAB308] rounded-full transition-colors text-white hover:text-black backdrop-blur-md border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center Play Button (only when paused) */}
          {!isPlaying && !isBuffering && (
            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center group/play">
              <div className="w-20 h-20 rounded-full bg-[#EAB308]/90 group-hover/play:bg-[#EAB308] group-hover/play:scale-110 flex items-center justify-center transition-all shadow-2xl shadow-black/50">
                <Play className="w-10 h-10 text-black fill-black ml-1" />
              </div>
            </button>
          )}

          {/* Bottom Controls */}
          <div className="p-6 pt-10 bg-gradient-to-t from-black via-black/60 to-transparent">
            {/* Progress Bar */}
            <div className="group/progress relative mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#EAB308]"
                style={{
                  background: `linear-gradient(to right, #EAB308 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-white/60 mt-2 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-[#EAB308] transition-colors">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                </button>
                <button onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)} className="text-white hover:text-[#EAB308] transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={() => videoRef.current && (videoRef.current.currentTime += 10)} className="text-white hover:text-[#EAB308] transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2 group/volume">
                  <button onClick={toggleMute} className="text-white hover:text-[#EAB308] transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (videoRef.current) videoRef.current.volume = v;
                      setIsMuted(v === 0);
                    }}
                    className="w-0 group-hover/volume:w-20 transition-all h-1 accent-[#EAB308] appearance-none bg-white/20 rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white transition-colors px-2 py-1 rounded bg-white/5 border border-white/10"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg overflow-hidden flex flex-col">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate);
                            if (videoRef.current) videoRef.current.playbackRate = rate;
                            setShowSpeedMenu(false);
                          }}
                          className={`px-4 py-2 text-xs hover:bg-[#EAB308] hover:text-black transition-colors ${playbackRate === rate ? 'text-[#EAB308]' : 'text-white'}`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={toggleFullscreen} className="text-white hover:text-[#EAB308] transition-colors">
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
