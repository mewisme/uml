import { useEffect, useState } from "react";

import { ExplorerTreeItem } from "./ExplorerTreeItem";
import { FileEntry } from "./types";

interface ExplorerFileTreeProps {
  rootPath: string;
  isGitRepo: boolean;
  files: FileEntry[];
  selectedPath: string | null;
  expandedPaths: Set<string>;
  hoveredFolder: string | null;
  onFileClick: (entry: FileEntry) => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  onInitGitRepo: (path: string) => void;
  onRevealInFileManager: (path: string) => void;
  onReload: (path: string) => void;
  onRename: (path: string, name: string) => void;
  onDelete: (path: string) => void;
  onMouseEnter: (path: string) => void;
  onMouseLeave: () => void;
}

export function ExplorerFileTree({
  rootPath,
  isGitRepo,
  files,
  selectedPath,
  expandedPaths,
  hoveredFolder,
  onFileClick,
  onCreateFile,
  onCreateFolder,
  onInitGitRepo,
  onRevealInFileManager,
  onReload,
  onRename,
  onDelete,
  onMouseEnter,
  onMouseLeave,
}: ExplorerFileTreeProps) {

  const [rootEntry, setRootEntry] = useState<FileEntry | null>(null);

  useEffect(() => {
    const rootEntry: FileEntry = {
      name: rootPath.split(/[/\\]/).pop() || rootPath,
      path: rootPath,
      is_dir: true,
      children: files,
      is_git_repo: isGitRepo,
    };
    setRootEntry(rootEntry);
  }, [rootPath, files, isGitRepo]);


  if (!rootEntry) {
    return null;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="py-1">
        <ExplorerTreeItem
          entry={rootEntry}
          depth={0}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          hoveredFolder={hoveredFolder}
          onFileClick={onFileClick}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          onInitGitRepo={onInitGitRepo}
          onRevealInFileManager={onRevealInFileManager}
          onReload={onReload}
          onRename={onRename}
          onDelete={onDelete}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </div>
    </div>
  );
}
