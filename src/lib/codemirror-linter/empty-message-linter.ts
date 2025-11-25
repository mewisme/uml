import { Diagnostic } from '@codemirror/lint';
import { Text } from '@codemirror/state';

export function checkEmptyMessage(
  line: string,
  lineNumber: number,
  doc: Text
): Diagnostic | null {

  const emptyMessageRegex = /^\s*(?:\d+\s+)?["\w\s]+?\s*<?-{1,2}>?\s*["\w\s]+?\s*:\s*$/;

  if (emptyMessageRegex.test(line)) {
    const from = doc.line(lineNumber).from;
    const to = doc.line(lineNumber).to;

    return {
      from,
      to,
      severity: 'error',
      message: 'Message text is required after colon (:)',
    };
  }

  return null;
}
