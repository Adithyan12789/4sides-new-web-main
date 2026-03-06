import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';

export type TranslationKey = 
  | 'home' 
  | 'movies' 
  | 'tvShows' 
  | 'searchPlaceholder' 
  | 'playNow' 
  | 'moreInfo' 
  | 'watchlist' 
  | 'continueWatching' 
  | 'trendingNow' 
  | 'top10' 
  | 'categories' 
  | 'featured';

const allTranslations: Record<Language, Record<string, string>> = {
    en: {
        home: 'Home',
        movies: 'Movies',
        tvShows: 'TV Shows',
        searchPlaceholder: 'Search movies, shows...',
        playNow: 'Play Now',
        moreInfo: 'More Info',
        watchlist: 'Watchlist',
        continueWatching: 'Continue Watching',
        trendingNow: 'Trending Now',
        top10: 'Top 10 Movies Today',
        categories: 'Categories',
        featured: 'Featured'
    },
    hi: {
        home: 'होम',
        movies: 'फिल्में',
        tvShows: 'टीवी शो',
        searchPlaceholder: 'फिल्में, शो खोजें...',
        playNow: 'अभी देखें',
        moreInfo: 'अधिक जानकारी',
        watchlist: 'मेरी सूची',
        continueWatching: 'देखना जारी रखें',
        trendingNow: 'अभी ट्रेंडिंग',
        top10: 'आज की टॉप 10 फिल्में',
        categories: 'श्रेणियाँ',
        featured: 'विशेष'
    },
    mr: {
        home: 'होम',
        movies: 'चित्रपट',
        tvShows: 'टीव्ही शो',
        searchPlaceholder: 'चित्रपट, शो शोधा...',
        playNow: 'आता पहा',
        moreInfo: 'अधिक माहिती',
        watchlist: 'माझी यादी',
        continueWatching: 'पाहणे सुरू ठेवा',
        trendingNow: 'आता ट्रेंडिंग',
        top10: 'आजचे टॉप 10 चित्रपट',
        categories: 'श्रेणी',
        featured: 'वैशिष्ट्यीकृत'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: TranslationKey): string => {
        return allTranslations[language][key] || allTranslations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
