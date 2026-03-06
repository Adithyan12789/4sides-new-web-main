import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const formatTitle = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const pageUrl = `https://portal.4sidesplay.com/page/${slug}`;
  const title = formatTitle(slug || '');

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-20">
      {/* Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-[#EAB308] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Page Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-8">
          {title}
        </h1>

        {/* Iframe Container */}
        <div className="glass rounded-3xl overflow-hidden border border-white/10 bg-white">
          <iframe
            src={pageUrl}
            title={title}
            className="w-full h-[calc(100vh-250px)] min-h-[600px] border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            style={{
              marginTop: '-100px', // Try to hide header by shifting up
              height: 'calc(100vh - 150px)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
