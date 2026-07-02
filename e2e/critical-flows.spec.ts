import { test, expect } from "@playwright/test";

// Each test uses a unique title so tests don't collide on the shared in-memory server.
const uid = () => Date.now().toString(36);

test.describe("Critical user flows", () => {
  // ─── home page ────────────────────────────────────────────────────────────

  test("home page loads with brand and New form button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Lite Forms")).toBeVisible();
    await expect(page.getByRole("link", { name: "New form" })).toBeVisible();
  });

  // ─── form creation ────────────────────────────────────────────────────────

  test("created form immediately appears in the home page list", async ({
    page,
  }) => {
    const title = `Create test ${uid()}`;

    await page.goto("/forms/new");
    await page.fill('input[placeholder="Form title"]', title);
    await page.getByRole("button", { name: "+ Text" }).click();
    await page.fill('input[placeholder="Question"]', "Favourite color?");

    await page.getByRole("button", { name: "Save form" }).click();
    await page.waitForURL("/");

    await expect(page.getByText(title)).toBeVisible();
  });

  test("builder blocks saving when a question label is empty", async ({
    page,
  }) => {
    await page.goto("/forms/new");
    // Add a question but leave label empty
    await page.getByRole("button", { name: "+ Text" }).click();
    await page.getByRole("button", { name: "Save form" }).click();

    // Validation error appears, still on builder page
    await expect(page.getByText("Question label is required")).toBeVisible();
    expect(page.url()).toContain("/forms/new");
  });

  // ─── form fill → success ──────────────────────────────────────────────────

  test("fill text form → submit → success screen appears", async ({ page }) => {
    const title = `Fill test ${uid()}`;

    // Create form
    await page.goto("/forms/new");
    await page.fill('input[placeholder="Form title"]', title);
    await page.getByRole("button", { name: "+ Text" }).click();
    await page.fill('input[placeholder="Question"]', "Your name");
    await page.getByRole("button", { name: "Save form" }).click();
    await page.waitForURL("/");

    // Fill it out
    await page
      .locator("li", { hasText: title })
      .getByRole("link", { name: "Fill out" })
      .click();

    await page.fill('input[placeholder="Your answer"]', "Alice");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(
      page.getByText("Your response has been recorded.")
    ).toBeVisible();
  });

  test("required text field prevents empty submission and shows error", async ({
    page,
  }) => {
    const title = `Required test ${uid()}`;

    // Create form with a required text question
    await page.goto("/forms/new");
    await page.fill('input[placeholder="Form title"]', title);
    await page.getByRole("button", { name: "+ Text" }).click();
    await page.fill('input[placeholder="Question"]', "Mandatory question");
    // Check the Required checkbox inside the question card
    await page
      .locator("label", { hasText: "Required" })
      .first()
      .locator('input[type="checkbox"]')
      .check();
    await page.getByRole("button", { name: "Save form" }).click();
    await page.waitForURL("/");

    // Open fill page and submit without answering
    await page
      .locator("li", { hasText: title })
      .getByRole("link", { name: "Fill out" })
      .click();
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("This field is required")).toBeVisible();
    await expect(
      page.getByText("Your response has been recorded.")
    ).not.toBeVisible();
  });

  // ─── response visibility ─────────────────────────────────────────────────

  test("submitted response immediately appears on the responses page", async ({
    page,
  }) => {
    const title = `Responses test ${uid()}`;

    // Create form
    await page.goto("/forms/new");
    await page.fill('input[placeholder="Form title"]', title);
    await page.getByRole("button", { name: "+ Text" }).click();
    await page.fill('input[placeholder="Question"]', "City");
    await page.getByRole("button", { name: "Save form" }).click();
    await page.waitForURL("/");

    // Submit a response
    await page
      .locator("li", { hasText: title })
      .getByRole("link", { name: "Fill out" })
      .click();
    await page.fill('input[placeholder="Your answer"]', "Kyiv");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByText("Your response has been recorded.")
    ).toBeVisible();

    // Go to responses page and verify
    await page.goto("/");
    await page
      .locator("li", { hasText: title })
      .getByRole("link", { name: "Responses" })
      .click();

    await expect(page.getByText("1 response")).toBeVisible();
    await expect(page.getByText("Kyiv")).toBeVisible();
  });

  test("two separate forms do not share responses", async ({ page }) => {
    const titleA = `Form A ${uid()}`;
    const titleB = `Form B ${uid()}`;

    // Create form A
    await page.goto("/forms/new");
    await page.fill('input[placeholder="Form title"]', titleA);
    await page.getByRole("button", { name: "+ Text" }).click();
    await page.fill('input[placeholder="Question"]', "Q");
    await page.getByRole("button", { name: "Save form" }).click();
    await page.waitForURL("/");

    // Create form B
    await page.getByRole("link", { name: "New form" }).click();
    await page.fill('input[placeholder="Form title"]', titleB);
    await page.getByRole("button", { name: "+ Text" }).click();
    await page.fill('input[placeholder="Question"]', "Q");
    await page.getByRole("button", { name: "Save form" }).click();
    await page.waitForURL("/");

    // Submit response only to form A
    await page
      .locator("li", { hasText: titleA })
      .getByRole("link", { name: "Fill out" })
      .click();
    await page.fill('input[placeholder="Your answer"]', "Only for A");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByText("Your response has been recorded.")
    ).toBeVisible();

    // Form B responses page must be empty
    await page.goto("/");
    await page
      .locator("li", { hasText: titleB })
      .getByRole("link", { name: "Responses" })
      .click();
    await expect(page.getByText("No responses yet")).toBeVisible();
    await expect(page.getByText("Only for A")).not.toBeVisible();
  });
});
