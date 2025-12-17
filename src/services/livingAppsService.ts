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
 * Debug-Funktion: Zeigt, dass URLs aus der API keine normalen / Zeichen enthalten
 */
export function demonstrateSlashProblem(url: string): void {
  console.group('🔍 URL-Analyse: Warum .split("/") nicht funktioniert');
  console.log('📋 URL aus API:', url);
  console.log('');
  
  console.log('❌ Test 1: Enthält die URL normale / Zeichen?');
  console.log('   url.includes("/"):', url.includes('/'));
  console.log('   → Erwartet: true, Tatsächlich:', url.includes('/'), '❌');
  console.log('');
  
  console.log('❌ Test 2: Was gibt .split("/") zurück?');
  const splitResult = url.split('/');
  console.log('   url.split("/").length:', splitResult.length);
  console.log('   → Erwartet: 7-8 Teile, Tatsächlich:', splitResult.length, 'Teil(e) ❌');
  console.log('   Array:', splitResult);
  console.log('');
  
  console.log('❌ Test 3: Findet lastIndexOf das letzte / ?');
  console.log('   url.lastIndexOf("/"):', url.lastIndexOf('/'));
  console.log('   → Erwartet: >0, Tatsächlich:', url.lastIndexOf('/'), '(nicht gefunden) ❌');
  console.log('');
  
  console.log('🔬 Test 4: Welche Zeichen sind das wirklich?');
  const slashLikeChars = url.match(/[^\w\-.:]/g) || [];
  if (slashLikeChars.length > 0) {
    console.log('   Gefundene Nicht-Standard-Zeichen:');
    slashLikeChars.slice(0, 3).forEach((char, i) => {
      console.log(`   [${i}] Zeichen: "${char}" | Unicode: U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')} | Code: ${char.charCodeAt(0)}`);
    });
  }
  console.log('');
  
  console.log('✅ Lösung: Regex extrahiert die ObjectID am Ende');
  const match = url.match(/([a-f0-9]{24})$/i);
  console.log('   url.match(/([a-f0-9]{24})$/i):', match ? match[1] : null);
  console.log('   → Funktioniert! ✅');
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