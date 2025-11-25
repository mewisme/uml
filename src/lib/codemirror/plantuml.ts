import { LanguageSupport, StreamLanguage, StringStream } from '@codemirror/language';

import { autocompletion } from '@codemirror/autocomplete';
import { lintPlantUML } from '../codemirror-linter';
import { linter } from '@codemirror/lint';
import { plantUMLCompletions } from './plantuml-completion';

interface PlantUMLState {
  tokenize: null | ((stream: StringStream, state: PlantUMLState) => string | null);
  context: string | null;
  note: boolean;
  indent: number;
}

export const plantumlLanguage = StreamLanguage.define<PlantUMLState>({
  name: "plantuml",

  startState: () => ({
    tokenize: null,
    context: null,
    note: false,
    indent: 0
  }),

  token(stream: StringStream, state: PlantUMLState) {

    if (stream.eatSpace()) return null;

    if (state.note === true) {

      if (stream.match(/^\s*end\s+note\s*$/i)) {
        state.note = false;
        return 'keyword';
      }

      stream.skipToEnd();
      return 'string';
    }



    if (stream.match('@startuml')) {
      state.context = 'diagram';
      return 'keyword';
    }
    if (stream.match('@enduml')) {
      state.context = null;
      return 'keyword';
    }

    if (stream.match(/^\s*note\s+(left|right)\s*$/i)) {
      state.note = true;
      return 'keyword';
    }

    if (stream.match(/^\s*end\s+note\s*$/i)) {
      state.note = false;
      return 'keyword';
    }

    if (stream.match("'")) {
      stream.skipToEnd();
      return 'comment';
    }


    if (stream.match(/:\s*(.*)/)) {
      return 'string';
    }


    if (stream.match(/^\s*==.*?==\s*$/)) {
      return 'keyword';
    }


    const keywords = [
      'actor', 'participant', 'boundary', 'control', 'entity', 'database',
      'collections', 'queue', 'title', 'note', 'legend', 'left', 'right',
      'of', 'header', 'footer', 'center', 'box', 'alt', 'else', 'opt',
      'loop', 'par', 'break', 'critical', 'group'
    ];

    const word = stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/) as RegExpMatchArray | null;
    if (word) {
      const matched = word[0].toLowerCase();
      if (keywords.includes(matched)) {
        return 'keyword';
      }
      return 'variable';
    }


    if (stream.match(/[-=]>|<[-=]|[-.=]{2,}>/)) {
      return 'operator';
    }


    if (stream.match(/[[\]{}():<>]/)) {
      return 'bracket';
    }


    if (stream.match('"')) {
      while (!stream.eol()) {
        if (stream.next() === '"') break;
      }
      return 'string';
    }


    if (stream.match(/#[0-9a-fA-F]{6}/)) {
      return 'atom';
    }


    stream.next();
    return null;
  },

  indent(state: PlantUMLState) {
    return state.indent * 2;
  },

  languageData: {
    commentTokens: { line: "'" }
  }
});

export function plantUML() {
  return new LanguageSupport(plantumlLanguage, [
    autocompletion({ override: [plantUMLCompletions] }),
    linter(lintPlantUML)
  ]);
}
