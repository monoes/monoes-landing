import { OrgDefSchema } from "../org-schema.ts";
import { CONTENT_TYPE, LibraryError, MAX_ARTIFACT_BYTES, type Kind } from "./types.ts";
import { isSemver } from "./semver.ts";
import { readZipEntry, ZipError } from "./zip.ts";

export const AUTOMATION_SCHEMA = "monoagent.automation/v1";
const AUTOMATION_ID = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const MAX_MANIFEST_BYTES = 1024 * 1024;

/** What the server derives from an uploaded artifact. */
export interface ValidatedArtifact {
  contentType: string;
  filename: string;
  meta: Record<string, unknown>;
  /** Defaults for fields the uploader didn't give. */
  name: string;
  slug: string;
  description: string;
  version: string | null;
}

function invalid(message: string): LibraryError {
  return new LibraryError(400, "invalid_artifact", message);
}

/** Same rules as org gallery slugs, with a per-kind fallback for names with no usable characters. */
export function slugify(value: string, fallback: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || fallback;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function parseJson(bytes: Uint8Array): unknown {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw invalid("File is not valid UTF-8 JSON.");
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function stringArray(v: unknown): string[] | null {
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : null;
}

async function validateAutomation(bytes: Uint8Array): Promise<ValidatedArtifact> {
  let raw: Uint8Array | null;
  try {
    raw = await readZipEntry(bytes, "automation.json", MAX_MANIFEST_BYTES);
  } catch (err) {
    if (err instanceof ZipError) throw invalid(`Not a valid .mpkg archive: ${err.message}.`);
    throw err;
  }
  if (!raw) throw invalid("The .mpkg has no automation.json at its root.");
  const m = parseJson(raw);
  if (!isObject(m)) throw invalid("automation.json must be a JSON object.");
  if (m.schema !== AUTOMATION_SCHEMA) throw invalid(`automation.json: schema must be "${AUTOMATION_SCHEMA}".`);
  if (typeof m.id !== "string" || !AUTOMATION_ID.test(m.id)) {
    throw invalid("automation.json: id must be lowercase letters, digits, '.', '_' or '-'.");
  }
  if (typeof m.name !== "string" || !m.name.trim()) throw invalid("automation.json: name is required.");
  if (typeof m.version !== "string" || !isSemver(m.version)) {
    throw invalid("automation.json: version must be a semver version like 1.2.0.");
  }
  const actions = stringArray(m.actions);
  if (!actions) throw invalid("automation.json: actions must be a list of action names.");
  const site = isObject(m.site) ? m.site : {};
  const domains = site.domains === undefined ? [] : stringArray(site.domains);
  if (!domains) throw invalid("automation.json: site.domains must be a list of domains.");
  const publisher = isObject(m.publisher) && typeof m.publisher.name === "string" ? m.publisher.name : null;
  const requires = isObject(m.requires) ? m.requires : {};
  const native = typeof requires.native === "string" && requires.native ? requires.native : null;
  const policy = isObject(m.policy) && typeof m.policy.tier === "string" ? m.policy.tier : "standard";

  return {
    contentType: CONTENT_TYPE.automation,
    filename: `${m.id}-${m.version}.mpkg`,
    meta: {
      automation_id: m.id,
      publisher,
      site_domains: domains,
      actions,
      requires_native: native !== null,
      policy_tier: policy,
      // Beyond SPEC.md's list: the compiled bot a native package needs and
      // the package's MonoAgent version range, for "needs MonoAgent ≥ x".
      native,
      engine: typeof m.engine === "string" ? m.engine : null,
    },
    name: m.name.trim(),
    slug: m.id,
    description: typeof m.description === "string" ? m.description : "",
    version: m.version,
  };
}

function validateWorkflow(bytes: Uint8Array): ValidatedArtifact {
  const wf = parseJson(bytes);
  if (!isObject(wf)) throw invalid("A workflow export must be a JSON object.");
  if (!Array.isArray(wf.nodes)) throw invalid("Not a MonoAgent workflow export: nodes is missing.");
  const types = new Set<string>();
  for (const node of wf.nodes) {
    if (!isObject(node) || typeof node.type !== "string" || !node.type) {
      throw invalid("Not a MonoAgent workflow export: every node needs a type.");
    }
    types.add(node.type);
  }
  if (wf.connections !== undefined && !Array.isArray(wf.connections)) {
    throw invalid("Not a MonoAgent workflow export: connections must be a list.");
  }
  const nodeTypes = [...types].sort();
  const bundled = isObject(wf.automations) ? Object.keys(wf.automations) : [];
  const unbundled = isObject(wf.unbundledAutomations) ? Object.keys(wf.unbundledAutomations) : [];
  const name = typeof wf.name === "string" && wf.name.trim() ? wf.name.trim() : "Untitled workflow";

  return {
    contentType: CONTENT_TYPE.workflow,
    filename: `${slugify(name, "workflow")}.json`,
    meta: {
      node_types: nodeTypes,
      trigger_types: nodeTypes.filter((t) => t.startsWith("trigger.")),
      required_automations: [...new Set([...bundled, ...unbundled])].sort(),
    },
    name,
    slug: slugify(name, "workflow"),
    description: typeof wf.description === "string" ? wf.description : "",
    version: null,
  };
}

function validateOrg(bytes: Uint8Array): ValidatedArtifact {
  const result = OrgDefSchema.safeParse(parseJson(bytes));
  if (!result.success) {
    const issue = result.error.issues[0];
    throw invalid(`Org JSON: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  const org = result.data;
  const topology = (org as Record<string, unknown>).topology;
  const slug = slugify(org.name, "org");
  return {
    contentType: CONTENT_TYPE.org,
    filename: `${slug}.json`,
    meta: { role_count: org.roles.length, topology: typeof topology === "string" ? topology : null },
    name: org.name,
    slug,
    description: org.goal,
    version: null,
  };
}

/** Validates an artifact for `kind` and derives its meta (400/413 on failure). */
export async function validateArtifact(kind: Kind, bytes: Uint8Array): Promise<ValidatedArtifact> {
  const max = MAX_ARTIFACT_BYTES[kind];
  if (bytes.byteLength > max) {
    throw new LibraryError(413, "too_large", `A ${kind} artifact can be at most ${max} bytes.`);
  }
  if (bytes.byteLength === 0) throw invalid("The file is empty.");
  if (kind === "automation") return validateAutomation(bytes);
  if (kind === "workflow") return validateWorkflow(bytes);
  return validateOrg(bytes);
}

/** Guesses the kind of a dropped file (web upload UI and seed script). */
export function guessKind(filename: string, bytes: Uint8Array): Kind | null {
  if (filename.toLowerCase().endsWith(".mpkg") || (bytes[0] === 0x50 && bytes[1] === 0x4b)) return "automation";
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
  if (!isObject(json)) return null;
  if (Array.isArray(json.nodes)) return "workflow";
  if (Array.isArray(json.roles)) return "org";
  return null;
}
