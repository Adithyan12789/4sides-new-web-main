import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';

interface Language {
  id: string;
  name: string;
  image: string;
}

interface LanguageCardProps {
  language: Language;
  index: number;
  onClick: () => void;
}

function LanguageCard({ language, index, onClick }: LanguageCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const moveX = (x - 0.5) * 20;
    const moveY = (y - 0.5) * 20;
    const rotateX = (y - 0.5) * -15;
    const rotateY = (x - 0.5) * 15;

    setTransform({ x: moveX, y: moveY, rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTransform({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      style={{
        transform: isVisible
          ? `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateZ(${transform.x !== 0 ? '20px' : '0'})`
          : 'perspective(1000px) rotateX(90deg)',
        transformStyle: 'preserve-3d',
        transitionDelay: `${index * 0.1}s`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
        style={{
          backgroundImage: `url(${language.image})`,
          transform: `scale(1.1) translate(${-transform.x * 0.5}px, ${-transform.y * 0.5}px)`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Accent Glow */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
        <h3
          className="text-3xl font-bold text-white transition-transform duration-300"
          style={{
            transform: `translate(${transform.x * 0.3}px, ${transform.y * 0.3}px)`,
          }}
        >
          {language.name}
        </h3>
      </div>

      {/* Border Glow on Hover */}
      <div
        className="absolute inset-0 rounded-2xl border-2 border-transparent hover:border-[#EAB308]/50 transition-colors duration-300 pointer-events-none"
      />
    </div>
  );
}

// Default language images mapping
const defaultLanguageImages: Record<string, string> = {
  english: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80',
  hindi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  tamil: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
  telugu: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  malayalam: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', // Kerala backwaters and cultural theme
  kannada: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
  bengali: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
  marathi: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
  punjabi: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
  gujarati: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
};

export default function Categories() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data } = useDashboard();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Extract unique languages from API data
  const languages: Language[] = [];
  if (data) {
    const languageSet = new Set<string>();
    
    Object.values(data).forEach((section: any) => {
      if (section?.movies) {
        section.movies.forEach((movie: any) => {
          if (movie.language && typeof movie.language === 'string') {
            languageSet.add(movie.language.toLowerCase());
          }
        });
      }
    });

    languageSet.forEach((lang) => {
      const capitalizedName = lang.charAt(0).toUpperCase() + lang.slice(1);
      languages.push({
        id: lang,
        name: capitalizedName,
        image: defaultLanguageImages[lang] || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
      });
    });
  }

  const handleLanguageClick = (languageId: string) => {
    navigate(`/language/${languageId}`);
  };

  // Don't render if no languages found 
  if (languages.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-[1920px] mx-auto">
        <h2
          className={`text-2xl sm:text-3xl font-bold text-white mb-8 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          Popular Language
        </h2>

        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 max-w-6xl">
            {languages.map((language, index) => (
              <LanguageCard
                key={language.id}
                language={language}
                index={index}
                onClick={() => handleLanguageClick(language.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
