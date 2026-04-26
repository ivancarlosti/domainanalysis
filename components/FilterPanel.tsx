
import React from 'react';
import { Play, Trash2 } from 'lucide-react';
import { FilterState } from '../types';
import { Language, translations } from '../constants/translations';

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onExecute: () => void;
  onClear: () => void;
  resultCount: number;
  language: Language;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, onExecute, onClear, resultCount, language }) => {
  const t = translations[language];

  const handleCheckboxChange = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] as boolean }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, keyword: e.target.value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-200">
      <h3 className="text-2xl text-gray-700 dark:text-gray-100 font-normal mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">{t.filters.title}</h3>

      <div className="space-y-8">
        {/* Section 1: Structure */}
        <div>
          <h4 className="text-lg text-gray-600 dark:text-gray-300 mb-3">{t.filters.structure}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-1">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.twoCharsWithNum} onChange={() => handleCheckboxChange('twoCharsWithNum')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.twoCharsNum}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.twoCharsNoNum} onChange={() => handleCheckboxChange('twoCharsNoNum')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.twoCharsNoNum}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.threeCharsWithNum} onChange={() => handleCheckboxChange('threeCharsWithNum')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.threeCharsNum}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.threeCharsNoNum} onChange={() => handleCheckboxChange('threeCharsNoNum')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.threeCharsNoNum}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded md:col-span-2">
              <input type="checkbox" checked={filters.fourToFifteenPt} onChange={() => handleCheckboxChange('fourToFifteenPt')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.dictPt}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded md:col-span-2">
              <input type="checkbox" checked={filters.fourToFifteenEn} onChange={() => handleCheckboxChange('fourToFifteenEn')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.dictEn}</span>
            </label>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Section 2: Extensions */}
        <div>
          <h4 className="text-lg text-gray-600 dark:text-gray-300 mb-3">{t.filters.extensions}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-1">
             <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.extComBr} onChange={() => handleCheckboxChange('extComBr')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">.com.br</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.extNetBr} onChange={() => handleCheckboxChange('extNetBr')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">.net.br</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.extOrgBr} onChange={() => handleCheckboxChange('extOrgBr')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">.org.br</span>
            </label>
             <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.extBlogBr} onChange={() => handleCheckboxChange('extBlogBr')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">.blog.br</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.extArtBr} onChange={() => handleCheckboxChange('extArtBr')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">.art.br</span>
            </label>
             <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.extLojaBr} onChange={() => handleCheckboxChange('extLojaBr')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">.loja.br</span>
            </label>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Section 3: Categories */}
        <div>
          <h4 className="text-lg text-gray-600 dark:text-gray-300 mb-3">{t.filters.categories}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-1">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.cities} onChange={() => handleCheckboxChange('cities')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.cities}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.animals} onChange={() => handleCheckboxChange('animals')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.fauna}</span>
            </label>
             <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.names} onChange={() => handleCheckboxChange('names')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.names}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.minerals} onChange={() => handleCheckboxChange('minerals')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.minerals}</span>
            </label>
             <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input type="checkbox" checked={filters.tech} onChange={() => handleCheckboxChange('tech')} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-gray-700 dark:text-gray-300">{t.filters.tech}</span>
            </label>
          </div>
        </div>
        
        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Section 4: Keyword */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex items-center gap-3 w-full sm:w-auto">
            <input type="checkbox" checked={filters.keyword.length > 0} readOnly className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{t.filters.keyword}</span>
          </label>
          <div className="flex-1 w-full">
            <input 
              type="text" 
              value={filters.keyword} 
              onChange={handleTextChange}
              placeholder={t.filters.placeholder}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            onClick={onExecute}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded shadow-sm transition-colors"
          >
            <Play size={18} fill="currentColor" /> {t.filters.execute}
          </button>
          <button 
            onClick={onClear}
            className="flex items-center justify-center gap-2 bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-6 rounded shadow-sm transition-colors"
          >
            <Trash2 size={18} /> {t.filters.clear}
          </button>
        </div>
        
        {resultCount > 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {resultCount} {t.filters.found}.
          </div>
        )}

      </div>
    </div>
  );
};

export default FilterPanel;
