import { LS_KEY_AI_API_KEY, LS_KEY_AI_BASE_URL, LS_KEY_AI_LANGUAGE, LS_KEY_AI_MODEL, LS_KEY_AI_PROVIDER, LS_KEY_AI_STREAM_ENABLED, Language } from "@/lib/ai/providers";
import { useEffect, useState } from "react";

import { defaultSettingsMaterialDark } from "@uiw/codemirror-theme-material";
import { useTheme } from "next-themes";

const DEFAULT_PREVIEW_DARK = "https://www.plantuml.com/plantuml/d";
const DEFAULT_PREVIEW_LIGHT = "https://www.plantuml.com/plantuml/";
const LS_KEY_DARK = "previewUrlDark";
const LS_KEY_LIGHT = "previewUrlLight";

export function useBackground(): {
  previewUrl: string;
  editorBackground: string;
  previewBackground: string;
  isDarkBackground: boolean;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  aiLanguage: Language;
  aiStreamEnabled: boolean;
} {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [userPreviewUrlDark, setUserPreviewUrlDark] = useState<string | null>(null);
  const [userPreviewUrlLight, setUserPreviewUrlLight] = useState<string | null>(null);
  const [userAiProvider, setUserAiProvider] = useState<string | null>(null);
  const [userAiApiKey, setUserAiApiKey] = useState<string | null>(null);
  const [userAiModel, setUserAiModel] = useState<string | null>(null);
  const [userAiBaseUrl, setUserAiBaseUrl] = useState<string | null>(null);
  const [userAiLanguage, setUserAiLanguage] = useState<string | null>(null);
  const [userStreamEnabled, setUserStreamEnabled] = useState<boolean>(false);

  const readPreviewUrlFromStorage = () => {
    if (typeof window === "undefined") return;
    try {
      setUserPreviewUrlDark(localStorage.getItem(LS_KEY_DARK));
      setUserPreviewUrlLight(localStorage.getItem(LS_KEY_LIGHT));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("useBackground: failed to read preview urls from localStorage", e);
    }
  };

  const readAiSettingsFromStorage = () => {
    if (typeof window === "undefined") return;
    try {
      setUserAiProvider(localStorage.getItem(LS_KEY_AI_PROVIDER));
      setUserAiApiKey(localStorage.getItem(LS_KEY_AI_API_KEY));
      setUserAiModel(localStorage.getItem(LS_KEY_AI_MODEL));
      setUserAiBaseUrl(localStorage.getItem(LS_KEY_AI_BASE_URL));
      setUserAiLanguage(localStorage.getItem(LS_KEY_AI_LANGUAGE) ?? "en");
      setUserStreamEnabled(localStorage.getItem(LS_KEY_AI_STREAM_ENABLED) === "true");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("useBackground: failed to read AI settings from localStorage", e);
    }
  }

  useEffect(() => {
    readPreviewUrlFromStorage();
    readAiSettingsFromStorage();

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY_DARK || e.key === LS_KEY_LIGHT) readPreviewUrlFromStorage();
    };

    const onCustomPreviewUrls = () => readPreviewUrlFromStorage();
    const onCustomAiSettings = () => readAiSettingsFromStorage();

    window.addEventListener("storage", onStorage);
    window.addEventListener("previewUrlChange", onCustomPreviewUrls as EventListener);
    window.addEventListener("aiSettingsChange", onCustomAiSettings as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("previewUrlChange", onCustomPreviewUrls as EventListener);
      window.removeEventListener("aiSettingsChange", onCustomAiSettings as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // re-read when theme changes to ensure previewUrl picks correct value
    readPreviewUrlFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const previewUrl = isDark
    ? userPreviewUrlDark ?? DEFAULT_PREVIEW_DARK
    : userPreviewUrlLight ?? DEFAULT_PREVIEW_LIGHT;

  return {
    previewUrl,
    editorBackground: isDark ? (defaultSettingsMaterialDark.background ?? "white") : "white",
    previewBackground: isDark ? "#27272b" : "white",
    isDarkBackground: isDark,
    aiProvider: userAiProvider ?? "openai",
    aiApiKey: userAiApiKey ?? "",
    aiModel: userAiModel ?? "gpt-4o",
    aiBaseUrl: userAiBaseUrl ?? "",
    aiLanguage: (userAiLanguage ?? "en") as Language,
    aiStreamEnabled: userStreamEnabled,
  };
}
