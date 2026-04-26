
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Upload } from 'lucide-react';
import { DictionaryStats } from '../types';
import { Language, translations } from '../constants/translations';

interface StatsPanelProps {
  stats: DictionaryStats;
  onFileUpload: (content: string) => void;
  onLoadSample: () => void;
  fileName: string | null;
  language: Language;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, onFileUpload, onLoadSample, fileName, language }) => {
  const [isOpen, setIsOpen] = useState(true);
  const t = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onFileUpload(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden transition-colors duration-200">
      <div 
        className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center cursor-pointer border-b border-gray-100 dark:border-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl text-gray-700 dark:text-gray-200 font-normal">{t.files}</h3>
        {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
      </div>

      {isOpen && (
        <div className="p-6 text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
             <div className="flex-1">
                <label className="block mb-2 font-medium text-gray-600 dark:text-gray-400">{t.loadTitle}</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Upload size={16} className="text-gray-500 dark:text-gray-300" />
                    <span className="text-gray-600 dark:text-gray-300">{t.selectFile}</span>
                    <input type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
                  </label>
                  <button 
                    onClick={onLoadSample}
                    className="px-4 py-2 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                  >
                    {t.useSample}
                  </button>
                </div>
                {fileName && <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1"><FileText size={12}/> {fileName}</p>}
             </div>
          </div>

          <p>1. {t.stats.loaded}: <span className="font-semibold">{stats.totalDomains.toLocaleString()}</span>.</p>
          <p>2. {t.stats.ptDict}: <span className="font-semibold">{stats.portugueseWords.toLocaleString()}</span>.</p>
          <p>3. {t.stats.enDict}: <span className="font-semibold">{stats.englishWords.toLocaleString()}</span>.</p>
          <p>4. {t.stats.cities}: <span className="font-semibold">{stats.cities.toLocaleString()}</span>.</p>
          <p>5. {t.stats.fauna}: <span className="font-semibold">{stats.animals.toLocaleString()}</span>.</p>
          <p>6. {t.stats.names}: <span className="font-semibold">{stats.names.toLocaleString()}</span>.</p>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
