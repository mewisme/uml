import { useEffect, useState } from "react";

import { FileEntry } from "../types";

export function useExplorerState() {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);


  useEffect(() => {
    const savedPath = localStorage.getItem("lastOpenedFolder");
    if (savedPath) {
      setRootPath(savedPath);
    }

    const savedExpanded = localStorage.getItem("expandedFolders");
    if (savedExpanded) {
      try {
        const paths = JSON.parse(savedExpanded);
        setExpandedPaths(new Set(paths));
      } catch (e) {
        console.error("Failed to parse expanded folders", e);
      }
    } else if (savedPath) {

      setExpandedPaths(new Set([savedPath]));
    }
  }, []);


  useEffect(() => {
    localStorage.setItem("expandedFolders", JSON.stringify(Array.from(expandedPaths)));
  }, [expandedPaths]);

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  return {
    rootPath,
    setRootPath,
    files,
    setFiles,
    expandedPaths,
    setExpandedPaths,
    toggleExpand,
    hoveredFolder,
    setHoveredFolder,
  };
}
