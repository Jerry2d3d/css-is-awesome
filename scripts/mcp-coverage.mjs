#!/usr/bin/env node
// ============================================================================
// mcp-coverage.mjs
// ============================================================================
// Call-and-assert coverage for every MCP tool (story F5.2).
//
// Spawns mcp/server.cjs over stdio exactly as a client would, enumerates the
// tools it advertises, calls every one, and asserts each returns usable
// content rather than an error.
//
// Arguments are DISCOVERED, not hardcoded: `list_mixins` supplies the name fed
// to `get_mixin`, `list_themes` supplies `get_theme`, and so on. That keeps the
// suite from rotting the moment a mixin is renamed — the failure it should
// report is "the tool broke", not "the fixture went stale".
//
// A tool advertised by tools/list but not exercised here counts as UNCOVERED
// and lowers the percentage, so adding a tool without a test is visible.
//
// Usage: node scripts/mcp-coverage.mjs [--threshold=98]
// ============================================================================

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = path.join(ROOT, "mcp", "server.cjs");
const threshold = Number(
  (process.argv.slice(2).find((a) => a.startsWith("--threshold=")) || "--threshold=98").split("=")[1],
);

// ─── Minimal stdio JSON-RPC client ──────────────────────────────────────────
function client() {
  const proc = spawn(process.execPath, [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
  const pending = new Map();
  let buf = "";
  let id = 0;

  proc.stdout.on("data", (d) => {
    buf += d.toString();
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        const r = pending.get(msg.id);
        if (r) {
          pending.delete(msg.id);
          r(msg);
        }
      } catch {
        /* server may log non-JSON to stdout; ignore */
      }
    }
  });

  const send = (method, params) =>
    new Promise((resolve, reject) => {
      const myId = ++id;
      pending.set(myId, resolve);
      proc.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: myId, method, params })}\n`);
      setTimeout(() => {
        if (pending.has(myId)) {
          pending.delete(myId);
          reject(new Error(`timeout: ${method} ${JSON.stringify(params?.name ?? "")}`));
        }
      }, 20000);
    });

  return { send, kill: () => proc.kill() };
}

const c = client();
const results = [];

function text(res) {
  return res?.result?.content?.[0]?.text ?? "";
}

function record(name, ok, why) {
  results.push({ name, ok, why });
}

/** Call a tool and assert it returned usable, non-error content. */
async function call(name, args = {}, extra) {
  try {
    const res = await c.send("tools/call", { name, arguments: args });
    const body = text(res);
    if (res?.result?.isError) return record(name, false, `isError: ${body.slice(0, 80)}`);
    if (!body || body.length < 2) return record(name, false, "empty response body");
    if (extra) {
      const problem = extra(body);
      if (problem) return record(name, false, problem);
    }
    record(name, true);
    return body;
  } catch (err) {
    record(name, false, err.message);
    return "";
  }
}

/**
 * Identifier of the first item in a list_* payload, used to drive get_*.
 * Families don't agree on the key — mixins/themes/tokens use `name`, while
 * animations use `slug` — so accept either rather than special-casing.
 */
function firstName(body) {
  try {
    const item = JSON.parse(body).items?.[0];
    return item?.name ?? item?.slug ?? item?.id ?? null;
  } catch {
    return null;
  }
}

try {
  await c.send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "mcp-coverage", version: "1" },
  });

  const listed = await c.send("tools/list", {});
  const advertised = (listed?.result?.tools ?? []).map((t) => t.name).sort();

  // 1. list_* first — they feed everything else.
  const FAMILIES = ["themes", "mixins", "functions", "tokens", "animations", "components", "recipes"];
  const sample = {};
  for (const fam of FAMILIES) {
    const body = await call(`list_${fam}`, {}, (b) => {
      const p = JSON.parse(b);
      return typeof p.total === "number" && p.total > 0 ? null : `list_${fam} returned nothing`;
    });
    sample[fam] = firstName(body);
  }

  // 2. get_* driven by the discovered names.
  const GETTERS = {
    get_theme: "themes",
    get_mixin: "mixins",
    get_function: "functions",
    get_token: "tokens",
    get_animation: "animations",
    get_component: "components",
    get_recipe: "recipes",
  };
  for (const [tool, fam] of Object.entries(GETTERS)) {
    if (!sample[fam]) {
      record(tool, false, `no sample name from list_${fam}`);
      continue;
    }
    await call(tool, { name: sample[fam] }, (b) =>
      b.includes(sample[fam]) ? null : `payload does not mention '${sample[fam]}'`,
    );
  }

  // 3. search_* — query with a prefix of a known name so a hit is guaranteed.
  const SEARCHERS = {
    search_themes: "themes",
    search_mixins: "mixins",
    search_functions: "functions",
    search_tokens: "tokens",
    search_components: "components",
  };
  for (const [tool, fam] of Object.entries(SEARCHERS)) {
    const q = (sample[fam] || "a").slice(0, 3);
    await call(tool, { query: q }, (b) => {
      const p = JSON.parse(b);
      return (p.total ?? p.items?.length ?? 0) > 0 ? null : `no hits for '${q}'`;
    });
  }

  // 4. Doc readers — must return a real file body.
  for (const tool of advertised.filter((t) => t.startsWith("read_"))) {
    await call(tool, {}, (b) => {
      try {
        const p = JSON.parse(b);
        if (p.exists === false) return `${p.path} does not exist in the package`;
        if (!p.body || p.body.length < 50) return "body too short to be a real doc";
        return null;
      } catch {
        return b.length > 50 ? null : "unparseable, too short";
      }
    });
  }

  // 5. Helpers.
  await call("resolve_size", { px: 17 }, (b) => (JSON.parse(b).px === 17 ? null : "did not echo px"));
  await call("assemble_prompt", { intent: "overview" }, (b) =>
    b.length > 100 ? null : "prompt suspiciously short",
  );
  if (sample.mixins) {
    await call("assemble_prompt", { intent: `mixin:${sample.mixins}` }, (b) =>
      b.includes(sample.mixins) ? null : "assembled prompt missing the requested mixin",
    );
  }

  // ─── Report ───────────────────────────────────────────────────────────────
  const tested = new Set(results.map((r) => r.name));
  const untested = advertised.filter((t) => !tested.has(t));
  for (const t of untested) record(t, false, "advertised by tools/list but never exercised");

  const passed = results.filter((r) => r.ok);
  // De-dupe: assemble_prompt is called twice.
  const byTool = new Map();
  for (const r of results) byTool.set(r.name, (byTool.get(r.name) ?? true) && r.ok);
  const okCount = [...byTool.values()].filter(Boolean).length;
  const pct = ((okCount / advertised.length) * 100).toFixed(1);

  console.log(`mcp-coverage — ${advertised.length} tools advertised\n`);
  console.log(`  covered   ${okCount}/${advertised.length}  (${pct}%)`);
  console.log(`  assertions ${passed.length}/${results.length} passed`);

  const failures = [...byTool.entries()].filter(([, ok]) => !ok);
  if (failures.length) {
    console.log(`\nFAILING:`);
    for (const [name] of failures) {
      const why = results.find((r) => r.name === name && !r.ok)?.why;
      console.log(`  ✗ ${name} — ${why}`);
    }
  }

  c.kill();
  if (Number(pct) < threshold) {
    console.error(`\nmcp-coverage FAILED — ${pct}% is below the ${threshold}% threshold.`);
    process.exit(1);
  }
  console.log(`\nmcp-coverage passed — ${pct}% ≥ ${threshold}%.`);
} catch (err) {
  c.kill();
  console.error(`mcp-coverage FAILED — ${err.message}`);
  process.exit(1);
}
