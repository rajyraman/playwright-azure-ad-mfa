import { test, expect } from './fixtures';

type account = { accountid: string; name: string; };

test('open account form', async ({ page }) => {
    await test.step('Retrieve account records and navigate to the first account', async () => {
        await page.evaluate(async () => {
            const accountRecords: account[] = (
                await Xrm.WebApi.retrieveMultipleRecords(
                    'account',
                    `?$select=accountid,name`
                )
            ).entities;
            Xrm.Navigation.navigateTo({
                pageType: 'entityrecord',
                entityId: accountRecords[0].accountid,
                entityName: 'account',
            });
        });
    });

    await test.step('Check if Save button is visible', async () => {
        await page.waitForFunction(() => Xrm.Utility.getPageContext().input);
        const currentRecord = await page.evaluate(
            () => Xrm.Utility.getPageContext().input as Xrm.EntityFormPageContext
        );
        const refreshButton = page.getByRole('menuitem', { name: 'Refresh' });
        expect(currentRecord.entityName).toEqual('account');
        await refreshButton.click();
    });
});
