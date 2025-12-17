// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Produkte {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    produktname?: string;
    kategorie?: string;
    marke?: string;
    groesse?: string;
    beschreibung?: string;
  };
}

export interface Preise {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    produkt?: string;
    geschaeft?: string;
    preis?: number;
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    bemerkungen?: string;
  };
}

export interface Geschaefte {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    geschaeftsname?: string;
    kette?: string;
    strasse?: string;
    hausnummer?: string;
    postleitzahl?: string;
    stadt?: string;
    notizen?: string;
  };
}

export const APP_IDS = {
  PRODUKTE: '6936e6c75134d7f5c73f7d1c',
  PREISE: '6936e6cdf0cfa73dc3c66854',
  GESCHAEFTE: '6936e6cd9361feb26bd89d11',
} as const;

// Helper Types for creating new records
export type CreateProdukte = Produkte['fields'];
export type CreatePreise = Preise['fields'];
export type CreateGeschaefte = Geschaefte['fields'];