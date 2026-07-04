import assert from "node:assert/strict";
import { chromium, type ConsoleMessage } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const allowedConsoleNoise = ["Download the React DevTools"];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message: ConsoleMessage) => {
    if (message.type() === "error" && !allowedConsoleNoise.some((text) => message.text().includes(text))) {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

const routes = [
  ["/command-center", "Command Center"],
  ["/fixtures", "Fixtures"],
  ["/fixtures/mp-demo-fixture-001", "Japan vs Croatia"],
  ["/signals", "Signals"],
  ["/proof-console", "Proof Console"],
  ["/replay-lab", "Replay Lab"],
  ["/audit-log", "Audit Log"],
  ["/settings", "Settings"],
] as const;

for (const [route, text] of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 10_000 });
  }

  await page.goto(`${baseUrl}/replay-lab`, { waitUntil: "networkidle" });
  await page.getByTitle("Start replay").click();
  await page.getByText("Replay running", { exact: false }).waitFor({ state: "visible", timeout: 10_000 });
  await page.getByTitle("Pause replay").click();
  await page.getByText("Replay paused", { exact: false }).waitFor({ state: "visible", timeout: 10_000 });
  await page.getByTitle("Reset replay").click();
  await page.getByText("Replay idle", { exact: false }).waitFor({ state: "visible", timeout: 10_000 });

  await page.goto(`${baseUrl}/signals`, { waitUntil: "networkidle" });
  await page.getByTitle("Acknowledge signal").first().click();
  await page.getByText("acknowledged", { exact: false }).first().waitFor({ state: "visible", timeout: 10_000 });

  await page.goto(`${baseUrl}/proof-console`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Verify" }).click();
  await page.getByText("Validation status:", { exact: false }).waitFor({ state: "visible", timeout: 10_000 });

  await page.goto(`${baseUrl}/command-center`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/matchproof-command-center.png", fullPage: true });

  const response = await page.goto(`${baseUrl}/api/health`, { waitUntil: "networkidle" });
  assert.equal(response?.ok(), true);
  const healthText = await page.locator("body").innerText();
  assert.equal(healthText.includes("\"ok\":true"), true);

  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(pageErrors, []);

  await browser.close();
  console.log("Browser smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
