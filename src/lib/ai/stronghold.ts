import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';

import { appDataDir } from '@tauri-apps/api/path';

const VAULT_PASSWORD = 'uml-editor-ai-settings-vault';
const CLIENT_NAME = 'ai-settings-client';
const VAULT_FILENAME = 'ai-settings.hold';

let strongholdInstance: Stronghold | null = null;
let clientInstance: Client | null = null;

async function initStronghold(): Promise<{ stronghold: Stronghold; client: Client }> {
  if (strongholdInstance && clientInstance) {
    return { stronghold: strongholdInstance, client: clientInstance };
  }

  try {
    const appDir = await appDataDir();
    const vaultPath = `${appDir}/${VAULT_FILENAME}`;
    strongholdInstance = await Stronghold.load(vaultPath, VAULT_PASSWORD);

    try {
      clientInstance = await strongholdInstance.loadClient(CLIENT_NAME);
    } catch {
      clientInstance = await strongholdInstance.createClient(CLIENT_NAME);
    }

    return { stronghold: strongholdInstance, client: clientInstance };
  } catch (error) {
    console.error('Failed to initialize Stronghold:', error);
    throw error;
  }
}

async function getStore() {
  const { client } = await initStronghold();
  return client.getStore();
}

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ArrayToString(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

export async function getAiSetting(key: string): Promise<string | null> {
  try {
    const store = await getStore();
    const data = await store.get(key);
    if (!data || data.length === 0) {
      return null;
    }
    return uint8ArrayToString(new Uint8Array(data));
  } catch (error) {
    // If key doesn't exist, return null
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    console.error(`Failed to get AI setting ${key}:`, error);
    return null;
  }
}

export async function setAiSetting(key: string, value: string): Promise<void> {
  try {
    const store = await getStore();
    const data = Array.from(stringToUint8Array(value));
    await store.insert(key, data);
    const { stronghold } = await initStronghold();
    await stronghold.save();
  } catch (error) {
    console.error(`Failed to set AI setting ${key}:`, error);
    throw error;
  }
}

export async function removeAiSetting(key: string): Promise<void> {
  try {
    const store = await getStore();
    await store.remove(key);
    const { stronghold } = await initStronghold();
    await stronghold.save();
  } catch (error) {
    // If key doesn't exist, that's fine
    if (error instanceof Error && error.message.includes('not found')) {
      return;
    }
    console.error(`Failed to remove AI setting ${key}:`, error);
    throw error;
  }
}

