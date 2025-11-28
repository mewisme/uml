import { LazyStore } from '@tauri-apps/plugin-store';

const store = new LazyStore("ai-settings.json");


// ===========================
// Public API
// ===========================

export async function setAiSetting(key: string, value: string): Promise<void> {
  await store.set(key, value);
  await store.save();
}

export async function getAiSetting(key: string): Promise<string | null> {
  try {
    const value = await store.get(key);
    return value as string | null;
  } catch {
    return null;
  }
}

export async function removeAiSetting(key: string): Promise<void> {
  try {
    await store.delete(key);
    await store.save();
  } catch {
    // Key doesn't exist, ignore
  }
}

export async function initDefaultAiSettings(defaults: Record<string, string>): Promise<void> {
  let changed = false;

  for (const [key, val] of Object.entries(defaults)) {
    const existing = await store.get(key);
    if (existing === null || existing === undefined) {
      await store.set(key, val);
      changed = true;
    }
  }

  if (changed) {
    await store.save();
  }
}

