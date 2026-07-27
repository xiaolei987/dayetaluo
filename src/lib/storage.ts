/**
 * 统一本地存储模块
 * 所有 localStorage 读写集中在此，消除各处重复定义的 STORAGE_KEY 和 load/save 逻辑
 */
import { scopedStorage, logger } from '@lark-apaas/client-toolkit-lite';
import type { IReadingRecord, IUserProfile } from '@/types/tarot';
import type { AiConfig } from './aiApi';

// ========== 存储键 (唯一声明点) ==========
const KEYS = {
  readings: '__tarot_readings',
  favorites: '__tarot_favorites',
  userProfile: '__tarot_userProfile',
  aiConfig: '__tarot_ai_config',
} as const;

// ========== 占卜记录 ==========
export function loadReadings(): IReadingRecord[] {
  try {
    const raw = scopedStorage.getItem(KEYS.readings);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { logger.error('loadReadings:', String(e)); return []; }
}

export function saveReadings(readings: IReadingRecord[]): void {
  scopedStorage.setItem(KEYS.readings, JSON.stringify(readings));
}

export function addReading(record: IReadingRecord): IReadingRecord[] {
  const readings = loadReadings();
  readings.unshift(record);
  saveReadings(readings);
  return readings;
}

export function findReading(id: string): IReadingRecord | null {
  return loadReadings().find(r => r.id === id) ?? null;
}

/** 更新一条记录 (不存在则插入头部) */
export function upsertReading(record: IReadingRecord): void {
  const readings = loadReadings();
  const idx = readings.findIndex(r => r.id === record.id);
  if (idx >= 0) readings[idx] = record;
  else readings.unshift(record);
  saveReadings(readings);
}

// ========== 收藏 ==========
export function loadFavorites(): string[] {
  try {
    const raw = scopedStorage.getItem(KEYS.favorites);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { logger.error('loadFavorites:', String(e)); return []; }
}

export function saveFavorites(ids: string[]): void {
  scopedStorage.setItem(KEYS.favorites, JSON.stringify(ids));
}

/** toggle 收藏状态，返回新的 isFavorite */
export function toggleFavorite(readingId: string): boolean {
  const favs = loadFavorites();
  const idx = favs.indexOf(readingId);
  if (idx >= 0) { favs.splice(idx, 1); saveFavorites(favs); return false; }
  favs.push(readingId);
  saveFavorites(favs);
  return true;
}

/** 更新 reading.isFavorite 字段 */
export function syncReadingFavorite(readingId: string, isFavorite: boolean): void {
  const readings = loadReadings();
  const r = readings.find(r => r.id === readingId);
  if (r) { r.isFavorite = isFavorite; saveReadings(readings); }
}

// ========== 用户信息 ==========
export function loadUserProfile(): IUserProfile {
  try {
    const raw = scopedStorage.getItem(KEYS.userProfile);
    return raw ? JSON.parse(raw) : { nickname: '' };
  } catch (e) { logger.error('loadUserProfile:', String(e)); return { nickname: '' }; }
}

export function saveUserProfile(profile: IUserProfile): void {
  scopedStorage.setItem(KEYS.userProfile, JSON.stringify(profile));
}

// ========== AI 配置 ==========
export { getAiConfig, saveAiConfig, hasAiConfig } from './aiApi';

// ========== ID 生成 ==========
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
