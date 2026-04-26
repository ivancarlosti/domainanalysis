import { AnalysisResult } from "../types";

export const analyzeDomainsWithGemini = async (domains: string[]): Promise<AnalysisResult[]> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ domains })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `analysis-failed-${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.results) ? (data.results as AnalysisResult[]) : [];
};
