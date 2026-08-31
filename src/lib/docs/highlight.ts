export type Lang = "bash" | "js" | "json" | "text";

type Rule = { pattern: RegExp; className: string };

const BASH_RULES: Rule[] = [
  { pattern: /#.*$/, className: "text-ivory/40" },
  { pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, className: "text-gold" },
  { pattern: /\B--?[A-Za-z][\w-]*/, className: "text-gold-warm" },
  { pattern: /^\s*[a-z][\w.-]*(?=\s)/, className: "text-ivory" },
];

const JSON_RULES: Rule[] = [
  { pattern: /"(?:[^"\\]|\\.)*"(?=\s*:)/, className: "text-gold-warm" },
  { pattern: /"(?:[^"\\]|\\.)*"/, className: "text-gold" },
  { pattern: /\b(?:true|false|null)\b/, className: "text-gold-muted" },
  { pattern: /-?\b\d+(?:\.\d+)?\b/, className: "text-gold-muted" },
];

const JS_RULES: Rule[] = [
  { pattern: /\/\/.*$/, className: "text-ivory/40" },
  { pattern: /`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, className: "text-gold" },
  {
    pattern:
      /\b(?:const|let|var|function|async|await|return|new|typeof|if|else|for|while|import|export|from|of|in)\b/,
    className: "text-gold-warm",
  },
  { pattern: /-?\b\d+(?:\.\d+)?\b/, className: "text-gold-muted" },
];

const RULES: Record<Lang, Rule[]> = { bash: BASH_RULES, json: JSON_RULES, js: JS_RULES, text: [] };

export function inferLang(label: string | undefined, code: string): Lang {
  if (label?.endsWith(".js")) return "js";
  if (label === "curl") return "bash";
  const trimmed = code.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  return "text";
}

export type Token = { text: string; className?: string };

// Single combined pass per line: at each position, try every rule (in
// priority order) anchored with "y" (sticky) semantics via lastIndex, take
// the earliest/highest-priority match, emit it, then continue scanning.
export function highlight(code: string, lang: Lang): Token[] {
  const rules = RULES[lang];
  const lines = code.split("\n");
  const tokens: Token[] = [];

  lines.forEach((line, i) => {
    let pos = 0;
    while (pos < line.length) {
      let best: { index: number; length: number; className: string } | null = null;
      for (const rule of rules) {
        const re = new RegExp(rule.pattern.source, rule.pattern.flags.replace("g", "") + "g");
        re.lastIndex = pos;
        const m = re.exec(line);
        if (m && m.index === pos && (best === null || m[0].length > best.length)) {
          best = { index: m.index, length: m[0].length, className: rule.className };
        }
      }
      if (best) {
        tokens.push({ text: line.slice(pos, pos + best.length), className: best.className });
        pos += best.length;
        continue;
      }
      // No rule matched at this exact position — find the nearest upcoming match to bound plain text.
      let nextIndex = line.length;
      for (const rule of rules) {
        const re = new RegExp(rule.pattern.source, rule.pattern.flags.replace("g", "") + "g");
        re.lastIndex = pos;
        const m = re.exec(line);
        if (m && m.index < nextIndex) nextIndex = m.index;
      }
      tokens.push({ text: line.slice(pos, nextIndex) });
      pos = nextIndex;
    }
    if (i < lines.length - 1) tokens.push({ text: "\n" });
  });

  return tokens;
}
