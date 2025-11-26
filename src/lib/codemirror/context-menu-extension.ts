import { EditorView, ViewPlugin } from "@codemirror/view";

import { Extension } from "@codemirror/state";

export function customContextMenuExtension(): Extension {
  return ViewPlugin.define((view: EditorView) => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const wrapper = view.dom.closest('[data-radix-context-menu-trigger]');
      if (wrapper) {
        Object.defineProperty(event, 'target', {
          writable: false,
          value: wrapper,
        });

        const syntheticEvent = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          button: 2,
          buttons: 0,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey,
          view: event.view || window,
        });

        wrapper.dispatchEvent(syntheticEvent);
      }
    };

    view.dom.addEventListener("contextmenu", handleContextMenu, true);

    return {
      destroy() {
        view.dom.removeEventListener("contextmenu", handleContextMenu, true);
      },
    };
  });
}

