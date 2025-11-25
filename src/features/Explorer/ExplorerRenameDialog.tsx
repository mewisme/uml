import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ExplorerRenameDialogProps {
  isOpen: boolean;
  currentName: string;
  itemPath: string;
  onClose: () => void;
  onRename: (oldPath: string, newName: string) => Promise<void>;
}

export function ExplorerRenameDialog({
  isOpen,
  currentName,
  itemPath,
  onClose,
  onRename,
}: ExplorerRenameDialogProps) {
  const [renameItemName, setRenameItemName] = useState(currentName);

  const handleRename = async () => {
    if (!renameItemName) return;
    try {
      await onRename(itemPath, renameItemName);
      onClose();
    } catch (error) {

    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <Input
          value={renameItemName}
          onChange={(e) => setRenameItemName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRename}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
