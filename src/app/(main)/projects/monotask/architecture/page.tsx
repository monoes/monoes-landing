import Link from "next/link";

const accent = "#A07840";

const heroStats = [
  { value: "0", label: "Servers Required" },
  { value: "Ed25519", label: "Identity Crypto" },
  { value: "CRDT", label: "Sync Protocol" },
  { value: "6", label: "Rust Crates" },
  { value: "libp2p", label: "P2P Stack" },
  { value: "7272", label: "Default Port" },
];

const crates = [
  {
    icon: "🃏",
    subtitle: "Domain Model",
    name: "monotask-core",
    description: "Automerge CRDT document logic. Owns board/column/card/checklist/chat data structures, all mutations, and migrations. init_doc() creates the root Automerge structure. Every mutation is a CRDT operation — concurrent edits from multiple peers merge automatically.",
    tags: ["automerge", "board.rs", "card.rs", "column.rs", "chat.rs", "space.rs"],
    color: "#A07840",
  },
  {
    icon: "🔐",
    subtitle: "Cryptography",
    name: "monotask-crypto",
    description: "Ed25519 identity management using ed25519-dalek. Identity::generate() creates a fresh keypair from OsRng. Node IDs are base32-encoded public keys with a pk_ prefix. Sign() and verify() underpin invite tokens, space membership, and all P2P messages.",
    tags: ["ed25519-dalek", "OsRng", "pk_ prefix", "invite tokens", "SSH import"],
    color: "#8B7355",
  },
  {
    icon: "🌐",
    subtitle: "P2P Networking",
    name: "monotask-net",
    description: "libp2p swarm with mDNS peer discovery on the local network and optional bootstrap peers for WAN. QUIC transport. Custom sync protocol exchanges Automerge sync messages. AnnounceSpaces and SyncBoard commands flow via mpsc channels to the background tokio task.",
    tags: ["libp2p", "mDNS", "QUIC", "port 7272", "tokio", "mpsc"],
    color: "#B8956A",
  },
  {
    icon: "🗄",
    subtitle: "Persistence",
    name: "monotask-storage",
    description: "SQLite via rusqlite (bundled). Stores board rows with serialized Automerge binary blobs. Space and membership tables hold invite state. Card number index (card_id → number) is maintained for fast CLI lookups. Schema managed by schema.rs migrations.",
    tags: ["rusqlite", "bundled SQLite", "Automerge blobs", "space.rs", "card_number.rs"],
    color: "#C8A97E",
  },
  {
    icon: "⌨️",
    subtitle: "CLI",
    name: "monotask-cli",
    description: "Clap-based command tree covering every feature: board create/list/delete, column add/move, card add/move/assign/label/due, checklist, comment, space create/invite/join/kick, sync start, and ai-help (structured JSON schema output for AI agents).",
    tags: ["clap", "board", "card", "column", "space", "ai-help", "--json"],
    color: "#A07840",
  },
  {
    icon: "🖥",
    subtitle: "Desktop App",
    name: "monotask-tauri",
    description: "Tauri v2 desktop app (drag-and-drop kanban UI). Calls the same core crates via Rust backend. Supports column sorting, card covers, labels, due dates, assignees, checklists, and QR code invite generation. No separate UI binary — one executable for both CLI and GUI.",
    tags: ["Tauri v2", "drag-and-drop", "QR invites", "labels", "due dates", "covers"],
    color: "#8B7355",
  },
];

const dataFlow = [
  {
    num: "1", color: "#A07840",
    title: "Identity Creation",
    body: "First run: monotask-crypto generates an Ed25519 keypair from OsRng. Public key is base32-encoded as the node ID (pk_abc123…). Private key is stored encrypted in ~/.monotask/identity. Alternatively, import from an existing SSH Ed25519 key.",
    code: "Identity::generate() → pk_<base32(pubkey)>",
  },
  {
    num: "2", color: "#8B7355",
    title: "Board Creation",
    body: "monotask board create 'Sprint 5' creates an Automerge AutoCommit document. init_doc() writes the root structure: columns (List), cards (Map), members (Map), actor_card_seq (Map), label_definitions (Map). The binary document blob is stored in SQLite alongside a board row.",
    code: "AutoCommit::new() → init_doc() → storage.save_board(board_id, doc.save())",
  },
  {
    num: "3", color: "#B8956A",
    title: "Card Operations (CRDT Mutations)",
    body: "card::add_card() appends to the columns List and cards Map as Automerge transactions. Each card gets a UUIDv7 ID and an actor-scoped card number (actor_card_seq). Concurrent edits from different peers — add card, move card, edit title — merge without conflict via Automerge's CRDT semantics.",
    code: "doc.put_object(&cards_map, card_id, ObjType::Map) → doc.commit()",
  },
  {
    num: "4", color: "#C8A97E",
    title: "Space Creation & Invite",
    body: "monotask space create 'Team Alpha' registers a Space with an Ed25519-signed metadata block. monotask space invite generates a time-limited token: JSON payload (space_id, pubkey, expiry, permissions) serialized via CBOR, signed with the creator's signing key, base58-encoded. Recipient decodes, verifies signature, and joins.",
    code: "InviteMetadata → ciborium::to_vec() → sign() → bs58::encode()",
  },
  {
    num: "5", color: "#A07840",
    title: "P2P Discovery (mDNS)",
    body: "When sync is enabled, monotask-net starts a libp2p swarm on UDP/TCP port 7272. mDNS broadcasts discover peers on the local network automatically. For WAN, bootstrap_peers can be pre-configured. On peer connect: AnnounceSpaces command tells the peer which Space IDs this node participates in.",
    code: "Swarm::new() → mDNS behaviour → PeerConnected → AnnounceSpaces",
  },
  {
    num: "6", color: "#8B7355",
    title: "Automerge Sync Exchange",
    body: "On board sync: both peers run the Automerge sync protocol — exchange sync messages (binary diffs) until convergent. Peer A sends SyncMessage; Peer B applies generate_sync_message → receive_sync_message loop. When sync is complete, the merged document is saved back to SQLite. Both peers now have identical board state.",
    code: "doc.generate_sync_message() ↔ doc.receive_sync_message() → storage.save_board()",
  },
  {
    num: "7", color: "#C8A97E",
    title: "CLI Output (--json)",
    body: "Every command supports --json for structured output: boards list returns [{id, name, columns_count, cards_count}]. ai-help prints a full JSON schema of all commands and their arguments — AI agents (Claude, Cursor) can read this to learn the API without documentation.",
    code: "monotask board list --json | jq '.[] | .name'",
  },
];

const crdtDetails = [
  { title: "Document Root Structure", detail: "Automerge AutoCommit with 5 top-level keys: columns (List), cards (Map), members (Map), actor_card_seq (Map), label_definitions (Map)" },
  { title: "Card ID Format", detail: "UUIDv7 (time-ordered) ensures consistent sort order across peers without coordination" },
  { title: "Card Number Format", detail: "actor_card_seq[actor_id]++ — each actor maintains its own counter, preventing collisions: ALICE-1, BOB-1 can coexist" },
  { title: "Merge Semantics", detail: "Concurrent column reorders → Last-Write-Wins on List. Concurrent card edits → field-level merge. Concurrent deletes + edits → delete wins (is_deleted flag)" },
  { title: "Sync Protocol", detail: "Automerge's built-in sync protocol: exchange sync messages in a loop until both sides agree. No custom merge logic required." },
  { title: "Storage Format", detail: "doc.save() returns the full Automerge binary. Stored as BLOB in SQLite boards.doc column. On load: AutoCommit::load(&blob)" },
];

const cryptoDetails = [
  { key: "Key Algorithm", value: "Ed25519 (ed25519-dalek v2)" },
  { key: "Key Source", value: "OsRng (OS random, not user entropy)" },
  { key: "Node ID Format", value: "pk_ + base32(pubkey, RFC4648 no-padding)" },
  { key: "Invite Payload", value: "CBOR-encoded InviteMetadata (ciborium)" },
  { key: "Invite Encoding", value: "bs58 (Base58Check) — human-copyable" },
  { key: "Signature", value: "Ed25519 over CBOR payload SHA-256 hash" },
  { key: "SSH Import", value: "ssh-key crate — parse OpenSSH Ed25519 privkey" },
  { key: "Key Storage", value: "~/.monotask/identity (caller-encrypted)" },
];

const perfRows = [
  { op: "Board load (100 cards)", val: "<20ms", pct: 92, note: "Automerge blob deserialize + SQLite read" },
  { op: "Card add (CRDT commit)", val: "<5ms", pct: 97, note: "Single AutoCommit transaction" },
  { op: "Invite token generate", val: "<2ms", pct: 99, note: "CBOR + Ed25519 sign" },
  { op: "Invite token verify", val: "<1ms", pct: 99, note: "Ed25519 verify only" },
  { op: "mDNS peer discovery", val: "<3s", pct: 70, note: "First discovery on LAN (multicast)" },
  { op: "Automerge sync (1K ops)", val: "<100ms", pct: 75, note: "Binary sync message exchange" },
  { op: "SQLite write (board save)", val: "<10ms", pct: 93, note: "Single BLOB write, WAL mode" },
  { op: "CLI JSON output", val: "<50ms", pct: 85, note: "Includes SQLite read + serialization" },
];

export default function MonoTaskArchitecturePage() {
  return (
    <div className="bg-ivory-warm min-h-screen">
      {/* Header */}
      <div className="border-b border-ivory-linen bg-white/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/projects/monotask" className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors">← MonoTask</Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">Architecture</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Crates", "Flow", "CRDT", "Crypto", "Performance"].map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors">{s}</a>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="px-8 py-24 md:py-32 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <div className="inline-block mb-6 text-xs font-semibold uppercase tracking-label px-3 py-1 rounded-full border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
            Rust · Automerge · libp2p
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>MonoTask</span>
            <br />Syncs Without Servers
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            6 Rust crates, Automerge CRDTs, Ed25519 cryptographic identities, and libp2p networking. Boards merge automatically. Nothing ever phones home.
          </p>
          <div className="inline-flex flex-wrap gap-px overflow-hidden rounded-xl border border-espresso/10 bg-espresso/5">
            {heroStats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-start gap-1 px-6 py-4 bg-white/80">
                <span className="text-2xl font-semibold leading-none tracking-tight" style={{ color: accent }}>{value}</span>
                <span className="text-[10px] uppercase tracking-label font-medium text-espresso/45">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture SVG */}
      <section className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Architecture</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">System Overview</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            6-crate Rust workspace. Core CRDT logic is UI-agnostic — shared by CLI and Tauri desktop. Sync is purely peer-to-peer via libp2p.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ fontFamily: "Satoshi, -apple-system, sans-serif" }}>
              <defs>
                <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="rgba(42,35,24,0.25)" />
                </marker>
                <marker id="arr2-acc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#A07840" />
                </marker>
              </defs>

              {/* User interfaces */}
              <rect x="30" y="20" width="160" height="55" rx="10" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.5"/>
              <text x="110" y="43" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">CLI</text>
              <text x="110" y="61" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10">monotask-cli</text>

              <rect x="210" y="20" width="160" height="55" rx="10" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.5"/>
              <text x="290" y="43" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">Desktop App</text>
              <text x="290" y="61" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10">monotask-tauri</text>

              {/* Core domain */}
              <rect x="110" y="110" width="260" height="65" rx="12" fill="rgba(160,120,64,0.1)" stroke="#A07840" strokeWidth="2"/>
              <text x="240" y="135" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">monotask-core</text>
              <text x="240" y="153" textAnchor="middle" fill="#A07840" fontSize="10" fontWeight="600">Automerge CRDT · board · card · column · space</text>
              <text x="240" y="167" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">init_doc() · mutations · migrations</text>

              {/* Storage */}
              <rect x="30" y="215" width="200" height="55" rx="10" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1.5"/>
              <text x="130" y="238" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">monotask-storage</text>
              <text x="130" y="255" textAnchor="middle" fill="#C8A97E" fontSize="10" fontWeight="600">SQLite · Automerge blobs</text>
              <text x="130" y="268" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">~/.monotask/data.db</text>

              {/* Crypto */}
              <rect x="250" y="215" width="170" height="55" rx="10" fill="rgba(184,149,106,0.1)" stroke="#B8956A" strokeWidth="1.5"/>
              <text x="335" y="238" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">monotask-crypto</text>
              <text x="335" y="255" textAnchor="middle" fill="#B8956A" fontSize="10" fontWeight="600">Ed25519 · invite tokens</text>
              <text x="335" y="268" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">sign · verify · bs58</text>

              {/* Network */}
              <rect x="450" y="110" width="200" height="160" rx="12" fill="rgba(139,115,85,0.06)" stroke="#8B7355" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="550" y="133" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="10" fontWeight="700" letterSpacing="0.06em">NETWORK LAYER</text>
              <text x="550" y="150" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">monotask-net</text>
              <text x="550" y="167" textAnchor="middle" fill="#8B7355" fontSize="10">libp2p swarm</text>

              <rect x="465" y="180" width="80" height="36" rx="8" fill="rgba(139,115,85,0.1)" stroke="#8B7355" strokeWidth="1"/>
              <text x="505" y="196" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="600">mDNS</text>
              <text x="505" y="210" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">discovery</text>

              <rect x="557" y="180" width="80" height="36" rx="8" fill="rgba(160,120,64,0.1)" stroke="#A07840" strokeWidth="1"/>
              <text x="597" y="196" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="600">QUIC</text>
              <text x="597" y="210" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">transport</text>

              {/* Peer node on right */}
              <rect x="695" y="140" width="165" height="100" rx="12" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.12)" strokeWidth="1.2" strokeDasharray="5,3"/>
              <text x="777" y="165" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="11" fontWeight="700">Remote Peer</text>
              <text x="777" y="183" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="10">monotask-net</text>
              <text x="777" y="200" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">Automerge sync</text>
              <text x="777" y="215" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">port 7272</text>
              <text x="777" y="232" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="9">(same Space)</text>

              {/* Arrows */}
              <line x1="110" y1="75" x2="185" y2="112" stroke="#A07840" strokeWidth="1.3" markerEnd="url(#arr2-acc)" strokeOpacity="0.6"/>
              <line x1="290" y1="75" x2="270" y2="112" stroke="rgba(42,35,24,0.2)" strokeWidth="1.3" markerEnd="url(#arr2)"/>
              <line x1="200" y1="155" x2="135" y2="215" stroke="rgba(42,35,24,0.2)" strokeWidth="1.2" markerEnd="url(#arr2)" strokeDasharray="4,3"/>
              <line x1="270" y1="175" x2="295" y2="215" stroke="rgba(42,35,24,0.2)" strokeWidth="1.2" markerEnd="url(#arr2)" strokeDasharray="4,3"/>
              <line x1="370" y1="145" x2="450" y2="155" stroke="#8B7355" strokeWidth="1.3" markerEnd="url(#arr2)" strokeOpacity="0.5"/>
              <line x1="650" y1="185" x2="695" y2="188" stroke="#8B7355" strokeWidth="1.3" markerEnd="url(#arr2)" strokeOpacity="0.4" strokeDasharray="5,3"/>
              <line x1="695" y1="192" x2="650" y2="195" stroke="#8B7355" strokeWidth="1.3" markerEnd="url(#arr2)" strokeOpacity="0.4" strokeDasharray="5,3"/>

              {/* sync label */}
              <text x="672" y="178" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="8.5">sync msgs</text>

              {/* Data path label */}
              <text x="240" y="200" textAnchor="middle" fill="rgba(42,35,24,0.2)" fontSize="8">save/load</text>

              {/* Animated dots */}
              <circle r="2.5" fill="#A07840" opacity="0.9">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 110 48 L 185 115" />
              </circle>
              <circle r="2.5" fill="#8B7355" opacity="0.8">
                <animateMotion dur="3s" repeatCount="indefinite" begin="0.5s" path="M 650 188 L 695 190" />
              </circle>

              {/* Bottom row: SQLite file + mDNS broadcast */}
              <rect x="30" y="310" width="180" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1"/>
              <text x="120" y="326" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">~/.monotask/data.db</text>
              <text x="120" y="342" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">boards · spaces · card_numbers</text>

              <rect x="230" y="310" width="180" height="40" rx="8" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1"/>
              <text x="320" y="326" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="10" fontWeight="600">~/.monotask/identity</text>
              <text x="320" y="342" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">Ed25519 signing key (encrypted)</text>

              <line x1="130" y1="270" x2="130" y2="310" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr2)"/>
              <line x1="335" y1="270" x2="320" y2="310" stroke="rgba(42,35,24,0.12)" strokeWidth="1" markerEnd="url(#arr2)"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Crates */}
      <section id="crates" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Workspace</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">6 Rust Crates</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Each crate owns a single layer. Core CRDT logic is independent of UI — the CLI and desktop app share identical behavior.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {crates.map((c) => (
              <div key={c.name} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft hover:shadow-soft-lg hover:border-espresso/20 transition-all duration-200"
                style={{ borderTop: `3px solid ${c.color}` }}>
                <div className="text-2xl mb-3">{c.icon}</div>
                <p className="text-[10px] uppercase tracking-label font-semibold mb-1" style={{ color: c.color }}>{c.subtitle}</p>
                <h3 className="text-xs font-semibold text-espresso mb-2 font-mono">{c.name}</h3>
                <p className="text-xs text-espresso/60 leading-relaxed mb-4">{c.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                      style={{ color: c.color, borderColor: `${c.color}40`, background: `${c.color}08` }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section id="flow" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Data Flow</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">End-to-End System Flow</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            From key generation to peer sync — every step, from identity creation to CRDT convergence.
          </p>
          <div className="flex flex-col gap-4">
            {dataFlow.map((step) => (
              <div key={step.num} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: step.color }}>{step.num}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-espresso mb-2">{step.title}</h4>
                  <p className="text-sm text-espresso/60 leading-relaxed mb-3">{step.body}</p>
                  {step.code && (
                    <code className="block text-xs bg-ivory-warm border border-espresso/8 rounded-lg px-4 py-2 text-espresso/70 font-mono">{step.code}</code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRDT Details */}
      <section id="crdt" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>CRDT</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Automerge Document Model</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Every board is one Automerge AutoCommit document. Concurrent mutations from any peer merge deterministically — no conflict resolution logic required.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {crdtDetails.map((d) => (
              <div key={d.title} className="rounded-xl border border-espresso/10 bg-white p-5 shadow-soft flex gap-4">
                <div className="flex-shrink-0 w-1 rounded-full self-stretch" style={{ background: accent }} />
                <div>
                  <p className="text-xs font-semibold text-espresso mb-1.5">{d.title}</p>
                  <p className="text-xs text-espresso/60 leading-relaxed">{d.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">Root Document Structure</p>
            <pre className="text-xs font-mono bg-ivory-warm border border-espresso/8 rounded-xl px-5 py-4 text-espresso/65 overflow-x-auto leading-loose">{`ROOT (AutoCommit)
├── columns: List         // ordered column IDs
├── cards: Map            // card_id → Card object
│   └── <uuid-v7>: Map
│       ├── title, description, number
│       ├── column_id, position
│       ├── labels, assignees, due_date
│       ├── is_deleted: bool
│       └── checklist: List
├── members: Map          // pubkey_hex → role
├── actor_card_seq: Map   // actor_id → u64 counter
└── label_definitions: Map`}</pre>
          </div>
        </div>
      </section>

      {/* Crypto */}
      <section id="crypto" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Cryptography</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Ed25519 Identity System</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            No accounts. No servers. Identity is an Ed25519 keypair. Invite tokens are signed payloads — verifiable offline by any peer.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">Key Properties</p>
              <div className="flex flex-col gap-3">
                {cryptoDetails.map((r) => (
                  <div key={r.key} className="flex justify-between gap-4 text-xs">
                    <span className="text-espresso/50">{r.key}</span>
                    <span className="font-mono font-semibold text-right" style={{ color: accent }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">Invite Token Flow</p>
              <pre className="text-xs font-mono text-espresso/65 leading-loose">{`// Creator
let meta = InviteMetadata {
  space_id, pubkey,
  expiry, permissions,
};
let bytes = ciborium::to_vec(&meta);
let sig = identity.sign(&sha256(bytes));
let token = bs58::encode([bytes, sig]);

// Recipient
let (meta, sig) = bs58::decode(token);
Identity::verify(meta.pubkey, &meta, &sig)?;
// ✓ token is authentic`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section id="performance" className="px-8 py-20 bg-ivory-warm">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Performance</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Speed Benchmarks</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Rust + bundled SQLite ensures consistent performance across all platforms.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-espresso/8 bg-ivory-warm/50">
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40">Operation</th>
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40 w-52">Speed</th>
                  <th className="py-3 px-5 text-left text-[11px] uppercase tracking-label font-semibold text-espresso/40">Notes</th>
                </tr>
              </thead>
              <tbody>
                {perfRows.map((row, i) => (
                  <tr key={row.op} className={i < perfRows.length - 1 ? "border-b border-espresso/6" : ""}>
                    <td className="py-3 px-5 text-sm text-espresso">{row.op}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-espresso/8 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${accent}, #C8A97E)` }} />
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: accent }}>{row.val}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-xs text-espresso/45">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          MonoTask · Rust · Automerge · libp2p · Architecture 2026-04-15 ·{" "}
          <Link href="/projects/monotask" className="hover:text-espresso/60 transition-colors">← Back to MonoTask</Link>
        </p>
      </footer>
    </div>
  );
}
