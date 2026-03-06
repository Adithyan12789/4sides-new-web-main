/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance } from 'axios';
import { BASE_URLS, API_ENDPOINTS } from '@/config/api.config';

/**
 * ============================================
 * AXIOS INSTANCES
 * ============================================
 * 
 * This file creates axios instances for different API versions.
 * Base URLs are imported from api.config.ts
 * 
 * To change backend URLs, edit src/config/api.config.ts
 * ============================================
 */

// Base URLs from config
const BASE_URL = BASE_URLS.API_V1;
const BASE_URL_V2 = BASE_URLS.API_V2;
const BASE_URL_V3 = BASE_URLS.STATIC_PAGES;

// Create axios instances
const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const apiV2: AxiosInstance = axios.create({
    baseURL: BASE_URL_V2,
    headers: {
        'Content-Type': 'application/json',
    },
});

const apiV3: AxiosInstance = axios.create({
    baseURL: BASE_URL_V3,
    headers: {
        'Content-Type': 'text/html',
    },
});

const apiPublic: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY,
    },
});

// Request interceptor to add auth token
const addAuthToken = (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

api.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiV2.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Response interceptor to handle errors
const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
        // Only redirect to login if it's an actual auth failure
        // Don't redirect if we're already on the auth page or if it's a profile update
        const isAuthPage = window.location.pathname === '/auth';
        const isProfileUpdate = error.config?.url?.includes('/update-profile');
        const isChangePassword = error.config?.url?.includes('/change-password');
        const isSaveUserProfile = error.config?.url?.includes('/save-userprofile');
        
        // Silently fail profile updates without logging errors
        if (isProfileUpdate) {
            console.warn('Profile update failed: User not authenticated');
            return Promise.reject(error);
        }
        
        // Only clear session and redirect for actual authentication failures
        if (!isAuthPage && !isChangePassword && !isSaveUserProfile) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }
    } else if (error.response?.status === 406) {
        console.error('Device limit reached:', error.response.data);
        
        // Check if this is a profile-related endpoint
        const isSaveUserProfile = error.config?.url?.includes('/save-userprofile');
        
        if (isSaveUserProfile) {
            // For profile operations, provide a more specific message
            if (error.response.data && typeof error.response.data === 'object' && !error.response.data.message) {
                error.response.data.message = 'Unable to update profile. Please logout from other devices in Account Settings and try again.';
            }
        } else {
            // For other operations (login, etc.), use the standard message
            if (error.response.data && typeof error.response.data === 'object' && !error.response.data.message) {
                error.response.data.message = 'Maximum device limit reached. Please logout from other devices to continue.';
            }
        }
    }
    return Promise.reject(error);
};

api.interceptors.response.use((response) => response, handleAuthError);
apiV2.interceptors.response.use((response) => response, handleAuthError);
apiPublic.interceptors.response.use((response) => response, (error) => Promise.reject(error));

/**
 * ============================================
 * API ENDPOINTS
 * ============================================
 * 
 * IMPORTANT: This is kept for backward compatibility.
 * For new development, use API_ENDPOINTS from @/config/api.config
 * 
 * To change endpoints, edit src/config/api.config.ts
 * ============================================
 */
export const ENDPOINTS = {
    // Auth
    AUTH: API_ENDPOINTS.AUTH,

    // OTP (Public - No Auth Required)
    OTP: API_ENDPOINTS.OTP,

    // Dashboard & Content
    CONTENT: {
        ...API_ENDPOINTS.CONTENT_V1,
        V2: API_ENDPOINTS.CONTENT_V2,
    },

    // TV & Sessions
    TV: API_ENDPOINTS.TV_SESSION,

    // Useful links (full URLs)
    PRIVACY_POLICY: `${BASE_URL_V3}${API_ENDPOINTS.STATIC_PAGES.PRIVACY_POLICY}`,
    TERMS_CONDITIONS: `${BASE_URL_V3}${API_ENDPOINTS.STATIC_PAGES.TERMS_CONDITIONS}`,
    HELP_SUPPORT: `${BASE_URL_V3}${API_ENDPOINTS.STATIC_PAGES.HELP_SUPPORT}`,
    REFUND_CANCELLATION_POLICY: `${BASE_URL_V3}${API_ENDPOINTS.STATIC_PAGES.REFUND_CANCELLATION}`,
    DATA_DELETION_REQUEST: `${BASE_URL_V3}${API_ENDPOINTS.STATIC_PAGES.DATA_DELETION}`,
    ABOUT_US: `${BASE_URL_V3}${API_ENDPOINTS.STATIC_PAGES.ABOUT_US}`,
    FAQ: `${BASE_URL_V3}${API_ENDPOINTS.STATIC_PAGES.FAQ}`,

    // Others
    NOTIFICATIONS: API_ENDPOINTS.NOTIFICATION.LIST,
    NOTIFICATION_LIST: API_ENDPOINTS.NOTIFICATION.LIST,
    SUBSCRIPTION: API_ENDPOINTS.SUBSCRIPTION.STATUS,
    APP_CONFIG: API_ENDPOINTS.OTHER.APP_CONFIG,
    OPTIMIZE: API_ENDPOINTS.OTHER.OPTIMIZE,
    RAZORPAY: API_ENDPOINTS.PAYMENT,
};


export { api, apiPublic, apiV2, apiV3 };
export default api;

