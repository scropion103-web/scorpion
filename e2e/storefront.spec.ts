import { expect, test } from "@playwright/test";

test.describe("storefront", () => {
  test("root redirects to Arabic RTL", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("حيث يبدأ العطر");
  });

  test("renders the seeded products and filters by tab", async ({ page }) => {
    await page.goto("/ar");
    const grid = page.locator("#product-grid");
    await expect(grid.getByTestId("product-card")).toHaveCount(12);
    await page.getByRole("tab", { name: "نيش" }).click();
    await expect(grid.getByTestId("product-card")).toHaveCount(3);
    await expect(page.getByRole("tab", { name: "نيش" })).toHaveAttribute("aria-selected", "true");
  });

  test("tabs support arrow-key navigation", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("tab", { name: "All" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Men", exact: true })).toBeFocused();
    await expect(page.getByRole("tab", { name: "Men", exact: true })).toHaveAttribute("aria-selected", "true");
  });

  test("switches to English LTR", async ({ page }) => {
    await page.goto("/ar");
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Where every scent");
  });

  test("size picker updates the price", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator("#product-grid").getByTestId("product-card").first();
    const price = card.locator("span.font-extrabold").first();
    const before = await price.textContent();
    await card.getByText("100 ml").click();
    await expect(price).not.toHaveText(before ?? "");
  });

  test("SEO files are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap:");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("/en");
  });

  test("unknown pages show the localized 404", async ({ page }) => {
    const res = await page.goto("/en/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});
