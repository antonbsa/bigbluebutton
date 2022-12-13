const { test } = require('@playwright/test');
const Page = require('../core/page');
const { MultiUsers } = require('../user/multiusers');
const { Audio } = require('./audio');

test.describe.configure({ mode: 'serial' });

// pages
let pageInstance;
let browserInstance;
let modPage;
let userPage;

// intern variables
let isFirstTestRun = true;

// tests
test.describe.parallel('Audio', () => {
  test.describe.serial('Join audio', () => {
    const audio = new Audio();
    // playwright hooks
    test.beforeAll(async ({ browser }) => {
      browserInstance = browser;
      pageInstance = await browserInstance.newPage();
      const context = pageInstance.context();
      modPage = new Page(browserInstance, context, pageInstance);
      await modPage.init(true, false);
    });

    test.afterEach(async () => {
      isFirstTestRun = false;
    });

    async function initUserPage(shouldCloseAudioModal = false, { fullName = 'Attendee', useModMeetingId = true, ...restOptions } = {}) {
      const options = {
        ...restOptions,
        fullName,
        meetingId: (useModMeetingId) ? modPage.meetingId : undefined,
      };

      const { browser } = modPage;
      const userContext = await browser.newContext();
      const userPageInstance = await userContext.newPage();
      userPage = new Page(browser, userContext, userPageInstance);
      await userPage.init(false, shouldCloseAudioModal, options);
    }

    // https://docs.bigbluebutton.org/2.6/release-tests.html#listen-only-mode-automated
    test('Join audio with Listen Only @ci', async () => {
      // const audio = new Audio();
      // await audio.init(true, false);
      await audio.joinAudio(modPage);
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#join-audio-automated
    test('Join audio with Microphone @ci', async () => {
      // const audio = new Audio();
      // await audio.init(true, false);
      await audio.joinMicrophone({ modPage, isFirstTestRun });
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#choosing-different-sources
    test('Change audio input and keep it connected', async ({ browser, page }) => {
      // const audio = new Audio(browser, page);
      // await audio.init(true, false);
      await audio.changeAudioInput({ modPage, isFirstTestRun });
    });

    test('Keep the last mute state after rejoining audio @ci', async () => {
      // const audio = new Audio(browser, page);
      // await audio.init(true, false);
      await audio.keepMuteStateOnRejoin({ modPage, isFirstTestRun });
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#muteunmute
    test('Mute yourself by clicking the mute button @ci', async () => {
      // const audio = new Audio(browser, page);
      // await audio.init(true, false);
      await audio.muteYourselfByButton({ modPage, isFirstTestRun });
    });
  });

  test.describe.serial('Talking indicator @ci', () => {
    const audio = new Audio();
    // playwright hooks
    test.beforeAll(async ({ browser }) => {
      browserInstance = browser;
      pageInstance = await browserInstance.newPage();
      const context = pageInstance.context();
      modPage = new Page(browserInstance, context, pageInstance);
      await modPage.init(true, false);
    });

    test.afterEach(async () => {
      isFirstTestRun = false;
    });

    async function initUserPage(shouldCloseAudioModal = false, { fullName = 'Attendee', useModMeetingId = true, ...restOptions } = {}) {
      const options = {
        ...restOptions,
        fullName,
        meetingId: (useModMeetingId) ? modPage.meetingId : undefined,
      };

      const { browser } = modPage;
      const userContext = await browser.newContext();
      const userPageInstance = await userContext.newPage();
      userPage = new Page(browser, userContext, userPageInstance);
      await userPage.init(false, shouldCloseAudioModal, options);
    }

    // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
    test('Mute yourself by clicking the talking indicator', async () => {
      // const audio = new Audio(browser, page);
      // await audio.init(true, false);
      await audio.muteYourselfBytalkingIndicator({ modPage, isFirstTestRun });
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
    test('Mute another user by clicking the talking indicator', async () => {
      // const audio = new MultiUsers(browser, context);
      // await audio.initModPage(page);
      // await audio.initUserPage(false);
      await initUserPage();
      await audio.muteAnotherUser({ modPage, userPage });
    });
  });
});
