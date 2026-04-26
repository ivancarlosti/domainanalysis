
import React, { useState, useEffect } from 'react';
import { AnalysisResult, DomainEntry } from '../types';
import { Sparkles, Loader2, DollarSign, Tag } from 'lucide-react';
import { Language, translations } from '../constants/translations';

interface ResultsTableProps {
  domains: DomainEntry[];
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  analysisResults: AnalysisResult[];
  language: Language;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ domains, onAnalyze, isAnalyzing, analysisResults, language }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const t = translations[language];

  // Reset to page 1 when domains list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [domains]);

  if (domains.length === 0) return null;

  const totalPages = Math.ceil(domains.length / itemsPerPage);
  const currentDomains = domains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper to find analysis for a domain
  const getAnalysis = (domainName: string) => analysisResults.find(r => r.domain === domainName);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-12 transition-colors duration-200">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-xl text-gray-700 dark:text-gray-100 font-normal">{t.results.title}</h3>
        
        {domains.length > 0 && domains.length <= 100 && (
          <button 
            onClick={onAnalyze}
            disabled={isAnalyzing || analysisResults.length > 0}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium transition-colors ${
              isAnalyzing || analysisResults.length > 0 ? 'bg-indigo-300 dark:bg-indigo-900 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
            }`}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {isAnalyzing ? t.results.analyzing : t.results.analyze}
          </button>
        )}
        {domains.length > 100 && (
          <span className="text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded border border-orange-100 dark:border-orange-900">
            {t.results.limitInfo}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">{t.results.colDomain}</th>
              <th className="px-6 py-3">{t.results.colSize}</th>
              <th className="px-6 py-3">{t.results.colChars}</th>
              <th className="px-6 py-3">{t.results.colValuation}</th>
              <th className="px-6 py-3">{t.results.colCategory}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {currentDomains.map((d, idx) => {
              const analysis = getAnalysis(d.name);
              return (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-100">
                    <a 
                      href={`https://registro.br/novo-dominio/?fqdn=${d.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
                    >
                      {d.name}
                    </a>
                  </td>
                  <td className="px-6 py-3">{d.length}</td>
                  <td className="px-6 py-3">
                    {d.hasNumbers ? 'Alfanumérico' : 'Letras'}
                  </td>
                  <td className="px-6 py-3">
                    {analysis ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                        analysis.valuation.toLowerCase().includes('high') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                        analysis.valuation.toLowerCase().includes('medium') ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}>
                        <DollarSign size={10} /> {analysis.valuation}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-3">
                    {analysis ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          <Tag size={10} /> {analysis.category}
                        </span>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 max-w-xs">{analysis.analysis}</p>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 flex justify-center gap-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                {t.results.prev}
            </button>
            <span className="px-3 py-1 text-gray-600 dark:text-gray-400">{t.results.page} {currentPage} {t.results.of} {totalPages}</span>
            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                {t.results.next}
            </button>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
