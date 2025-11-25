import { useEffect, useState } from "react";

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { encode } from "plantuml-encoder";
import { toast } from "sonner";

interface PreviewWindowManagerProps {
  umlCode: string;
  projectName: string;
  svgContent: string;
  onPreviewWindowChange: (window: WebviewWindow | null) => void;
}

export function usePreviewWindow({
  umlCode,
  projectName,
  svgContent,
  onPreviewWindowChange,
}: PreviewWindowManagerProps) {
  const [previewWindow, setPreviewWindow] = useState<WebviewWindow | null>(null);


  useEffect(() => {
    const closeExistingPreviews = async () => {
      try {
        const windows = await WebviewWindow.getAll();
        windows.forEach(window => {
          if (window.label === "preview") {
            window.close();
          }
        });
      } catch (error) {
        console.error("Error closing existing preview windows:", error);
      }
    };

    closeExistingPreviews();
  }, []);


  useEffect(() => {
    return () => {
      if (previewWindow) {
        previewWindow.close();
      }
    };
  }, [previewWindow]);

  const openPreviewWindow = async () => {
    try {
      const webview = new WebviewWindow("preview", {
        url: "/preview",
        title: `Preview: ${projectName}`,
        width: 800,
        height: 600,
        center: true,

      });

      console.log("previewWindow", webview);

      setPreviewWindow(webview);
      onPreviewWindowChange(webview);

      webview.once("tauri://created", async function () {


        const encoded = encode(umlCode);
        setTimeout(async () => {
          try {
            await webview.emit("update-diagram", {
              diagram: encoded,
            });
            console.log("update-diagram (initial)", encoded);
          } catch (error) {
            console.error("Error emitting initial update-diagram:", error);
          }
        }, 1000);
      });

      webview.once("tauri://error", function (e) {
        console.error("Error creating preview window:", e);
      });

      webview.once("tauri://destroyed", function () {
        setPreviewWindow(null);
        onPreviewWindowChange(null);
      });
    } catch (error) {
      console.error("Error creating preview window:", error);
      toast.error("Failed to open preview window");
    }
  };


  useEffect(() => {
    if (!previewWindow || !svgContent) return;
    console.log("update-diagram (update)", svgContent);
    const encoded = encode(umlCode);
    previewWindow.emit("update-diagram", {
      diagram: encoded,
    }).catch((error) => {
      console.error("Error emitting update-diagram event:", error);
    });
  }, [svgContent, previewWindow, umlCode]);

  return {
    previewWindow,
    openPreviewWindow,
  };
} 