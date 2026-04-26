
import { DomainEntry, FilterState } from '../types';
import { 
  MOCK_PT_DICT, 
  MOCK_EN_DICT, 
  MOCK_CITIES, 
  MOCK_ANIMALS, 
  MOCK_NAMES,
  MOCK_SURNAMES,
  MOCK_MINERALS,
  MOCK_TECH
} from '../constants';

// Helper to remove extension for checking
const getSLD = (domain: string) => domain.split('.')[0];

export const parseDomains = (text: string): DomainEntry[] => {
  const lines = text.split(/\r?\n/);
  const domains: DomainEntry[] = [];

  for (const line of lines) {
    const cleanLine = line.trim().toLowerCase();
    if (!cleanLine || !cleanLine.includes('.')) continue;

    const parts = cleanLine.split('.');
    const name = parts[0];
    const extension = parts.slice(1).join('.');

    domains.push({
      name: cleanLine,
      length: name.length,
      hasNumbers: /\d/.test(name),
      hasHyphen: /-/.test(name),
      extension: extension
    });
  }
  return domains;
};

export const applyFilters = (domains: DomainEntry[], filters: FilterState): DomainEntry[] => {
  // Logic: 
  // 1. Keyword (AND) - if exists
  // 2. Extension (AND if any selected) - e.g. must be .com.br OR .net.br if those are checked
  // 3. Criteria (Structure OR Category) - if any criteria selected, domain must match at least one

  const isAnyCheckboxChecked = Object.values(filters).some(val => val === true);
  const hasKeyword = filters.keyword.trim().length > 0;

  // Basic check: if nothing selected, return all
  if (!isAnyCheckboxChecked && !hasKeyword) {
    return domains;
  }

  // Identify active filters groups
  const activeExtensions: string[] = [];
  if (filters.extComBr) activeExtensions.push('com.br');
  if (filters.extNetBr) activeExtensions.push('net.br');
  if (filters.extOrgBr) activeExtensions.push('org.br');
  if (filters.extBlogBr) activeExtensions.push('blog.br');
  if (filters.extArtBr) activeExtensions.push('art.br');
  if (filters.extLojaBr) activeExtensions.push('loja.br');

  const hasExtensionFilter = activeExtensions.length > 0;

  // Check if any "Structure" or "Category" filter is active
  const criteriaKeys: (keyof FilterState)[] = [
    'twoCharsWithNum', 'twoCharsNoNum', 'threeCharsWithNum', 'threeCharsNoNum',
    'fourToFifteenPt', 'fourToFifteenEn', 'cities', 'animals', 'names', 
    'minerals', 'tech'
  ];
  const hasCriteriaFilter = criteriaKeys.some(k => filters[k] === true);

  return domains.filter(d => {
    const sld = getSLD(d.name);
    
    // 1. Keyword Filter (Global Restriction)
    if (hasKeyword && !sld.includes(filters.keyword.toLowerCase())) {
      return false;
    }
    
    // 2. Extension Filter (Global Restriction)
    if (hasExtensionFilter) {
      if (!activeExtensions.includes(d.extension)) {
        return false;
      }
    }

    // 3. Criteria Filters (OR Logic within this group)
    // If no criteria filters are set, we pass (assuming matched keyword/extension is enough)
    if (!hasCriteriaFilter) {
      return true;
    }

    // If criteria filters ARE set, we must match at least one
    let criteriaMatch = false;

    // Structure
    if (filters.twoCharsWithNum && sld.length === 2 && d.hasNumbers) criteriaMatch = true;
    if (filters.twoCharsNoNum && sld.length === 2 && !d.hasNumbers) criteriaMatch = true;
    if (filters.threeCharsWithNum && sld.length === 3 && d.hasNumbers) criteriaMatch = true;
    if (filters.threeCharsNoNum && sld.length === 3 && !d.hasNumbers) criteriaMatch = true;

    // Dictionary
    if (sld.length >= 4 && sld.length <= 15) {
      if (filters.fourToFifteenPt && MOCK_PT_DICT.has(sld)) criteriaMatch = true;
      if (filters.fourToFifteenEn && MOCK_EN_DICT.has(sld)) criteriaMatch = true;
    }

    // Categories
    if (filters.cities && MOCK_CITIES.has(sld)) criteriaMatch = true;
    if (filters.animals && MOCK_ANIMALS.has(sld)) criteriaMatch = true;
    if (filters.names && (MOCK_NAMES.has(sld) || MOCK_SURNAMES.has(sld))) criteriaMatch = true;
    if (filters.minerals && MOCK_MINERALS.has(sld)) criteriaMatch = true;
    if (filters.tech && MOCK_TECH.has(sld)) criteriaMatch = true;

    return criteriaMatch;
  });
};
