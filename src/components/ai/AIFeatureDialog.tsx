import * as React from "react";

import { AI_PROVIDER_CONFIG, LS_KEY_AI_API_KEY, LS_KEY_AI_BASE_URL, LS_KEY_AI_LANGUAGE, LS_KEY_AI_MODEL, LS_KEY_AI_PROVIDER, LS_KEY_AI_STREAM_ENABLED } from "@/lib/ai/providers";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Settings2Icon } from "lucide-react";
import { Switch } from "../ui/switch";

const KEYS_AI_PROVIDER = Object.keys(AI_PROVIDER_CONFIG);

export function AIFeatureDialog() {
  const [aiProvider, setAiProvider] = React.useState<string>("");
  const [aiBaseUrl, setAiBaseUrl] = React.useState<string>("");
  const [aiApiKey, setAiApiKey] = React.useState<string>("");
  const [aiModel, setAiModel] = React.useState<string>("");
  const [language, setLanguage] = React.useState<string>("");
  const [streamEnabled, setStreamEnabled] = React.useState<boolean>(false);

  const readAiSettingsFromStorage = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      setAiProvider(localStorage.getItem(LS_KEY_AI_PROVIDER) ?? "openai");
      setAiBaseUrl(localStorage.getItem(LS_KEY_AI_BASE_URL) ?? "");
      setAiApiKey(localStorage.getItem(LS_KEY_AI_API_KEY) ?? "");
      setAiModel(localStorage.getItem(LS_KEY_AI_MODEL) ?? "gpt-4o");
      setLanguage(localStorage.getItem(LS_KEY_AI_LANGUAGE) ?? "en");
      setStreamEnabled(localStorage.getItem(LS_KEY_AI_STREAM_ENABLED) === "true");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("AIFeatureDialog: failed to read AI settings from localStorage", e);
    }
  }, []);

  React.useEffect(() => {
    readAiSettingsFromStorage();


    const onAiSettingsChange = () => readAiSettingsFromStorage();

    window.addEventListener("aiSettingsChange", onAiSettingsChange as EventListener);

    return () => {
      window.removeEventListener("aiSettingsChange", onAiSettingsChange as EventListener);
    };
  }, [readAiSettingsFromStorage]);

  const save = () => {
    if (typeof window === "undefined") return;
    const provider = aiProvider.trim();
    const baseUrl = aiBaseUrl.trim();
    const apiKey = aiApiKey.trim();
    const model = aiModel.trim();
    const lang = language.trim();

    try {
      if (provider === "") localStorage.removeItem(LS_KEY_AI_PROVIDER);
      else localStorage.setItem(LS_KEY_AI_PROVIDER, provider);

      if (baseUrl === "") localStorage.removeItem(LS_KEY_AI_BASE_URL);
      else localStorage.setItem(LS_KEY_AI_BASE_URL, baseUrl);

      if (apiKey === "") localStorage.removeItem(LS_KEY_AI_API_KEY);
      else localStorage.setItem(LS_KEY_AI_API_KEY, apiKey);

      if (model === "") localStorage.removeItem(LS_KEY_AI_MODEL);
      else localStorage.setItem(LS_KEY_AI_MODEL, model);

      if (lang === "") localStorage.removeItem(LS_KEY_AI_LANGUAGE);
      else localStorage.setItem(LS_KEY_AI_LANGUAGE, lang);

      if (streamEnabled) localStorage.setItem(LS_KEY_AI_STREAM_ENABLED, "true");
      else localStorage.removeItem(LS_KEY_AI_STREAM_ENABLED);


      window.dispatchEvent(new Event("aiSettingsChange"));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("AIFeatureDialog: failed to save AI settings", e);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="flex cursor-pointer items-center gap-1 text-xs hover:bg-primary/10 px-1 py-0.5 rounded"
        >
          <Settings2Icon size={10} />
          AI Settings
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>Set the AI provider and API key for the AI assistant.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <div className="flex items-end gap-2 w-full">
            <div className="grid gap-2 flex-1">
              <label className="text-xs">AI Provider</label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {KEYS_AI_PROVIDER.map((provider) => (
                    <SelectItem key={provider} value={provider}>{AI_PROVIDER_CONFIG[provider as keyof typeof AI_PROVIDER_CONFIG].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 flex-1">
              <label className="text-xs">Model</label>
              {aiProvider === 'custom' ? (
                <Input value={aiModel} onChange={(e) => setAiModel(e.target.value)} placeholder="Enter a custom model" />
              ) : (
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDER_CONFIG[aiProvider as keyof typeof AI_PROVIDER_CONFIG]?.models.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2 flex-1">
              <label className="text-xs">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {aiProvider === 'custom' && (
            <div className="grid gap-2">
              <label className="text-xs">Base URL</label>
              <Input value={aiBaseUrl} onChange={(e) => setAiBaseUrl(e.target.value)} placeholder="https://example.com/api" />
            </div>
          )}

          <label className="text-xs">API Key</label>
          <Input value={aiApiKey} onChange={(e) => setAiApiKey(e.target.value)} placeholder="sk-1234567890" type="password" />

          <div className="flex items-center gap-2 justify-between py-2">
            <label className="text-xs">Streaming responses</label>
            <Switch checked={streamEnabled} onCheckedChange={() => setStreamEnabled((prev) => !prev)} className="cursor-pointer" />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">Cancel</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button size="sm" onClick={save}>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}