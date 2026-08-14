"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Column = "todo" | "doing" | "done";

interface Card {
  id: string;
  title: string;
  column: Column;
}

interface SyncRipple {
  cardId: string;
  col: Column;
}

const INITIAL_CARDS: Card[] = [
  { id: "1", title: "Design landing page", column: "done" },
  { id: "2", title: "Implement CRDT sync", column: "doing" },
  { id: "3", title: "Add QR invites", column: "todo" },
  { id: "4", title: "Write CLI tests", column: "todo" },
];

const COLUMNS: { key: Column; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" },
];

const NEXT_COLUMN: Record<Column, Column | null> = {
  todo: "doing",
  doing: "done",
  done: null,
};

const COL_COLORS: Record<Column, string> = {
  todo: "#8B7355",
  doing: "#C8A97E",
  done: "#4CAF50",
};

export function KanbanSync() {
  const [peerA, setPeerA] = useState<Card[]>(INITIAL_CARDS.map((c) => ({ ...c })));
  const [peerB, setPeerB] = useState<Card[]>(INITIAL_CARDS.map((c) => ({ ...c })));
  const [ripple, setRipple] = useState<SyncRipple | null>(null);

  const moveCard = (cardId: string) => {
    const card = peerA.find((c) => c.id === cardId);
    if (!card) return;
    const next = NEXT_COLUMN[card.column];
    if (!next) return;

    // Update Peer A immediately
    setPeerA((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column: next } : c))
    );

    // After 500ms, update Peer B with ripple
    setTimeout(() => {
      setPeerB((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, column: next } : c))
      );
      setRipple({ cardId, col: next });
      setTimeout(() => setRipple(null), 700);
    }, 500);
  };

  return (
    <div className="w-full rounded-2xl bg-ivory-warm border border-ivory-linen p-3 sm:p-4">
      <p className="text-xs tracking-label text-gold-bronze uppercase mb-3 sm:mb-4">
        P2P CRDT Sync
      </p>

      <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
        {/* Peer A */}
        <PeerBoard
          label="Peer A"
          cards={peerA}
          onMove={moveCard}
          showMoveButtons
          ripple={null}
        />

        {/* Sync arrow */}
        <div className="flex items-center justify-center text-gold text-xl md:rotate-0 rotate-90 flex-shrink-0">
          ⇄
        </div>

        {/* Peer B */}
        <PeerBoard
          label="Peer B"
          cards={peerB}
          onMove={undefined}
          showMoveButtons={false}
          ripple={ripple}
        />
      </div>
    </div>
  );
}

interface PeerBoardProps {
  label: string;
  cards: Card[];
  onMove?: (id: string) => void;
  showMoveButtons: boolean;
  ripple: SyncRipple | null;
}

function PeerBoard({ label, cards, onMove, showMoveButtons, ripple }: PeerBoardProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-espresso mb-2 flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: "#C8A97E" }}
        />
        {label}
      </div>

      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col.key);
          return (
            <div key={col.key} className="flex-1 min-w-[90px] sm:min-w-0">
              <div
                className="text-[10px] font-medium mb-1.5 px-1"
                style={{ color: COL_COLORS[col.key] }}
              >
                {col.label}
              </div>

              <div
                className="rounded-lg p-1.5 min-h-[80px] flex flex-col gap-1.5"
                style={{ background: "rgba(237,229,216,0.35)" }}
              >
                <AnimatePresence mode="popLayout">
                  {colCards.map((card) => {
                    const isRippling =
                      ripple && ripple.cardId === card.id && ripple.col === col.key;
                    const canMove =
                      showMoveButtons && NEXT_COLUMN[card.column] !== null;

                    return (
                      <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative rounded-md px-2 py-1.5 text-[10px] text-espresso font-medium break-words"
                        style={{
                          background: "#FFFFF0",
                          border: "1px solid rgba(237,229,216,0.7)",
                          boxShadow: "0 1px 4px rgba(42,35,24,0.04)",
                        }}
                      >
                        {/* Sync ripple overlay */}
                        {isRippling && (
                          <motion.div
                            className="absolute inset-0 rounded-md border-2 pointer-events-none"
                            style={{ borderColor: "#C8A97E" }}
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.08 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}

                        <span className="block leading-tight break-words hyphens-auto">{card.title}</span>

                        {canMove && (
                          <button
                            onClick={() => onMove?.(card.id)}
                            className="mt-1 text-[9px] px-1.5 py-0.5 rounded transition-colors"
                            style={{
                              background: "rgba(200,169,126,0.12)",
                              color: "#8B7355",
                              border: "1px solid rgba(200,169,126,0.3)",
                            }}
                          >
                            → {NEXT_COLUMN[card.column]}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {colCards.length === 0 && (
                  <div className="text-[9px] text-gold-bronze/40 text-center py-2">
                    empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
