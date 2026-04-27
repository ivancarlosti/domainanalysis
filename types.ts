export interface DomainEntry {
  name: string;
  length: number;
  hasNumbers: boolean;
  hasHyphen: boolean;
  extension: string;
}

export interface DictionaryStats {
  totalDomains: number;
  portugueseWords: number;
  englishWords: number;
  cities: number;
  animals: number;
  names: number;
}

export interface FilterState {
  // Length & Composition
  twoCharsWithNum: boolean;
  twoCharsNoNum: boolean;
  threeCharsWithNum: boolean;
  threeCharsNoNum: boolean;
  fourToFifteenPt: boolean;
  fourToFifteenEn: boolean;

  // Specific Categories
  cities: boolean;
  animals: boolean;
  names: boolean;
  minerals: boolean;
  tech: boolean;

  // Extensions
  extComBr: boolean;
  extNetBr: boolean;
  extOrgBr: boolean;
  extBlogBr: boolean;
  extArtBr: boolean;
  extLojaBr: boolean;

  // Custom
  keyword: string;
}
