import { useEffect, useState } from "react";

import { ZoomableView } from "@/components/ZoomableView";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useBackground } from "@/hooks/useBackground";

export default function TestPage() {
  const [diagram, setDiagram] = useState("");
  const { previewBackground, previewUrl } = useBackground();
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const webview = getCurrentWebviewWindow();
        console.log("Setting up listener on webview:", webview);
        unlisten = await webview.listen("update-diagram", (event: { payload: { diagram: string } }) => {
          console.log("update-diagram event received", event);
          setDiagram(event.payload.diagram || "");
        });
        console.log("Listener set up for update-diagram");
      } catch (error) {
        console.error("Error setting up update-diagram listener:", error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);
  return (
    <div className="h-screen w-screen" style={{ backgroundColor: previewBackground }}>
      <ZoomableView className="h-full">
        <img src={`${previewUrl}svg/${diagram}`} />
      </ZoomableView>
    </div>
  );
}
