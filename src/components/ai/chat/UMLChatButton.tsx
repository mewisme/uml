import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

import { Button } from "../../ui/button";
import { MessageCircle } from "lucide-react";
import { useSetChatActive } from "@/stores/aiFeature";

interface UMLChatButtonProps {
  errorMessage?: string;
  showErrorDialog?: boolean;
  onShowErrorDialog?: () => void;
}

export function UMLChatButton({ errorMessage, showErrorDialog, onShowErrorDialog }: UMLChatButtonProps) {
  const setChatActive = useSetChatActive();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setChatActive(true)}
        title={"Chat"}
      >
        <MessageCircle size={14} />
      </Button>
      <AlertDialog open={showErrorDialog} onOpenChange={onShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle> Error Generating AI Chat </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onShowErrorDialog}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}