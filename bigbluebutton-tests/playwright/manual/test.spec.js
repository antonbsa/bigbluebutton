const { test } = require('@playwright/test');
const { Manual } = require('./manual');

test.describe.parallel('Manual', () => {
  test('Manual Test', async ({ browser, context, page }) => {
    const manual = new Manual(browser, context);
    //! The First called function needs to receive the "page" parameter 
    // manual.initPages() :: base function with joins with 1 moderator and 1 attendee
    // manual.initModPage() // manual.initModPage2() :: joins with mod1 and/or mod2
    // manual.initUserPage() // manual.initUserPage2() :: joins with user1 and/or user2
    await manual.initModPage(page);
    await manual.manualTest();
  });
});