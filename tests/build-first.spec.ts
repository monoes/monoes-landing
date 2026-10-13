import { test, expect, type Page } from "@playwright/test";

// Analytics and font hosts are third-party; block them so the page `load` event never waits on the network.
test.beforeEach(async ({ context, baseURL }) => {
  const origin = new URL(baseURL ?? "http://localhost:3000").origin;
  await context.route(
    (url) => url.origin !== origin,
    (route) => route.abort(),
  );
});

const PAGES = [
  { path: "/build-first/companies", h1: /Modernize your stack/, audience: "companies" },
  { path: "/build-first/startups", h1: /Ship your product/, audience: "startups" },
] as const;

for (const { path, h1 } of PAGES) {
  test.describe(path, () => {
    test("renders every required section in the server HTML", async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
      for (const name of [
        "How the offer works",
        "How the Acceptance Spec works",
        "Who it is for",
        "Who it is not for",
        "Questions we expect",
        "Apply for a build slot",
        "What you can verify today",
      ]) {
        await expect(page.getByRole("heading", { name })).toBeVisible();
      }
      await expect(page.getByRole("table")).toBeVisible();
      await expect(page.getByRole("link", { name: "Terms apply" }).first()).toHaveAttribute("href", "/build-first/terms");
      await context.close();
    });

    test("has SEO and Open Graph metadata", async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(/Build First/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
    });

    test("has no horizontal scroll on mobile and desktop", async ({ page }) => {
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `width ${width}`).toBeLessThanOrEqual(clientWidth + 1);
      }
    });

    test("shows field errors from the server when the form is submitted empty", async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: "Apply for a build slot" }).click();
      await expect(page.getByRole("alert").getByText("Please fix the highlighted fields.")).toBeVisible();
      await expect(page.locator("#email-error")).toBeVisible();
      await expect(page.locator("#consent-error")).toBeVisible();
    });

    test("never claims anything it must not", async ({ page }) => {
      await page.goto(path);
      const body = (await page.locator("main").innerText()).toLowerCase();
      for (const banned of ["guarantee", "100% free", "testimonial", "as seen in"]) {
        expect(body).not.toContain(banned);
      }
    });
  });
}

async function fillCompanyForm(page: Page) {
  await page.goto("/build-first/companies");
  await page.getByLabel("What do you want built?").selectOption("modernize");
  await page.getByLabel("Your name").fill("Test Applicant");
  await page.getByLabel("Work email").fill("applicant@example.com");
  await page.getByLabel("Your role").fill("Head of Operations");
  await page.getByLabel("Company", { exact: true }).fill("Example GmbH");
  await page.getByLabel("Country of registration").fill("Germany");
  await page.getByLabel("Company size").selectOption("50-249");
  await page.getByLabel("Budget you could agree if the build passes").selectOption("50k-150k");
  await page.getByLabel("How would you expect to pay if the build meets your Spec?").selectOption("cash");
  await page
    .getByLabel("What should we build, and what outcome means success?")
    .fill("Move our legacy PHP monolith to a modern stack with identical behaviour and better performance.");
  await page.getByLabel("A decision maker can join the Spec call and answer questions within two business days.").check();
  await page.getByLabel(/I agree that Monoes may contact me/).check();
}

test.describe("application form", () => {
  test("a complete application is stored and confirmed", async ({ page }) => {
    await fillCompanyForm(page);
    await page.getByRole("button", { name: "Apply for a build slot" }).click();
    await expect(page.getByRole("status")).toContainText("Application received");
  });

  test("a short description is rejected with a field error", async ({ page }) => {
    await fillCompanyForm(page);
    await page.getByLabel("What should we build, and what outcome means success?").fill("too short");
    await page.getByRole("button", { name: "Apply for a build slot" }).click();
    await expect(page.locator("#description-error")).toContainText("at least 40 characters");
  });

  test("the API rejects invalid and oversized payloads", async ({ request }) => {
    const bad = await request.post("/api/build-first/apply", { data: { email: "nope" } });
    expect(bad.status()).toBe(400);
    const notJson = await request.post("/api/build-first/apply", { data: "{oops", headers: { "content-type": "text/plain" } });
    expect(notJson.status()).toBe(400);
    const big = await request.post("/api/build-first/apply", { data: "x".repeat(25_000), headers: { "content-type": "text/plain" } });
    expect(big.status()).toBe(413);
  });
});

test.describe("terms and sitemap", () => {
  test("terms page renders and states the Build Fee condition", async ({ page }) => {
    await page.goto("/build-first/terms");
    await expect(page.getByRole("heading", { level: 1, name: "Build First terms" })).toBeVisible();
    await expect(page.getByText("a Build Fee applies").first()).toBeVisible();
  });

  test("sitemap lists both landing pages and the terms", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const xml = await res.text();
    for (const p of ["/build-first/companies", "/build-first/startups", "/build-first/terms"]) {
      expect(xml).toContain(p);
    }
  });
});
