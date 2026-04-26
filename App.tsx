
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import FilterPanel from './components/FilterPanel';
import ResultsTable from './components/ResultsTable';
import { DomainEntry, DictionaryStats, FilterState, AnalysisResult } from './types';
import { parseDomains, applyFilters } from './utils/filterUtils';
import { 
  MOCK_PT_DICT, 
  MOCK_EN_DICT, 
  MOCK_CITIES, 
  MOCK_ANIMALS, 
  MOCK_NAMES,
  MOCK_SURNAMES,
  SAMPLE_DOMAINS_TXT 
} from './constants';
import { analyzeDomainsWithGemini } from './services/geminiService';
import { Language } from './constants/translations';

const INITIAL_FILTER_STATE: FilterState = {
  // Structure
  twoCharsWithNum: false,
  twoCharsNoNum: false,
  threeCharsWithNum: false,
  threeCharsNoNum: false,
  fourToFifteenPt: false,
  fourToFifteenEn: false,
  // Categories
  cities: false,
  animals: false,
  names: false,
  minerals: false,
  tech: false,
  // Extensions
  extComBr: false,
  extNetBr: false,
  extOrgBr: false,
  extBlogBr: false,
  extArtBr: false,
  extLojaBr: false,
  // Search
  keyword: ''
};

function App() {
  const [rawDomains, setRawDomains] = useState<DomainEntry[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<DomainEntry[]>([]);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // UI States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('pt-BR');

  const [stats, setStats] = useState<DictionaryStats>({
    totalDomains: 0,
    portugueseWords: MOCK_PT_DICT.size,
    englishWords: MOCK_EN_DICT.size,
    cities: MOCK_CITIES.size,
    animals: MOCK_ANIMALS.size,
    names: MOCK_NAMES.size + MOCK_SURNAMES.size
  });

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  // Theme logic - CRITICAL for Tailwind 'class' strategy
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleFileUpload = (content: string) => {
    const parsed = parseDomains(content);
    setRawDomains(parsed);
    setStats(prev => ({ ...prev, totalDomains: parsed.length }));
    setFileName("lista-personalizada.txt");
    setFilteredDomains([]); // Reset results
  };

  const loadSampleData = () => {
    const parsed = parseDomains(SAMPLE_DOMAINS_TXT);
    setRawDomains(parsed);
    setStats(prev => ({ ...prev, totalDomains: parsed.length }));
    setFileName("exemplo-sistema.txt");
  };

  const executeFilter = () => {
    const results = applyFilters(rawDomains, filters);
    setFilteredDomains(results);
    setAnalysisResults([]); // Reset AI results on new filter
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
    setFilteredDomains([]);
    setAnalysisResults([]);
  };

  const handleGeminiAnalysis = async () => {
    if (filteredDomains.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const domainStrings = filteredDomains.map(d => d.name);
      const results = await analyzeDomainsWithGemini(domainStrings);
      setAnalysisResults(results);
    } catch (e) {
      console.error("Failed to analyze", e);
      alert("Erro ao conectar com Gemini API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentDate = new Date().toLocaleString(language, { month: 'long', year: 'numeric' });
  const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 pb-20 text-gray-900 dark:text-gray-100">
      <Header 
        currentDate={capitalizedDate} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
      />
      
      <main className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
        <StatsPanel 
          stats={stats} 
          onFileUpload={handleFileUpload} 
          onLoadSample={loadSampleData}
          fileName={fileName}
          language={language}
        />
        
        <FilterPanel 
          filters={filters}
          setFilters={setFilters}
          onExecute={executeFilter}
          onClear={clearFilters}
          resultCount={filteredDomains.length}
          language={language}
        />

        <ResultsTable 
          domains={filteredDomains}
          onAnalyze={handleGeminiAnalysis}
          isAnalyzing={isAnalyzing}
          analysisResults={analysisResults}
          language={language}
        />
      </main>
    </div>
  );
}

export default App;
