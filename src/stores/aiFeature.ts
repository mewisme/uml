import { atom, useAtomValue, useSetAtom } from "jotai";

const isExplainActiveAtom = atom<boolean>(false);
const isOptimizeActiveAtom = atom<boolean>(false);
const isChatActiveAtom = atom<boolean>(false);


const setExplainActiveAtom = atom(null, (_get, set, active: boolean) => {
  set(isExplainActiveAtom, active);
});

const setOptimizeActiveAtom = atom(null, (_get, set, active: boolean) => {
  set(isOptimizeActiveAtom, active);
});

const setChatActiveAtom = atom(null, (_get, set, active: boolean) => {
  set(isChatActiveAtom, active);
});

const resetAIFeatureAtom = atom(null, (_get, set) => {
  set(isExplainActiveAtom, false);
  set(isOptimizeActiveAtom, false);
  set(isChatActiveAtom, false);
});


export function useIsExplainActive(): boolean {
  return useAtomValue(isExplainActiveAtom);
}

export function useIsOptimizeActive(): boolean {
  return useAtomValue(isOptimizeActiveAtom);
}

export function useIsChatActive(): boolean {
  return useAtomValue(isChatActiveAtom);
}

export function useSetExplainActive(): (active: boolean) => void {
  const setExplainActive = useSetAtom(setExplainActiveAtom);
  return (active: boolean) => setExplainActive(active);
}

export function useSetOptimizeActive(): (active: boolean) => void {
  const setOptimizeActive = useSetAtom(setOptimizeActiveAtom);
  return (active: boolean) => setOptimizeActive(active);
}

export function useSetChatActive(): (active: boolean) => void {
  const setChatActive = useSetAtom(setChatActiveAtom);
  return (active: boolean) => setChatActive(active);
}

export function useResetAIFeature(): () => void {
  const reset = useSetAtom(resetAIFeatureAtom);
  return () => reset();
}


export function useAIFeatureStates() {
  const isExplainActive = useIsExplainActive();
  const isOptimizeActive = useIsOptimizeActive();
  const isChatActive = useIsChatActive();
  return { isExplainActive, isOptimizeActive, isChatActive };
}


export function useAIFeatureActions() {
  const setExplainActive = useSetExplainActive();
  const setOptimizeActive = useSetOptimizeActive();
  const setChatActive = useSetChatActive();
  const reset = useResetAIFeature();
  return { setExplainActive, setOptimizeActive, setChatActive, reset };
}


interface AIFeatureState {
  isExplainActive: boolean;
  isOptimizeActive: boolean;
  isChatActive: boolean;
  setExplainActive: (active: boolean) => void;
  setOptimizeActive: (active: boolean) => void;
  setChatActive: (active: boolean) => void;
  reset: () => void;
}

export function useAIFeatureStore<T>(selector?: (state: AIFeatureState) => T): T {
  const states = useAIFeatureStates();
  const actions = useAIFeatureActions();

  const store: AIFeatureState = {
    ...states,
    ...actions,
  };

  return selector ? selector(store) : (store as T);
}

