
export interface UMLMessage {
  from: string;
  to: string;
  text: string;
  lineNumber: number;
  arrowType: string;
}


export function parseUMLMessages(umlCode: string): UMLMessage[] {
  const lines = umlCode.split('\n');
  const messages: UMLMessage[] = [];





  const messageRegex = /^\s*(?:(\d+)\s+)?(["\w\s]+?)\s*(<?-{1,2}>?)\s*(["\w\s]+?)\s*:\s*(.+)$/;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();


    if (
      !trimmedLine ||
      trimmedLine.startsWith("'") ||
      trimmedLine.startsWith("@") ||
      trimmedLine.startsWith("==") ||
      trimmedLine.startsWith("title") ||
      trimmedLine.startsWith("participant") ||
      trimmedLine.startsWith("autonumber") ||
      trimmedLine.startsWith("activate") ||
      trimmedLine.startsWith("deactivate")
    ) {
      return;
    }

    const match = line.match(messageRegex);
    if (match) {
      const [, , from, arrowType, to, text] = match;

      messages.push({
        from: from.replace(/"/g, '').trim(),
        to: to.replace(/"/g, '').trim(),
        text: text.trim(),
        lineNumber: index + 1,
        arrowType: arrowType.trim(),
      });
    }
  });

  return messages;
}


export function findMessageLine(
  svgMessageIndex: number,
  umlCode: string
): number | null {
  const lines = umlCode.split('\n');





  const messageRegex = /^\s*(?:\d+\s+)?["\w\s]+?\s*<?-{1,2}>?\s*["\w\s]+?(?:\s*:\s*.+)?$/;

  let messageCount = 0;

  console.log("lines", lines)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();


    if (
      !line ||
      line.startsWith("'") ||
      line.startsWith("@") ||
      line.startsWith("==") ||
      line.startsWith("title") ||
      line.startsWith("participant") ||
      line.startsWith("autonumber") ||
      line.startsWith("activate") ||
      line.startsWith("deactivate") ||
      line.startsWith("note")
    ) {
      continue;
    }


    if (messageRegex.test(line)) {
      console.log(i, `Found message: ${line}`, svgMessageIndex, messageCount);

      if (messageCount === svgMessageIndex) {
        console.log("result", i + 1)
        return i + 1;
      }
      messageCount++;
    }
  }

  return null;
}
