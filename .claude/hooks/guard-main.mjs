#!/usr/bin/env node
/**
 * Main branch guard (Claude Code PreToolUse hook on Bash).
 * Any push to main, merge into main, force push or `gh pr merge` stops and
 * asks for a yes before it runs.
 */
import { execSync } from "node:child_process";

let input = "";
for await (const chunk of process.stdin) input += chunk;

let command = "";
try {
  command = JSON.parse(input).tool_input?.command ?? "";
} catch {
  process.exit(0);
}

function currentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

const reasons = [];
// Split on shell separators so "cd x && git push" is still caught.
for (const part of command.split(/&&|\|\||;|\|/)) {
  const tokens = part.trim().split(/\s+/);
  const gitIndex = tokens.indexOf("git");
  if (gitIndex !== -1) {
    const sub = tokens.slice(gitIndex + 1).filter((t) => !t.startsWith("-") || t.startsWith("--force") || t === "-f");
    const verb = sub[0];
    const args = sub.slice(1);
    if (verb === "push") {
      const toMain = args.some((a) => a === "main" || /(^|:)(refs\/heads\/)?main$/.test(a));
      const bare = args.filter((a) => !a.startsWith("-")).length <= 1;
      if (toMain || (bare && currentBranch() === "main")) reasons.push("pushes to main");
      if (args.some((a) => a.startsWith("--force") || a === "-f")) reasons.push("force pushes");
    }
    if (verb === "merge" && currentBranch() === "main") reasons.push("merges into main");
  }
  if (/\bgh\s+pr\s+merge\b/.test(part)) reasons.push("merges a pull request");
}

if (reasons.length) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: `This command ${[...new Set(reasons)].join(" and ")}. Main is the live site: confirm before it runs.`,
      },
    }),
  );
}
process.exit(0);
