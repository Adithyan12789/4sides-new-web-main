import { useState, useEffect } from 'react';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import MovieRow from '@/sections/MovieRow';
import Footer from '@/sections/Footer';
import MovieModal from '@/components/MovieModal';
import Categories from './sections/Categories';
import type { Movie } from '@/types';
import { contentService } from '@/services/contentService';
import ShimmerRow from '@/components/ShimmerRow';

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const data = await contentService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  // Extract sections from dashboard data
  const mainBanner = dashboardData?.main_banner || [];
  const rows = dashboardData?.data || [];

  return (
    <div className="min-h-screen bg-[#000000] grain-overlay">
      {/* Navigation */}
      <Navigation />

      {isLoading ? (
        <div className="pt-20">
          <div className="h-[70vh] w-full bg-white/5 animate-pulse" />
          <div className="mt-8 space-y-12">
            <ShimmerRow />
            <ShimmerRow />
            <ShimmerRow />
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          {mainBanner.length > 0 && <Hero movies={mainBanner} />}

          {/* Main Content */}
          <main className="relative z-10 mt-0 sm:-mt-20 lg:-mt-32">
            {rows.map((row: any, index: number) => (
              <MovieRow
                key={row.id || index}
                title={row.title}
                movies={row.movies || []}
                onMovieClick={handleMovieClick}
                variant={row.slug === 'continue-watching' ? 'continue-watching' : row.slug === 'top-10' ? 'top10' : 'default'}
              />
            ))}

            {/* Categories */}
            <Categories />
          </main>
        </>
      )}

      {/* Footer */}
      <Footer />

      {/* Movie Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
