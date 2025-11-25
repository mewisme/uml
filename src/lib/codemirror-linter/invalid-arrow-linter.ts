import { Diagnostic } from '@codemirror/lint';
import { Text } from '@codemirror/state';

export function checkInvalidArrow(
  line: string,
  lineNumber: number,
  doc: Text
): Diagnostic | null {

  const invalidArrowRegex = /^\s*["\w\s]+?\s*[-=]{3,}\s*["\w\s]+/;

  if (invalidArrowRegex.test(line) && !line.includes('->') && !line.includes('<-')) {
    const from = doc.line(lineNumber).from;
    const to = doc.line(lineNumber).to;

    return {
      from,
      to,
      severity: 'error',
      message: 'Invalid arrow syntax. Use ->, -->, <-, or <--',
    };
  }

  return null;
}
