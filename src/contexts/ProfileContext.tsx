import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Profile {
  id: number;
  name: string;
  avatar?: string;
  is_child_profile: number; // 0 or 1
}

interface ProfileContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  isChildProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);

  // Load active profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('activeProfile');
    if (savedProfile && savedProfile !== 'undefined') {
      try {
        const profile = JSON.parse(savedProfile);
        setActiveProfileState(profile);
      } catch (e) {
        console.error('Error parsing active profile from localStorage', e);
        localStorage.removeItem('activeProfile');
      }
    }
  }, []);

  const setActiveProfile = (profile: Profile | null) => {
    setActiveProfileState(profile);
    if (profile) {
      localStorage.setItem('activeProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('activeProfile');
    }
  };

  const isChildProfile = activeProfile?.is_child_profile === 1;

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile, isChildProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
