 /**
 * ============================================
 * API CONFIGURATION FILE
 * ============================================
 * 
 * This file contains all API endpoints and base URLs.
 * To change backend APIs, simply update the values here.
 * 
 * INSTRUCTIONS FOR NEW DEVELOPERS:
 * 1. Update BASE_URLS to point to your backend
 * 2. Update ENDPOINTS to match your API routes
 * 3. No need to change service files - they use this config
 * 
 * ============================================
 */

// ============================================
// BASE URLS - Change these to your backend
// ============================================
export const BASE_URLS = {
  // Main API base URL (V1)
  API_V1: import.meta.env.VITE_API_BASE_URL || 'https://portal.4sidesplay.com/api',
  
  // API V2 base URL
  API_V2: import.meta.env.VITE_API_V2_BASE_URL || 'https://portal.4sidesplay.com/api/v2',
  
  // Static pages base URL
  STATIC_PAGES: import.meta.env.VITE_STATIC_PAGE_URL || 'https://portal.4sidesplay.com/page',

  // Razorpay Key
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || '',
} as const;

// ============================================
// API ENDPOINTS - Change these to match your routes
// ============================================
export const API_ENDPOINTS = {
  
  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================
  AUTH: {
    // User Registration
    REGISTER: '/register',
    
    // User Login
    LOGIN: '/login',
    
    // User Logout
    LOGOUT: '/logout',
    
    // Social Login (Google, Facebook, etc.)
    SOCIAL_LOGIN: '/social-login',
    
    // Password Management
    FORGOT_PASSWORD: '/forgot-password',
    CHANGE_PASSWORD: '/change-password',
    
    // User Profile
    USER_DETAIL: '/user-detail',
    UPDATE_PROFILE: '/update-profile',
    DELETE_ACCOUNT: '/delete-account',
    
    // PIN Management
    CHANGE_PIN: '/change-pin',
    VERIFY_PIN: '/verify-pin',
    
    // OTP (with auth)
    SEND_OTP: '/send-otp',
    VERIFY_OTP_AUTH: '/verify-otp',
    
    // Parental Controls
    UPDATE_PARENTAL_LOCK: '/update-parental-lock',
    
    // Device Management
    LOGOUT_ALL: '/logout-all',
    LOGOUT_ALL_NO_AUTH: '/logout-all-data',
    DEVICE_LOGOUT: '/device-logout',
    DEVICE_LOGOUT_NO_AUTH: '/device-logout-data',
  },

  // ==========================================
  // OTP ENDPOINTS (Public - No Auth)
  // ==========================================
  OTP: {
    // Send OTP for login
    LOGIN_OTP: '/login-otp',
    
    // Verify OTP for login
    VERIFY_OTP: '/verify-otp',
    
    // Resend OTP
    RESEND_OTP: '/resend-otp',
  },

  // ==========================================
  // CONTENT ENDPOINTS (V1)
  // ==========================================
  CONTENT_V1: {
    // Dashboard
    DASHBOARD: '/dashboard-detail',
    DASHBOARD_DATA: '/dashboard-detail-data',
    
    // Trending & Banners
    TRENDING: '/get-tranding-data',
    BANNER: '/banner-data',
    
    // Search
    SEARCH: '/search-list',
    
    // Gallery
    GALLERY: '/gallery-list',
    
    // Unlocked Content
    UNLOCKED_CONTENT: '/unlocked-content',
    
    // Vendor
    VENDOR_DASHBOARD: '/vendor-dashboard-list',
    
    // Watchlist
    WATCH_LIST: '/watch-list',
    SAVE_WATCHLIST: '/save-watchlist',
    DELETE_WATCHLIST: '/delete-watchlist',
    
    // Ratings
    SAVE_RATING: '/save-rating',
  },

  // ==========================================
  // CONTENT ENDPOINTS (V2)
  // ==========================================
  CONTENT_V2: {
    // Dashboard
    DASHBOARD: '/dashboard-detail',
    DASHBOARD_DATA: '/dashboard-detail-data',
    
    // Movie Details
    MOVIE_DETAILS: '/movie-details',
    
    // TV Show Details
    TVSHOW_DETAILS: '/tvshow-details',
    
    // Episode Details
    EPISODE_DETAILS: '/episode-details',
    
    // Live TV
    LIVETV_DASHBOARD: '/livetv-dashboard',
    
    // Pay Per View
    PAY_PER_VIEW_LIST: '/pay-per-view-list',
    
    // Profile
    PROFILE_DETAILS: '/profile-details',
    
    // Interactions
    PLAYLIST_ADD: '/playlist-add',
    LIKE_CONTENT: '/like-content',
    SHARE_CONTENT: '/share-content',
  },

  // ==========================================
  // SUBSCRIPTION ENDPOINTS
  // ==========================================
  SUBSCRIPTION: {
    // Subscription Status
    STATUS: '/subscription',
    
    // Plans
    PLAN_LIST: '/plan-list',
    ALL_PLANS: '/plans',
    PLAN_DETAILS: '/plans/:id', // Use with planId parameter
    
    // Subscription Management
    SAVE_SUBSCRIPTION: '/save-subscription-details',
    SUBSCRIPTION_HISTORY: '/user-subscription_histroy',
    CANCEL_SUBSCRIPTION: '/cancle-subscription',
  },

  // ==========================================
  // PAYMENT ENDPOINTS (Razorpay)
  // ==========================================
  PAYMENT: {
    // Razorpay
    CREATE_ORDER: '/create-order',
    SYNC_PAYMENTS: '/razorpay/sync-payments',
  },

  // ==========================================
  // NOTIFICATION ENDPOINTS
  // ==========================================
  NOTIFICATION: {
    // List notifications
    LIST: '/notification-list',
    
    // Remove single notification
    REMOVE: '/notification-remove/:id', // Use with notificationId parameter
    
    // Clear all notifications
    CLEAR_ALL: '/notification-deleteall',
  },

  // ==========================================
  // TV SESSION ENDPOINTS
  // ==========================================
  TV_SESSION: {
    // Initiate TV session
    INITIATE: '/tv/initiate-session',
    
    // Check TV session
    CHECK: '/tv/check-session',
    
    // Confirm TV session
    CONFIRM: '/tv/confrim-session', // Note: Backend has typo 'confrim'
  },

  // ==========================================
  // STATIC PAGES (V3)
  // ==========================================
  STATIC_PAGES: {
    PRIVACY_POLICY: '/privacy-policy',
    TERMS_CONDITIONS: '/terms-conditions',
    HELP_SUPPORT: '/help-and-support',
    REFUND_CANCELLATION: '/refund-and-cancellation-policy',
    DATA_DELETION: '/data-deletation-request',
    ABOUT_US: '/about-us',
    FAQ: '/faq',
  },

  // ==========================================
  // OTHER ENDPOINTS
  // ==========================================
  OTHER: {
    // App Configuration
    APP_CONFIG: '/app-configuration',
    
    // Optimize
    OPTIMIZE: '/optimize',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build full URL for V1 API endpoint
 */
export const buildV1Url = (endpoint: string): string => {
  return `${BASE_URLS.API_V1}${endpoint}`;
};

/**
 * Build full URL for V2 API endpoint
 */
export const buildV2Url = (endpoint: string): string => {
  return `${BASE_URLS.API_V2}${endpoint}`;
};

/**
 * Build full URL for static page
 */
export const buildStaticPageUrl = (endpoint: string): string => {
  return `${BASE_URLS.STATIC_PAGES}${endpoint}`;
};

/**
 * Replace URL parameters (e.g., /plans/:id -> /plans/123)
 */
export const replaceUrlParams = (endpoint: string, params: Record<string, string | number>): string => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  return url;
};

// ============================================
// EXPORT ALL
// ============================================
export default {
  BASE_URLS,
  API_ENDPOINTS,
  buildV1Url,
  buildV2Url,
  buildStaticPageUrl,
  replaceUrlParams,
};
