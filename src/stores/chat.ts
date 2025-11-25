import { atom, useAtomValue, useSetAtom } from "jotai";

import type { UIMessage } from "@ai-sdk/react";

const chatsAtom = atom<Record<string, UIMessage[]>>({});
const currentChatIdAtom = atom<string | null>(null);


const setMessagesForChatAtom = atom(null, (_get, set, { chatId, messages }: { chatId: string; messages: UIMessage[] }) => {
  const currentChats = _get(chatsAtom);
  set(chatsAtom, {
    ...currentChats,
    [chatId]: messages,
  });
});

const setCurrentChatIdAtom = atom(null, (_get, set, chatId: string | null) => {
  set(currentChatIdAtom, chatId);
});

const deleteChatAtom = atom(null, (_get, set, chatId: string) => {
  const currentChats = _get(chatsAtom);
  const { [chatId]: _, ...remainingChats } = currentChats;
  set(chatsAtom, remainingChats);
});

const clearAllChatsAtom = atom(null, (_get, set) => {
  set(chatsAtom, {});
  set(currentChatIdAtom, null);
});


export function useCurrentChatId(): string | null {
  return useAtomValue(currentChatIdAtom);
}

export function useSetCurrentChatId(): (chatId: string | null) => void {
  const setCurrentChatId = useSetAtom(setCurrentChatIdAtom);
  return (chatId: string | null) => setCurrentChatId(chatId);
}


export function useChatMessages(chatId: string | null): UIMessage[] {
  const chats = useAtomValue(chatsAtom);
  if (!chatId) return [];
  return chats[chatId] || [];
}

export function useSetChatMessages(): (chatId: string, messages: UIMessage[]) => void {
  const setMessagesForChat = useSetAtom(setMessagesForChatAtom);
  return (chatId: string, messages: UIMessage[]) => {
    setMessagesForChat({ chatId, messages });
  };
}


export function useCurrentChatMessages(): UIMessage[] {
  const currentChatId = useCurrentChatId();
  return useChatMessages(currentChatId);
}


export function useRenewChatId(): () => string {
  const setCurrentChatId = useSetAtom(setCurrentChatIdAtom);
  const deleteChat = useSetAtom(deleteChatAtom);
  const currentChatId = useAtomValue(currentChatIdAtom);

  return () => {

    if (currentChatId) {
      deleteChat(currentChatId);
    }


    const newChatId = crypto.randomUUID();
    setCurrentChatId(newChatId);
    return newChatId;
  };
}


export function useDeleteChat(): (chatId: string) => void {
  const deleteChat = useSetAtom(deleteChatAtom);
  return (chatId: string) => deleteChat(chatId);
}


export function useClearAllChats(): () => void {
  const clearAll = useSetAtom(clearAllChatsAtom);
  return () => clearAll();
}

