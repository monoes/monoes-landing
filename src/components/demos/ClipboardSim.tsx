"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ClipType = "code" | "text" | "path";

interface Clip {
  id: number;
  text: string;
  type: ClipType;
  pinned: boolean;
  time: string;
}

const INITIAL_CLIPS: Clip[] = [
  { id: 1, text: "const api = fetch('/v1/agents')", type: "code", pinned: false, time: "2s ago" },
  { id: 2, text: "Review the PR before merging", type: "text", pinned: true, time: "5m ago" },
  { id: 3, text: "~/projects/monoes/src/main.rs", type: "path", pinned: false, time: "12m ago" },
  { id: 4, text: "npm install @dnd-kit/core", type: "code", pinned: false, time: "1h ago" },
];

const RANDOM_CLIPS: Omit<Clip, "id" | "pinned" | "time">[] = [
  { text: "git commit -m 'feat: add swarm demo'", type: "code" },
  { text: "Check the monoes dashboard later", type: "text" },
  { text: "/usr/local/bin/monomind", type: "path" },
  { text: "export default function App() {}", type: "code" },
  { text: "Meeting at 3pm re: launch", type: "text" },
  { text: "~/Desktop/monoes/landing", type: "path" },
];

const TYPE_COLORS: Record<ClipType, string> = {
  code: "text-emerald-600",
  text: "text-blue-500",
  path: "text-amber-600",
};

const TYPE_LABELS: Record<ClipType, string> = {
  code: "code",
  text: "text",
  path: "path",
};

type TabFilter = "all" | ClipType;

export function ClipboardSim() {
  const [clips, setClips] = useState<Clip[]>(INITIAL_CLIPS);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabFilter>("all");
  const [nextId, setNextId] = useState(100);

  const simulateCopy = () => {
    const template = RANDOM_CLIPS[nextId % RANDOM_CLIPS.length];
    const newClip: Clip = {
      id: nextId,
      text: template.text,
      type: template.type,
      pinned: false,
      time: "just now",
    };
    setClips((prev) => [newClip, ...prev]);
    setNextId((n) => n + 1);
  };

  const togglePin = (id: number) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const filtered = clips.filter((c) => {
    const matchesSearch = c.text.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === "all" || c.type === tab;
    return matchesSearch && matchesTab;
  });

  const tabs: TabFilter[] = ["all", "code", "text", "path"];

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-soft-lg"
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(237,229,216,0.8)",
        maxWidth: 360,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(237,229,216,0.6)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="text-sm font-semibold text-espresso">MonoClip</span>
        </div>
        <button
          onClick={simulateCopy}
          className="text-xs px-3 py-1 rounded-lg font-medium transition-all duration-150 active:scale-95"
          style={{
            background: "#2A2318",
            color: "#C8A97E",
          }}
        >
          Simulate Copy
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(237,229,216,0.4)" }}>
        <input
          type="text"
          placeholder="Search clips…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-lg outline-none"
          style={{
            background: "rgba(250,247,240,0.8)",
            border: "1px solid rgba(237,229,216,0.7)",
            color: "#2A2318",
          }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 py-2" style={{ borderBottom: "1px solid rgba(237,229,216,0.4)" }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs px-2 py-1 rounded-md transition-all duration-150"
            style={{
              background: tab === t ? "#2A2318" : "transparent",
              color: tab === t ? "#C8A97E" : "#8B7355",
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Clips list */}
      <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((clip) => (
            <motion.div
              key={clip.id}
              layout
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-start gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(237,229,216,0.3)" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-mono truncate"
                  style={{ color: "#2A2318" }}
                >
                  {clip.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium ${TYPE_COLORS[clip.type]}`}>
                    {TYPE_LABELS[clip.type]}
                  </span>
                  <span className="text-[10px] text-gold-bronze/60">{clip.time}</span>
                </div>
              </div>
              <button
                onClick={() => togglePin(clip.id)}
                className="flex-shrink-0 text-sm transition-all duration-150 hover:scale-110"
                style={{ color: clip.pinned ? "#C8A97E" : "#D4C5B0" }}
                title={clip.pinned ? "Unpin" : "Pin"}
              >
                📌
              </button>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-xs text-gold-bronze/50"
            >
              No clips match
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
