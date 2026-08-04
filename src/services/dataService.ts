/**
 * Data Service - Handles loading PQRSD data from external sources
 * 
 * Configuration:
 * - Set VITE_DATA_URL environment variable to point to your JSON file
 * - Default: loads from /data/pqrsd_data.json (local public folder)
 * 
 * For external hosting (no redeploy needed):
 * - GitHub: https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/data/pqrsd_data.json
 * - Cloudflare R2: https://your-bucket.r2.dev/pqrsd_data.json
 * - S3: https://your-bucket.s3.amazonaws.com/pqrsd_data.json
 */

import type { DataPQRSD } from '../types/pqrsd';

// Default data URL - can be overridden by VITE_DATA_URL env variable
const DATA_URL = import.meta.env.VITE_DATA_URL || '/data/pqrsd_data.json';

// Cache for loaded data
let cachedData: DataPQRSD | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load PQRSD data from the configured URL
 * Uses cache to avoid repeated fetches
 */
export async function loadData(forceRefresh = false): Promise<DataPQRSD> {
  const now = Date.now();
  
  // Return cached data if valid
  if (!forceRefresh && cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }
  
  try {
    const response = await fetch(DATA_URL, {
      cache: forceRefresh ? 'no-cache' : 'default',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error loading data: ${response.status} ${response.statusText}`);
    }
    
    const data: DataPQRSD = await response.json();
    
    // Validate data structure
    if (!data.documentos || !Array.isArray(data.documentos)) {
      throw new Error('Invalid data format: missing documentos array');
    }
    
    // Update cache
    cachedData = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}

/**
 * Get data URL being used
 */
export function getDataUrl(): string {
  return DATA_URL;
}

/**
 * Check if external data source is configured
 */
export function isExternalSource(): boolean {
  return !!import.meta.env.VITE_DATA_URL;
}

/**
 * Clear cached data (useful after updates)
 */
export function clearCache(): void {
  cachedData = null;
  lastFetchTime = 0;
}
