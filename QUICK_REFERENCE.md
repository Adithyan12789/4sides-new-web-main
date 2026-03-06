# Quick Reference Card

## 🎯 For New Developers: Change Backend APIs in 3 Steps

### Step 1: Open Config File
```
src/config/api.config.ts
```

### Step 2: Update URLs
```typescript
export const BASE_URLS = {
  API_V1: 'https://your-backend.com/api',     // ← Change this
  API_V2: 'https://your-backend.com/api/v2',  // ← Change this
  STATIC_PAGES: 'https://your-backend.com/page', // ← Change this
}
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

**Done!** All services automatically use the new URLs.

---

## 📂 Key Files

| File | What It Does | Should You Edit? |
|------|--------------|------------------|
| `src/config/api.config.ts` | **API configuration** | ✅ YES |
| `src/lib/api.ts` | Axios instances | ⚠️ Rarely |
| `src/services/*.ts` | API calls | ❌ NO |
| `.env` | Environment variables | ✅ YES |

---

## 🔗 Common Tasks

### Change Login Endpoint
```typescript
// src/config/api.config.ts
API_ENDPOINTS.AUTH.LOGIN = '/new-login-path'
```

### Add New Endpoint
```typescript
// 1. Add to config
API_ENDPOINTS.CONTENT_V2.NEW_FEATURE = '/new-feature'

// 2. Use in service
import { apiV2 } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/api.config';

const data = await apiV2.get(API_ENDPOINTS.CONTENT_V2.NEW_FEATURE);
```

### Use Local Backend
```env
# .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_V2_BASE_URL=http://localhost:8000/api/v2
```

---

## 🚀 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📚 Documentation Links

- **[API Configuration Guide](./API_CONFIGURATION_GUIDE.md)** - Detailed guide
- **[API Architecture](./API_ARCHITECTURE.md)** - Visual diagrams
- **[API Documentation](./API_DOCUMENTATION.md)** - All endpoints
- **[Project Documentation](./PROJECT_DOCUMENTATION.md)** - Full guide

---

## 🆘 Troubleshooting

### Changes Not Working?
1. Stop dev server (Ctrl+C)
2. Clear browser cache
3. Restart: `npm run dev`
4. Hard refresh (Ctrl+Shift+R)

### CORS Errors?
- Check backend CORS settings
- Verify base URL is correct
- Use Vite proxy for development

### 404 Errors?
- Verify endpoint exists in backend
- Check spelling in `api.config.ts`
- Check browser network tab

---

## 💡 Pro Tips

✅ **DO:**
- Use environment variables
- Keep all endpoints in `api.config.ts`
- Test after changes
- Document custom endpoints

❌ **DON'T:**
- Hardcode URLs in services
- Edit service files for endpoint changes
- Commit `.env` with secrets
- Mix V1/V2 without reason

---

## 🎨 Axios Instances

```typescript
import { api, apiV2, apiV3, apiPublic } from '@/lib/api';

// V1 with auth
await api.get('/endpoint');

// V2 with auth
await apiV2.get('/endpoint');

// Static pages (no auth)
await apiV3.get('/page');

// Public (no auth)
await apiPublic.post('/login', data);
```

---

## 🔐 Environment Variables

```env
# Required
VITE_API_BASE_URL=https://api.example.com/api
VITE_API_V2_BASE_URL=https://api.example.com/api/v2
VITE_STATIC_PAGE_URL=https://api.example.com/page

# Optional
VITE_RAZORPAY_KEY=rzp_test_xxxxx
```

---

## 📊 Endpoint Categories

```typescript
API_ENDPOINTS.AUTH.*           // Authentication (21)
API_ENDPOINTS.OTP.*            // OTP Login (3)
API_ENDPOINTS.CONTENT_V1.*     // Content V1 (10)
API_ENDPOINTS.CONTENT_V2.*     // Content V2 (11)
API_ENDPOINTS.SUBSCRIPTION.*   // Subscriptions (7)
API_ENDPOINTS.PAYMENT.*        // Payments (2)
API_ENDPOINTS.NOTIFICATION.*   // Notifications (3)
API_ENDPOINTS.TV_SESSION.*     // TV Sessions (3)
API_ENDPOINTS.STATIC_PAGES.*   // Static Pages (7)
API_ENDPOINTS.OTHER.*          // Other (2)
```

---

**Print this page for quick reference!**
