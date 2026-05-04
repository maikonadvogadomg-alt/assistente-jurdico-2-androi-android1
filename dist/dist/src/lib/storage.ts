import type { AIConfig, Message } from "./ai";

export interface KeySlot {
  label: string;
  provider: AIConfig["provider"];
  apiKey: string;
  model: string;
}

const SLOTS_KEY = "juridico_key_slots";
const ACTIVE_SLOT_KEY = "juridico_active_slot";
const PANEL_KEY = (id: number) => `juridico_ai_panel_${id}`;
const SYSTEM_KEY = "juridico_system_prompt";
const PLAYGROUND_KEY = "juridico_playground_saves";

const DEFAULT_SLOTS: KeySlot[] = [
  { label: "Chave 1", provider: "openai", apiKey: "", model: "gpt-4o" },
  { label: "Chave 2", provider: "groq", apiKey: "", model: "llama-3.3-70b-versatile" },
  { label: "Chave 3", provider: "anthropic", apiKey: "", model: "claude-3-5-sonnet-20241022" },
  { label: "Chave 4", provider: "openrouter", apiKey: "", model: "openai/gpt-4o" },
];

export function loadKeySlots(): KeySlot[] {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SLOTS;
  } catch { return DEFAULT_SLOTS; }
}

export function saveKeySlots(slots: KeySlot[]) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

export function loadActiveSlot(): number {
  return parseInt(localStorage.getItem(ACTIVE_SLOT_KEY) ?? "0", 10);
}

export function saveActiveSlot(idx: number) {
  localStorage.setItem(ACTIVE_SLOT_KEY, String(idx));
}

export function loadMessages(panelId: number): Message[] {
  try {
    const raw = localStorage.getItem(PANEL_KEY(panelId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveMessages(panelId: number, messages: Message[]) {
  localStorage.setItem(PANEL_KEY(panelId), JSON.stringify(messages.slice(-300)));
}

export function clearMessages(panelId: number) {
  localStorage.removeItem(PANEL_KEY(panelId));
}

export function loadSystemPrompt(): string {
  return localStorage.getItem(SYSTEM_KEY) ?? "";
}

export function saveSystemPrompt(prompt: string) {
  localStorage.setItem(SYSTEM_KEY, prompt);
}

export interface PlaygroundSave {
  id: string;
  name: string;
  code: string;
  savedAt: number;
}

export function loadPlaygroundSaves(): PlaygroundSave[] {
  try {
    const raw = localStorage.getItem(PLAYGROUND_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function savePlayground(saves: PlaygroundSave[]) {
  localStorage.setItem(PLAYGROUND_KEY, JSON.stringify(saves));
}

// Legacy compat
export function loadConfig(): Partial<AIConfig> {
  const slots = loadKeySlots();
  const idx = loadActiveSlot();
  const slot = slots[idx];
  if (!slot?.apiKey) return {};
  return { provider: slot.provider, apiKey: slot.apiKey, model: slot.model };
}

export function saveConfig(cfg: Partial<AIConfig>) {
  const slots = loadKeySlots();
  const idx = loadActiveSlot();
  if (cfg.provider) slots[idx].provider = cfg.provider;
  if (cfg.apiKey !== undefined) slots[idx].apiKey = cfg.apiKey ?? "";
  if (cfg.model) slots[idx].model = cfg.model;
  saveKeySlots(slots);
}
