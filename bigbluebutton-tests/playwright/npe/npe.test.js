const { default: test } = require('@playwright/test');
const { Stress } = require('../stress/stress');

test('Testing occasional NPE', async ({ browser, context }, testInfo) => {
  testInfo.setTimeout(0)
  const npeTest = new Stress(browser, context);
  await npeTest.occasionalNpe()
})
