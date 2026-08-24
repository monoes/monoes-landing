import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/projects") {
      return {
        url: "data:text/javascript,export const projects = [{ id: 'p1', name: 'Monomind', slug: 'monomind', tagline: 'tag', description: 'desc', repo: 'https://github.com/monoes/monomind', language: 'TS', accent: '', number: '01', features: [], install: [] }];",
        shortCircuit: true,
      };
    }
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { registerWebMcpTools } = await import("./register-tools.ts");

describe("registerWebMcpTools", () => {
  it("does nothing when navigator.modelContext is unavailable", () => {
    Object.defineProperty(globalThis, "navigator", { value: {}, configurable: true });
    assert.doesNotThrow(() => registerWebMcpTools());
  });

  it("registers a list_projects tool that returns real project data as JSON text", () => {
    const registerTool = mock.fn();
    Object.defineProperty(globalThis, "navigator", { value: { modelContext: { registerTool } }, configurable: true });

    registerWebMcpTools();

    assert.equal(registerTool.mock.calls.length, 1);
    const tool = registerTool.mock.calls[0].arguments[0];
    assert.equal(tool.name, "list_projects");
    assert.equal(tool.inputSchema.type, "object");
    assert.deepEqual(tool.inputSchema.required, []);

    const result = tool.execute();
    const projects = JSON.parse(result.content[0].text);
    assert.equal(projects.length, 1);
    assert.equal(projects[0].name, "Monomind");
    assert.equal(projects[0].repo, "https://github.com/monoes/monomind");
  });
});
