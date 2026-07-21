import Link from "next/link";

const accent = "#8B7355";

const heroStats = [
  { value: "E2E", label: "Encrypted" },
  { value: "Noise XX", label: "Handshake" },
  { value: "Double Ratchet", label: "Msg Keys" },
  { value: "WebRTC", label: "Transport" },
  { value: "CRDT", label: "Ordering (Yjs)" },
  { value: "0", label: "Servers" },
];

const packages = [
  {
    icon: "🔐",
    subtitle: "Cryptography",
    name: "@monoes/crypto",
    description: "Ed25519 identities, Noise XX handshake protocol (X25519 ECDH + ChaCha20-Poly1305), and Double Ratchet algorithm (X25519 DH ratcheting with per-message key derivation). Built on @noble libraries — audited, zero-dependency cryptography.",
    tags: ["@noble/curves", "@noble/hashes", "@noble/ciphers", "Noise XX", "Double Ratchet", "Ed25519"],
    color: "#8B7355",
  },
  {
    icon: "🌐",
    subtitle: "P2P Engine",
    name: "@monoes/p2p-core",
    description: "WireMessage codec (CBOR-encoded binary protocol with BLAKE3 body hash). MessageEngine handles deduplication, persistence, and ordering. CRDTEngine wraps Yjs for conflict-free message consistency. P2PTransport manages WebRTC DataChannel lifecycle.",
    tags: ["cbor-x", "BLAKE3", "Yjs CRDT", "MessageEngine", "WireMessage"],
    color: "#A07840",
  },
  {
    icon: "🗄",
    subtitle: "Storage",
    name: "@monoes/storage",
    description: "SQLite via op-sqlite (native, with optional SQLCipher encryption). Manages messages, conversations, contacts, and outbox retry queue. Migration system with typed repositories for each entity. executeSync API for synchronous React Native persistence.",
    tags: ["op-sqlite", "SQLCipher", "outbox queue", "typed repos", "migrations"],
    color: "#B8956A",
  },
  {
    icon: "📱",
    subtitle: "Mobile App",
    name: "@monoes/mobile",
    description: "React Native + Expo with Expo Router navigation. Zustand stores for conversations, identity, and contacts. react-native-webrtc for peer connectivity. react-native-keychain for secure Ed25519 private key storage in iOS Keychain / Android Keystore.",
    tags: ["React Native", "Expo", "Zustand", "Expo Router", "react-native-webrtc"],
    color: "#C8A97E",
  },
  {
    icon: "🎨",
    subtitle: "Design System",
    name: "@monoes/ui",
    description: "Design token library — colors, typography, spacing scales. Reusable components: Avatar (MonoID-derived visual), MessageBubble (status indicators, ephemeral flag, timestamp). Tailwind-compatible token exports.",
    tags: ["design tokens", "Avatar", "MessageBubble", "typography", "spacing"],
    color: "#8B7355",
  },
];

const handshake = [
  { step: "msg1", dir: "→", label: "Initiator → Responder", detail: "Ephemeral public key (e)" },
  { step: "msg2", dir: "←", label: "Responder → Initiator", detail: "Ephemeral (e) + static (s, encrypted) + empty payload" },
  { step: "msg3", dir: "→", label: "Initiator → Responder", detail: "Static (s, encrypted) + empty payload" },
  { step: "split", dir: "✓", label: "Keys Derived", detail: "send_key, recv_key split from handshake state" },
];

const messageFlow = [
  {
    num: "1", color: "#8B7355",
    title: "Identity Exchange (Out-of-Band)",
    body: "Two users exchange Ed25519 public keys via QR code scan or deep link. No account required — the public key IS the identity. MonoIDs are displayed as human-readable base58 strings. Contacts stored in @monoes/storage ContactRepository.",
    code: "Ed25519 pubkey → QR code → deep link → contact stored",
  },
  {
    num: "2", color: "#A07840",
    title: "WebRTC Connection",
    body: "P2PTransport creates WebRTC PeerConnection. User A generates offer SDP, signals to User B via QR/link (out-of-band). User B creates answer SDP. Once RTCDataChannel opens (ordered=true), transport is ready. No STUN/TURN servers required for local connections.",
    code: "createOffer() → [out-of-band signal] → createAnswer() → DataChannel open",
  },
  {
    num: "3", color: "#B8956A",
    title: "Noise XX Handshake",
    body: "User A (initiator) begins Noise XX handshake over the DataChannel with 0x01 type prefix. 3-message exchange derives session keys from ephemeral X25519 DH + static Ed25519 keys. split() produces separate send/receive ChaCha20-Poly1305 cipher states. Handshake authenticates both parties mutually.",
    code: `type: 0x01 (HANDSHAKE)
msg1: e                → (ephemeral pubkey)
msg2: e, ee, se, s, es ← (encrypted static)
msg3: s, se            → (encrypted static)
↓ split() → {send_key, recv_key}`,
  },
  {
    num: "4", color: "#C8A97E",
    title: "Message Send (Double Ratchet)",
    body: "Plaintext enters Double Ratchet encrypt(): chain key advances via KDF_CK to derive a per-message key. Message encrypted with ChaCha20-Poly1305. Header includes sender DH public key, previous chain length (pn), and message index (n). Wrapped in WireMessage (CBOR): version, sender/recipient pubkeys, nonce, body, BLAKE3 hash, timestamp, flags.",
    code: `KDF_CK(chain_key) → (new_chain_key, msg_key)
encrypt(msg_key, plaintext, header) → ciphertext
WireMessage { type=0x02, body: ciphertext, hash: blake3 }`,
  },
  {
    num: "5", color: "#8B7355",
    title: "Message Receive & Decrypt",
    body: "DataChannel receives bytes. handleRawMessage strips type prefix: 0x01 → noiseHandshakeService, 0x02 → receiveMessageService. For 0x02: look up Double Ratchet session by sender pubkey. Decrypt using header (out-of-order messages handled via skip key cache). Deduplication: nonce used as unique ID prevents replay.",
    code: "0x02 → lookup session → ratchet.decrypt(header, ciphertext) → dedup(nonce)",
  },
  {
    num: "6", color: "#A07840",
    title: "Persistence & UI Update",
    body: "Decrypted message persisted to SQLite via MessageRepository (op-sqlite executeSync). Conversation auto-created if unknown peer, unread count incremented. Zustand useConversationStore updated immediately for UI reactivity. dbPersistenceService syncs asynchronously. Yjs CRDTEngine ensures consistent message ordering across reconnections.",
    code: "MessageRepository.insert() → useConversationStore.addMessage() → Yjs sync",
  },
  {
    num: "7", color: "#B8956A",
    title: "Outbox & Retry",
    body: "Sent messages queued to outbox repository before transmission. If DataChannel is unavailable (peer offline), messages persist in outbox and are retried when the channel reconnects. Local-first design means the app remains fully functional offline.",
    code: "outbox.enqueue(msg) → send() → outbox.dequeue() on success",
  },
  {
    num: "8", color: "#C8A97E",
    title: "Ephemeral Messages",
    body: "Messages with the EPHEMERAL flag set (WireMessage.flags) are not persisted to SQLite. Displayed in UI, then discarded on session close. Receiver never writes to disk. Useful for sensitive information that should not survive device storage.",
    code: "flags & EPHEMERAL → display only, no MessageRepository.insert()",
  },
];

const cryptoStack = [
  { layer: "Identity", algo: "Ed25519", lib: "@noble/ed25519", purpose: "User identity, message signing, MonoID generation" },
  { layer: "Handshake", algo: "Noise XX", lib: "@noble/curves (X25519)", purpose: "Mutual authentication + session key derivation" },
  { layer: "ECDH", algo: "X25519", lib: "@noble/curves", purpose: "Ephemeral DH in Noise handshake + Double Ratchet" },
  { layer: "Message Encryption", algo: "ChaCha20-Poly1305", lib: "@noble/ciphers", purpose: "Per-message authenticated encryption" },
  { layer: "Key Derivation", algo: "HKDF-SHA256", lib: "@noble/hashes", purpose: "KDF_CK in Double Ratchet chain" },
  { layer: "Body Integrity", algo: "BLAKE3", lib: "@noble/hashes", purpose: "WireMessage body hash for integrity verification" },
  { layer: "Serialization", algo: "CBOR", lib: "cbor-x", purpose: "WireMessage binary encoding (vs JSON — 40% smaller)" },
  { layer: "Key Storage", algo: "OS Keychain", lib: "react-native-keychain", purpose: "iOS Keychain / Android Keystore for private keys" },
];

const wireMessageFields = [
  { field: "version", type: "u8", desc: "Protocol version (current: 1)" },
  { field: "sender_pubkey", type: "[u8; 32]", desc: "Ed25519 public key of sender" },
  { field: "recipient_pubkey", type: "[u8; 32]", desc: "Ed25519 public key of recipient" },
  { field: "nonce", type: "[u8; 12]", desc: "Unique nonce — used as deduplication ID" },
  { field: "body", type: "Vec<u8>", desc: "Encrypted ciphertext (ChaCha20-Poly1305)" },
  { field: "body_hash", type: "[u8; 32]", desc: "BLAKE3 hash of body for integrity" },
  { field: "timestamp", type: "i64", desc: "Unix milliseconds (UTC)" },
  { field: "flags", type: "u8", desc: "Bitmask: EPHEMERAL=0x01, DELIVERY_RECEIPT=0x02" },
];

export default function MonoChatArchitecturePage() {
  return (
    <div className="bg-ivory-warm min-h-screen">
      {/* Header */}
      <div className="border-b border-ivory-linen bg-white/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors">← Monoes</Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">MonoChat Architecture</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Packages", "Flow", "Crypto", "Protocol", "Storage"].map((s) => (
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
            TypeScript Monorepo · React Native · Noise XX · Double Ratchet
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>MonoChat</span>
            <br />Encrypts Everything
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            P2P encrypted messaging for iOS and Android. Noise XX handshake, Double Ratchet per-message keys, WebRTC transport, Yjs CRDT ordering. No server ever sees your messages.
          </p>
          <div className="inline-flex flex-wrap gap-px overflow-hidden rounded-xl border border-espresso/10 bg-espresso/5">
            {heroStats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-start gap-1 px-6 py-4 bg-white/80">
                <span className="text-xl font-semibold leading-none tracking-tight" style={{ color: accent }}>{value}</span>
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
            5-package Turbo monorepo. Crypto, networking, and storage are pure TypeScript packages shared across platforms. The mobile app wires them together with Zustand state management.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg viewBox="0 0 900 380" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ fontFamily: "Satoshi, -apple-system, sans-serif" }}>
              <defs>
                <marker id="arr4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="rgba(42,35,24,0.25)" />
                </marker>
                <marker id="arr4-acc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#8B7355" />
                </marker>
              </defs>

              {/* Mobile App top */}
              <rect x="200" y="15" width="500" height="65" rx="12" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.8"/>
              <text x="450" y="38" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="10" fontWeight="700" letterSpacing="0.07em">@monoes/mobile (React Native + Expo)</text>
              <rect x="218" y="48" width="100" height="24" rx="6" fill="rgba(139,115,85,0.1)" stroke="#8B7355" strokeWidth="1"/>
              <text x="268" y="64" textAnchor="middle" fill="#2A2318" fontSize="9" fontWeight="600">Zustand Stores</text>
              <rect x="328" y="48" width="100" height="24" rx="6" fill="rgba(160,120,64,0.1)" stroke="#A07840" strokeWidth="1"/>
              <text x="378" y="64" textAnchor="middle" fill="#2A2318" fontSize="9" fontWeight="600">Expo Router</text>
              <rect x="438" y="48" width="100" height="24" rx="6" fill="rgba(184,149,106,0.1)" stroke="#B8956A" strokeWidth="1"/>
              <text x="488" y="64" textAnchor="middle" fill="#2A2318" fontSize="9" fontWeight="600">WebRTC</text>
              <rect x="548" y="48" width="120" height="24" rx="6" fill="rgba(200,169,126,0.1)" stroke="#C8A97E" strokeWidth="1"/>
              <text x="608" y="64" textAnchor="middle" fill="#2A2318" fontSize="9" fontWeight="600">OS Keychain</text>

              {/* Package row */}
              <rect x="30" y="115" width="180" height="75" rx="10" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.5"/>
              <text x="120" y="138" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/crypto</text>
              <text x="120" y="154" textAnchor="middle" fill="#8B7355" fontSize="9.5" fontWeight="600">Noise XX · Double Ratchet</text>
              <text x="120" y="168" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">Ed25519 · X25519 · ChaCha20</text>
              <text x="120" y="182" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="8">@noble libraries</text>

              <rect x="225" y="115" width="180" height="75" rx="10" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.5"/>
              <text x="315" y="138" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/p2p-core</text>
              <text x="315" y="154" textAnchor="middle" fill="#A07840" fontSize="9.5" fontWeight="600">WireMessage · MessageEngine</text>
              <text x="315" y="168" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">CBOR · BLAKE3 · Yjs CRDT</text>
              <text x="315" y="182" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="8">P2PTransport</text>

              <rect x="420" y="115" width="180" height="75" rx="10" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.5"/>
              <text x="510" y="138" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/storage</text>
              <text x="510" y="154" textAnchor="middle" fill="#B8956A" fontSize="9.5" fontWeight="600">op-sqlite + SQLCipher</text>
              <text x="510" y="168" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">messages · convos · contacts</text>
              <text x="510" y="182" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="8">outbox retry queue</text>

              <rect x="615" y="115" width="150" height="75" rx="10" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.5"/>
              <text x="690" y="138" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">@monoes/ui</text>
              <text x="690" y="154" textAnchor="middle" fill="#C8A97E" fontSize="9.5" fontWeight="600">Design Tokens</text>
              <text x="690" y="168" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">Avatar · MessageBubble</text>
              <text x="690" y="182" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="8">typography · spacing</text>

              {/* Crypto detail */}
              <rect x="30" y="220" width="380" height="55" rx="10" fill="rgba(139,115,85,0.05)" stroke="#8B7355" strokeWidth="1.2" strokeDasharray="4,3"/>
              <text x="218" y="240" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="9" fontWeight="700" letterSpacing="0.06em">ENCRYPTION PIPELINE</text>
              <text x="218" y="255" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="9.5">Ed25519 identity → Noise XX handshake → X25519 ratchet → ChaCha20-Poly1305 msg keys</text>
              <text x="218" y="269" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="8.5">HKDF-SHA256 key derivation · BLAKE3 body hash · CBOR wire format</text>

              {/* WebRTC transport */}
              <rect x="425" y="220" width="340" height="55" rx="10" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.08)" strokeWidth="1.2"/>
              <text x="595" y="240" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9" fontWeight="700" letterSpacing="0.06em">TRANSPORT</text>
              <text x="595" y="256" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="9.5">WebRTC DataChannel (ordered=true) · react-native-webrtc</text>
              <text x="595" y="270" textAnchor="middle" fill="rgba(42,35,24,0.3)" fontSize="8.5">0x01 = Noise handshake · 0x02 = application message</text>

              {/* Peer B */}
              <rect x="350" y="305" width="200" height="55" rx="10" fill="rgba(42,35,24,0.03)" stroke="rgba(42,35,24,0.10)" strokeWidth="1.2" strokeDasharray="5,3"/>
              <text x="450" y="325" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="11" fontWeight="700">Remote Peer (Peer B)</text>
              <text x="450" y="342" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="9">@monoes/crypto · @monoes/p2p-core</text>
              <text x="450" y="355" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="8.5">same crypto stack — symmetric protocol</text>

              {/* Arrows */}
              {[120, 315, 510, 690].map((x, i) => (
                <line key={x} x1={x} y1="80" x2={x < 450 ? x + (450 - x) * 0.3 : x - (x - 450) * 0.3} y2="115" stroke={["#8B7355","#A07840","#B8956A","#C8A97E"][i]} strokeWidth="1.3" markerEnd="url(#arr4-acc)" strokeOpacity="0.5"/>
              ))}
              <line x1="120" y1="190" x2="120" y2="220" stroke="#8B7355" strokeWidth="1.2" markerEnd="url(#arr4)" strokeOpacity="0.4"/>
              <line x1="490" y1="190" x2="510" y2="220" stroke="#B8956A" strokeWidth="1.2" markerEnd="url(#arr4)" strokeOpacity="0.4"/>
              <line x1="450" y1="275" x2="450" y2="305" stroke="rgba(42,35,24,0.2)" strokeWidth="1.2" markerEnd="url(#arr4)" strokeDasharray="4,3"/>

              <circle r="2.5" fill="#8B7355" opacity="0.9">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 450 80 L 315 115" />
              </circle>
              <circle r="2.5" fill="#A07840" opacity="0.8">
                <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.8s" path="M 450 275 L 450 305" />
              </circle>
            </svg>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Monorepo</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">5 Packages</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Turbo monorepo with clean separation: crypto, p2p, storage, and UI are fully independent packages. The mobile app is the only consumer.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <div key={p.name} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft hover:shadow-soft-lg hover:border-espresso/20 transition-all duration-200"
                style={{ borderTop: `3px solid ${p.color}` }}>
                <div className="text-2xl mb-3">{p.icon}</div>
                <p className="text-[10px] uppercase tracking-label font-semibold mb-1" style={{ color: p.color }}>{p.subtitle}</p>
                <h3 className="text-xs font-semibold text-espresso mb-2 font-mono">{p.name}</h3>
                <p className="text-xs text-espresso/60 leading-relaxed mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                      style={{ color: p.color, borderColor: `${p.color}40`, background: `${p.color}08` }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Message Flow */}
      <section id="flow" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Data Flow</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">End-to-End Message Flow</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            From identity exchange to encrypted delivery — every step, from QR code scan to decrypted message on screen.
          </p>
          <div className="flex flex-col gap-4">
            {messageFlow.map((step) => (
              <div key={step.num} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft flex gap-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: step.color }}>{step.num}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-espresso mb-2">{step.title}</h4>
                  <p className="text-sm text-espresso/60 leading-relaxed mb-3">{step.body}</p>
                  {step.code && (
                    <pre className="text-xs bg-ivory-warm border border-espresso/8 rounded-lg px-4 py-3 text-espresso/70 font-mono leading-relaxed overflow-x-auto">{step.code}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Noise XX Handshake detail */}
      <section id="crypto" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Cryptography</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Noise XX + Double Ratchet</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-8">
            Two-layer encryption: Noise XX for mutual authentication and session key derivation, then Double Ratchet for forward-secret per-message keys.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Noise XX */}
            <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-5">Noise XX Handshake (3 Messages)</p>
              <div className="flex flex-col gap-3">
                {handshake.map((h) => (
                  <div key={h.step} className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-xs font-bold font-mono px-2 py-1 rounded border" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}0d` }}>{h.step}</span>
                    <div>
                      <p className="text-xs font-semibold text-espresso">{h.label}</p>
                      <p className="text-xs text-espresso/55 mt-0.5">{h.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Double Ratchet */}
            <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-5">Double Ratchet (Per-Message Keys)</p>
              <div className="flex flex-col gap-3">
                {[
                  { k: "DH Ratchet", v: "X25519 — new ephemeral keypair each send/receive direction flip" },
                  { k: "Chain Key (CK)", v: "HKDF-SHA256 derived — advances with each message in a direction" },
                  { k: "Message Key (MK)", v: "KDF_CK(chain_key) — unique per message, discarded after use" },
                  { k: "Forward Secrecy", v: "Compromising msg N doesn't expose msgs 1..N-1" },
                  { k: "Out-of-Order", v: "Skip key cache — missing messages handled without blocking" },
                  { k: "Cipher", v: "ChaCha20-Poly1305 AEAD — authenticated encryption with additional data" },
                ].map((r) => (
                  <div key={r.k} className="flex gap-3 text-xs">
                    <span className="flex-shrink-0 font-semibold w-32" style={{ color: accent }}>{r.k}</span>
                    <span className="text-espresso/60 leading-relaxed">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crypto stack table */}
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden">
            <div className="px-5 py-3 border-b border-espresso/8 bg-ivory-warm/50">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40">Full Cryptography Stack</p>
            </div>
            <table className="w-full border-collapse">
              <tbody>
                {cryptoStack.map((row, i) => (
                  <tr key={row.layer} className={i < cryptoStack.length - 1 ? "border-b border-espresso/6" : ""}>
                    <td className="py-3 px-5 text-xs font-semibold text-espresso w-32">{row.layer}</td>
                    <td className="py-3 px-5 text-xs font-mono font-bold w-36" style={{ color: accent }}>{row.algo}</td>
                    <td className="py-3 px-5 text-xs text-espresso/45 w-40">{row.lib}</td>
                    <td className="py-3 px-5 text-xs text-espresso/60">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* WireMessage Protocol */}
      <section id="protocol" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Protocol</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">WireMessage Format</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            CBOR-encoded binary protocol. Prefixed with 0x01 (handshake) or 0x02 (application data) before transmission over the WebRTC DataChannel.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-espresso/8 bg-ivory-warm/50">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40">WireMessage Fields</p>
            </div>
            <table className="w-full border-collapse">
              <tbody>
                {wireMessageFields.map((row, i) => (
                  <tr key={row.field} className={i < wireMessageFields.length - 1 ? "border-b border-espresso/6" : ""}>
                    <td className="py-3 px-5 text-xs font-mono font-bold w-36" style={{ color: accent }}>{row.field}</td>
                    <td className="py-3 px-5 text-xs font-mono text-espresso/45 w-28">{row.type}</td>
                    <td className="py-3 px-5 text-xs text-espresso/60">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-3">Wire Encoding</p>
            <pre className="text-xs font-mono bg-ivory-warm border border-espresso/8 rounded-xl px-5 py-4 text-espresso/65 overflow-x-auto leading-loose">{`// DataChannel receives:
[0x02] [CBOR-encoded WireMessage]
  │
  ├─ type check → 0x01 = noiseHandshakeService
  └─ type check → 0x02 = receiveMessageService
       │
       └─ lookup Double Ratchet session by sender_pubkey
            └─ decrypt(header, body) → plaintext
                 └─ dedup check (nonce)
                      └─ persist + update Zustand store`}</pre>
          </div>
        </div>
      </section>

      {/* Storage */}
      <section id="storage" className="px-8 py-20 bg-ivory-warm">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Storage</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Local-First SQLite</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            op-sqlite with optional SQLCipher encryption. Every message persisted locally first — the app works fully offline.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { table: "messages", color: "#8B7355", fields: ["id (nonce-based unique)", "conversation_id", "sender_pubkey", "content (decrypted)", "timestamp, flags", "is_ephemeral (not stored)"] },
              { table: "conversations", color: "#A07840", fields: ["id, peer_pubkey", "display_name", "last_message_at", "unread_count", "created_at"] },
              { table: "contacts", color: "#B8956A", fields: ["pubkey (MonoID)", "display_name", "avatar_seed", "verified (bool)", "added_at"] },
              { table: "outbox", color: "#C8A97E", fields: ["id, recipient_pubkey", "wire_message (BLOB)", "attempts, next_retry", "created_at", "status (pending/sent)"] },
            ].map((s) => (
              <div key={s.table} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft" style={{ borderLeft: `4px solid ${s.color}` }}>
                <p className="text-xs uppercase tracking-label font-bold mb-3 font-mono" style={{ color: s.color }}>{s.table}</p>
                <ul className="flex flex-col gap-1.5">
                  {s.fields.map((f) => (
                    <li key={f} className="text-xs text-espresso/60 font-mono flex items-start gap-2">
                      <span style={{ color: s.color }} className="mt-0.5">—</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "op-sqlite executeSync", body: "React Native SQLite with synchronous API — avoids async callback chains in message handling. op-sqlite is 2–10× faster than expo-sqlite for write-heavy workloads." },
              { title: "Offline-First Outbox", body: "Sent messages queued in outbox before transmission. Retried exponentially on reconnect. Guarantees delivery even if the peer is offline at send time." },
              { title: "No Cloud, No Telemetry", body: "All data stays on device. SQLite file is the only persistence. Delete the app → delete all messages. Optional SQLCipher encryption for at-rest protection." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
                <h4 className="text-sm font-semibold text-espresso mb-2">{c.title}</h4>
                <p className="text-xs text-espresso/60 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ivory-linen bg-ivory-parchment px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          MonoChat · TypeScript · React Native · Noise XX · Architecture 2026-04-15 ·{" "}
          <Link href="/" className="hover:text-espresso/60 transition-colors">← Monoes</Link>
        </p>
      </footer>
    </div>
  );
}
