import { expect, test } from "@playwright/test";

test.describe("cart & checkout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("add to cart, drawer, persistence", async ({ page }) => {
    const card = page.locator("#product-grid").getByTestId("product-card").first();
    await card.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    await page.getByTestId("cart-button").click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId("cart-line")).toHaveCount(1);
    await drawer.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByTestId("cart-count")).toHaveText("2");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();

    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText("2");
  });

  test("validates the form, applies a coupon and places an order", async ({ page }) => {
    const card = page.locator("#product-grid").getByTestId("product-card").first();
    await card.getByRole("button", { name: "Buy now" }).click();

    const form = page.getByTestId("checkout-form");
    await form.getByTestId("submit-order").click();
    await expect(page.getByText("Enter your full name")).toBeVisible();
    await expect(page.getByText("Enter a valid phone number")).toBeVisible();

    // coupon
    await page.getByPlaceholder("Discount code").fill("welcome15");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByText("Code discount (WELCOME15)").first()).toBeVisible();

    await form.getByLabel("Full name").fill("Playwright Tester");
    await form.getByLabel("Phone number").fill("01012345678");
    await form.getByLabel("Full address").fill("Cairo, Nasr City, Street 10, Building 5");
    await form.getByText("Vodafone Cash", { exact: true }).click();
    await form.getByLabel("Suggestion to improve our service").fill("Great site!");
    await form.getByTestId("submit-order").click();

    await expect(page).toHaveURL(/\/en\/order\/PC-[A-Z0-9]+/, { timeout: 20_000 });
    await expect(page.getByTestId("order-ref")).toHaveText(/^PC-/);
    await expect(page.getByText("Complete your payment")).toBeVisible();
    await expect(page.getByTestId("proof-form")).toBeVisible();
    await expect(page.getByTestId("order-status")).toHaveText("Under review");
  });

  test("an invalid coupon is rejected", async ({ page }) => {
    await page.locator("#product-grid").getByTestId("product-card").first().getByRole("button", { name: "Add to cart" }).click();
    await page.getByPlaceholder("Discount code").fill("NOPE");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByRole("status").getByText("Invalid discount code")).toBeVisible();
  });
});
