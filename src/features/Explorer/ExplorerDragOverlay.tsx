import { File, Folder } from "lucide-react";

import { DragOverlay } from "@dnd-kit/core";
import { FileEntry } from "./types";

interface ExplorerDragOverlayProps {
  activeItem: FileEntry | null;
}

export function ExplorerDragOverlay({ activeItem }: ExplorerDragOverlayProps) {
  return (
    <DragOverlay>
      {activeItem ? (
        <div className="flex items-center gap-2 px-2 py-1 bg-background border rounded shadow-lg">
          {activeItem.is_dir ? (
            <Folder className="w-4 h-4" />
          ) : (
            <File size={16} className="opacity-70" />
          )}
          <span className="text-sm">{activeItem.name}</span>
        </div>
      ) : null}
    </DragOverlay>
  );
}
