// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Preisvergleich {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    hintergrund_farbe_1_hell?: string;
    kategorie?: string;
    hintergrund_bild_hell?: string;
    app_id?: string;
    icon?: string;
    parameter_identifizierer?: string;
    target?: string;
    breite_tablet?: number;
    hoehe_widescreen?: number;
    hoehe_fullhd?: number;
    text_farbe_hell?: string;
    hintergrund_bild_dunkel?: string;
    uebergeordnetes_panel?: string;
    dummy?: string;
    beschriftung?: string;
    reihenfolge?: number;
    hoehe_tablet?: number;
    spalte_widescreen?: number;
    beschreibung?: string;
    hoehe_desktop?: number;
    breite_widescreen?: number;
    breite_fullhd?: number;
    hintergrund?: string;
    text_farbe_dunkel?: string;
    hintergrund_farbe_1_dunkel?: string;
    hintergrund_farbe_2_dunkel?: string;
    css_class?: string;
    spalte_mobil2?: number;
    parameter_typ?: string;
    parameter_ist_zuruecksetzbar?: boolean;
    parameter_ist_pflichtfeld?: boolean;
    parameter_optionen?: string;
    template?: string;
    title?: string;
    url?: string;
    breite_mobil2?: number;
    hoehe_mobil2?: number;
    spalte_tablet?: number;
    breite_tablet2?: number;
    spalte_desktop?: number;
    spalte_fullhd?: number;
    darstellung?: string;
    hintergrund_farbe_2_hell?: string;
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

export const APP_IDS = {
  PREISVERGLEICH: '6936e6ea3affba4f80b7a732',
  GESCHAEFTE: '6936e6cd9361feb26bd89d11',
  PRODUKTE: '6936e6c75134d7f5c73f7d1c',
} as const;

// Helper Types for creating new records
export type CreatePreisvergleich = Preisvergleich['fields'];
export type CreateGeschaefte = Geschaefte['fields'];
export type CreateProdukte = Produkte['fields'];