export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  duration: string;
  description: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  releaseDate?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodeCount: number;
  episodes: Episode[];
  releaseYear?: number;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: string;
  duration: string;
  imdbRating: number;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  genres: string[];
  category?: string;
  progress?: number;
  episodeInfo?: string;
  type?: 'movie' | 'tvshow';
  trailerUrl?: string;
  videoUrl?: string;
  language?: string;
  isPaid?: boolean;
  isRestricted?: boolean; // 18+ content
  seasons?: Season[]; // For TV shows
  totalSeasons?: number;
  totalEpisodes?: number;
}

export interface MovieCategory {
  id: string;
  name: string;
  movies: Movie[];
}

export interface ContinueWatchingItem extends Movie {
  progress: number;
  episodeInfo: string;
}
