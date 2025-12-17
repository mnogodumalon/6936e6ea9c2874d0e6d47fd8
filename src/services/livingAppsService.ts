// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Produkte, Preise, Geschaefte } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Handle if url is already just an ID (no slashes)
  if (!url.includes('/')) return url;
  
  // Extract the last part of the URL path
  const parts = url.split('/');
  const recordId = parts[parts.length - 1];
  
  // Debug logging
  console.log('extractRecordId:', { input: url, output: recordId });
  
  return recordId || null;
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