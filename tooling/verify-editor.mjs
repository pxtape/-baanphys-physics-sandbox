import assert from "node:assert/strict";
import process from "node:process";
import { Console } from "node:console";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
const console = new Console(process.stdout, process.stderr);
const base =
  process.env.EDITOR_TEST_URL ??
  "http://127.0.0.1:5173/-baanphys-physics-sandbox/";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BAANPHYS_CHROMIUM_PATH ?? "/usr/bin/chromium",
});
const errors = [];
try {
  if (process.argv.includes("--public-build")) {
    const page = await browser.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page
      .getByRole("heading", { name: "Free fall", exact: true })
      .waitFor();
    assert(
      await page.getByRole("button", { name: "Play simulation" }).isDisabled(),
    );
    assert.equal(await page.getByRole("checkbox").count(), 0);
    await page
      .getByRole("button", { name: "Rectangle", exact: false })
      .filter({ has: page.locator(".plus") })
      .click();
    assert.equal(await page.locator("svg [data-body]").count(), 3);
    await page.goto(base + "?mode=student");
    await page
      .getByRole("heading", { name: "Student playback is not available yet." })
      .waitFor();
    assert.deepEqual(errors, []);
    console.log(
      "PASS: default production build permits authoring, disables experimental playback and blocks student surface.",
    );
  } else {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1050 },
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page
      .getByRole("heading", { name: "Free fall", exact: true })
      .waitFor();
    const play = page.getByRole("button", { name: "Play simulation" }),
      step = page.getByRole("button", { name: "Step simulation" }),
      clock = page.getByLabel("Elapsed simulation time");
    await page
      .getByLabel("Preview model", { exact: true })
      .selectOption("free-flight");
    assert(await play.isDisabled(), "Preview must require opt-in");
    await page
      .getByRole("button", { name: "Circle", exact: false })
      .filter({ has: page.locator(".plus") })
      .click();
    await page
      .getByRole("button", { name: "Rectangle", exact: false })
      .filter({ has: page.locator(".plus") })
      .click();
    await page
      .getByRole("button", { name: "Static floor", exact: false })
      .click();
    assert.equal(await page.locator("svg [data-body]").count(), 5);
    await page
      .getByRole("button", { name: "Select Rectangle", exact: true })
      .click();
    await page.getByLabel("Mass", { exact: true }).fill("2");
    await page.getByLabel("Mass", { exact: true }).press("Tab");
    assert.equal(
      await page.getByLabel("Mass", { exact: true }).inputValue(),
      "2",
    );
    await page.getByLabel("Width", { exact: true }).fill("-1");
    await page.getByLabel("Width", { exact: true }).press("Tab");
    await page.getByRole("alert").waitFor();
    assert.equal(
      await page.getByLabel("Width", { exact: true }).inputValue(),
      "1.2",
    );
    const rect = page.getByRole("button", {
        name: "Select Rectangle",
        exact: true,
      }),
      box = await rect.boundingBox();
    const beforeX = Number(
      await page.getByLabel("Position x", { exact: true }).inputValue(),
    );
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 70,
      box.y + box.height / 2 - 20,
      { steps: 8 },
    );
    await page.mouse.up();
    assert(
      Number(
        await page.getByLabel("Position x", { exact: true }).inputValue(),
      ) >
        beforeX + 0.5,
      "Drag must change authored SI coordinates",
    );
    await rect.focus();
    const beforeY = Number(
      await page.getByLabel("Position y", { exact: true }).inputValue(),
    );
    await page.keyboard.press("ArrowUp");
    assert(
      Math.abs(
        Number(
          await page.getByLabel("Position y", { exact: true }).inputValue(),
        ) -
          beforeY -
          0.1,
      ) < 1e-8,
    );
    await page.getByLabel("Scene example").selectOption("projectile");
    const ids = await page
      .locator("svg [data-body]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-body")));
    await page
      .getByLabel("Enable experimental preview in this teacher workspace")
      .check();
    await step.click();
    assert.equal(await clock.textContent(), "0.008 s");
    assert(await page.getByLabel("Position x", { exact: true }).isDisabled());
    assert.equal(
      await page.getByLabel("Position x", { exact: true }).inputValue(),
      "-3",
    );
    await play.click();
    await page.waitForTimeout(180);
    await page.getByRole("button", { name: "Pause simulation" }).click();
    const paused = await clock.textContent();
    await page.waitForTimeout(100);
    assert.equal(await clock.textContent(), paused);
    assert(parseFloat(paused) > 0.008);
    await page.getByRole("button", { name: "Reset simulation" }).click();
    assert.equal(await clock.textContent(), "0.000 s");
    assert.equal(
      await page.getByLabel("Position x", { exact: true }).inputValue(),
      "-3",
    );
    assert.deepEqual(
      await page
        .locator("svg [data-body]")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-body"))),
      ids,
    );
    await play.click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Stopped before possible contact" })
      .waitFor({ timeout: 5000 });
    assert(
      await page.getByRole("button", { name: "Play simulation" }).isDisabled(),
    );
    await page.getByRole("button", { name: "Reset simulation" }).click();
    await page.getByLabel("Gravity y", { exact: true }).fill("-8");
    await page.getByLabel("Gravity y", { exact: true }).press("Tab");
    assert.equal(
      await page.getByLabel("Gravity y", { exact: true }).inputValue(),
      "-8",
    );
    await page
      .getByRole("button", { name: "Rectangle", exact: false })
      .filter({ has: page.locator(".plus") })
      .click();
    await mkdir("docs/preview", { recursive: true });
    await page.screenshot({
      path: "docs/preview/teacher-editor-desktop.png",
      fullPage: true,
    });
    await page.evaluate((url) => {
      const iframe = globalThis.document.createElement("iframe");
      iframe.id = "student-check";
      iframe.src = url;
      globalThis.document.body.append(iframe);
    }, base);
    await page
      .frameLocator("#student-check")
      .getByRole("heading", { name: "Student playback is not available yet." })
      .waitFor();
    await page.locator("#student-check").evaluate((n) => n.remove());
    await page.goto(base + "?mode=student");
    await page
      .getByRole("heading", { name: "Student playback is not available yet." })
      .waitFor();
    assert.equal(await page.locator("svg").count(), 0);
    const tablet = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 1,
    });
    const touch = await tablet.newPage();
    await touch.addInitScript(() => {
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        value: undefined,
      });
    });
    touch.on("pageerror", (e) => errors.push(e.message));
    await touch.goto(base);
    await touch
      .getByRole("heading", { name: "Free fall", exact: true })
      .waitFor();
    await touch
      .getByRole("button", { name: "Rectangle", exact: false })
      .filter({ has: touch.locator(".plus") })
      .tap();
    const target = await touch
      .getByRole("button", { name: "Select Rectangle", exact: true })
      .boundingBox();
    const cdp = await tablet.newCDPSession(touch);
    const x = target.x + target.width / 2,
      y = target.y + target.height / 2;
    const startX = Number(
      await touch.getByLabel("Position x", { exact: true }).inputValue(),
    );
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + 40, y: y - 20 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    assert(
      Number(
        await touch.getByLabel("Position x", { exact: true }).inputValue(),
      ) > startX,
      "Touch pointer drag updates SI position",
    );
    assert(
      await touch.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth <=
          globalThis.innerWidth,
      ),
      "Tablet must not overflow horizontally",
    );
    await touch.screenshot({
      path: "docs/preview/teacher-editor-tablet.png",
      fullPage: true,
    });
    await tablet.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS: create/select/drag/keyboard/properties/validation/gravity/step/play/pause/reset/contact stop/IDs/iframe/student lockout/tablet touch. Chromium only, not real Safari/iPad.",
    );
  }
} finally {
  await browser.close();
}
