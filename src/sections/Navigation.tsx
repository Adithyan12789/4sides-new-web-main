import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout, setUser } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function Navigation() {
  const { t } = useLanguage();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { activeProfile, isChildProfile } = useProfile();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTogglingParentalLock, setIsTogglingParentalLock] = useState(false);


  const navLinks = useMemo(() => [
    { name: t('home'), href: '/' },
    { name: t('movies'), href: '/movies' },
    { name: t('tvShows'), href: '/tv-shows' },
    { name: 'Subscription', href: '/subscription' },
  ], [t]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleLogout = async () => {
    try {
      // Clear local session immediately for responsiveness
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Attempt backend logout (thunk now handles success/fail gracefully)
      await dispatch(logout());
      
      toast.success('Logged out successfully');
      setIsMobileMenuOpen(false);
      navigate('/auth');
    } catch (error: any) {
      // Redirect anyway as session is cleared
      navigate('/auth');
    }
  };

  const handleToggleParentalLock = async () => {
    try {
      setIsTogglingParentalLock(true);
      const newValue = user?.is_parental_lock_enable === 1 ? 0 : 1;
      
      const response = await authService.updateParentalLock(newValue === 1);
      
      // Check for success using both success and status fields
      const isSuccess = response.success || response.status;
      
      if (isSuccess) {
        // Update user in localStorage and Redux state
        const updatedUser = { 
          ...user,
          id: user?.id || 0,
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          email: user?.email || '',
          created_at: user?.created_at || '',
          updated_at: user?.updated_at || '',
          is_parental_lock_enable: newValue 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update Redux state properly
        dispatch(setUser(updatedUser));
        
        toast.success(newValue === 1 ? 'Security Control enabled' : 'Security Control disabled');
      } else {
        toast.error(response.message || 'Failed to update security control');
      }
    } catch (error: any) {
      console.error('Parental lock error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update security control');
    } finally {
      setIsTogglingParentalLock(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMobileMenuOpen
        ? 'glass py-3'
        : 'bg-gradient-to-b from-black/80 to-transparent py-5'
        }`}
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-bold text-white tracking-tight hover:text-[#EAB308] transition-colors"
            >
              <img src="/full-logo.png" alt="Logo" className="w-full h-12" />
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`text-base font-semibold tracking-wide transition-colors relative group ${location.pathname === link.href
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                      }`}
                  >
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-[#EAB308] transition-all duration-300 ${location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Modern Search Bar */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[300px] lg:w-[400px] bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-12 pr-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#EAB308] focus:bg-white/15 transition-all duration-300"
                />
              </form>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-white hover:text-[#EAB308] transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Sign In Button / User Avatar */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center gap-2 p-1 rounded-full transition-all duration-300 ${isProfileMenuOpen || location.pathname === '/profile' ? 'ring-2 ring-[#EAB308]/50' : 'hover:ring-2 hover:ring-white/20'
                    }`}
                  aria-label="User menu"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#EAB308] to-[#FACC15] flex items-center justify-center shadow-lg shadow-[#EAB308]/20 border-2 border-white/10">
                    {user?.file_url ? (
                      <img 
                        src={user.file_url} 
                        alt={user.first_name || 'User'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={user?.file_url ? 'hidden' : ''}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-3 w-72 glass rounded-2xl overflow-hidden border border-white/10 animate-fade-in z-10 shadow-2xl backdrop-blur-2xl">
                      {/* Header Section */}
                      <div className="relative px-6 py-5 bg-gradient-to-br from-[#EAB308]/20 via-transparent to-transparent border-b border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#EAB308] to-[#FACC15] flex items-center justify-center shadow-lg shadow-[#EAB308]/30 ring-2 ring-white/10">
                            {user?.file_url ? (
                              <img 
                                src={user.file_url} 
                                alt={user.first_name || 'User'} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={user?.file_url ? 'hidden' : ''}>
                              <User className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-base truncate">
                              {user?.first_name || 'User'}
                            </h3>
                            <p className="text-white/50 text-xs truncate">
                              {user?.email || 'user@example.com'}
                            </p>
                            {activeProfile && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[#EAB308] text-xs font-semibold">
                                  {activeProfile.name}
                                  {isChildProfile && ' (Child)'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAB308]/10 rounded-full blur-3xl -z-10" />
                      </div>

                      {/* Menu Items */}
                      <div className="p-3 space-y-1">
                        <Link
                          to="/account-settings"
                          className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <svg className="w-4 h-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Account Settings</div>
                            <div className="text-xs text-white/40">Manage your account</div>
                          </div>
                          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          to="/profile"
                          className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <User className="w-4 h-4 text-[#EAB308]" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Profile</div>
                            <div className="text-xs text-white/40">View your profile</div>
                          </div>
                          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          to="/my-watchlist"
                          className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <svg className="w-4 h-4 text-[#EAB308]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">My Watchlist</div>
                            <div className="text-xs text-white/40">Saved movies & shows</div>
                          </div>
                          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          to="/subscription"
                          className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <svg className="w-4 h-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Subscription</div>
                            <div className="text-xs text-white/40">Manage your plan</div>
                          </div>
                          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          to="/unlocked-videos"
                          className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <svg className="w-4 h-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Unlocked Videos</div>
                            <div className="text-xs text-white/40">Purchased content</div>
                          </div>
                          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          to="/subscription-history"
                          className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <svg className="w-4 h-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Subscription History</div>
                            <div className="text-xs text-white/40">View past subscriptions</div>
                          </div>
                          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          to="/pay-per-view-history"
                          className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <svg className="w-4 h-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Purchase History</div>
                            <div className="text-xs text-white/40">Pay-per-view purchases</div>
                          </div>
                          <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        {/* Security Control Toggle */}
                        <div className="group flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-300">
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                            <Shield className="w-4 h-4 text-[#EAB308]" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Security Control</div>
                            <div className="text-xs text-white/40">Parental lock</div>
                          </div>
                          <button
                            onClick={handleToggleParentalLock}
                            disabled={isTogglingParentalLock}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                              user?.is_parental_lock_enable === 1 ? 'bg-[#EAB308]' : 'bg-white/20'
                            } ${isTogglingParentalLock ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                                user?.is_parental_lock_enable === 1 ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-3 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* Logout Button */}
                      <div className="p-3">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="group w-full flex items-center gap-4 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 hover:translate-x-1"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold">Sign Out</div>
                            <div className="text-xs text-red-400/60">Logout from account</div>
                          </div>
                          <svg className="w-4 h-4 text-red-400/40 group-hover:text-red-400/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:block px-5 py-2 rounded-full border border-white/20 text-white font-semibold hover:bg-white hover:text-black transition-all duration-300"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-[#EAB308] transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-64 mt-4' : 'max-h-0'
            }`}
        >
          <ul className="flex flex-col gap-2 py-4 border-t border-white/10">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`block py-2 transition-colors ${location.pathname === link.href
                    ? 'text-[#EAB308]'
                    : 'text-white/80 hover:text-white'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {isAuthenticated ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-500 font-semibold transition-colors hover:text-red-400"
                >
                  Sign Out
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/auth"
                  className={`block py-2 transition-colors ${location.pathname === '/auth'
                    ? 'text-[#EAB308]'
                    : 'text-white/80 hover:text-white'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Mobile Search Modal */}
        {isSearchOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-bold">Search</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-white hover:text-[#EAB308] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                handleSearch(e);
                setIsSearchOpen(false);
              }}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-12 pr-4 py-3 text-base text-white placeholder:text-white/50 focus:outline-none focus:border-[#EAB308] focus:bg-white/15 transition-all"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
