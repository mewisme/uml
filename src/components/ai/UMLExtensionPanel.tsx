import "../../styles/codemirror-lint.css";

import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsExplainActive, useIsOptimizeActive } from "@/stores/aiFeature";

import { Response } from "../ui/shadcn-io/ai/response";
import { githubLight } from "@uiw/codemirror-theme-github";
import { lintGutter } from "@codemirror/lint";
import { materialDark } from "@uiw/codemirror-theme-material";
import { plantUML } from "../../lib/codemirror/plantuml";
import { useBackground } from "@/hooks/useBackground";
import { useTheme } from "next-themes";

interface UMLExtensionPanelProps {
  result?: string | null;
}

export function UMLExtensionPanel({ result = undefined }: UMLExtensionPanelProps) {
  const { theme } = useTheme();
  const { editorBackground } = useBackground();
  const [editorTheme, setEditorTheme] = useState(githubLight);
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const isExplainActive = useIsExplainActive();
  const isOptimizeActive = useIsOptimizeActive();

  useEffect(() => {
    setEditorTheme(theme === 'dark' ? materialDark : githubLight);
  }, [theme]);

  const extensions = useMemo(() => {
    const baseExtensions: any[] = [plantUML()];
    baseExtensions.push(lintGutter());
    return baseExtensions;
  }, []);

  return (
    <div className="overflow-y-auto h-full" style={{ backgroundColor: editorBackground, padding: isExplainActive ? "10px" : "0px" }}>
      {isExplainActive && !isOptimizeActive && (
        <Response
          allowedImagePrefixes={["*"]}
          allowedLinkPrefixes={["*"]}
        >
          {result ?? ""}
        </Response>
      )}
      {isOptimizeActive && !isExplainActive && <CodeMirror
        ref={editorRef}
        value={result ?? ""}
        height="100%"
        className="h-full"
        readOnly={true}
        theme={editorTheme}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />}
    </div>
  );
}