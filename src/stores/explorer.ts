import { atom, useAtom } from "jotai";

const explorerRootPathAtom = atom<string | null>(null);


export function useExplorerRootPath() {
  return useAtom(explorerRootPathAtom);
}