import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiV2 } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import type { Movie } from '@/types';

interface ApiMovie {
  id: number | string;
  name: string;
  description: string;
  poster_image: string;
  thumbnail_image: string;
  imdb_rating: string;
  content_rating: string;
  duration: string;
  release_date: string | null;
  type: 'movie' | 'tvshow';
  trailer_url: string | null;
  video_url_input: string | null;
  language: string | null;
  movie_access: string | null;
  genres: { id: number; name: string }[];
}

const formatDuration = (duration: string | null): string => {
  if (!duration) return '';
  const match = duration.match(/^(\d{1,2}):(\d{1,2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const h = hours > 0 ? `${hours}h` : '';
    const m = minutes > 0 ? `${minutes}m` : '';
    return `${h} ${m}`.trim();
  }
  return duration;
};

const mapApiMovieToMovie = (apiMovie: ApiMovie): Movie => {
  return {
    id: String(apiMovie.id),
    title: apiMovie.name || '',
    year: apiMovie.release_date ? new Date(apiMovie.release_date).getFullYear() : 2024,
    rating: apiMovie.content_rating || 'PG-13',
    duration: formatDuration(apiMovie.duration),
    imdbRating: parseFloat(apiMovie.imdb_rating) || 0,
    description: (apiMovie.description || '').replace(/<[^>]*>?/gm, ''),
    posterUrl: apiMovie.poster_image || apiMovie.thumbnail_image || '',
    backdropUrl: apiMovie.thumbnail_image || apiMovie.poster_image || '',
    genres: apiMovie.genres ? apiMovie.genres.map((g) => g.name) : [],
    type: apiMovie.type,
    trailerUrl: apiMovie.trailer_url || undefined,
    videoUrl: apiMovie.video_url_input || undefined,
    language: apiMovie.language || undefined,
    isPaid: apiMovie.movie_access?.toLowerCase() === 'paid' || apiMovie.movie_access === '1',
    isRestricted: apiMovie.content_rating === '18+',
  };
};

export default function LanguageMoviesPage() {
  const { language } = useParams<{ language: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchLanguageMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from dashboard data and filter by language
        const response = await apiV2.get('/dashboard-detail-data');
        
        if (response.data.status && response.data.data) {
          const allMovies: Movie[] = [];
          
          // Collect all movies from all sections
          Object.values(response.data.data).forEach((section: any) => {
            if (Array.isArray(section)) {
              section.forEach((movie: ApiMovie) => {
                if (movie.language?.toLowerCase() === language?.toLowerCase()) {
                  allMovies.push(mapApiMovieToMovie(movie));
                }
              });
            } else if (section?.data && Array.isArray(section.data)) {
              section.data.forEach((movie: ApiMovie) => {
                if (movie.language?.toLowerCase() === language?.toLowerCase()) {
                  allMovies.push(mapApiMovieToMovie(movie));
                }
              });
            }
          });
          
          setMovies(allMovies);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };

    if (language) {
      fetchLanguageMovies();
    }
  }, [language]);

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] grain-overlay pt-24 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 capitalize">
          {language} Movies
        </h1>
        
        {movies.length === 0 ? (
          <p className="text-white/60 text-center py-12">No movies found for this language.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-8 sm:gap-10">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => handleMovieClick(movie)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
