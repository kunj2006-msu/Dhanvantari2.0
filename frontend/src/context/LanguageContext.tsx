import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

export type LanguageCode = 'en-IN' | 'gu-IN';

interface LanguageContextType {
  languageCode: LanguageCode;
  languageName: 'English' | 'Gujarati';
  isInitialized: boolean;
  changeLanguage: (code: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languageCode, setLanguageCode] = useState<LanguageCode>(() => {
    const savedLang = localStorage.getItem('dhanvantari_lang') as LanguageCode;
    if (savedLang === 'en-IN' || savedLang === 'gu-IN') {
      return savedLang;
    }
    return 'en-IN';
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Ensure i18next has loaded the initial language state before marking context as initialized
    i18n.changeLanguage(languageCode).finally(() => {
      setIsInitialized(true);
      document.documentElement.setAttribute('lang', languageCode);
    });
  }, []);

  const changeLanguage = (code: LanguageCode) => {
    setLanguageCode(code);
    localStorage.setItem('dhanvantari_lang', code);
    i18n.changeLanguage(code);
    document.documentElement.setAttribute('lang', code);
  };

  const languageName = languageCode === 'gu-IN' ? 'Gujarati' : 'English';

  return (
    <LanguageContext.Provider value={{ languageCode, languageName, isInitialized, changeLanguage }}>
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
