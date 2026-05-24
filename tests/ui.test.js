const { test, expect } = require('@playwright/test');

const baseUrl = 'https://www.saucedemo.com/';
const username = 'standard_user';
const password = 'secret_sauce';

async function login(page) {
  await page.goto(baseUrl);
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
}

async function readInventoryPrices(page) {
  return page.locator('[data-test="inventory-item-price"]').evaluateAll((elements) =>
    elements.map((element) => Number.parseFloat(element.textContent.replace('$', ''))),
  );
}

test.describe('SauceDemo UI', () => {
  test.setTimeout(60000);

  test('login page has the expected title', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page).toHaveTitle(/Swag Labs/);
  });

  test('login form fields are visible', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('standard user can log in and see products', async ({ page }) => {
    await login(page);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
  });

  test('product can be added to cart', async ({ page }) => {
    await login(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('sorting by price low to high works', async ({ page }) => {
    await login(page);

    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const prices = await readInventoryPrices(page);
    const sortedPrices = [...prices].sort((left, right) => left - right);

    expect(prices).toEqual(sortedPrices);
  });

  test('product details page opens from inventory', async ({ page }) => {
    await login(page);

    await page.locator('[data-test="item-4-title-link"]').click();

    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });
});
