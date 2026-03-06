# API Architecture & Flow

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Components                         │ │
│  │  (HomePage, MovieDetailPage, AuthPage, etc.)               │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Service Layer                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ authService  │  │contentService│  │subscription  │    │ │
│  │  │              │  │              │  │Service       │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  └─────────┼──────────────────┼──────────────────┼───────────┘ │
│            │                  │                  │              │
│            └──────────────────┼──────────────────┘              │
│                               │                                 │
│                               ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  API Configuration                          │ │
│  │              (src/config/api.config.ts)                     │ │
│  │                                                              │ │
│  │  • BASE_URLS (V1, V2, Static Pages)                        │ │
│  │  • API_ENDPOINTS (All endpoint paths)                      │ │
│  │  • Helper functions                                         │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Axios Instances                           │ │
│  │                  (src/lib/api.ts)                           │ │
│  │                                                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │   api    │  │  apiV2   │  │  apiV3   │  │apiPublic │  │ │
│  │  │   (V1)   │  │   (V2)   │  │ (Static) │  │ (No Auth)│  │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │ │
│  └───────┼─────────────┼─────────────┼─────────────┼────────┘ │
│          │             │             │             │           │
└──────────┼─────────────┼─────────────┼─────────────┼───────────┘
           │             │             │             │
           │             │             │             │
           └─────────────┴─────────────┴─────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   API V1     │  │   API V2     │  │ Static Pages │         │
│  │   /api       │  │  /api/v2     │  │    /page     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  portal.4sidesplay.com                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### Example: User Login

```
1. User enters credentials
   ↓
2. AuthPage component
   ↓
3. Calls authService.login(credentials)
   ↓
4. authService imports API_ENDPOINTS from config
   ↓
5. Uses apiPublic.post(API_ENDPOINTS.AUTH.LOGIN, data)
   ↓
6. apiPublic instance adds headers
   ↓
7. Request sent to: BASE_URLS.API_V1 + API_ENDPOINTS.AUTH.LOGIN
   ↓
8. Backend processes request
   ↓
9. Response interceptor handles response
   ↓
10. authService stores token in localStorage
    ↓
11. Returns data to component
    ↓
12. Component updates UI
```

---

## 📂 File Relationships

### Configuration Files

```
src/config/api.config.ts
├── Exports: BASE_URLS
├── Exports: API_ENDPOINTS
├── Exports: Helper functions
└── Used by: src/lib/api.ts

src/lib/api.ts
├── Imports: BASE_URLS from config
├── Imports: API_ENDPOINTS from config
├── Creates: api (V1 instance)
├── Creates: apiV2 (V2 instance)
├── Creates: apiV3 (Static pages instance)
├── Creates: apiPublic (No auth instance)
├── Exports: ENDPOINTS (backward compatibility)
└── Used by: All service files

.env
├── Defines: VITE_API_BASE_URL
├── Defines: VITE_API_V2_BASE_URL
├── Defines: VITE_STATIC_PAGE_URL
└── Used by: src/config/api.config.ts
```

### Service Files

```
src/services/authService.ts
├── Imports: api, apiPublic from @/lib/api
├── Imports: API_ENDPOINTS from @/config/api.config
├── Uses: API_ENDPOINTS.AUTH.*
└── Used by: Components, Redux slices

src/services/contentService.ts
├── Imports: api, apiV2, apiV3 from @/lib/api
├── Imports: API_ENDPOINTS from @/config/api.config
├── Uses: API_ENDPOINTS.CONTENT_V1.*, API_ENDPOINTS.CONTENT_V2.*
└── Used by: Components, Redux slices

src/services/subscriptionService.ts
├── Imports: api, apiPublic from @/lib/api
├── Imports: API_ENDPOINTS from @/config/api.config
├── Uses: API_ENDPOINTS.SUBSCRIPTION.*, API_ENDPOINTS.PAYMENT.*
└── Used by: Components, Redux slices
```

---

## 🎯 Axios Instances

### Instance Types

| Instance | Base URL | Auth Required | Use Case |
|----------|----------|---------------|----------|
| `api` | API_V1 | ✅ Yes | Authenticated V1 endpoints |
| `apiV2` | API_V2 | ✅ Yes | Authenticated V2 endpoints |
| `apiV3` | STATIC_PAGES | ❌ No | Static HTML pages |
| `apiPublic` | API_V1 | ❌ No | Public endpoints (login, register) |

### Request Interceptors

```typescript
// All instances except apiPublic
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptors

```typescript
// Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
```

---

## 🔐 Authentication Flow

### Login Process

```
┌─────────────┐
│   User      │
│ Enters      │
│ Credentials │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  authService.login(credentials)     │
│                                     │
│  1. Add device_id                   │
│  2. Call apiPublic.post()           │
│  3. Endpoint: API_ENDPOINTS.AUTH.LOGIN │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend API                        │
│  POST /api/login                    │
│                                     │
│  1. Validate credentials            │
│  2. Generate token                  │
│  3. Return user + token             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  authService                        │
│                                     │
│  1. Extract token from response     │
│  2. Store in localStorage           │
│  3. Store user data                 │
│  4. Return success                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Component                          │
│                                     │
│  1. Update Redux state              │
│  2. Redirect to home                │
└─────────────────────────────────────┘
```

### Authenticated Request

```
┌─────────────┐
│  Component  │
│  Calls      │
│  Service    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Service Method                     │
│  api.get(API_ENDPOINTS.CONTENT.*)   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Request Interceptor                │
│                                     │
│  1. Get token from localStorage     │
│  2. Add Authorization header        │
│  3. Send request                    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend API                        │
│  Validates token                    │
│  Returns data                       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Response Interceptor               │
│                                     │
│  1. Check status code               │
│  2. Handle errors (401, 406, etc.)  │
│  3. Return data                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Service Method                     │
│  Returns response.data              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│  Component  │
│  Updates UI │
└─────────────┘
```

---

## 🛠️ How to Change APIs

### Scenario 1: Change Backend URL

**What to change:**
```
.env file
└── VITE_API_BASE_URL=https://new-backend.com/api
```

**What happens:**
```
.env
└── src/config/api.config.ts (reads env var)
    └── src/lib/api.ts (uses BASE_URLS)
        └── All services (use axios instances)
            └── All components (call services)
```

### Scenario 2: Change Single Endpoint

**What to change:**
```
src/config/api.config.ts
└── API_ENDPOINTS.AUTH.LOGIN = '/new-login-path'
```

**What happens:**
```
src/config/api.config.ts
└── src/services/authService.ts (imports API_ENDPOINTS)
    └── authService.login() (uses API_ENDPOINTS.AUTH.LOGIN)
        └── Components (call authService.login())
```

### Scenario 3: Add New Endpoint

**Steps:**
```
1. Add to src/config/api.config.ts
   └── API_ENDPOINTS.CONTENT_V2.NEW_ENDPOINT = '/new-path'

2. Add service method in src/services/contentService.ts
   └── getNewData: async () => {
        return await apiV2.get(API_ENDPOINTS.CONTENT_V2.NEW_ENDPOINT);
      }

3. Use in component
   └── const data = await contentService.getNewData();
```

---

## 📊 Endpoint Categories

### Authentication (21 endpoints)
```
API_ENDPOINTS.AUTH.*
├── REGISTER
├── LOGIN
├── LOGOUT
├── SOCIAL_LOGIN
├── FORGOT_PASSWORD
├── CHANGE_PASSWORD
├── USER_DETAIL
├── UPDATE_PROFILE
├── DELETE_ACCOUNT
└── ... (12 more)
```

### Content V1 (10 endpoints)
```
API_ENDPOINTS.CONTENT_V1.*
├── DASHBOARD
├── DASHBOARD_DATA
├── SEARCH
├── WATCH_LIST
├── SAVE_WATCHLIST
└── ... (5 more)
```

### Content V2 (11 endpoints)
```
API_ENDPOINTS.CONTENT_V2.*
├── MOVIE_DETAILS
├── TVSHOW_DETAILS
├── EPISODE_DETAILS
├── LIVETV_DASHBOARD
├── PLAYLIST_ADD
└── ... (6 more)
```

### Subscription (7 endpoints)
```
API_ENDPOINTS.SUBSCRIPTION.*
├── STATUS
├── PLAN_LIST
├── ALL_PLANS
├── SAVE_SUBSCRIPTION
└── ... (3 more)
```

### Payment (2 endpoints)
```
API_ENDPOINTS.PAYMENT.*
├── CREATE_ORDER
└── SYNC_PAYMENTS
```

---

## 🎨 Visual Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    EASY TO CHANGE                            │
│                                                              │
│  1. Edit ONE file: src/config/api.config.ts                 │
│  2. Change BASE_URLS or API_ENDPOINTS                       │
│  3. Save and restart dev server                             │
│  4. Done! All services automatically use new config         │
│                                                              │
│  ✅ No need to edit service files                           │
│  ✅ No need to edit component files                         │
│  ✅ No need to search for hardcoded URLs                    │
│  ✅ Type-safe with TypeScript                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**For detailed instructions, see:** [API_CONFIGURATION_GUIDE.md](./API_CONFIGURATION_GUIDE.md)
