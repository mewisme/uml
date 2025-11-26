import { FileEntry } from "@/features/Explorer/types";
import { generateFileStructureHash } from "./fileStructureUtils";
import { invoke } from "@tauri-apps/api/core";

export async function checkAndReloadExplorer(
  rootPath: string,
  previousHash: string,
  loadDir: (path: string) => Promise<void>
): Promise<string> {
  try {

    const freshFiles = await invoke<FileEntry[]>("list_dir", { path: rootPath });


    const currentHash = generateFileStructureHash(freshFiles);


    if (currentHash !== previousHash) {
      console.log("File structure changed, reloading...");
      await loadDir(rootPath);
    }

    return currentHash;
  } catch (error) {
    console.error("Failed to check for file changes:", error);
    return previousHash;
  }
}