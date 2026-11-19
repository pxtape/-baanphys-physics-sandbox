import assert from "node:assert/strict";
import process from "node:process";
import { Buffer } from "node:buffer";
import { Console } from "node:console";
import { mkdir, readFile } from "node:fs/promises";
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
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      acceptDownloads: true,
    }),
    page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => void d.accept());
  await page.goto(base);
  await page.getByRole("heading", { name: "Free fall", exact: true }).waitFor();
  const ids = await page
    .locator("svg [data-body]")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-body")));
  const precise = "0.123456789123";
  await page.getByLabel("Position x", { exact: true }).fill(precise);
  await page.getByLabel("Position x", { exact: true }).press("Tab");
  if (process.argv.includes("--public-build")) {
    assert(
      await page.getByRole("button", { name: "Play simulation" }).isDisabled(),
    );
  } else {
    await page
      .getByLabel("Enable experimental preview in this teacher workspace")
      .check();
    await page.getByRole("button", { name: "Step simulation" }).click();
  }
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  await page.getByText("Saved locally · revision 1", { exact: true }).waitFor();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const exported = JSON.parse(await readFile(await (await dl).path(), "utf8"));
  assert.equal(exported.bodies[0].position.x, Number(precise));
  assert.equal(
    exported.bodies[0].position.y,
    4,
    "Save/export authored coordinates, not preview coordinates",
  );
  assert.equal(exported.identity.state, "saved");
  await page.reload();
  await page.getByRole("button", { name: "Saved scenes", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "Saved scenes" });
  await dialog.getByRole("button", { name: "Open", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(
    await page.getByLabel("Position x", { exact: true }).inputValue(),
    precise,
  );
  await page.getByLabel("Position x", { exact: true }).focus();
  await page.getByLabel("Position x", { exact: true }).press("Tab");
  assert.deepEqual(
    await page
      .locator("svg [data-body]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-body"))),
    ids,
  );
  await page.getByRole("button", { name: "Saved scenes", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Saved scenes" });
  await dialog.getByRole("button", { name: "Rename", exact: true }).click();
  await dialog.getByLabel("New scene name").fill("Competition lab");
  await dialog.getByRole("button", { name: "Save name", exact: true }).click();
  await dialog.getByText("Competition lab", { exact: true }).waitFor();
  await mkdir("docs/preview", { recursive: true });
  await page.screenshot({
    path: "docs/preview/scene-library.png",
    fullPage: true,
  });
  await dialog.getByRole("button", { name: "Close library" }).click();
  await page
    .getByRole("heading", { name: "Competition lab", exact: true })
    .waitFor();
  // A second tab writes a new head; the first must report a conflict, not overwrite it.
  const other = await context.newPage();
  other.on("dialog", (d) => void d.accept());
  await other.goto(base);
  await other
    .getByRole("button", { name: "Saved scenes", exact: true })
    .click();
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "Open", exact: true })
    .click();
  await other.getByLabel("Position y", { exact: true }).fill("5");
  await other.getByLabel("Position y", { exact: true }).press("Tab");
  await other
    .getByRole("button", { name: "Save locally", exact: true })
    .click();
  await other
    .getByText("Saved locally · revision 3", { exact: true })
    .waitFor();
  await page.getByLabel("Position y", { exact: true }).fill("6");
  await page.getByLabel("Position y", { exact: true }).press("Tab");
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "newer revision" }).waitFor();
  assert.equal(
    await page.getByLabel("Position y", { exact: true }).inputValue(),
    "6",
  );
  await other.close();
  // Invalid import preserves working properties and IDs.
  await page.getByLabel("Import Scene JSON file").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":999}'),
  });
  await page
    .getByRole("alert")
    .filter({ hasText: "Invalid Scene JSON" })
    .waitFor();
  assert.equal(
    await page.getByLabel("Position y", { exact: true }).inputValue(),
    "6",
  );
  await page.getByLabel("Import Scene JSON file").setInputFiles({
    name: "scene.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(exported)),
  });
  await page
    .getByText("Imported as a new unsaved local copy.", { exact: false })
    .waitFor();
  assert.equal(
    await page.getByLabel("Position x", { exact: true }).inputValue(),
    precise,
  );
  assert.equal(
    await page.getByLabel("Position y", { exact: true }).inputValue(),
    "4",
  );
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  await page.getByText("Saved locally · revision 1", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Saved scenes", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Saved scenes" });
  await dialog.getByRole("listitem").nth(1).waitFor();
  assert.equal(await dialog.getByRole("listitem").count(), 2);
  const row = dialog.getByRole("listitem").filter({ hasText: "Free fall" });
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await row
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await row.waitFor({ state: "hidden" });
  assert.equal(await dialog.getByRole("listitem").count(), 1);
  await dialog.getByRole("button", { name: "Close library" }).click();
  // Real browser storage failure, without deleting existing data or replacing the draft.
  await page.evaluate(() => {
    globalThis.__originalOpen = globalThis.IDBFactory.prototype.open;
    globalThis.IDBFactory.prototype.open = function () {
      throw new globalThis.DOMException("disabled for test", "SecurityError");
    };
  });
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "storage is unavailable" })
    .waitFor();
  assert.equal(
    await page.getByLabel("Position x", { exact: true }).inputValue(),
    precise,
  );
  await page.evaluate(() => {
    globalThis.IDBFactory.prototype.open = globalThis.__originalOpen;
    delete globalThis.__originalOpen;
  });
  assert.deepEqual(errors, []);
  console.log(
    process.argv.includes("--public-build")
      ? "PASS: production Save/Load/rename/delete/JSON/conflict/storage-error workflow; experimental playback remains disabled."
      : "PASS: save during preview preserves authored data; reload/load/IDs/full precision/rename/two-tab conflict/export/import/invalid-file/delete/storage-failure.",
  );
} finally {
  await browser.close();
}
