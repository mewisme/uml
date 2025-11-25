import { Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { checkEmptyMessage } from './empty-message-linter';
import { checkInvalidArrow } from './invalid-arrow-linter';

function shouldSkipLine(line: string): boolean {
  const trimmedLine = line.trim();

  return (
    !trimmedLine ||
    trimmedLine.startsWith("'") ||
    trimmedLine.startsWith("@") ||
    trimmedLine.startsWith("==") ||
    trimmedLine.startsWith("title") ||
    trimmedLine.startsWith("participant") ||
    trimmedLine.startsWith("autonumber") ||
    trimmedLine.startsWith("activate") ||
    trimmedLine.startsWith("deactivate") ||
    trimmedLine.startsWith("note") ||
    trimmedLine.startsWith("end note")
  );
}


export function lintPlantUML(view: EditorView): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc;
  const lines = doc.toString().split('\n');


  const linters = [
    checkEmptyMessage,
    checkInvalidArrow,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];


    if (shouldSkipLine(line)) {
      continue;
    }


    for (const linter of linters) {
      const diagnostic = linter(line, i + 1, doc);
      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
    }
  }

  return diagnostics;
}
