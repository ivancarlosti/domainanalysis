
import React, { useState, useEffect } from 'react';
import { DomainEntry } from '../types';
import { Language, translations } from '../constants/translations';

interface ResultsTableProps {
  domains: DomainEntry[];
  language: Language;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ domains, language }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const t = translations[language];

  useEffect(() => {
    setCurrentPage(1);
  }, [domains]);

  if (domains.length === 0) return null;

  const totalPages = Math.ceil(domains.length / itemsPerPage);
  const currentDomains = domains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-12 transition-colors duration-200">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-xl text-gray-700 dark:text-gray-100 font-normal">{t.results.title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">{t.results.colDomain}</th>
              <th className="px-6 py-3">{t.results.colSize}</th>
              <th className="px-6 py-3">{t.results.colChars}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {currentDomains.map((d, idx) => (
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
                  {d.hasNumbers ? t.results.alphanumeric : t.results.letters}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
