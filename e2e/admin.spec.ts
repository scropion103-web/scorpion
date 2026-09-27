import { expect, test } from "@playwright/test";

const EMAIL = process.env.ADMIN_EMAIL ?? "admin@perfumecafe.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

test.describe("admin", () => {
  test("redirects to login when signed out", async ({ page }) => {
    await page.goto("/en/admin");
    await expect(page).toHaveURL(/\/en\/admin\/login/);
  });

  test("rejects a wrong password", async ({ page }) => {
    await page.goto("/en/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    // scope to the form: Next.js also renders an empty role="alert" route announcer
    await expect(page.locator("form").getByRole("alert")).toContainText("Incorrect email or password");
  });

  test("signs in and navigates the dashboard", async ({ page }) => {
    await page.goto("/en/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en\/admin$/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

    await page.goto("/en/admin/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();

    await page.goto("/en/admin/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.locator("tbody tr")).not.toHaveCount(0);

    await page.goto("/en/admin/coupons");
    await expect(page.getByText("WELCOME15").first()).toBeVisible();

    await page.goto("/en/admin/settings");
    await expect(page.getByRole("heading", { name: "Store settings" })).toBeVisible();
  });
});
