import Link from "next/link";

const accent = "#B8956A";

const heroStats = [
  { value: "~8MB", label: "Binary Size" },
  { value: "~30MB", label: "RAM Idle" },
  { value: "<200ms", label: "Startup" },
  { value: "300ms", label: "Poll Interval" },
  { value: "500", label: "Default History" },
  { value: "9", label: "MCP Tools" },
];

const backendModules = [
  {
    icon: "🗄",
    subtitle: "Database Layer",
    name: "db/",
    description: "SQLite via rusqlite with WAL mode, memory temp store, and 256 MB mmap. Single migration (v001) creates all tables. Singleton connection wrapped in Arc<Mutex> for thread-safe access.",
    tags: ["rusqlite", "WAL mode", "migrations", "Arc<Mutex>"],
    color: "#B8956A",
  },
  {
    icon: "📋",
    subtitle: "Clipboard Watcher",
    name: "clipboard/watcher.rs",
    description: "Background thread polls system clipboard every 300ms via hash comparison. Handles text, images (saved as PNG), and file lists. Deduplicates by touching updated_at on identical content instead of creating new rows.",
    tags: ["300ms poll", "hash dedup", "image PNG", "file paths"],
    color: "#A07840",
  },
  {
    icon: "🔍",
    subtitle: "Content Detector",
    name: "clipboard/detector.rs",
    description: "Regex-based classifier assigns content_type (url, email, color, code, image, file, text) and generates 200-char previews. URL, email, and color patterns are exact-match; code detected by multi-line + symbol density.",
    tags: ["url", "email", "color", "code", "image", "file"],
    color: "#8B7355",
  },
  {
    icon: "⌨️",
    subtitle: "Shortcut Manager",
    name: "shortcuts/manager.rs",
    description: "Registers/deregisters global hotkeys via tauri-plugin-global-shortcut. Master shortcut (Cmd+Shift+V) shows window; per-folder shortcuts capture selected text via osascript + sentinel detection then save directly to that folder.",
    tags: ["global hotkeys", "osascript", "sentinel detect", "folder routing"],
    color: "#C8A97E",
  },
  {
    icon: "🖥",
    subtitle: "Window Manager",
    name: "window/manager.rs",
    description: "Controls the frameless always-on-top floating panel. ActivationPolicy::Accessory hides from Dock and Cmd+Tab. Window is pre-rendered and shown/hidden instantly via visibility toggle — no reload cost.",
    tags: ["frameless", "always-on-top", "Accessory policy", "spring anim"],
    color: "#B8956A",
  },
  {
    icon: "📟",
    subtitle: "System Tray",
    name: "tray/setup.rs",
    description: "Builds macOS menu bar icon with Open / Update / Quit context menu. Tray click shows/hides window. Listens for update events to add version badge and notification. No Dock presence.",
    tags: ["menu bar", "context menu", "update badge", "no Dock"],
    color: "#A07840",
  },
  {
    icon: "⚡",
    subtitle: "Tauri Commands",
    name: "commands/",
    description: "Four command files expose the backend to Svelte: folders.rs (CRUD + reorder), clips.rs (get, pin, delete, move, copy, export), settings.rs (update with side effects), utility.rs (stats, cleanup, CLI install, update check).",
    tags: ["folders.rs", "clips.rs", "settings.rs", "utility.rs"],
    color: "#8B7355",
  },
  {
    icon: "💻",
    subtitle: "CLI + MCP Server",
    name: "bin/mclip.rs",
    description: "Standalone 828-line Rust binary with subcommands: list, add, remove, pin, get, folder, context, mcp. The mcp subcommand launches a JSON-RPC 2.0 stdio server exposing 9 clipboard tools to Claude Desktop, Cursor, and Windsurf.",
    tags: ["828 lines", "JSON-RPC 2.0", "stdio", "9 MCP tools"],
    color: "#C8A97E",
  },
];

const frontendModules = [
  { name: "lib/api/tauri.ts", desc: "Typed wrappers around Tauri invoke() for all backend commands. Type definitions for Folder, ClipItem, Settings, AppStats." },
  { name: "lib/stores/clips.svelte.ts", desc: "Svelte 5 rune-based store — items, isLoading, searchQuery, activeFolder, flashingId. Methods: load(), prependItem(), removeItem(), updateItem()." },
  { name: "lib/stores/folders.svelte.ts", desc: "Folder list and active folder tracking with $state runes. Synced with backend via Tauri events." },
  { name: "App.svelte", desc: "Root shell. Registers Tauri event listeners (clip:new, folder:saved, cleanup:done, update:progress). Handles search debounce and window focus/blur logic." },
  { name: "ClipCard.svelte", desc: "Individual clip: preview text, type icon, timestamp, source app, pin badge. Hover reveals copy/pin/delete actions. Click triggers 150ms accent flash + copy command." },
  { name: "FolderModal.svelte", desc: "Create/edit folder with emoji picker, hex color picker, and global shortcut recorder with conflict detection." },
  { name: "SettingsPanel.svelte", desc: "Slide-in panel with sections: General, Clipboard, Shortcuts, Auto-cleanup, About. Setting changes trigger backend side effects (re-register shortcut, reschedule cleanup)." },
  { name: "SearchBar.svelte", desc: "Full-width search with 150ms debounce. Cmd+F or / to focus. Empty/Escape to return to folder view. Searches across ALL folders." },
];

const dataFlow = [
  {
    num: "1", color: "#B8956A",
    title: "App Startup",
    body: "Tauri initializes, opens SQLite at ~/.monoclip/monoclip.db, runs migrations, creates AppState. Sets ActivationPolicy::Accessory (menu bar only). Initializes plugins, builds tray, registers global shortcuts, starts clipboard watcher thread, runs auto-cleanup if enabled.",
    code: null,
  },
  {
    num: "2", color: "#A07840",
    title: "Clipboard Poll (every 300ms)",
    body: "Background thread reads system clipboard. Tries: file list → image → plain text. Hashes content; skips if identical to last. Runs content-type detector (regex). Deduplication: identical in Inbox → touch updated_at. New: INSERT into clip_items, enforce max_history_items (delete oldest unpinned), emit clip:new event.",
    code: "watcher.rs → detector.rs → db/queries.rs → emit('clip:new', item)",
  },
  {
    num: "3", color: "#8B7355",
    title: "Frontend Receives Clip",
    body: "App.svelte listener fires on clip:new. If no search active and viewing Inbox: clipsStore.prependItem(item) with spring entrance animation. No full reload — single prepend keeps scroll position.",
    code: null,
  },
  {
    num: "4", color: "#C8A97E",
    title: "User Opens Window (Cmd+Shift+V)",
    body: "Global shortcut fires; window.show() + window.setFocus(). Pre-rendered Svelte UI instantly visible (no load time). Spring animation from 0.96→1.0 scale in 180ms. Content already populated from background sync.",
    code: null,
  },
  {
    num: "5", color: "#B8956A",
    title: "User Copies a Clip",
    body: "Click on ClipCard → invoke copy_to_clipboard(id). Backend fetches content, writes to system clipboard via tauri-plugin-clipboard-manager. If paste_on_click=true: spawns async task to simulate Cmd+V after 150ms delay. Frontend shows 150ms color flash on the card.",
    code: null,
  },
  {
    num: "6", color: "#A07840",
    title: "Per-Folder Shortcut",
    body: "User presses Cmd+Opt+1 (assigned to Work folder). shortcuts/manager fires: runs osascript to capture selected text (Cmd+C with sentinel). If selection found → save to folder. If not → read current clipboard. Emits folder:saved event. Toast: 'Work ← selection'.",
    code: "osascript → sentinel detect → folder save → emit('folder:saved')",
  },
  {
    num: "7", color: "#8B7355",
    title: "Search",
    body: "User types in SearchBar. 150ms debounce fires clipsStore.load(undefined, query). Backend runs LIKE pattern on content + preview across ALL folders, returns ≤50 results. Frontend replaces list. Escape → reload current folder.",
    code: null,
  },
  {
    num: "8", color: "#C8A97E",
    title: "Auto-Cleanup",
    body: "Triggers on startup + daily background timer. Deletes non-pinned, non-deleted clips older than auto_clean_days (default 30). Exceptions: always keeps 10 most recent Inbox items; pinned items never deleted. Emits cleanup:done. Toast: 'Auto-cleaned 42 old clips'.",
    code: null,
  },
];

const schema = [
  {
    table: "folders",
    color: "#B8956A",
    fields: ["id (PK, Inbox=1)", "name, icon (emoji), color (hex)", "global_shortcut (nullable)", "position (sidebar order)", "created_at, updated_at"],
  },
  {
    table: "clip_items",
    color: "#A07840",
    fields: ["id (PK, AUTOINCREMENT)", "content (full text)", "content_type (text|url|email|color|code|image|file)", "preview (≤200 chars)", "folder_id → folders.id", "is_pinned, is_deleted (soft delete)", "source_app (bundle ID)", "created_at, updated_at"],
  },
  {
    table: "settings",
    color: "#8B7355",
    fields: ["id = 1 (singleton)", "master_shortcut (default: Cmd+Shift+V)", "auto_clean_enabled, auto_clean_days (1–365)", "max_history_items (50–2000, default 500)", "paste_on_click, theme, launch_at_login", "ignored_apps (JSON array)"],
  },
  {
    table: "schema_version",
    color: "#C8A97E",
    fields: ["version: 1 (tracks migrations)"],
  },
];

const mcpTools = [
  { name: "list_clips", desc: "List clips with optional folder, search query, and pagination limit" },
  { name: "add_clip", desc: "Insert new text clip into specified folder" },
  { name: "get_clip", desc: "Fetch full raw content by clip ID" },
  { name: "remove_clip", desc: "Delete clip by ID (soft delete)" },
  { name: "pin_clip", desc: "Mark clip as pinned — skips auto-cleanup" },
  { name: "unpin_clip", desc: "Remove pin status from clip" },
  { name: "list_folders", desc: "Get all folders with emoji, color, shortcut" },
  { name: "create_folder", desc: "Create new folder with emoji and hex color" },
  { name: "delete_folder", desc: "Delete folder — clips moved to Inbox" },
];

const perfRows = [
  { op: "Binary size", val: "~8 MB", pct: 95, note: "vs Electron ~150 MB" },
  { op: "RAM idle", val: "~30 MB", pct: 90, note: "vs Electron ~300 MB" },
  { op: "Startup to tray ready", val: "<200 ms", pct: 95, note: "No splash screen" },
  { op: "Window reveal", val: "<50 ms", pct: 98, note: "Pre-rendered, just toggle visibility" },
  { op: "Clipboard poll cycle", val: "<1 ms", pct: 99, note: "Hash check only if unchanged" },
  { op: "Search (10K clips)", val: "<50 ms", pct: 85, note: "LIKE + LIMIT + indexed columns" },
  { op: "DB queries", val: "<10 ms", pct: 95, note: "WAL mode + mmap + indexes" },
  { op: "Image save to PNG", val: "<30 ms", pct: 80, note: "~/.monoclip/images/" },
];

export default function MonoClipArchitecturePage() {
  return (
    <div className="bg-ivory-warm min-h-screen">
      {/* Header */}
      <div className="border-b border-ivory-linen bg-white/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/projects/mono-clip" className="text-xs uppercase tracking-label font-medium text-espresso/40 hover:text-espresso transition-colors">
              ← MonoClip
            </Link>
            <span className="text-espresso/20">/</span>
            <span className="text-xs uppercase tracking-label font-medium text-espresso/60">Architecture</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Backend", "Frontend", "Flow", "Database", "MCP", "Performance"].map((s) => (
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
            v0.2.11 · Technical Architecture
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-espresso tracking-tight leading-none mb-6">
            How <span style={{ color: accent }}>MonoClip</span>
            <br />Watches Everything
          </h1>
          <p className="text-lg md:text-xl text-espresso/55 font-light leading-relaxed max-w-2xl mb-16">
            Tauri 2 + Rust backend, Svelte 5 frontend. A native macOS clipboard manager that runs silently at 8 MB, polls at 300 ms, and exposes your history to AI via MCP.
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
            Tauri bridges a Rust backend (clipboard, DB, shortcuts) with a Svelte 5 frontend via typed commands and event emission.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden p-6">
            <svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ fontFamily: "Satoshi, -apple-system, sans-serif" }}>
              <defs>
                <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="rgba(42,35,24,0.25)" />
                </marker>
                <marker id="arr-acc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#B8956A" />
                </marker>
              </defs>

              {/* macOS System */}
              <rect x="30" y="15" width="200" height="55" rx="10" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.5" strokeOpacity="0.6"/>
              <text x="130" y="38" textAnchor="middle" fill="#2A2318" fontSize="12" fontWeight="700">macOS System</text>
              <text x="130" y="56" textAnchor="middle" fill="rgba(42,35,24,0.45)" fontSize="10">Clipboard · Shortcuts · Tray</text>

              {/* Rust backend box */}
              <rect x="280" y="15" width="360" height="220" rx="12" fill="rgba(184,149,106,0.05)" stroke="#B8956A" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="460" y="38" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="10" fontWeight="700" letterSpacing="0.08em">RUST BACKEND (src-tauri)</text>

              {/* hook-handler equiv: main.rs */}
              <rect x="310" y="50" width="160" height="48" rx="9" fill="rgba(184,149,106,0.12)" stroke="#B8956A" strokeWidth="1.5"/>
              <text x="390" y="70" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">main.rs</text>
              <text x="390" y="86" textAnchor="middle" fill="#B8956A" fontSize="9" fontWeight="600">App Bootstrapper</text>

              <rect x="495" y="50" width="130" height="48" rx="9" fill="rgba(160,120,64,0.1)" stroke="#A07840" strokeWidth="1.3"/>
              <text x="560" y="70" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">state.rs</text>
              <text x="560" y="86" textAnchor="middle" fill="#A07840" fontSize="9" fontWeight="600">Arc&lt;Mutex&lt;DB&gt;&gt;</text>

              {/* Sub modules row */}
              <rect x="295" y="120" width="110" height="44" rx="8" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2"/>
              <text x="350" y="138" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">clipboard/</text>
              <text x="350" y="153" textAnchor="middle" fill="#8B7355" fontSize="8.5">watcher + detector</text>

              <rect x="415" y="120" width="100" height="44" rx="8" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.2"/>
              <text x="465" y="138" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">shortcuts/</text>
              <text x="465" y="153" textAnchor="middle" fill="#B8956A" fontSize="8.5">manager.rs</text>

              <rect x="525" y="120" width="95" height="44" rx="8" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.2"/>
              <text x="572" y="138" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">commands/</text>
              <text x="572" y="153" textAnchor="middle" fill="#A07840" fontSize="8.5">4 files</text>

              {/* DB */}
              <rect x="295" y="185" width="320" height="38" rx="8" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.2"/>
              <text x="455" y="199" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">db/ (rusqlite · WAL · mmap · migrations)</text>
              <text x="455" y="213" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">~/.monoclip/monoclip.db</text>

              {/* Svelte frontend */}
              <rect x="280" y="258" width="360" height="90" rx="12" fill="rgba(139,105,20,0.04)" stroke="#8B6914" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="460" y="276" textAnchor="middle" fill="rgba(42,35,24,0.35)" fontSize="10" fontWeight="700" letterSpacing="0.08em">SVELTE 5 FRONTEND (src/)</text>

              <rect x="295" y="286" width="105" height="50" rx="8" fill="rgba(139,115,85,0.08)" stroke="#8B7355" strokeWidth="1.2"/>
              <text x="347" y="307" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Stores</text>
              <text x="347" y="322" textAnchor="middle" fill="#8B7355" fontSize="8">clips · folders · settings</text>

              <rect x="412" y="286" width="105" height="50" rx="8" fill="rgba(184,149,106,0.08)" stroke="#B8956A" strokeWidth="1.2"/>
              <text x="464" y="307" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">Components</text>
              <text x="464" y="322" textAnchor="middle" fill="#B8956A" fontSize="8">12+ Svelte files</text>

              <rect x="529" y="286" width="98" height="50" rx="8" fill="rgba(160,120,64,0.08)" stroke="#A07840" strokeWidth="1.2"/>
              <text x="578" y="307" textAnchor="middle" fill="#2A2318" fontSize="10" fontWeight="700">lib/api/</text>
              <text x="578" y="322" textAnchor="middle" fill="#A07840" fontSize="8">typed invoke()</text>

              {/* CLI standalone */}
              <rect x="680" y="140" width="185" height="68" rx="10" fill="rgba(200,169,126,0.08)" stroke="#C8A97E" strokeWidth="1.3"/>
              <text x="772" y="162" textAnchor="middle" fill="#2A2318" fontSize="11" fontWeight="700">mclip (CLI binary)</text>
              <text x="772" y="178" textAnchor="middle" fill="#C8A97E" fontSize="9.5" fontWeight="600">828 lines · standalone</text>
              <text x="772" y="194" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="9">list · add · pin · mcp</text>

              {/* MCP server label */}
              <rect x="695" y="228" width="155" height="36" rx="8" fill="rgba(200,169,126,0.06)" stroke="#C8A97E" strokeWidth="1" strokeDasharray="3,2"/>
              <text x="772" y="244" textAnchor="middle" fill="#C8A97E" fontSize="10" fontWeight="700">MCP Server (JSON-RPC)</text>
              <text x="772" y="257" textAnchor="middle" fill="rgba(42,35,24,0.4)" fontSize="8.5">Claude · Cursor · Windsurf</text>

              {/* Arrows */}
              <line x1="230" y1="42" x2="278" y2="68" stroke="#B8956A" strokeWidth="1.3" markerEnd="url(#arr-acc)" strokeOpacity="0.6"/>
              <line x1="390" y1="98" x2="350" y2="120" stroke="rgba(42,35,24,0.2)" strokeWidth="1.2" markerEnd="url(#arr)" strokeDasharray="4,3"/>
              <line x1="420" y1="98" x2="465" y2="120" stroke="rgba(42,35,24,0.2)" strokeWidth="1.2" markerEnd="url(#arr)" strokeDasharray="4,3"/>
              <line x1="450" y1="98" x2="555" y2="120" stroke="rgba(42,35,24,0.2)" strokeWidth="1.2" markerEnd="url(#arr)" strokeDasharray="4,3"/>
              <line x1="460" y1="246" x2="460" y2="258" stroke="#B8956A" strokeWidth="1.3" markerEnd="url(#arr-acc)" strokeOpacity="0.5"/>
              <line x1="640" y1="160" x2="680" y2="165" stroke="rgba(42,35,24,0.15)" strokeWidth="1.2" markerEnd="url(#arr)" strokeDasharray="3,3"/>
              <line x1="772" y1="208" x2="772" y2="228" stroke="rgba(42,35,24,0.2)" strokeWidth="1.1" markerEnd="url(#arr)"/>

              {/* Tauri bridge label */}
              <text x="460" y="252" textAnchor="middle" fill="rgba(42,35,24,0.25)" fontSize="9">← Tauri invoke() / emit() →</text>

              {/* Animated dots */}
              <circle r="2.5" fill="#B8956A" opacity="0.9">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 130 70 L 310 70" />
              </circle>
              <circle r="2.5" fill="#A07840" opacity="0.9">
                <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.4s" path="M 460 246 L 460 285" />
              </circle>
            </svg>
          </div>
        </div>
      </section>

      {/* Backend Modules */}
      <section id="backend" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Rust Backend</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">8 Backend Modules</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Pure Rust — no npm deps. Each module owns a single responsibility.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {backendModules.map((m) => (
              <div key={m.name} className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft hover:shadow-soft-lg hover:border-espresso/20 transition-all duration-200"
                style={{ borderTop: `3px solid ${m.color}` }}>
                <div className="text-2xl mb-3">{m.icon}</div>
                <p className="text-[10px] uppercase tracking-label font-semibold mb-1" style={{ color: m.color }}>{m.subtitle}</p>
                <h3 className="text-xs font-semibold text-espresso mb-2 font-mono">{m.name}</h3>
                <p className="text-xs text-espresso/60 leading-relaxed mb-4">{m.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                      style={{ color: m.color, borderColor: `${m.color}40`, background: `${m.color}08` }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frontend Modules */}
      <section id="frontend" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Svelte 5 Frontend</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Frontend Architecture</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Svelte 5 runes for zero-runtime reactivity. Class-based stores with $state. Typed invoke() wrappers eliminate runtime errors.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {frontendModules.map((m) => (
              <div key={m.name} className="rounded-xl border border-espresso/10 bg-white p-5 shadow-soft flex gap-4">
                <div className="flex-shrink-0 w-1 rounded-full self-stretch" style={{ background: accent }} />
                <div>
                  <p className="text-xs font-bold font-mono mb-1.5" style={{ color: accent }}>{m.name}</p>
                  <p className="text-xs text-espresso/60 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section id="flow" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Data Flow</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">End-to-End System Flow</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            From startup to clipboard copy — every step in sequence.
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

      {/* Database Schema */}
      <section id="database" className="px-8 py-20 bg-ivory-parchment border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Storage</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">SQLite Schema</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-8">
            Single file at <code className="text-xs font-mono bg-ivory-warm px-1.5 py-0.5 rounded border border-espresso/8">~/.monoclip/monoclip.db</code> with 4 tables. WAL mode + mmap for concurrent read/write.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {schema.map((s) => (
              <div key={s.table} className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft"
                style={{ borderLeft: `4px solid ${s.color}` }}>
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
          <div className="mt-6 rounded-2xl border border-espresso/10 bg-white p-5 shadow-soft">
            <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-3">SQLite Performance Pragmas</p>
            <div className="grid sm:grid-cols-4 gap-3">
              {[
                { pragma: "journal_mode=WAL", desc: "Concurrent read/write" },
                { pragma: "synchronous=NORMAL", desc: "Fast writes, still safe" },
                { pragma: "temp_store=MEMORY", desc: "In-memory temp tables" },
                { pragma: "mmap_size=256MB", desc: "Memory-mapped I/O" },
              ].map((p) => (
                <div key={p.pragma} className="rounded-xl bg-ivory-warm border border-espresso/8 p-3">
                  <code className="block text-[10px] font-mono font-bold mb-1" style={{ color: accent }}>{p.pragma}</code>
                  <p className="text-[11px] text-espresso/50">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MCP Server */}
      <section id="mcp" className="px-8 py-20 bg-ivory-warm border-b border-ivory-linen">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>AI Integration</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">MCP Server</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            <code className="text-sm font-mono">mclip mcp</code> starts a JSON-RPC 2.0 stdio server exposing 9 clipboard tools to Claude Desktop, Cursor, and Windsurf.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {mcpTools.map((t) => (
              <div key={t.name} className="rounded-xl border border-espresso/10 bg-white p-4 shadow-soft hover:translate-y-[-2px] hover:border-espresso/20 transition-all duration-200">
                <p className="text-xs font-bold font-mono mb-2" style={{ color: accent }}>{t.name}</p>
                <p className="text-xs text-espresso/60 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
            <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">Configuration</p>
            <pre className="text-xs font-mono bg-ivory-warm border border-espresso/8 rounded-xl px-5 py-4 text-espresso/70 overflow-x-auto leading-loose">{`// ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "mclip": {
      "command": "mclip",
      "args": ["mcp"]
    }
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section id="performance" className="px-8 py-20 bg-ivory-parchment">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-label font-semibold mb-3" style={{ color: accent }}>Performance</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-espresso mb-4">Speed Benchmarks</h2>
          <p className="text-espresso/55 font-light leading-relaxed max-w-2xl mb-12">
            Tauri + Rust deliver native performance. Every metric is measured on macOS with SSD storage.
          </p>
          <div className="rounded-2xl border border-espresso/10 bg-white shadow-soft overflow-hidden mb-8">
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">vs Electron Alternatives</p>
              <div className="flex flex-col gap-3">
                {[
                  { metric: "Binary size", tauri: "~8 MB", electron: "~150 MB" },
                  { metric: "RAM idle", tauri: "~30 MB", electron: "~300 MB" },
                  { metric: "Startup", tauri: "<200 ms", electron: "1–3 s" },
                ].map((r) => (
                  <div key={r.metric} className="grid grid-cols-3 text-xs gap-2">
                    <span className="text-espresso/45">{r.metric}</span>
                    <span className="font-semibold" style={{ color: accent }}>{r.tauri}</span>
                    <span className="text-espresso/30 line-through">{r.electron}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-espresso/10 bg-white p-6 shadow-soft">
              <p className="text-[10px] uppercase tracking-label font-semibold text-espresso/40 mb-4">Storage Limits</p>
              <div className="flex flex-col gap-3">
                {[
                  { k: "Max clipboard content", v: "50,000 chars" },
                  { k: "Max preview", v: "200 chars" },
                  { k: "Default history", v: "500 items" },
                  { k: "Max history (configurable)", v: "2,000 items" },
                  { k: "DB size soft warn", v: "100 MB" },
                ].map((r) => (
                  <div key={r.k} className="flex justify-between text-xs">
                    <span className="text-espresso/50">{r.k}</span>
                    <span className="font-semibold" style={{ color: accent }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ivory-linen bg-ivory-warm px-8 py-10 text-center">
        <p className="text-xs text-espresso/35">
          MonoClip v0.2.11 · Architecture · 2026-04-15 ·{" "}
          <Link href="/projects/mono-clip" className="hover:text-espresso/60 transition-colors">← Back to MonoClip</Link>
        </p>
      </footer>
    </div>
  );
}
