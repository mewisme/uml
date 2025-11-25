import { memo, useEffect, useState } from "react";

import { DndContext } from "@dnd-kit/core";
import { ExplorerCreateDialog } from "./ExplorerCreateDialog";
import { ExplorerDragOverlay } from "./ExplorerDragOverlay";
import { ExplorerEmptyState } from "./ExplorerEmptyState";
import { ExplorerFileSearchDialog } from "./ExplorerFileSearchDialog";
import { ExplorerFileTree } from "./ExplorerFileTree";
import { ExplorerHeader } from "./ExplorerHeader";
import { ExplorerProps } from "./types";
import { ExplorerRenameDialog } from "./ExplorerRenameDialog";
import { useExplorerDragDrop } from "./hooks/useExplorerDragDrop";
import { useExplorerFileOperations } from "./hooks/useExplorerFileOperations";
import { useExplorerState } from "./hooks/useExplorerState";

function ExplorerComponent({
  onFileSelect,
  selectedPath,
  isExplorerVisible,
  onToggleExplorer,
}: ExplorerProps) {

  const {
    rootPath,
    setRootPath,
    files,
    setFiles,
    expandedPaths,
    toggleExpand,
    hoveredFolder,
    setHoveredFolder,
  } = useExplorerState();


  const {
    handleOpenFolder,
    loadDir,
    handleFileClick,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
  } = useExplorerFileOperations({
    rootPath,
    setRootPath,
    setFiles,
    expandedPaths,
    toggleExpand,
    onFileSelect,
  });


  const { activeItem, sensors, handleDragEnd } = useExplorerDragDrop({
    files,
    loadDir,
  });


  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [createParentPath, setCreateParentPath] = useState("");

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameItemPath, setRenameItemPath] = useState("");
  const [renameItemName, setRenameItemName] = useState("");

  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        if (rootPath) {
          setIsSearchDialogOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rootPath]);


  useEffect(() => {
    if (rootPath) {
      loadDir(rootPath);
    }
  }, [rootPath]);


  const openCreateDialog = (parentPath: string, type: "file" | "folder") => {
    setCreateParentPath(parentPath);
    setCreateType(type);
    setIsCreateDialogOpen(true);
  };

  const openRenameDialog = (path: string, currentName: string) => {
    setRenameItemPath(path);
    setRenameItemName(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleCreate = async (parentPath: string, name: string) => {
    if (createType === "file") {
      await createFile(parentPath, name);
    } else {
      await createFolder(parentPath, name);
    }
  };

  const handleSearchFile = () => {
    setIsSearchDialogOpen(true);
  };

  const handleFileSelectFromSearch = async (path: string) => {

    try {
      const fileName = path.split("/").pop() || "";
      await handleFileClick({ name: fileName, path, is_dir: false });
    } catch (error) {
      console.error("Failed to open file from search:", error);
    }
  };


  if (!rootPath) {
    return <ExplorerEmptyState onOpenFolder={handleOpenFolder} />;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-muted/10 border-r">
        { }
        <ExplorerHeader
          isExplorerVisible={isExplorerVisible}
          onToggleExplorer={onToggleExplorer}
          rootPath={rootPath}
          onOpenFolder={handleOpenFolder}
          onCreateFile={() => openCreateDialog(rootPath, "file")}
          onCreateFolder={() => openCreateDialog(rootPath, "folder")}
          onSearchFile={handleSearchFile}
        />

        { }
        <ExplorerFileTree
          rootPath={rootPath}
          files={files}
          selectedPath={selectedPath || null}
          expandedPaths={expandedPaths}
          hoveredFolder={hoveredFolder}
          onFileClick={handleFileClick}
          onCreateFile={(path) => openCreateDialog(path, "file")}
          onCreateFolder={(path) => openCreateDialog(path, "folder")}
          onRename={openRenameDialog}
          onDelete={deleteNode}
          onMouseEnter={setHoveredFolder}
          onMouseLeave={() => setHoveredFolder(null)}
        />
      </div>

      { }
      <ExplorerCreateDialog
        isOpen={isCreateDialogOpen}
        type={createType}
        parentPath={createParentPath}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreate}
      />

      <ExplorerRenameDialog
        isOpen={isRenameDialogOpen}
        currentName={renameItemName}
        itemPath={renameItemPath}
        onClose={() => setIsRenameDialogOpen(false)}
        onRename={renameNode}
      />

      <ExplorerFileSearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        files={files}
        rootPath={rootPath}
        onFileSelect={handleFileSelectFromSearch}
      />

      { }
      <ExplorerDragOverlay activeItem={activeItem} />
    </DndContext>
  );
}

export const Explorer = memo(ExplorerComponent);
