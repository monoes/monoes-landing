import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeMpkg } from "./helpers/make-zip";
import { registerAndOnboard, unique } from "./helpers/library-auth";

test("upload an automation on the web, see it in My library, get the install command, make it public, delete it", async ({ page }) => {
  await registerAndOnboard(page);
  const id = unique("web-");
  const dir = mkdtempSync(join(tmpdir(), "library-e2e-"));
  const file = join(dir, `${id}.mpkg`);
  writeFileSync(file, makeMpkg({ id, name: `Web ${id}` }));

  await page.goto("/library/upload");
  await page.getByTestId("library-file").setInputFiles(file);
  await expect(page.getByText("Web automation", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "Upload", exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`/library/automations/${id}$`));
  await expect(page.getByRole("heading", { name: `Web ${id}` })).toBeVisible();
  await expect(page.getByText("private", { exact: true })).toBeVisible();
  await expect(page.getByText("demo.example")).toBeVisible();

  await page.getByRole("button", { name: "Add to MonoAgent" }).click();
  const command = await page.getByTestId("install-command").textContent();
  expect(command).toMatch(/^monoagentcli library install automation [0-9a-f-]{36}$/);

  await page.goto("/library?tab=mine");
  await expect(page.getByText(`Web ${id}`)).toBeVisible();
  await page.goto(`/library?q=${id}`);
  await expect(page.getByText("Nothing matches")).toBeVisible();

  await page.goto(`/library/automations/${id}`);
  await page.getByLabel("Visibility").selectOption("public");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved.");
  await page.goto(`/library?tab=automations&q=${id}`);
  await expect(page.getByText(`Web ${id}`)).toBeVisible();

  await page.goto(`/library/automations/${id}`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page).toHaveURL(/\/library\?tab=mine$/);
  const gone = await page.request.get(`/library/automations/${id}`);
  expect(gone.status()).toBe(404);
});

test("the library is browsable without logging in", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Library" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in to upload" })).toBeVisible();
  await page.getByRole("link", { name: "Orgs" }).click();
  await expect(page.getByRole("link", { name: "community org gallery" })).toBeVisible();
  await page.goto("/library?tab=mine");
  await expect(page.getByText("to see your private and published items")).toBeVisible();
});
