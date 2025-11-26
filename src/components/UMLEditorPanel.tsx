import "../styles/codemirror-lint.css";

import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { customContextMenuExtension } from "../lib/codemirror/context-menu-extension";
import { githubLight } from "@uiw/codemirror-theme-github";
import { lintGutter } from "@codemirror/lint";
import { materialDark } from "@uiw/codemirror-theme-material";
import { plantUML } from "../lib/codemirror/plantuml";
import { useTheme } from "next-themes";

interface UMLEditorPanelProps {
  umlCode: string;
  onChange: (value: string) => void;
  onErrorCountChange?: (count: number) => void;
}

export interface UMLEditorPanelRef {
  jumpToLine: (lineNumber: number) => void;
}

export const UMLEditorPanel = forwardRef<UMLEditorPanelRef, UMLEditorPanelProps>(
  ({ umlCode, onChange, onErrorCountChange }, ref) => {
    const { theme } = useTheme();
    const [editorTheme, setEditorTheme] = useState(githubLight);
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const [hasErrors, setHasErrors] = useState(false);

    useEffect(() => {
      setEditorTheme(theme === 'dark' ? materialDark : githubLight);
    }, [theme]);


    useEffect(() => {
      if (!onErrorCountChange) return;


      const lines = umlCode.split('\n');
      let errorCount = 0;

      const emptyMessageRegex = /^\s*(?:\d+\s+)?["\w\s]+?\s*<?-{1,2}>?\s*["\w\s]+?\s*:\s*$/;

      for (const line of lines) {
        if (emptyMessageRegex.test(line)) {
          errorCount++;
        }
      }

      setHasErrors(errorCount > 0);
      onErrorCountChange(errorCount);
    }, [umlCode, onErrorCountChange]);


    const extensions = useMemo(() => {
      const baseExtensions: any[] = [plantUML(), customContextMenuExtension()];
      if (hasErrors) {
        baseExtensions.push(lintGutter());
      }
      return baseExtensions;
    }, [hasErrors]);


    useImperativeHandle(ref, () => ({
      jumpToLine: (lineNumber: number) => {
        const view = editorRef.current?.view;
        if (!view) return;

        try {

          const line = view.state.doc.line(lineNumber);


          const pos = line.from;



          view.dispatch({
            selection: EditorSelection.cursor(pos),
            effects: EditorView.scrollIntoView(pos, {
              y: 'center',
              x: 'start',
              yMargin: 50,
              xMargin: 50
            }),
          });


          view.focus();
        } catch (error) {
          console.error(`Failed to jump to line ${lineNumber}:`, error);
        }
      },
    }), []);

    const handleCut = async () => {
      const view = editorRef.current?.view;
      if (!view) return;

      const selection = view.state.selection.main;
      if (selection.empty) return;

      const text = view.state.sliceDoc(selection.from, selection.to);
      try {
        await navigator.clipboard.writeText(text);
        view.dispatch({
          changes: {
            from: selection.from,
            to: selection.to,
            insert: "",
          },
          selection: { anchor: selection.from },
        });
      } catch (error) {
        console.error("Failed to cut:", error);
      }
    };

    const handleCopy = async () => {
      const view = editorRef.current?.view;
      if (!view) return;

      const selection = view.state.selection.main;
      if (selection.empty) return;

      const text = view.state.sliceDoc(selection.from, selection.to);
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    };

    const handlePaste = async () => {
      const view = editorRef.current?.view;
      if (!view) return;

      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          const selection = view.state.selection.main;
          view.dispatch({
            changes: {
              from: selection.from,
              to: selection.to,
              insert: text,
            },
            selection: { anchor: selection.from + text.length },
          });
        }
      } catch (error) {
        console.error("Failed to paste:", error);
      }
    };

    const handleSelectAll = () => {
      const view = editorRef.current?.view;
      if (!view) return;

      const docLength = view.state.doc.length;
      view.dispatch({
        selection: EditorSelection.create([
          EditorSelection.range(0, docLength),
        ]),
      });
      view.focus();
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="h-full w-full" data-radix-context-menu-trigger>
            <CodeMirror
              ref={editorRef}
              value={umlCode}
              height="100%"
              onChange={onChange}
              className="h-full"
              style={{ height: 'calc(100% - 32px)' }}
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
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleCut}>
            Cut
            <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopy}>
            Copy
            <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={handlePaste}>
            Paste
            <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleSelectAll}>
            Select All
            <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
);