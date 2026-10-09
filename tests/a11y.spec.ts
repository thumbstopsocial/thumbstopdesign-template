import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { allPages } from "../lib/config";

/** axe on every page at desktop and mobile width. Fails on any serious or critical issue. */
for (const width of [1280, 390]) {
  for (const page of allPages) {
    test(`accessibility ${page.path} @ ${width}px`, async ({ page: p }) => {
      await p.setViewportSize({ width, height: 900 });
      await p.goto(page.path);
      const results = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      const summary = serious.map((v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}]`);
      expect(summary, summary.join("\n")).toEqual([]);
    });
  }
}
