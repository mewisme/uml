import * as React from "react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

const LS_KEY_DARK = "previewUrlDark";
const LS_KEY_LIGHT = "previewUrlLight";

interface PreviewUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewUrlDialog({ open, onOpenChange }: PreviewUrlDialogProps) {
  const [darkUrl, setDarkUrl] = React.useState<string>("");
  const [lightUrl, setLightUrl] = React.useState<string>("");

  const readPreviewUrlsFromStorage = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const d = localStorage.getItem(LS_KEY_DARK) ?? "";
      const l = localStorage.getItem(LS_KEY_LIGHT) ?? "";
      setDarkUrl(d);
      setLightUrl(l);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("PreviewUrlDialog: failed to read preview urls from localStorage", e);
    }
  }, []);

  React.useEffect(() => {
    readPreviewUrlsFromStorage();

    const onPreviewUrlChange = () => readPreviewUrlsFromStorage();

    window.addEventListener("previewUrlChange", onPreviewUrlChange as EventListener);

    return () => {
      window.removeEventListener("previewUrlChange", onPreviewUrlChange as EventListener);
    };
  }, [readPreviewUrlsFromStorage]);

  // Load settings when dialog opens
  React.useEffect(() => {
    if (open) {
      readPreviewUrlsFromStorage();
    }
  }, [open, readPreviewUrlsFromStorage]);

  const save = () => {
    if (typeof window === "undefined") return;
    const d = darkUrl.trim();
    const l = lightUrl.trim();
    try {
      if (d === "") localStorage.removeItem(LS_KEY_DARK);
      else localStorage.setItem(LS_KEY_DARK, d);

      if (l === "") localStorage.removeItem(LS_KEY_LIGHT);
      else localStorage.setItem(LS_KEY_LIGHT, l);

      window.dispatchEvent(new Event("previewUrlChange"));
      onOpenChange(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("PreviewUrlDialog: failed to save preview urls", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom preview URLs</DialogTitle>
          <DialogDescription>Set a custom PlantUML preview endpoint for dark and light modes. Leave empty to use the default.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <label className="text-xs">Dark mode URL</label>
          <Input value={darkUrl} onChange={(e) => setDarkUrl(e.target.value)} placeholder="https://example.com/plantuml/d" />

          <label className="text-xs">Light mode URL</label>
          <Input value={lightUrl} onChange={(e) => setLightUrl(e.target.value)} placeholder="https://example.com/plantuml/" />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">Cancel</Button>
          </DialogClose>

          <Button size="sm" onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
