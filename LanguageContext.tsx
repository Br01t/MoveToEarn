import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from './translations';

type Language = 'en' | 'it';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tRich: (key: string) => ReactNode; 
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'it' : 'en');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations['en']];
    return translation || key;
  };

  const tRich = (key: string): ReactNode => {
    const text = t(key);
    const parts = text.split(/(<b>.*?<\/b>)/g);

    return parts.map((part, index) => {
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        const content = part.replace(/<\/?b>/g, '');
        return <b key={index} className="text-white font-extrabold">{content}</b>;
      }
      return part;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t, tRich }}>
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