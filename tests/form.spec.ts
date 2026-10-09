import { test, expect } from "@playwright/test";
import { config } from "../lib/config";
import { sampleFormValues } from "../lib/links";

/**
 * Fills in and submits the real contact form, as a person would, and waits
 * for the success message. On a preview with RESEND_TEST_RECIPIENT set to
 * delivered@resend.dev, this proves Resend accepted the email.
 */
test("contact form submits", async ({ page }) => {
  await page.goto(config.form.page);
  const form = page.getByTestId("contact-form");
  await expect(form).toBeVisible();
  const values = sampleFormValues(config.form.fields);
  for (const f of config.form.fields) {
    const input = form.locator(`[name="${f.name}"]`);
    if (f.type === "select") await input.selectOption(values[f.name]);
    else await input.fill(values[f.name]);
  }
  // Wait past the minimum fill time, as a person would take.
  await page.waitForTimeout(3500);
  const response = page.waitForResponse((r) => r.url().endsWith("/api/contact"));
  await form.locator('[type="submit"]').click();
  const res = await response;
  const body = await res.json();
  expect(res.status(), JSON.stringify(body)).toBe(200);
  expect(body.ok).toBe(true);
  await expect(page.getByTestId("form-success")).toBeVisible();
});
