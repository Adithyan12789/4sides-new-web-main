# 4Sides Play - OTT Streaming Platform

A modern, feature-rich streaming platform built with React, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Documentation

### 📖 Start Here
- **[Documentation Index](./DOCUMENTATION_INDEX.md)** - 📑 **Complete documentation guide**

### For New Developers
- **[Quick Reference](./QUICK_REFERENCE.md)** - ⚡ **5-minute quick start**
- **[API Configuration Guide](./API_CONFIGURATION_GUIDE.md)** - ⭐ **Change backend APIs**
- **[API Visual Guide](./API_VISUAL_GUIDE.md)** - 🎨 **Printable diagrams**

### Architecture & Reference
- **[API Architecture](./API_ARCHITECTURE.md)** - Visual guide to API structure
- **[API Documentation](./API_DOCUMENTATION.md)** - All 70+ API endpoints
- **[Project Documentation](./PROJECT_DOCUMENTATION.md)** - Complete project overview
- **[Performance Guide](./PERFORMANCE.md)** - Performance optimization tips

### Summary
- **[Changes Summary](./CHANGES_SUMMARY.md)** - What we've built
- **[Setup Summary](./API_SETUP_SUMMARY.md)** - How it works

## 🔧 Changing Backend APIs

**All API configuration is in ONE file:**
```
src/config/api.config.ts
```

**To change backend URLs:**
1. Edit `.env` file or `src/config/api.config.ts`
2. Update `BASE_URLS` object
3. Restart dev server

**That's it!** See [API Configuration Guide](./API_CONFIGURATION_GUIDE.md) for details.

## 🛠️ Tech Stack

- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Build tool
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## 📁 Project Structure

```
src/
├── config/
│   └── api.config.ts          ← API configuration (change this!)
├── lib/
│   └── api.ts                 ← Axios instances
├── services/
│   ├── authService.ts         ← Authentication
│   ├── contentService.ts      ← Content management
│   └── subscriptionService.ts ← Subscriptions
├── components/                ← React components
├── pages/                     ← Page components
├── store/                     ← Redux store
└── types/                     ← TypeScript types
```

## 🌍 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=https://portal.4sidesplay.com/api
VITE_API_V2_BASE_URL=https://portal.4sidesplay.com/api/v2
VITE_STATIC_PAGE_URL=https://portal.4sidesplay.com/page
VITE_RAZORPAY_KEY=your_razorpay_key
```

## 📖 Features

- 🎬 Movies & TV Shows streaming
- 👤 User authentication (Email, Social, OTP)
- 💳 Subscription management with Razorpay
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast performance with Vite
- 🔒 Protected routes
- 🌐 Multi-language support

## 🤝 Contributing

1. Read the [API Configuration Guide](./API_CONFIGURATION_GUIDE.md)
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Proprietary - 4Sides Play

---

**Need help?** Check the [API Configuration Guide](./API_CONFIGURATION_GUIDE.md) or [Project Documentation](./PROJECT_DOCUMENTATION.md)

