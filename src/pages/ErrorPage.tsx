import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';
import { Home, ArrowLeft, Film, Tv, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
  const error = useRouteError();
  const [mounted, setMounted] = useState(false);
  
  let status = 404;
  let message = 'Page not found';
  let description = "The page you're looking for doesn't exist or has been moved.";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.statusText || 'Something went wrong';
    if (status === 404) {
      message = 'Page not found';
      description = "The page you're looking for doesn't exist or has been moved.";
    }
  } else if (error instanceof Error) {
    message = 'Something went wrong';
    description = error.message;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#151515] to-[#0a0a0a] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className={`relative z-10 text-center max-w-2xl w-full transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="mb-8 sm:mb-12">
          <img 
            src="/full-logo.png" 
            alt="4Sides Play" 
            className="h-8 sm:h-10 mx-auto opacity-80"
          />
        </div>

        {/* Animated 404 */}
        <div className="relative mb-6 sm:mb-8">
          <h1 className="text-[120px] sm:text-[180px] lg:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 leading-none animate-gradient">
            {status}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-yellow-500/10 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <Film className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">{message}</h2>
        <p className="text-base sm:text-lg text-white/60 mb-8 sm:mb-12 px-4">{description}</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
          <Link
            to="/"
            className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="text-sm sm:text-base">Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base">Go Back</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="glass-light rounded-2xl p-6 sm:p-8 mx-4">
          <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6">Or explore these sections:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link
              to="/movies"
              className="group flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 border border-white/10"
            >
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base">Movies</span>
            </Link>
            <Link
              to="/tv-shows"
              className="group flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 border border-white/10"
            >
              <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base">TV Shows</span>
            </Link>
            <Link
              to="/search"
              className="group flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 border border-white/10"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm sm:text-base">Search</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
