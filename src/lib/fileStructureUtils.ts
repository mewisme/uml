import { FileEntry } from "@/features/Explorer/types";

export function generateFileStructureHash(files: FileEntry[]): string {
  const paths: string[] = [];

  function collectPaths(entries: FileEntry[]) {
    for (const entry of entries) {

      paths.push(`${entry.path}:${entry.is_dir ? "dir" : "file"}`);
      if (entry.children) {
        collectPaths(entry.children);
      }
    }
  }

  collectPaths(files);
  paths.sort();

  return paths.join("|");
}


export function hasFileStructureChanged(
  oldFiles: FileEntry[],
  newFiles: FileEntry[]
): boolean {
  const oldHash = generateFileStructureHash(oldFiles);
  const newHash = generateFileStructureHash(newFiles);
  return oldHash !== newHash;
}