import React from "react";

interface ReleaseDiagramProps {
  slug: string;
}

export function ReleaseDiagram({ slug }: ReleaseDiagramProps) {
  switch (slug) {
    case "monomind-v22-org-runtime-v2":
      return <V22OrgRuntimeDiagram />;
    case "monomind-v23-local-memory-engine":
      return <V23LocalMemoryDiagram />;
    case "monomind-v25-second-brain":
      return <V25SecondBrainDiagram />;
    case "monomind-v28-antigravity-multiplatform":
      return <V28AntigravityDiagram />;
    case "monomind-v29-hardening-review-swarm":
      return <V29HardeningDiagram />;
    case "graph-engineering-multi-agent-systems":
      return <GraphEngineeringDiagram />;
    default:
      return null;
  }
}

function GraphEngineeringDiagram() {
  const rows = [
    { concept: "Two graphs (org + work)", impl: "OrgDef + TaskDag", status: "wired" },
    { concept: "Dynamic agent orgs", impl: "split / merge / cancel", status: "wired" },
    { concept: "Handoff protocol", impl: "OrgHandoffSchema", status: "wired" },
    { concept: "Work graph generator", impl: "org_plan_graph", status: "wired" },
    { concept: "Patterns (advisor / KG)", impl: "2 org templates", status: "wired" },
    { concept: "Per-node observability", impl: "'trace' event type", status: "scaffold" },
    { concept: "Per-node failure routing", impl: "FailureRoutingSchema", status: "scaffold" },
  ];

  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Graph Engineering Playbook — Monomind Adaptation
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Seven Concepts, Five Wired, Two Scaffolded
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-gold/20 text-xs font-mono text-gold border border-gold/30">
          61 tests added
        </span>
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.concept}
            className="p-3 sm:p-4 rounded-xl bg-espresso border border-gold/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={
                  "px-2 py-0.5 rounded font-bold " +
                  (r.status === "wired"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400")
                }
              >
                {r.status === "wired" ? "WIRED" : "SCAFFOLD"}
              </span>
              <span className="text-ivory/90 truncate">{r.concept}</span>
            </div>
            <span className="text-gold/80 truncate">{r.impl}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-espresso/60 border border-gold/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gold/80">
        <span>
          circuit_breaker (enforced) &rarr; failure_routing (configured, not yet enforced)
        </span>
        <span className="text-ivory/60">Apache-2.0 &nbsp;·&nbsp; orgrt/</span>
      </div>
    </div>
  );
}

function V22OrgRuntimeDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.2 Release Architecture
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Org Runtime v2 — OrgDaemon, OrgBus, PolicyEngine
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-gold/20 text-xs font-mono text-gold border border-gold/30">
          Real Provider-Backed Sessions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-xs font-mono text-gold/70">ORGDAEMON</div>
          <div className="text-sm font-bold text-ivory">One process, many orgs</div>
          <div className="text-[11px] font-mono text-gold/60">
            Each role gets its own real agent session
          </div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-xs font-mono text-gold/70">ORGBUS</div>
          <div className="text-sm font-bold text-ivory">Append-only JSONL log</div>
          <div className="text-[11px] font-mono text-gold/60">
            In-process fanout to dashboard &amp; history
          </div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-xs font-mono text-gold/70">POLICYENGINE</div>
          <div className="text-sm font-bold text-ivory">Per-role governance</div>
          <div className="text-[11px] font-mono text-gold/60">
            Tool allow/deny, file scope, token budget, audit trail
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-espresso/60 border border-gold/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dashboard: 127.0.0.1:4242, auto-launched by SessionStart hook</span>
        </div>
        <div className="text-gold/80">
          Config: <code className="text-gold font-bold">.monomind/orgs/&lt;name&gt;.json</code>
        </div>
      </div>
    </div>
  );
}

function V23LocalMemoryDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.3.1 Engine Architecture
          </span>
          <h4 className="text-lg font-bold text-ivory">
            LanceDB Removed — Local SQLite + Local Embeddings
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-xs font-mono text-emerald-400 border border-emerald-500/30">
          ~600MB Native Deps Removed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-5 rounded-xl bg-espresso border border-gold/20 space-y-3">
          <div className="text-xs font-mono text-gold font-semibold uppercase">
            1. Storage
          </div>
          <p className="text-xs text-ivory/80 leading-relaxed">
            better-sqlite3 as the primary driver, with a sql.js WASM fallback when the native binary can&apos;t load.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-espresso border border-gold/20 space-y-3">
          <div className="text-xs font-mono text-gold font-semibold uppercase">
            2. Embeddings
          </div>
          <p className="text-xs text-ivory/80 leading-relaxed">
            Local MiniLM/HuggingFace models run in-process via transformers.js — no API key, no cloud call.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-espresso border border-gold/20 space-y-3">
          <div className="text-xs font-mono text-gold font-semibold uppercase">
            3. Fallback Index
          </div>
          <p className="text-xs text-ivory/80 leading-relaxed">
            A pure-JS HNSW index exists only as a dormant fallback for native SQLite load failures — not the active path.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-espresso/60 border border-gold/20 flex items-center justify-between text-xs font-mono text-gold/80">
        <span>LanceDB + apache-arrow: fully removed</span>
        <span>Package: @monoes/memory (npm)</span>
      </div>
    </div>
  );
}

function V25SecondBrainDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.5 Feature Architecture
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Second Brain — Local Document Knowledge Base
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-gold/20 text-xs font-mono text-gold border border-gold/30">
          80% Recall Bar (CI-enforced)
        </span>
      </div>

      <div className="space-y-4 mb-6 font-mono text-xs">
        <div className="p-4 rounded-xl bg-espresso border border-gold/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
              PROJECT BRAIN
            </span>
            <span>Per-project index, heading-aware chunking</span>
          </div>
          <span className="text-emerald-400">~22 file types</span>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
              GLOBAL BRAIN
            </span>
            <span>~/.monomind/global-brain, merged at query time</span>
          </div>
          <span className="text-emerald-400">project wins ties</span>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
              INJECTION
            </span>
            <span>Per-prompt [SECOND_BRAIN] context, ~60ms warm</span>
          </div>
          <span className="text-amber-400">MCP: knowledge_search</span>
        </div>
      </div>
    </div>
  );
}

function V28AntigravityDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.8 Platform Architecture
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Google Antigravity Support &amp; Multi-Platform Init
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-gold/20 text-xs font-mono text-gold border border-gold/30">
          Default Output
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs font-mono">
        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">DEFAULT</div>
          <div className="font-bold text-ivory">Claude Code</div>
          <div className="text-[10px] text-emerald-400">Primary target</div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">DEFAULT (NEW)</div>
          <div className="font-bold text-ivory">Antigravity</div>
          <div className="text-[10px] text-emerald-400">GEMINI.md, .gemini/rules/</div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">OPT-IN</div>
          <div className="font-bold text-ivory">opencode</div>
          <div className="text-[10px] text-gold/80">--opencode flag</div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">OPT-IN</div>
          <div className="font-bold text-ivory">Kimi Code</div>
          <div className="text-[10px] text-gold/80">--kimicode flag</div>
        </div>
      </div>
    </div>
  );
}

function V29HardeningDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.9.0 Review Release
          </span>
          <h4 className="text-lg font-bold text-ivory">
            233 Files Audited, 28 Issues Fixed, 0 Test Failures
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-xs font-mono text-emerald-400 border border-emerald-500/30">
          884 / 884 Tests Passing
        </span>
      </div>

      <div className="p-6 rounded-xl bg-espresso border border-gold/20 space-y-4 text-xs font-mono text-ivory/90 leading-relaxed">
        <p>
          A 7-agent, in-process review swarm (no cross-machine networking, vote-count &quot;consensus&quot;) audited ~92,000 lines across the codebase.
        </p>
        <div className="flex flex-wrap gap-4 text-gold">
          <span>✓ Command-injection fix (cap-documents.ts)</span>
          <span>✓ Dashboard/server bind to 127.0.0.1</span>
          <span>✓ Atomic state writes</span>
          <span>✓ 5000ms SQLite busy_timeout</span>
        </div>
      </div>
    </div>
  );
}
