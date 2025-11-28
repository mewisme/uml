import * as React from "react";

import { AI_PROVIDER_CONFIG, SH_KEY_AI_API_KEY, SH_KEY_AI_BASE_URL, SH_KEY_AI_LANGUAGE, SH_KEY_AI_MODEL, SH_KEY_AI_PROVIDER, SH_KEY_AI_STREAM_ENABLED } from "@/lib/ai/providers";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getAiSetting, setAiSetting } from "@/lib/ai/store";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

const KEYS_AI_PROVIDER = Object.keys(AI_PROVIDER_CONFIG);

interface AIFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIFeatureDialog({ open, onOpenChange }: AIFeatureDialogProps) {
  const [aiProvider, setAiProvider] = React.useState<string>("");
  const [aiBaseUrl, setAiBaseUrl] = React.useState<string>("");
  const [aiApiKey, setAiApiKey] = React.useState<string>("");
  const [aiModel, setAiModel] = React.useState<string>("");
  const [language, setLanguage] = React.useState<string>("");
  const [streamEnabled, setStreamEnabled] = React.useState<boolean>(false);

  const readAiSettingsFromStorage = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const provider = await getAiSetting(SH_KEY_AI_PROVIDER);
      const baseUrl = await getAiSetting(SH_KEY_AI_BASE_URL);
      const apiKey = await getAiSetting(SH_KEY_AI_API_KEY);
      const model = await getAiSetting(SH_KEY_AI_MODEL);
      const lang = await getAiSetting(SH_KEY_AI_LANGUAGE);
      const streamEnabled = await getAiSetting(SH_KEY_AI_STREAM_ENABLED);

      setAiProvider(provider ?? "openai");
      setAiBaseUrl(baseUrl ?? "");
      setAiApiKey(apiKey ?? "");
      setAiModel(model ?? "gpt-4o");
      setLanguage(lang ?? "en");
      setStreamEnabled(streamEnabled === "true");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("AIFeatureDialog: failed to read AI settings from store", e);
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


  React.useEffect(() => {
    if (open) {
      readAiSettingsFromStorage();
    }
  }, [open, readAiSettingsFromStorage]);

  const save = async () => {
    // eslint-disable-next-line no-console
    console.log("AIFeatureDialog: save function called");

    const provider = aiProvider.trim();
    const baseUrl = aiBaseUrl.trim();
    const apiKey = aiApiKey.trim();
    const model = aiModel.trim();
    const lang = language.trim();

    try {
      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: starting to save settings", { provider, baseUrl, model, lang, streamEnabled });

      await setAiSetting(SH_KEY_AI_PROVIDER, provider);
      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: saved provider", provider);

      await setAiSetting(SH_KEY_AI_BASE_URL, baseUrl);
      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: saved baseUrl", baseUrl);

      await setAiSetting(SH_KEY_AI_API_KEY, apiKey);
      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: saved apiKey", apiKey ? "***" : "(empty)");

      await setAiSetting(SH_KEY_AI_MODEL, model);
      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: saved model", model);

      await setAiSetting(SH_KEY_AI_LANGUAGE, lang);
      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: saved lang", lang);

      await setAiSetting(SH_KEY_AI_STREAM_ENABLED, streamEnabled ? "true" : "false");
      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: saved streamEnabled", streamEnabled);

      // eslint-disable-next-line no-console
      console.log("AIFeatureDialog: all settings saved successfully");
      window.dispatchEvent(new Event("aiSettingsChange"));
      onOpenChange(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("AIFeatureDialog: failed to save AI settings", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>Set the AI provider and API key for the AI assistant.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <div className="flex items-end gap-2 w-full">
            <div className="grid gap-2 flex-1">
              <label className="text-xs">AI Provider</label>
              <Select value={aiProvider} onValueChange={setAiProvider} defaultValue="openai">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="OpenAI" />
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
                <Select value={aiModel} onValueChange={setAiModel} defaultValue="gpt-4o">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="gpt-4o" />
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
              <Select value={language} onValueChange={setLanguage} defaultValue="en">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="English" />
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

          <Button type="button" size="sm" onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
