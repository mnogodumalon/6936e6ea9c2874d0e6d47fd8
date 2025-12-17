// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Preisvergleich, Geschaefte, Produkte } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen (MongoDB ObjectID) mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
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
  // --- PREISVERGLEICH ---
  static async getPreisvergleich(): Promise<Preisvergleich[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.PREISVERGLEICH}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getPreisvergleichEntry(id: string): Promise<Preisvergleich | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.PREISVERGLEICH}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createPreisvergleichEntry(fields: Preisvergleich['fields']) {
    return callApi('POST', `/apps/${APP_IDS.PREISVERGLEICH}/records`, { fields });
  }
  static async updatePreisvergleichEntry(id: string, fields: Partial<Preisvergleich['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.PREISVERGLEICH}/records/${id}`, { fields });
  }
  static async deletePreisvergleichEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.PREISVERGLEICH}/records/${id}`);
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

}