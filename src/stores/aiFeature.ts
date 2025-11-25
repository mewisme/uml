import { atom, useAtom } from "jotai";

interface AIFeatureState {
  isExplainActive: boolean;
  isOptimizeActive: boolean;
  setExplainActive: (active: boolean) => void;
  setOptimizeActive: (active: boolean) => void;
  reset: () => void;
}

// Base atoms
const isExplainActiveAtom = atom<boolean>(false);
const isOptimizeActiveAtom = atom<boolean>(false);

// Action atoms
const setExplainActiveAtom = atom(null, (_get, set, active: boolean) => {
  set(isExplainActiveAtom, active);
});

const setOptimizeActiveAtom = atom(null, (_get, set, active: boolean) => {
  set(isOptimizeActiveAtom, active);
});

const resetAIFeatureAtom = atom(null, (_get, set) => {
  set(isExplainActiveAtom, false);
  set(isOptimizeActiveAtom, false);
});

// Hook to use the store
export function useAIFeatureStore<T>(selector?: (state: AIFeatureState) => T): T {
  const [isExplainActive] = useAtom(isExplainActiveAtom);
  const [isOptimizeActive] = useAtom(isOptimizeActiveAtom);
  const [, setExplainActive] = useAtom(setExplainActiveAtom);
  const [, setOptimizeActive] = useAtom(setOptimizeActiveAtom);
  const [, reset] = useAtom(resetAIFeatureAtom);

  const store: AIFeatureState = {
    isExplainActive,
    isOptimizeActive,
    setExplainActive: (active) => setExplainActive(active),
    setOptimizeActive: (active) => setOptimizeActive(active),
    reset: () => reset(),
  };

  return selector ? selector(store) : (store as T);
}

