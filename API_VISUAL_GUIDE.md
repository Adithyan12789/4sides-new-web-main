# API Visual Guide - Print This!

## 🎯 3-Step Process to Change APIs

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  STEP 1: Open Config File                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📁 src/config/api.config.ts                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  STEP 2: Update URLs or Endpoints                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  export const BASE_URLS = {                                 │
│    API_V1: 'https://your-backend.com/api',  ← Change!      │
│  }                                                           │
│                                                              │
│  export const API_ENDPOINTS = {                             │
│    AUTH: {                                                   │
│      LOGIN: '/login',  ← Change!                           │
│    }                                                         │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  STEP 3: Restart Dev Server                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  $ npm run dev                                               │
│                                                              │
│  ✅ Done! All services use new config automatically         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure (What to Edit)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ✅ EDIT THESE FILES                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📄 .env                                                     │
│     └─ Environment variables (URLs, keys)                   │
│                                                              │
│  📄 src/config/api.config.ts                                │
│     └─ All API endpoints and base URLs                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ⚠️ RARELY EDIT                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📄 src/lib/api.ts                                          │
│     └─ Only if changing interceptors                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ❌ DON'T EDIT THESE                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📄 src/services/authService.ts                             │
│  📄 src/services/contentService.ts                          │
│  📄 src/services/subscriptionService.ts                     │
│     └─ These automatically use the config                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 How Data Flows

```
┌──────────────┐
│   .env       │  Environment Variables
│              │  (URLs, API Keys)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│   src/config/api.config.ts           │  Configuration
│                                      │  (BASE_URLS, API_ENDPOINTS)
│   • BASE_URLS                        │
│   • API_ENDPOINTS                    │
│   • Helper functions                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   src/lib/api.ts                     │  Axios Instances
│                                      │  (HTTP Clients)
│   • api (V1 + Auth)                  │
│   • apiV2 (V2 + Auth)                │
│   • apiV3 (Static Pages)             │
│   • apiPublic (No Auth)              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   src/services/*.ts                  │  API Services
│                                      │  (Business Logic)
│   • authService                      │
│   • contentService                   │
│   • subscriptionService              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   Components                         │  React Components
│                                      │  (UI)
│   • HomePage                         │
│   • MovieDetailPage                  │
│   • AuthPage                         │
│   • etc.                             │
└──────────────────────────────────────┘
```

---

## 🎨 Axios Instances Cheat Sheet

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  api (V1 with Authentication)                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  import { api } from '@/lib/api';                           │
│  await api.get('/endpoint');                                │
│                                                              │
│  ✅ Adds auth token automatically                           │
│  ✅ Base URL: VITE_API_BASE_URL                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  apiV2 (V2 with Authentication)                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  import { apiV2 } from '@/lib/api';                         │
│  await apiV2.get('/endpoint');                              │
│                                                              │
│  ✅ Adds auth token automatically                           │
│  ✅ Base URL: VITE_API_V2_BASE_URL                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  apiV3 (Static Pages, No Auth)                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  import { apiV3 } from '@/lib/api';                         │
│  await apiV3.get('/page-slug');                             │
│                                                              │
│  ❌ No auth token                                           │
│  ✅ Base URL: VITE_STATIC_PAGE_URL                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  apiPublic (Public Endpoints, No Auth)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  import { apiPublic } from '@/lib/api';                     │
│  await apiPublic.post('/login', data);                      │
│                                                              │
│  ❌ No auth token                                           │
│  ✅ Base URL: VITE_API_BASE_URL                            │
│  ✅ Use for: login, register, public data                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Common Tasks Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  TASK: Change Backend URL                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  FILE: .env                                                  │
│                                                              │
│  VITE_API_BASE_URL=https://new-backend.com/api             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  TASK: Change Login Endpoint                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  FILE: src/config/api.config.ts                             │
│                                                              │
│  API_ENDPOINTS.AUTH.LOGIN = '/auth/login'                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  TASK: Add New Endpoint                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  FILE: src/config/api.config.ts                             │
│                                                              │
│  API_ENDPOINTS.CONTENT_V2.NEW_FEATURE = '/new-feature'      │
│                                                              │
│  FILE: src/services/contentService.ts                       │
│                                                              │
│  getNewFeature: async () => {                               │
│    return await apiV2.get(                                  │
│      API_ENDPOINTS.CONTENT_V2.NEW_FEATURE                   │
│    );                                                        │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  TASK: Use Local Backend                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  FILE: .env                                                  │
│                                                              │
│  VITE_API_BASE_URL=http://localhost:8000/api               │
│  VITE_API_V2_BASE_URL=http://localhost:8000/api/v2         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting Flowchart

```
┌─────────────────────────────────────┐
│  Changes not working?               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Did you restart dev server?        │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
        NO          YES
         │           │
         ▼           ▼
┌─────────────┐  ┌─────────────────────┐
│ Restart:    │  │ Did you clear       │
│ npm run dev │  │ browser cache?      │
└─────────────┘  └──────┬──────────────┘
                        │
                  ┌─────┴─────┐
                  │           │
                 NO          YES
                  │           │
                  ▼           ▼
         ┌─────────────┐  ┌──────────────┐
         │ Hard refresh│  │ Check browser│
         │ Ctrl+Shift+R│  │ console for  │
         └─────────────┘  │ errors       │
                          └──────────────┘
```

---

## 📚 Documentation Map

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  START HERE                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📄 QUICK_REFERENCE.md                                      │
│     └─ 5 min read, quick reference card                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  DETAILED GUIDE                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📄 API_CONFIGURATION_GUIDE.md                              │
│     └─ 15 min read, complete guide with examples            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  VISUAL LEARNER                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📄 API_ARCHITECTURE.md                                     │
│     └─ 10 min read, diagrams and flowcharts                 │
│                                                              │
│  📄 API_VISUAL_GUIDE.md (this file)                         │
│     └─ Print this for quick reference                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  REFERENCE                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📄 API_DOCUMENTATION.md                                    │
│     └─ All 70+ API endpoints documented                     │
│                                                              │
│  📄 PROJECT_DOCUMENTATION.md                                │
│     └─ Complete project documentation                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist for New Developers

```
□ Read QUICK_REFERENCE.md
□ Read API_CONFIGURATION_GUIDE.md
□ Copy .env.example to .env
□ Update .env with your backend URLs
□ Open src/config/api.config.ts
□ Understand BASE_URLS structure
□ Understand API_ENDPOINTS structure
□ Run npm install
□ Run npm run dev
□ Test API calls in browser
□ Check browser console for errors
□ Bookmark this guide!
```

---

**Print this page and keep it at your desk!** 📄🖨️
