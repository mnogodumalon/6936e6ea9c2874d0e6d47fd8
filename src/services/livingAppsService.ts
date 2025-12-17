// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Produkte, Preise, Geschaefte } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---

/**
 * Extrahiert die Record-ID aus einer URL.
 * 
 * WICHTIG: Die Living Apps API gibt URLs zurück, die KEINE normalen Slash-Zeichen (/) enthalten!
 * Stattdessen werden spezielle Unicode-Zeichen verwendet, die wie Slashes aussehen.
 */
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Extrahiere die letzten 24 Hex-Zeichen (MongoDB ObjectID) mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

/**
 * Debug-Funktion: Vergleicht split('/') vs. Regex-Extraktion
 */
export function demonstrateSlashProblem(url: string): void {
  console.group('🔍 URL ID-Extraktion Vergleich');
  console.log('📋 URL:', url);
  console.log('');
  
  // Methode 1: Original mit split('/')
  console.log('Methode 1: url.split("/").pop()');
  const splitParts = url.split('/');
  const idFromSplit = splitParts.pop() || null;
  console.log(`   Anzahl Teile nach split("/"): ${splitParts.length + 1}`);
  console.log(`   Alle Teile:`, splitParts.concat([idFromSplit || '']));
  console.log(`   ➜ Extrahierte ID: "${idFromSplit}"`);
  console.log(`   ➜ ID-Länge: ${idFromSplit?.length || 0} Zeichen`);
  console.log('');
  
  // Methode 2: Regex
  console.log('Methode 2: url.match(/([a-f0-9]{24})$/i)');
  const match = url.match(/([a-f0-9]{24})$/i);
  const idFromRegex = match ? match[1] : null;
  console.log(`   ➜ Extrahierte ID: "${idFromRegex}"`);
  console.log(`   ➜ ID-Länge: ${idFromRegex?.length || 0} Zeichen`);
  console.log('');
  
  // Vergleich
  console.log('Vergleich:');
  if (idFromSplit === idFromRegex && idFromSplit?.length === 24) {
    console.log(`   ✅ Beide Methoden funktionieren und geben dasselbe Ergebnis: "${idFromSplit}"`);
  } else if (idFromSplit !== idFromRegex) {
    console.log(`   ❌ Unterschiedliche Ergebnisse!`);
    console.log(`   split('/'): "${idFromSplit}"`);
    console.log(`   regex:      "${idFromRegex}"`);
    if (idFromRegex && idFromRegex.length === 24) {
      console.log(`   → Regex-Methode ist korrekt ✅`);
    }
    if (splitParts.length === 0 || splitParts.length === 1) {
      console.log(`   → split('/') funktioniert nicht - URL enthält keine normalen / Zeichen ❌`);
    }
  } else if (idFromSplit && idFromSplit.length !== 24) {
    console.log(`   ⚠️ split('/') gibt falsche ID-Länge zurück: ${idFromSplit.length} statt 24 Zeichen`);
  }
  
  console.groupEnd();
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- PRODUKTE ---
  static async getProdukte(): Promise<Produkte[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.PRODUKTE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getProdukteEntry(id: string): Promise<Produkte | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.PRODUKTE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createProdukteEntry(fields: Produkte['fields']) {
    return callApi('POST', `/apps/${APP_IDS.PRODUKTE}/records`, { fields });
  }
  static async updateProdukteEntry(id: string, fields: Partial<Produkte['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.PRODUKTE}/records/${id}`, { fields });
  }
  static async deleteProdukteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.PRODUKTE}/records/${id}`);
  }

  // --- PREISE ---
  static async getPreise(): Promise<Preise[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.PREISE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getPreiseEntry(id: string): Promise<Preise | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.PREISE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createPreiseEntry(fields: Preise['fields']) {
    return callApi('POST', `/apps/${APP_IDS.PREISE}/records`, { fields });
  }
  static async updatePreiseEntry(id: string, fields: Partial<Preise['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.PREISE}/records/${id}`, { fields });
  }
  static async deletePreiseEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.PREISE}/records/${id}`);
  }

  // --- GESCHAEFTE ---
  static async getGeschaefte(): Promise<Geschaefte[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.GESCHAEFTE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getGeschaefteEntry(id: string): Promise<Geschaefte | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.GESCHAEFTE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createGeschaefteEntry(fields: Geschaefte['fields']) {
    return callApi('POST', `/apps/${APP_IDS.GESCHAEFTE}/records`, { fields });
  }
  static async updateGeschaefteEntry(id: string, fields: Partial<Geschaefte['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.GESCHAEFTE}/records/${id}`, { fields });
  }
  static async deleteGeschaefteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.GESCHAEFTE}/records/${id}`);
  }

}