import { test, expect } from "@playwright/test";
import { CONSENT_KEY } from "../components/system/consent-key";

/**
 * Consent Mode defaults must be set to denied before anything else runs, and
 * the banner must store and apply the visitor's choice.
 */
test("consent defaults are denied before GTM", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const first = await page.evaluate(() => Array.from((window.dataLayer?.[0] ?? []) as ArrayLike<unknown>));
  expect(first[0]).toBe("consent");
  expect(first[1]).toBe("default");
  expect(first[2]).toMatchObject({ ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  expect(errors).toEqual([]);
});

test("banner stores the choice and can be reopened", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("region", { name: "Cookie consent" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Reject" }).click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe("denied");

  await page.getByRole("button", { name: "Cookie settings" }).click();
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Accept" }).click();
  expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe("granted");

  await page.reload();
  await expect(banner).toBeHidden();
  const updated = await page.evaluate(() =>
    (window.dataLayer ?? []).some((e) => {
      const a = Array.from(e as ArrayLike<unknown>);
      return a[0] === "consent" && a[1] === "update" && (a[2] as Record<string, string>).analytics_storage === "granted";
    }),
  );
  expect(updated).toBe(true);
});
