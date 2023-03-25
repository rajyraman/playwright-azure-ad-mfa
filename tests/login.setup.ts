import { chromium, FullConfig, test as setup } from '@playwright/test';
import { TOTP } from 'otpauth';
import {
    ChainedTokenCredential,
    AzureCliCredential,
    AzurePowerShellCredential,
    ManagedIdentityCredential,
} from '@azure/identity';

setup('do login', async ({ page, baseURL }) => {
    //if there is any issue use chromium.launch({ headless: false })
    if (process.env.isRefreshCookies === '1') {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        let userName = process.env.loginUserName;
        if (!userName) {
            const cred = new ChainedTokenCredential(
                new AzureCliCredential(),
                new AzurePowerShellCredential(),
                new ManagedIdentityCredential()
            );
            const tokenResponse = await cred.getToken(`${new URL(baseURL!).origin}/.default`);
            userName = JSON.parse(Buffer.from(tokenResponse.token.split('.')[1], 'base64').toString())?.upn;
        }
        await page.goto(baseURL!, { waitUntil: 'networkidle' });

        const userNameTextBox = page.locator('[name=loginfmt]');
        userNameTextBox.fill(userName!);
        await page.getByRole('button', { name: 'Next' }).click();

        const passwordTextBox = page.locator('[name=passwd]');
        passwordTextBox.fill(process.env.password!);
        await page.getByRole('button', { name: 'Sign In' }).click();

        const otpTextBox = page.getByRole('textbox', { name: 'Enter code' });
        var totp = new TOTP({
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: process.env.totp,
        });

        // Generate a token.
        var token = totp.generate();
        otpTextBox.fill(token);
        await page.getByRole('button', { name: 'Verify' }).click();

        await page.getByRole('button', { name: 'Yes' }).click();
        await page.waitForURL('**/main.aspx**');
        await page.context().storageState({ path: process.env.storageState });
    }
});
