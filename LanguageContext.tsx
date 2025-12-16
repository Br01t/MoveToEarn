
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from './translations';

type Language = 'en' | 'it';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tRich: (key: string) => ReactNode; // New helper for Rich Text (Bold)
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'it' : 'en');
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations['en']];
    return translation || key;
  };

  // Parses string for <b>tags</b> and renders them as bold React elements
  const tRich = (key: string): ReactNode => {
    const text = t(key);
    // Regex splits by <b>...</b> keeping the delimiter for processing
    const parts = text.split(/(<b>.*?<\/b>)/g);

    return parts.map((part, index) => {
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        // Remove the tags and wrap in a styled span/b
        const content = part.replace(/<\/?b>/g, '');
        return <b key={index} className="text-white font-extrabold">{content}</b>;
      }
      return part;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, tRich }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};