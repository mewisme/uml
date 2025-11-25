import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Brain, LoaderCircle, Sparkles } from "lucide-react";
import { useIsExplainActive, useIsOptimizeActive } from "@/stores/aiFeature";

import { Button } from "../ui/button";

interface UMLExtensionButtonProps {
  onGenerate: () => void;
  isExplain?: boolean;
  isOptimize?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  showErrorDialog?: boolean;
  onShowErrorDialog?: () => void;
}

export function UMLExtensionButton({ onGenerate, isExplain, isOptimize, isLoading, errorMessage, showErrorDialog, onShowErrorDialog }: UMLExtensionButtonProps) {
  const isExplainActive = useIsExplainActive();
  const isOptimizeActive = useIsOptimizeActive();
  const shouldShowLoading = isLoading && ((isExplain && isExplainActive) || (isOptimize && isOptimizeActive));

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={shouldShowLoading ? undefined : onGenerate}
        disabled={shouldShowLoading}
        title={isExplain ? "Explain" : isOptimize ? "Optimize" : "Generate"}
      >
        {shouldShowLoading ? (
          <LoaderCircle size={14} className="animate-spin" />
        ) : isExplain ? (
          <Brain size={14} />
        ) : isOptimize ? (
          <Sparkles size={14} />
        ) : (
          <Brain size={14} />
        )}
      </Button>
      <AlertDialog open={showErrorDialog} onOpenChange={onShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle> Error Generating AI Feature </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onShowErrorDialog}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}