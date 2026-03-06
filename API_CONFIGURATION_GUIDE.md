# API Configuration Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [File Structure](#file-structure)
3. [Changing Backend URLs](#changing-backend-urls)
4. [Changing API Endpoints](#changing-api-endpoints)
5. [Adding New Endpoints](#adding-new-endpoints)
6. [Environment Variables](#environment-variables)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### For New Developers: How to Change Backend APIs

**All API configuration is centralized in ONE file:**
```
src/config/api.config.ts
```

**To change backend URLs:**
1. Open `src/config/api.config.ts`
2. Update the `BASE_URLS` object
3. Save the file
4. Restart dev server

**That's it!** No need to change service files or components.

---

## 📁 File Structure

```
src/
├── config/
│   └── api.config.ts          ← MAIN CONFIG FILE (Change this!)
├── lib/
│   ├── api.ts                 ← Axios instances (uses config)
│   └── axios.ts               ← Legacy file (not used)
├── services/
│   ├── authService.ts         ← Uses endpoints from config
│   ├── contentService.ts      ← Uses endpoints from config
│   └── subscriptionService.ts ← Uses endpoints from config
```

### Key Files

| File | Purpose | Should You Edit? |
|------|---------|------------------|
| `src/config/api.config.ts` | **Main configuration** | ✅ YES - Edit this to change APIs |
| `src/lib/api.ts` | Axios instances | ⚠️ Only if changing interceptors |
| `src/services/*.ts` | API service functions | ❌ NO - They use the config |

---

## 🔧 Changing Backend URLs

### Method 1: Environment Variables (Recommended)

**Step 1:** Create/edit `.env` file in project root:
```env
VITE_API_BASE_URL=https://your-backend.com/api
VITE_API_V2_BASE_URL=https://your-backend.com/api/v2
VITE_STATIC_PAGE_URL=https://your-backend.com/page
```

**Step 2:** Restart dev server:
```bash
npm run dev
```

### Method 2: Direct Configuration

**Step 1:** Open `src/config/api.config.ts`

**Step 2:** Update `BASE_URLS`:
```typescript
export const BASE_URLS = {
  API_V1: 'https://your-backend.com/api',
  API_V2: 'https://your-backend.com/api/v2',
  STATIC_PAGES: 'https://your-backend.com/page',
} as const;
```

**Step 3:** Save and restart dev server

---

## 🎯 Changing API Endpoints

### Example: Change Login Endpoint

**Current:** `/login`  
**New:** `/auth/login`

**Step 1:** Open `src/config/api.config.ts`

**Step 2:** Find the endpoint in `API_ENDPOINTS`:
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',  // ← Change this
    // ... other endpoints
  },
}
```

**Step 3:** Update it:
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',  // ← Updated!
    // ... other endpoints
  },
}
```

**Step 4:** Save the file

**That's it!** All services using this endpoint will automatically use the new URL.

---

## ➕ Adding New Endpoints

### Example: Add a "Get User Profile" Endpoint

**Step 1:** Open `src/config/api.config.ts`

**Step 2:** Add to appropriate section:
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    GET_PROFILE: '/user/profile',  // ← Add new endpoint
    // ... other endpoints
  },
}
```

**Step 3:** Use in service file (`src/services/authService.ts`):
```typescript
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/api.config';

export const authService = {
  // ... existing methods
  
  // New method using the new endpoint
  getUserProfile: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.GET_PROFILE);
    return response.data;
  },
};
```

---

## 🌍 Environment Variables

### Available Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Main API base URL (V1) | `https://portal.4sidesplay.com/api` |
| `VITE_API_V2_BASE_URL` | API V2 base URL | `https://portal.4sidesplay.com/api/v2` |
| `VITE_STATIC_PAGE_URL` | Static pages base URL | `https://portal.4sidesplay.com/page` |
| `VITE_RAZORPAY_KEY` | Razorpay payment key | - |

### Setting Up Environment Variables

**Development (.env):**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_V2_BASE_URL=http://localhost:3000/api/v2
VITE_STATIC_PAGE_URL=http://localhost:3000/page
VITE_RAZORPAY_KEY=rzp_test_xxxxx
```

**Production (.env.production):**
```env
VITE_API_BASE_URL=https://api.production.com/api
VITE_API_V2_BASE_URL=https://api.production.com/api/v2
VITE_STATIC_PAGE_URL=https://api.production.com/page
VITE_RAZORPAY_KEY=rzp_live_xxxxx
```

---

## 📚 Examples

### Example 1: Switch to Local Backend

**Scenario:** You want to test with a local backend running on `http://localhost:8000`

**Solution:**
```env
# .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_V2_BASE_URL=http://localhost:8000/api/v2
VITE_STATIC_PAGE_URL=http://localhost:8000/page
```

### Example 2: Change All Auth Endpoints

**Scenario:** Your backend uses `/auth/*` prefix for all auth endpoints

**Solution:** Edit `src/config/api.config.ts`:
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',      // was: /register
    LOGIN: '/auth/login',            // was: /login
    LOGOUT: '/auth/logout',          // was: /logout
    FORGOT_PASSWORD: '/auth/forgot', // was: /forgot-password
    // ... update all auth endpoints
  },
}
```

### Example 3: Add New Content Type Endpoint

**Scenario:** Add support for "Podcasts"

**Step 1:** Add endpoint in `src/config/api.config.ts`:
```typescript
export const API_ENDPOINTS = {
  CONTENT_V2: {
    MOVIE_DETAILS: '/movie-details',
    TVSHOW_DETAILS: '/tvshow-details',
    PODCAST_DETAILS: '/podcast-details',  // ← New!
    // ... other endpoints
  },
}
```

**Step 2:** Add service method in `src/services/contentService.ts`:
```typescript
import { apiV2 } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/api.config';

export const contentService = {
  // ... existing methods
  
  getPodcastDetails: async (podcastId: string) => {
    const response = await apiV2.get(API_ENDPOINTS.CONTENT_V2.PODCAST_DETAILS, {
      params: { id: podcastId }
    });
    return response.data;
  },
};
```

### Example 4: Use Different API Versions

**Scenario:** Some endpoints are on V1, some on V2, some on V3

**Solution:** Already handled! Just use the correct axios instance:
```typescript
import { api, apiV2, apiV3 } from '@/lib/api';

// V1 endpoint
await api.get('/some-v1-endpoint');

// V2 endpoint
await apiV2.get('/some-v2-endpoint');

// V3 endpoint (static pages)
await apiV3.get('/some-page');
```

---

## 🔍 Troubleshooting

### Issue 1: Changes Not Reflecting

**Problem:** You changed the config but still seeing old URLs

**Solution:**
1. Stop dev server (Ctrl+C)
2. Clear browser cache
3. Restart dev server: `npm run dev`
4. Hard refresh browser (Ctrl+Shift+R)

### Issue 2: CORS Errors

**Problem:** Getting CORS errors after changing backend URL

**Solution:**
1. Ensure backend allows requests from your frontend origin
2. Check backend CORS configuration
3. For development, you can use Vite proxy:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Issue 3: 404 Not Found

**Problem:** Getting 404 errors on API calls

**Solution:**
1. Verify endpoint exists in backend
2. Check endpoint spelling in `api.config.ts`
3. Verify base URL is correct
4. Check browser network tab for actual URL being called

### Issue 4: Authentication Not Working

**Problem:** Auth token not being sent with requests

**Solution:**
1. Check if token is in localStorage: `localStorage.getItem('authToken')`
2. Verify axios interceptor is adding token (check `src/lib/api.ts`)
3. Check backend expects `Authorization: Bearer {token}` header

---

## 📝 Best Practices

### ✅ DO:
- Use environment variables for different environments
- Keep all endpoints in `api.config.ts`
- Use TypeScript `as const` for type safety
- Document any custom endpoints
- Test after changing endpoints

### ❌ DON'T:
- Hardcode URLs in service files
- Duplicate endpoint definitions
- Commit `.env` file with sensitive keys
- Change service files when only endpoint changes
- Mix V1 and V2 endpoints without clear reason

---

## 🆘 Need Help?

### Quick Checklist:
- [ ] Updated `src/config/api.config.ts`?
- [ ] Restarted dev server?
- [ ] Cleared browser cache?
- [ ] Checked browser console for errors?
- [ ] Verified backend is running?
- [ ] Checked network tab in DevTools?

### Common Questions:

**Q: Do I need to change service files?**  
A: No! Service files automatically use the config.

**Q: Can I use different backends for different endpoints?**  
A: Yes! Just update the specific endpoint URL in `api.config.ts`.

**Q: How do I test with a local backend?**  
A: Update `.env` with local URLs and restart dev server.

**Q: What if my backend has different endpoint names?**  
A: Update the endpoint paths in `API_ENDPOINTS` in `api.config.ts`.

---

## 📖 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Full project guide
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Last Updated:** February 2026  
**Maintained By:** 4Sides Play Development Team
