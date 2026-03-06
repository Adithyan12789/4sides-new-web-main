/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { contentService } from '@/services/contentService';
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
    trailer_url_type?: string;
    video_url_input: string | null;
    video_upload_type?: string;
    language: string | null;
    movie_access: string | null;
    plan_id?: number | null;
    plan_level?: number | null;
    is_restricted?: number;
    download_status?: string;
    enable_quality?: string;
    download_url?: string | null;
    poster_tv_image?: string | null;
    price?: number;
    discounted_price?: number;
    purchase_type?: string;
    access_duration?: string;
    discount?: number;
    available_for?: string;
    is_purchased?: boolean;
    is_watch_list?: boolean;
    status?: number;
    genres: { id: number; name: string }[];
}

const formatDuration = (duration: string | null): string => {
    if (!duration) return '';
    // Handle HH:MM format
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
    // Parse year from release_date
    let year = 2024;
    if (apiMovie.release_date) {
        const parsedYear = new Date(apiMovie.release_date).getFullYear();
        if (!isNaN(parsedYear)) {
            year = parsedYear;
        }
    }

    // Parse IMDb rating
    let imdbRating = 0;
    if (apiMovie.imdb_rating) {
        const parsed = parseFloat(apiMovie.imdb_rating);
        if (!isNaN(parsed)) {
            imdbRating = parsed;
        }
    }

    // Clean description from HTML tags
    const cleanDescription = (apiMovie.description || '').replace(/<[^>]*>?/gm, '');

    // Determine if content is paid
    const isPaid = apiMovie.movie_access?.toLowerCase() === 'paid' || 
                   apiMovie.movie_access === '1' || 
                   !!(apiMovie.price && apiMovie.price > 0);

    // Determine if content is restricted (18+)
    const isRestricted = apiMovie.is_restricted === 1 || 
                        apiMovie.content_rating?.toLowerCase() === 'a' ||
                        apiMovie.content_rating?.toLowerCase() === 'a+';

    return {
        id: String(apiMovie.id),
        title: apiMovie.name || '',
        year,
        rating: apiMovie.content_rating || 'PG-13',
        duration: formatDuration(apiMovie.duration),
        imdbRating,
        description: cleanDescription,
        posterUrl: apiMovie.poster_image || apiMovie.thumbnail_image || '',
        backdropUrl: apiMovie.thumbnail_image || apiMovie.poster_image || '',
        genres: apiMovie.genres ? apiMovie.genres.map((g) => g.name) : [],
        type: apiMovie.type,
        trailerUrl: apiMovie.trailer_url || undefined,
        videoUrl: apiMovie.video_url_input || undefined,
        language: apiMovie.language || undefined,
        isPaid,
        isRestricted,
    };
};

// Map slider item to movie (slider has nested data structure)
const mapSliderToMovie = (sliderItem: any): Movie => {
    const movieData = sliderItem.data;
    if (!movieData) return mapApiMovieToMovie(sliderItem);
    
    return mapApiMovieToMovie(movieData);
};

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchData',
    async (_, { rejectWithValue }) => {
        try {
            // Get user_id from localStorage if available and user is authenticated
            const userStr = localStorage.getItem('user');
            const authToken = localStorage.getItem('authToken');
            let userId: string | number | undefined;
            
            // Only pass user_id if we have both a valid user object and auth token
            if (userStr && userStr !== 'undefined' && authToken) {
                try {
                    const user = JSON.parse(userStr);
                    // Only use user.id if it's a valid number (not a timestamp)
                    if (user.id && typeof user.id === 'number' && user.id < 1000000000) {
                        userId = user.id;
                    }
                } catch (e) {
                    console.error('Error parsing user from localStorage', e);
                }
            }

            // Fetch both endpoints in parallel
            const [dashboardDetail, dashboardData] = await Promise.all([
                contentService.getDashboardDetail(userId), // v2/dashboard-detail (slider, continue watching)
                contentService.getDashboardData(userId)     // v2/dashboard-detail-data (all other sections)
            ]);

            const mappedData: any = {};

            // Process dashboard-detail (slider and continue watching)
            if (dashboardDetail.status && dashboardDetail.data) {
                // Handle slider/banner data
                if (dashboardDetail.data.slider && Array.isArray(dashboardDetail.data.slider)) {
                    mappedData.slider = {
                        title: 'Featured',
                        movies: dashboardDetail.data.slider.map(mapSliderToMovie)
                    };
                }

                // Handle continue watching (continue_watch)
                if (dashboardDetail.data.continue_watch && Array.isArray(dashboardDetail.data.continue_watch)) {
                    mappedData.viewedMovies = {
                        title: 'Continue Watching',
                        movies: dashboardDetail.data.continue_watch.map(mapApiMovieToMovie)
                    };
                }

                // Handle top 10
                if (dashboardDetail.data.top_10 && Array.isArray(dashboardDetail.data.top_10)) {
                    mappedData.top_10 = {
                        title: 'Top 10 Today',
                        movies: dashboardDetail.data.top_10.map(mapApiMovieToMovie)
                    };
                }
            }

            // Process dashboard-detail-data (all other movie sections)
            if (dashboardData.status && dashboardData.data) {
                Object.keys(dashboardData.data).forEach((key) => {
                    const section = dashboardData.data[key];
                    if (section) {
                        if (Array.isArray(section)) {
                            if (section.length > 0) {
                                mappedData[key] = {
                                    title: key.replace(/([A-Z])/g, ' $1').trim(),
                                    movies: section.map(mapApiMovieToMovie)
                                };
                            }
                        } else if (section.data && Array.isArray(section.data)) {
                            if (section.data.length > 0) {
                                mappedData[key] = {
                                    title: section.name || key,
                                    movies: section.data.map(mapApiMovieToMovie)
                                };
                            }
                        }
                    }
                });
            }

            return mappedData;
        } catch (error: any) {
            console.error('Dashboard fetch error:', error);
            return rejectWithValue(error.message || 'Failed to fetch dashboard data');
        }
    }
);


interface DashboardState {
    data: any;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    data: null,
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;
