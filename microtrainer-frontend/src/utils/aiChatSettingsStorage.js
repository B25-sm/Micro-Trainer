const SETTINGS_KEY = "aiChatSettings.v1";

export const AI_CHAT_MODELS = [
  { value: "grok-4-latest", label: "Grok 4 (latest)" },
  { value: "grok-3-mini", label: "Grok 3 mini (faster)" },
];

export const DEFAULT_AI_CHAT_SETTINGS = {
  model: AI_CHAT_MODELS[0].value,
  temperature: 0.7,
  systemPrompt: "",
};

export function loadAiChatSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AI_CHAT_SETTINGS };
    return { ...DEFAULT_AI_CHAT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_AI_CHAT_SETTINGS };
  }
}

export function saveAiChatSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
