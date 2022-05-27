const { test } = require('@playwright/test');
const { Audio } = require('./audio');

test.describe.parallel('Audio', () => {
  test('Join audio with Listen Only @ci-wip', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinAudio();
  });

  test('Join audio with Microphone @ci-wip', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinMicrophone();
  });
});
