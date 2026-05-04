import { useState, useCallback, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { MessageSquare, Code2, Settings } from "lucide-react";
import { ChatPage } from "@/pages/ChatPage";
import { PlaygroundPage } from "@/pages/PlaygroundPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { loadKeySlots, loadActiveSlot, saveKeySlots, saveActiveSlot } from "@/lib/storage";
import type { KeySlot } from "@/lib/storage";

type Page = "chat" | "playground" | "settings";

function MainApp() {
  const [page, setPage] = useState<Page>("chat");
  const [slots, setSlots] = useState<KeySlot[]>(() => loadKeySlots());
  const [activeSlot, setActiveSlot] = useState<number>(() => loadActiveSlot());
  const [pendingPlayground, setPendingPlayground] = useState(false);

  const handleSaveSlots = useCallback((updated: KeySlot[]) => {
    setSlots(updated); saveKeySlots(updated);
  }, []);

  const handleSetActiveSlot = useCallback((idx: number) => {
    setActiveSlot(idx); saveActiveSlot(idx);
  }, []);

  // Listen for "send code to playground" events from MessageBubble
  useEffect(() => {
    const handler = () => {
      setPendingPlayground(true);
      setPage("playground");
    };
    window.addEventListener("chat:to-playground", handler);
    return () => window.removeEventListener("chat:to-playground", handler);
  }, []);

  const handlePlaygroundImportDone = useCallback(() => {
    setPendingPlayground(false);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0f0f0f] text-white">
      <div className="flex-1 overflow-hidden">
        {page === "chat" && (
          <ChatPage
            slots={slots}
            activeSlot={activeSlot}
            onSetActiveSlot={handleSetActiveSlot}
            onGoSettings={() => setPage("settings")}
            onGoPlayground={() => setPage("playground")}
          />
        )}
        {page === "playground" && (
          <PlaygroundPage
            pendingImport={pendingPlayground}
            onImportDone={handlePlaygroundImportDone}
          />
        )}
        {page === "settings" && (
          <SettingsPage
            slots={slots}
            activeSlot={activeSlot}
            onSaveSlots={handleSaveSlots}
            onSetActiveSlot={handleSetActiveSlot}
          />
        )}
      </div>

      <nav className="shrink-0 flex border-t border-white/10 bg-[#111111] relative">
        {(["chat", "playground", "settings"] as Page[]).map((p) => {
          const Icon = p === "chat" ? MessageSquare : p === "playground" ? Code2 : Settings;
          const label = p === "chat" ? "Conversa" : p === "playground" ? "Playground" : "Config";
          const active = page === p;
          const hasBadge = p === "playground" && pendingPlayground && page !== "playground";
          return (
            <button key={p} onClick={() => setPage(p)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all relative ${
                active ? "text-violet-400" : "text-white/35 hover:text-white/70"}`}>
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-[#111111]" />
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {active && <div className="absolute bottom-0 w-8 h-0.5 bg-violet-500 rounded-t-full" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={MainApp} />
      </Switch>
    </WouterRouter>
  );
}
