import { test as base } from '@playwright/test';

export const test = base.extend<{}>({
    page: async ({ page }, use, testInfo) => {
        console.log(`Running ${testInfo.title}`);
        await page.goto(process.env.environmentUrl!);
        await page.waitForFunction(() => window.Xrm);
        await use(page);
    },
});
export { expect } from '@playwright/test';
