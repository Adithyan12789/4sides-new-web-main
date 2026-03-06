import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ChevronRight } from 'lucide-react';
import { contentService } from '@/services/contentService';

interface FooterLink {
  id: number;
  title: string;
  url: string;
  page_type?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export default function Footer() {
  const [footerData, setFooterData] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Fetch dashboard data for movies
        const dashboardResponse = await contentService.getDashboardDetail();
        if (dashboardResponse.success || dashboardResponse.status) {
          setFooterData(dashboardResponse.data);
        }

        // Fetch app configuration for email and phone
        const configResponse = await contentService.getAppConfig();
        if (configResponse) {
          setAppConfig(configResponse);
        }
      } catch (error) {
        console.error('Failed to fetch footer data:', error);
      }
    };

    fetchFooterData();
  }, []);

  // Get movies from slider array - extract data property from each slider item
  const sliderMovies = (footerData?.slider || [])
    .map((item: any) => item?.data)
    .filter((movie: any) => movie); // Remove any null/undefined entries
  
  // Filter only paid movies from slider
  const paidMovies = sliderMovies.filter((movie: any) => movie?.movie_access === 'paid');

  // Premium Shows: First 4 paid movies from slider in descending order (reverse)
  const premiumShows = paidMovies
    .slice(0, 4)
    .reverse()
    .map((movie: any, index: number) => ({
      id: movie.id || index,
      title: movie.name || movie.title,
      url: `/movie/${movie.id}`
    }));

  // IMDB Ratings: Top 4 rated paid movies (sorted by rating)
  const imdbRatings = paidMovies
    .filter((movie: any) => movie.imdb_rating || movie.rating)
    .sort((a: any, b: any) => {
      const ratingA = parseFloat(a.imdb_rating || a.rating || 0);
      const ratingB = parseFloat(b.imdb_rating || b.rating || 0);
      return ratingB - ratingA;
    })
    .slice(0, 4)
    .map((movie: any, index: number) => ({
      id: movie.id || index,
      title: movie.name || movie.title,
      url: `/movie/${movie.id}`
    }));

  const usefulLinks = [
    { id: 1, title: 'Privacy Policy', url: '/page/privacy-policy' },
    { id: 2, title: 'Terms & Conditions', url: '/page/terms-conditions' },
    { id: 3, title: 'Help And Support', url: '/page/help-and-support' },
    { id: 4, title: 'Refund And Cancellation Policy', url: '/page/refund-and-cancellation-policy' },
    { id: 5, title: 'Data Deletion Request', url: '/page/data-deletion-request' },
    { id: 6, title: 'About Us', url: '/page/about-us' },
    { id: 7, title: 'FAQ', url: '/page/faq' },
  ];

  // App Store Links
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.FourSidesTV.ott&hl=en_IN';
  const appStoreUrl = 'https://apps.apple.com/in/app/4-sides-tv/id6472454898';

  // Only include sections that have data
  const footerSections: FooterSection[] = [
    ...(premiumShows.length > 0 ? [{ title: 'Premium Shows', links: premiumShows }] : []),
    ...(imdbRatings.length > 0 ? [{ title: 'Based on IMDB Rating', links: imdbRatings }] : []),
    { title: 'Useful Links', links: usefulLinks },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#0F0F0F] to-black border-t border-white/5 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#EAB308]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#EAB308]/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Logo and Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="inline-block group">
              <img 
                src="/full-logo.png" 
                alt="4Sides Play" 
                className="h-14 transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>
            
            <p className="text-white/70 text-sm leading-relaxed">
              Your Ultimate Destination for Unlimited Movies and Shows!
            </p>

            {/* Contact Info Cards */}
            <div className="space-y-3">
              <a 
                href={`mailto:${appConfig?.inquriy_email}`}
                className="flex items-center gap-3 p-3 glass rounded-xl border border-white/10 hover:border-[#EAB308]/50 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#EAB308]/10 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                  <Mail className="w-5 h-5 text-[#EAB308]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Email Us</p>
                  <p className="text-white text-sm truncate">{appConfig?.inquriy_email}</p>
                </div>
              </a>

              <a 
                href={`tel:${appConfig?.helpline_number}`}
                className="flex items-center gap-3 p-3 glass rounded-xl border border-white/10 hover:border-[#EAB308]/50 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#EAB308]/10 flex items-center justify-center group-hover:bg-[#EAB308]/20 transition-colors">
                  <Phone className="w-5 h-5 text-[#EAB308]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Hotline</p>
                  <p className="text-white text-sm">{appConfig?.helpline_number}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-5">
              {section.title && (
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-gradient-to-r from-[#EAB308] to-transparent" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              <ul className="space-y-2.5">
                {section.links.map((link) => {
                  // Check if URL is external (starts with http)
                  const isExternal = link.url.startsWith('http');
                  
                  return (
                    <li key={link.id}>
                      {isExternal ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#EAB308] transition-all duration-300 group hover:translate-x-1"
                        >
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#EAB308]" />
                          <span>{link.title}</span>
                        </a>
                      ) : (
                        <Link
                          to={link.url}
                          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#EAB308] transition-all duration-300 group hover:translate-x-1"
                        >
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#EAB308]" />
                          <span>{link.title}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Download App Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#EAB308] to-transparent" />
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                Download Our App
              </h3>
            </div>
            
            <p className="text-white/60 text-sm leading-relaxed">
              Get instant access to the best movies and shows!
            </p>

            <div className="space-y-3">
              {/* Google Play */}
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/10 hover:border-[#EAB308]/50 transition-all duration-300 group hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#34A853] to-[#4285F4] flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] text-white/50 uppercase tracking-wider">Get it on</div>
                  <div className="text-sm font-bold text-white">Google Play</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#EAB308] transition-colors" />
              </a>

              {/* App Store */}
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/10 hover:border-[#EAB308]/50 transition-all duration-300 group hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#555555] to-[#000000] flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] text-white/50 uppercase tracking-wider">Download on</div>
                  <div className="text-sm font-bold text-white">App Store</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#EAB308] transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-white/40 text-sm text-center md:text-left">
              © {new Date().getFullYear()}{' '}
              <span className="text-[#EAB308] font-semibold">4sidesplayapp.in</span>
              . All Rights Reserved.
            </p>

            {/* Made with love */}
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤</span>
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
