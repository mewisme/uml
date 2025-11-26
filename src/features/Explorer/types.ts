export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
  is_git_repo?: boolean;
}

export interface ExplorerProps {
  onFileSelect: (path: string, content: string) => void;
  selectedPath?: string | null;
  isExplorerVisible: boolean;
  onToggleExplorer: () => void;
}
