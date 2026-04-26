
import React from 'react';
import { ExternalLink, Moon, Sun, LogOut } from 'lucide-react';
import { Language, translations } from '../constants/translations';
import { useAuth } from './AuthGate';

interface HeaderProps {
  currentDate: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ currentDate, isDarkMode, toggleTheme, language, setLanguage }) => {
  const t = translations[language];
  const { config, logout } = useAuth();
  const showLogout = config.authMethod !== 'none';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Top Bar */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-2 flex justify-between items-center text-xs border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLanguage('en-US')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${language === 'en-US' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
            title="English (US)"
          >
            <span className="text-base">🇺🇸</span> <span className="hidden sm:inline">English</span>
          </button>
          <button 
            onClick={() => setLanguage('pt-BR')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${language === 'pt-BR' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
            title="Português (BR)"
          >
            <span className="text-base">🇧🇷</span> <span className="hidden sm:inline">Português</span>
          </button>
          <button 
            onClick={() => setLanguage('es-MX')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${language === 'es-MX' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
            title="Español (MX)"
          >
            <span className="text-base">🇲🇽</span> <span className="hidden sm:inline">Español</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
          >
            {isDarkMode ? <Sun size={12} /> : <Moon size={12} />} {t.theme}
          </button>
          <a href="https://registro.br/tecnologia/ferramentas/whois/" target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors">
            <ExternalLink size={12} /> {t.whois}
          </a>
          {showLogout && (
            <button
              onClick={logout}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
            >
              <LogOut size={12} /> {t.exit}
            </button>
          )}
        </div>
      </div>

      {/* Main Header Content */}
      <div className="py-8 text-center px-4">
        <h1 className="text-3xl font-normal text-gray-700 dark:text-gray-100 mb-2 tracking-wide uppercase">{t.title}</h1>
        
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          {t.subtitle} <a href="https://registro.br/dominio/processo-de-liberacao/" target="_blank" rel="noreferrer" className="underline hover:text-green-600">aqui</a>.
        </p>
        <h2 className="text-2xl text-gray-600 dark:text-gray-300 mt-4">{currentDate}</h2>
      </div>
    </div>
  );
};

export default Header;
