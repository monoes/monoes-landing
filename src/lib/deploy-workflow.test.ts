import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The Cloudflare token in this workflow deploys code to monoes.me, and what monoes.me signs is
// what every mono-agent install trusts. Pull requests build and test; only main deploys.
const text = readFileSync(new URL("../../.github/workflows/deploy.yml", import.meta.url), "utf8");

// The text of each top-level job, keyed by job id (jobs sit at two-space indentation).
function jobs(): Record<string, string> {
  const out: Record<string, string> = {};
  let current = "";
  for (const line of text.slice(text.indexOf("\njobs:\n") + 7).split("\n")) {
    const header = line.match(/^  ([A-Za-z][\w-]*):\s*$/);
    if (header) out[(current = header[1])] = "";
    else if (current) out[current] += `${line}\n`;
  }
  return out;
}

describe(".github/workflows/deploy.yml", () => {
  const { check, deploy } = jobs();

  it("triggers only on a push to main, a pull request to main and a manual run", () => {
    const on = text.slice(text.indexOf("\non:\n") + 1).split("\n").slice(1).join("\n").split(/\n(?=\S)/)[0];
    assert.deepEqual([...on.matchAll(/^  ([a-z_]+):/gm)].map((m) => m[1]).sort(), ["pull_request", "push", "workflow_dispatch"], "the triggers are push, pull_request and workflow_dispatch, no others");
    assert.match(on, /push:\n\s+branches: \[main\]/, "a push triggers it on main only");
  });

  it("builds and tests every event, in a job that holds no Cloudflare credentials", () => {
    assert.ok(check, "a `check` job exists");
    assert.ok(!check.includes("if:"), "check has no condition: it runs for pull requests too");
    assert.match(check, /run: npm test\b/, "check runs the tests");
    assert.match(check, /opennextjs\/cloudflare build/, "check builds the site");
    assert.ok(!/wrangler|CLOUDFLARE|secrets\./.test(check), "check holds no Cloudflare credential");
  });

  it("deploys from the deploy job only, after check, and only for main", () => {
    assert.ok(deploy, "a `deploy` job exists");
    assert.match(deploy, /^ {4}needs: check\s*$/m, "deploy needs check, at job level");
    const condition = deploy.match(/^ {4}if: (.+)$/m)?.[1] ?? "";
    assert.equal(condition, "github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')", "deploy runs for a push or a manual run on main only");
    assert.ok(!condition.includes("pull_request"), "a pull request never deploys");
    assert.equal(text.match(/wrangler deploy/g)?.length, 1, "wrangler deploy appears once");
    assert.equal(text.match(/secrets\.CLOUDFLARE_API_TOKEN/g)?.length, 1, "the Cloudflare token is used once");
    assert.ok(deploy.includes("wrangler deploy") && deploy.includes("CLOUDFLARE_API_TOKEN"), "the one use is in the deploy job");
  });

  it("reads the repository with the workflow token and gives check no permissions of its own", () => {
    assert.match(text, /^permissions:\n {2}contents: read\n/m, "the top-level permissions are contents: read");
    assert.ok(!/^ {4}permissions:/m.test(check), "check takes the read-only permissions of the top level");
  });
});
