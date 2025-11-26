import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { AIFeatureDialog } from "./ai/AIFeatureDialog";
import { PreviewUrlDialog } from "./PreviewUrlDialog";
import { Settings2Icon } from "lucide-react";

type DialogType = "ai" | "preview" | null;

export function SettingsDialog() {
  const [openDialog, setOpenDialog] = React.useState<DialogType>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="flex cursor-pointer items-center gap-1 text-xs hover:bg-primary/10 px-1 py-0.5 rounded"
          >
            <Settings2Icon size={12} />
            Settings
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="text-xs">
          <DropdownMenuItem onClick={() => setOpenDialog("ai")}>
            AI Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("preview")}>
            Preview URLs
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AIFeatureDialog open={openDialog === "ai"} onOpenChange={(open) => setOpenDialog(open ? "ai" : null)} />
      <PreviewUrlDialog open={openDialog === "preview"} onOpenChange={(open) => setOpenDialog(open ? "preview" : null)} />
    </>
  );
}