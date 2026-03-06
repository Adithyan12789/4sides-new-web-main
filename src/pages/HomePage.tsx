import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import Hero from '@/sections/Hero';
import MovieRow from '@/sections/MovieRow';
import Categories from '@/sections/Categories';
import { ShimmerHero, ShimmerRow } from '@/components/ShimmerCard';
import type { Movie } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';
import { useAppSelector } from '@/hooks/useRedux';
import { useProfile } from '@/contexts/ProfileContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { data, loading, error } = useDashboard();
  const { user } = useAppSelector((state) => state.auth);
  const { isChildProfile } = useProfile();
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Show a "taking longer" message after 8 seconds but don't error out
  useEffect(() => {
    let timeout: any;
    if (loading) {
      timeout = setTimeout(() => {
        setIsSlowConnection(true);
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  // Filter content based on parental control or child profile
  const filteredData = useMemo(() => {
    if (!data) return null;
    
    // Check if filtering is needed (parental lock OR child profile)
    const shouldFilter = user?.is_parental_lock_enable === 1 || isChildProfile;
    
    // If no filtering needed, return all data
    if (!shouldFilter) return data;
    
    // Filter out 18+ content from all sections
    const filtered: any = {};
    Object.keys(data).forEach(key => {
      if (data[key]?.movies) {
        filtered[key] = {
          ...data[key],
          movies: data[key].movies.filter((movie: Movie) => !movie.isRestricted)
        };
      } else {
        filtered[key] = data[key];
      }
    });
    
    return filtered;
  }, [data, user, isChildProfile]);

  // Show shimmer only if loading and no data
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#EAB308]/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#EAB308]/3 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Shimmer Hero */}
        <ShimmerHero />

        {/* Shimmer Rows - Reduced to 3 for faster perception */}
        <main className="relative z-10 -mt-32 sm:-mt-40 lg:-mt-48 space-y-12 pb-24">
          {[...Array(3)].map((_, i) => (
            <ShimmerRow key={i} />
          ))}
        </main>

        {/* Loading timeout message */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="px-6 py-3 bg-black/80 backdrop-blur-md rounded-full border border-[#EAB308]/20 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-[#EAB308] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm">
              {isSlowConnection ? 'Connection is slow, still trying...' : 'Loading cinematic experience...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no data and no error yet, but finished loading, show a generic message or stay in shimmer
  if (!filteredData) {
    if (loading) return null; // Should be handled by shimmer above
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4 font-bold">
            {error ? 'Error loading cinematic experience' : 'Unable to load content'}
          </p>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            {error ? (typeof error === 'string' ? error : 'Something went wrong while connecting to our servers. Please try again.') : 'We couldn\'t find any content matching your profile.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#EAB308] text-black font-extrabold rounded-full hover:bg-[#FACC15] hover:scale-105 transition-all shadow-lg shadow-[#EAB308]/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Get banner/slider movies for hero section
  const heroMovies = filteredData['slider']?.movies || [];

  // Get all section keys dynamically from API data (excluding slider and viewedMovies)
  const allSections = Object.keys(filteredData).filter(key => 
    key !== 'slider' && key !== 'viewedMovies' && filteredData[key]?.movies?.length > 0
  );

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#EAB308]/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#EAB308]/3 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section - show slider movies if available */}
      {heroMovies.length > 0 && <Hero movies={heroMovies} />}

      {/* Main Content */}
      <main className={`relative z-10 ${heroMovies.length > 0 ? '-mt-16 sm:-mt-20 lg:-mt-24' : 'pt-24'} space-y-16 pb-24`}>
        {/* Continue Watching - Show first if available */}
        {filteredData['viewedMovies']?.movies?.length > 0 && (
          <MovieRow
            key="viewedMovies"
            title="Continue Watching"
            movies={filteredData['viewedMovies'].movies}
            onMovieClick={handleMovieClick}
            variant="continue-watching"
          />
        )}

        {/* All other sections dynamically */}
        {allSections.map((sectionKey) => {
          const section = filteredData[sectionKey];
          if (!section || section.movies.length === 0) return null;

          // Determine variant based on section key
          let variant: 'default' | 'continue-watching' | 'top10' = 'default';
          if (sectionKey.toLowerCase().includes('top') && sectionKey.toLowerCase().includes('10')) {
            variant = 'top10';
          }

          return (
            <MovieRow
              key={sectionKey}
              title={section.title}
              movies={section.movies}
              onMovieClick={handleMovieClick}
              variant={variant}
            />
          );
        })}

        {/* Categories */}
        <Categories />
      </main>
    </div>
  );
}
