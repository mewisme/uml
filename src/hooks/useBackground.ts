import { LS_KEY_AI_API_KEY, LS_KEY_AI_BASE_URL, LS_KEY_AI_LANGUAGE, LS_KEY_AI_MODEL, LS_KEY_AI_PROVIDER, LS_KEY_AI_STREAM_ENABLED, Language } from "@/lib/ai/providers";
import { getAiSetting } from "@/lib/ai/stronghold";
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

  const readAiSettingsFromStorage = async () => {
    if (typeof window === "undefined") return;
    try {
      const provider = await getAiSetting(LS_KEY_AI_PROVIDER);
      const apiKey = await getAiSetting(LS_KEY_AI_API_KEY);
      const model = await getAiSetting(LS_KEY_AI_MODEL);
      const baseUrl = await getAiSetting(LS_KEY_AI_BASE_URL);
      const language = await getAiSetting(LS_KEY_AI_LANGUAGE);
      const streamEnabled = await getAiSetting(LS_KEY_AI_STREAM_ENABLED);

      setUserAiProvider(provider);
      setUserAiApiKey(apiKey);
      setUserAiModel(model);
      setUserAiBaseUrl(baseUrl);
      setUserAiLanguage(language ?? "en");
      setUserStreamEnabled(streamEnabled === "true");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("useBackground: failed to read AI settings from Stronghold", e);
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
