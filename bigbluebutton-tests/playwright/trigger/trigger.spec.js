const { test, chromium } = require('@playwright/test');
const { Trigger } = require('./trigger');

// test.use({
//   // headless: false,
//   launchOptions: {
//     args: ['--disable-http2'],
//   }
// });

test.describe.parallel('Trigger', () => {
  test('Disconnect Meteor', async ({ browser, page }) => {
    const trigger = new Trigger(browser, page);
    await trigger.init(true, true);
    await trigger.triggerMeteorDisconnect();
  });

  test.skip('Shutting down network device', async ({ browser, context, page }) => {
    // console.log(browser.version())
    const trigger = new Trigger(browser, page);
    await trigger.init(true, true);
    await trigger.triggerNetworkServiceDisconnection();
  });

  test('Meteor Reconnection', async ({ browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'This test should only be run in a chromium browser');
    const browserServer = await chromium.launchServer({
      ...testInfo.project.use,
      args: [
        ...testInfo.project.use.launchOptions.args,
        '--disable-http2'
      ],
    });
    const wsEndpoint = browserServer.wsEndpoint();
    const browser = await chromium.connect(wsEndpoint);
    const page = await browser.newPage();
    const browserPid = browserServer.process().pid;
    // return;
    const trigger = new Trigger(browser, page);
    console.log('antes init')
    // await trigger.init(true, true);
    console.log('depois init')
    await trigger.meteorReconnection(browserPid);
  });
});
