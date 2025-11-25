import { Check, RefreshCcw } from "lucide-react";

import { Badge } from "./ui/badge";
import { ZoomableView } from "./ZoomableView";
import { useBackground } from "@/hooks/useBackground";
import { useEffect } from "react";

interface UMLPreviewPanelProps {
  svgContent: string;
  hidden?: boolean;
  onMessageClick?: (messageText: string, from?: string, to?: string, messageIndex?: number) => void;
}

export function UMLPreviewPanel({ svgContent, hidden, onMessageClick }: UMLPreviewPanelProps) {
  const { previewBackground } = useBackground();


  const flashTextElement = (textElement: SVGTextElement) => {

    const originalFill = textElement.getAttribute('fill') || '#000000';


    textElement.setAttribute('fill', '#FF0000');


    setTimeout(() => {
      textElement.setAttribute('fill', originalFill);
    }, 200);
  };



  useEffect(() => {
    if (!onMessageClick) return;

    const messages = document.querySelectorAll(".message");

    const handler = (ev: Event) => {
      const target = ev.target as HTMLElement;
      const parent = target.parentNode as HTMLElement;

      messages.forEach((message, messageIndex) => {
        if (message === parent) {


          const textElements = message.querySelectorAll("text");
          let messageText = "";
          let fromParticipant = "";
          let toParticipant = "";


          if (textElements.length > 0) {
            const lastText = textElements[textElements.length - 1];
            messageText = lastText.textContent?.trim() || "";
          }



          const allTexts = Array.from(textElements).map(t => t.textContent?.trim() || "");


          if (allTexts.length >= 2) {

            const potentialParticipants = allTexts.filter(t => t && !t.includes(':'));
            if (potentialParticipants.length >= 2) {
              fromParticipant = potentialParticipants[0];
              toParticipant = potentialParticipants[1];
            }
          }

          console.log("Clicked message:", { messageText, fromParticipant, toParticipant, messageIndex });


          textElements.forEach(textEl => {
            flashTextElement(textEl as SVGTextElement);
          });

          if (messageText) {
            onMessageClick(messageText, fromParticipant || undefined, toParticipant || undefined, messageIndex);
          }
          return;
        }
      });
    };


    messages.forEach(message => {
      message.removeEventListener("click", handler);
      message.addEventListener("click", handler);


      (message as HTMLElement).style.cursor = "pointer";
    });


    return () => {
      messages.forEach(message => {
        message.removeEventListener("click", handler);
      });
    };
  }, [svgContent, onMessageClick]);

  return (
    <div className={`uml-preview-card relative ${hidden ? "hidden" : ""}`}
      style={{ height: "100%", backgroundColor: previewBackground }}>

      <div className="absolute top-2 right-2">
        <Badge variant="outline" id="status-badge">
          <Check className="w-4 h-4" id="stt-icon-save" />
          <RefreshCcw className="w-4 h-4 animate-spin hidden" id="stt-icon-loading" />
          <span id="stt-text">Saved</span>
        </Badge>
      </div>
      <ZoomableView className="h-full">
        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="max-w-full h-[calc(100vh - 34px)] uml-preview"
        />
      </ZoomableView>
    </div>
  );
} 