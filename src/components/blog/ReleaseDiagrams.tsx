import React from "react";

interface ReleaseDiagramProps {
  slug: string;
}

export function ReleaseDiagram({ slug }: ReleaseDiagramProps) {
  switch (slug) {
    case "monomind-v28-workforce-orchestration-release":
      return <V28WorkforceDiagram />;
    case "monomind-v25-local-second-brain-release":
      return <V25VectorMemoryDiagram />;
    case "monomind-v20-deterministic-dag-engine-release":
      return <V20DagEngineDiagram />;
    case "monomind-v15-universal-cli-protocol-release":
      return <V15CliProtocolDiagram />;
    case "monomind-v10-open-source-foundation-release":
      return <V10FoundationDiagram />;
    default:
      return null;
  }
}

function V28WorkforceDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.8 Release Architecture
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Autonomous Workforce Matrix & 89 Worker Roles
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-gold/20 text-xs font-mono text-gold border border-gold/30">
          31 Org Subcommands
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-xs font-mono text-gold/70">ACCOUNTS PAYABLE</div>
          <div className="text-2xl font-bold text-ivory">24 Roles</div>
          <div className="text-[11px] font-mono text-gold/60">
            Invoice OCR, PO Match, Ledger Entry
          </div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-xs font-mono text-gold/70">ACCOUNTS RECEIVABLE</div>
          <div className="text-2xl font-bold text-ivory">18 Roles</div>
          <div className="text-[11px] font-mono text-gold/60">
            Billing Audits, Dunning, Reconciliation
          </div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-xs font-mono text-gold/70">HR ONBOARDING</div>
          <div className="text-2xl font-bold text-ivory">22 Roles</div>
          <div className="text-[11px] font-mono text-gold/60">
            Document Verify, System Provisioning
          </div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-xs font-mono text-gold/70">ISO & SOC2 AUDIT</div>
          <div className="text-2xl font-bold text-ivory">25 Roles</div>
          <div className="text-[11px] font-mono text-gold/60">
            Risk Gates, Compliance Checks
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-espresso/60 border border-gold/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Worker Capacity: 128 Threads</span>
        </div>
        <div className="text-gold/80">
          CLI Command: <code className="text-gold font-bold">monomind org init --roles=all</code>
        </div>
      </div>
    </div>
  );
}

function V25VectorMemoryDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.5 Engine Architecture
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Embedded SQLite + Pure-JS HNSW Vector Index
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-xs font-mono text-emerald-400 border border-emerald-500/30">
          &lt; 0.8ms Latency
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-5 rounded-xl bg-espresso border border-gold/20 space-y-3">
          <div className="text-xs font-mono text-gold font-semibold uppercase">
            1. Document Ingestion
          </div>
          <p className="text-xs text-ivory/80 leading-relaxed">
            Local ONNX/Ollama models chunk & embed PDF/code files locally with zero third-party API transmission.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-espresso border border-gold/20 space-y-3">
          <div className="text-xs font-mono text-gold font-semibold uppercase">
            2. RAM Graph Memory
          </div>
          <p className="text-xs text-ivory/80 leading-relaxed">
            Pure-JS HNSW index constructs multi-layer graph structures in RAM, eliminating ~600MB native C++ binaries.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-espresso border border-gold/20 space-y-3">
          <div className="text-xs font-mono text-gold font-semibold uppercase">
            3. SQLite Storage
          </div>
          <p className="text-xs text-ivory/80 leading-relaxed">
            Relational metadata and raw embeddings persist to local SQLite (`second_brain.sqlite`) with WASM fallback.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-espresso/60 border border-gold/20 flex items-center justify-between text-xs font-mono text-gold/80">
        <span>Zero External Dependencies</span>
        <span>Package: @monoes/memory</span>
      </div>
    </div>
  );
}

function V20DagEngineDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v2.0 Core Paradigm
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Deterministic DAG Workflow Engine & Risk Gates
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-gold/20 text-xs font-mono text-gold border border-gold/30">
          Zero Context Drift
        </span>
      </div>

      <div className="space-y-4 mb-6 font-mono text-xs">
        <div className="p-4 rounded-xl bg-espresso border border-gold/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
              NODE 01
            </span>
            <span>Master Orchestrator — Intent Planning & DAG Emission</span>
          </div>
          <span className="text-emerald-400">STATUS: COMPLETED</span>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
              NODE 02
            </span>
            <span>Execution Agent — Ephemeral Sandboxed Tool Parsing</span>
          </div>
          <span className="text-emerald-400">STATUS: COMPLETED (JSON Schema Valid)</span>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
              NODE 03
            </span>
            <span>Zero-Trust Risk Gate — Probabilistic Audit Check ($10K+)</span>
          </div>
          <span className="text-amber-400">STATUS: ESCALATED TO HUMAN QUEUE (98.4%)</span>
        </div>
      </div>
    </div>
  );
}

function V15CliProtocolDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v1.5 Protocol Architecture
          </span>
          <h4 className="text-lg font-bold text-ivory">
            Multi-Provider Model Router & IPC Socket Proxies
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-gold/20 text-xs font-mono text-gold border border-gold/30">
          Sub-2ms Dispatch
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs font-mono">
        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">LOCAL MODEL</div>
          <div className="font-bold text-ivory">vLLM / Ollama</div>
          <div className="text-[10px] text-emerald-400">Primary (0ms API cost)</div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">CLOUD ROUTER</div>
          <div className="font-bold text-ivory">Anthropic Claude</div>
          <div className="text-[10px] text-gold/80">Complex Reasoning</div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">FAILOVER</div>
          <div className="font-bold text-ivory">OpenAI / Groq</div>
          <div className="text-[10px] text-gold/80">Automated Retry</div>
        </div>

        <div className="p-4 rounded-xl bg-espresso border border-gold/20 space-y-2">
          <div className="text-gold/60">IPC SOCKET</div>
          <div className="font-bold text-ivory">Local Proxy</div>
          <div className="text-[10px] text-emerald-400">Sub-2ms IPC Latency</div>
        </div>
      </div>
    </div>
  );
}

function V10FoundationDiagram() {
  return (
    <div className="my-8 rounded-2xl bg-espresso-deep border border-gold/30 p-6 sm:p-8 text-ivory shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-gold uppercase tracking-wider">
            Monomind v1.0 Foundational Engine
          </span>
          <h4 className="text-lg font-bold text-ivory">
            100% Open-Source MIT Architecture & Multimodal Vision
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-xs font-mono text-emerald-400 border border-emerald-500/30">
          MIT License
        </span>
      </div>

      <div className="p-6 rounded-xl bg-espresso border border-gold/20 space-y-4 text-xs font-mono text-ivory/90 leading-relaxed">
        <p>
          Monomind v1.0 established the foundational open-source architecture for local-first agent teams, pairing multimodal vision parsers (<code className="text-gold">@monoes/monoclip</code>) with typed tool drivers.
        </p>
        <div className="flex flex-wrap gap-4 text-gold">
          <span>✓ 100% MIT Licensed</span>
          <span>✓ Local IPC Sockets</span>
          <span>✓ Multimodal Vision Parsing</span>
          <span>✓ Zero Vendor Lock-In</span>
        </div>
      </div>
    </div>
  );
}
