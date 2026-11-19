import assert from "node:assert/strict";
import process from "node:process";
import { Console } from "node:console";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
const console = new Console(process.stdout, process.stderr);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BAANPHYS_CHROMIUM_PATH ?? "/usr/bin/chromium",
});
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    process.env.EDITOR_TEST_URL ??
      "http://127.0.0.1:5173/-baanphys-physics-sandbox/",
  );
  await page.getByRole("heading", { name: "Free fall", exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("Preview model", { exact: true }).inputValue(),
    "collisions",
  );
  await page
    .getByText("Experimental physics · collision accuracy is NOT certified", {
      exact: true,
    })
    .waitFor();
  const play = page.getByRole("button", { name: "Play simulation" });
  assert(await play.isDisabled());
  await page.getByLabel("Restitution", { exact: true }).fill(".8");
  await page.getByLabel("Restitution", { exact: true }).press("Tab");
  await page
    .getByLabel("Enable experimental preview in this teacher workspace")
    .check();
  await play.click();
  async function resumeAfterSchedulingPause() {
    const playButton = page.getByRole("button", { name: "Play simulation" });
    if (await playButton.isVisible()) {
      const messages = await page.getByRole("alert").allTextContents();
      assert(
        messages.some((m) => m.startsWith("Preview paused")),
        `Unexpected stop: ${messages.join("; ")}`,
      );
      await playButton.click();
    }
  }
  let falling = false,
    bounced = false;
  for (let i = 0; i < 160; i++) {
    await page.waitForTimeout(40);
    await resumeAfterSchedulingPause();
    const vy = parseFloat(
      await page.locator(".live-readout dd").nth(3).innerText(),
    );
    if (vy < -1) falling = true;
    if (falling && vy > 1) {
      bounced = true;
      break;
    }
  }
  assert(bounced, "Real solver rebound must reach the live readout");
  assert.equal(await page.getByRole("alert").count(), 0);
  await page.getByRole("button", { name: "Pause simulation" }).click();
  assert.equal(
    await page.getByLabel("Position y", { exact: true }).inputValue(),
    "4",
    "Preview must not overwrite authored position",
  );
  await page.getByRole("button", { name: "Reset simulation" }).click();
  await page.getByLabel("Scene example").selectOption("collision");
  assert.equal(await page.locator("svg [data-body]").count(), 3);
  await page.getByRole("button", { name: "Play simulation" }).click();
  let reversed = false;
  for (let i = 0; i < 160; i++) {
    await page.waitForTimeout(40);
    await resumeAfterSchedulingPause();
    if (
      parseFloat(await page.locator(".live-readout dd").nth(2).innerText()) <
      -0.5
    ) {
      reversed = true;
      break;
    }
  }
  assert(reversed, "Circle A must reverse after body contact");
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await page.getByRole("button", { name: "Reset simulation" }).click();
  await page.getByLabel("Scene example").selectOption("sliding");
  await page.getByLabel("Width", { exact: true }).fill("1.4");
  await page.getByLabel("Width", { exact: true }).press("Tab");
  assert.equal(
    await page.getByLabel("Width", { exact: true }).inputValue(),
    "1.4",
  );
  await page.getByLabel("Friction", { exact: true }).fill(".7");
  await page.getByLabel("Friction", { exact: true }).press("Tab");
  await page.getByRole("button", { name: "Play simulation" }).click();
  let slowed = false;
  for (let i = 0; i < 160; i++) {
    await page.waitForTimeout(40);
    await resumeAfterSchedulingPause();
    if (
      Math.abs(
        parseFloat(await page.locator(".live-readout dd").nth(2).innerText()),
      ) < 0.2
    ) {
      slowed = true;
      break;
    }
  }
  assert(slowed, "Sliding block must slow under native friction");
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await page.getByRole("button", { name: "Reset simulation" }).click();
  await page.getByLabel("Scene example").selectOption("free-fall");
  await page.getByLabel("Angular velocity", { exact: true }).fill("2");
  await page.getByLabel("Angular velocity", { exact: true }).press("Tab");
  await page.getByRole("button", { name: "Step simulation" }).click();
  const transform = await page
    .getByRole("button", { name: "Select Circle", exact: true })
    .getAttribute("transform");
  assert(!transform.endsWith("rotate(0)"), "Native angle must be rendered");
  await page.getByRole("button", { name: "Reset simulation" }).click();
  await page.getByLabel("Scene example").selectOption("collision");
  await page
    .getByRole("button", { name: "Rectangle", exact: false })
    .filter({ has: page.locator(".plus") })
    .click();
  await mkdir("docs/preview", { recursive: true });
  await page.screenshot({
    path: "docs/preview/experimental-collisions.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: UI floor rebound, body collision, sliding friction, restitution/resize/spin editing, solver angle rendering, authored-state isolation and experimental labels.",
  );
} finally {
  await browser.close();
}
