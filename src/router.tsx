import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

// Lazy load pages for performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const MoviesPage = lazy(() => import('@/pages/MoviesPage'));
const TVShowsPage = lazy(() => import('@/pages/TVShowsPage'));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const MovieDetailPage = lazy(() => import('@/pages/MovieDetailPage'));
const LanguageMoviesPage = lazy(() => import('@/pages/LanguageMoviesPage'));
const CategoryViewAllPage = lazy(() => import('@/pages/CategoryViewAllPage'));
const SubscriptionPage = lazy(() => import('@/pages/SubscriptionPage'));
const MyWatchlistPage = lazy(() => import('@/pages/MyWatchlistPage'));
const UnlockedVideosPage = lazy(() => import('@/pages/UnlockedVideosPage'));
const SubscriptionHistoryPage = lazy(() => import('@/pages/SubscriptionHistoryPage'));
const PayPerViewHistoryPage = lazy(() => import('@/pages/PayPerViewHistoryPage'));
const AccountSettingsPage = lazy(() => import('@/pages/AccountSettingsPage'));
const StaticPage = lazy(() => import('@/pages/StaticPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));

// Simple loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-2 border-[#7B61FF]/20 border-t-[#7B61FF] rounded-full animate-spin" />
  </div>
);

function Layout() {
  return (
    <div className="min-h-screen bg-[#181818] flex flex-col">
      <Navigation />
      <main className="flex-grow animate-fade-in">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'movies',
        element: <MoviesPage />,
      },
      {
        path: 'tv-shows',
        element: <TVShowsPage />,
      },
      {
        path: 'search',
        element: <SearchResultsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'subscription',
        element: <SubscriptionPage />,
      },
      {
        path: 'my-watchlist',
        element: <MyWatchlistPage />,
      },
      {
        path: 'unlocked-videos',
        element: <UnlockedVideosPage />,
      },
      {
        path: 'subscription-history',
        element: <SubscriptionHistoryPage />,
      },
      {
        path: 'pay-per-view-history',
        element: <PayPerViewHistoryPage />,
      },
      {
        path: 'account-settings',
        element: <AccountSettingsPage />,
      },
      {
        path: 'movie/:id',
        element: <MovieDetailPage />,
      },
      {
        path: 'language/:language',
        element: <LanguageMoviesPage />,
      },
      {
        path: 'category/:categoryKey',
        element: <CategoryViewAllPage />,
      },
      {
        path: 'page/:slug',
        element: <StaticPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthPage />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
]);
