const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { connectMicrophone, isAudioItemSelected } = require('./util');
const { sleep } = require('../core/helpers');

class Audio extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async joinAudio(modPage) {
    const { autoJoinAudioModal, listenOnlyCallTimeout } = modPage.settings;
    if (!autoJoinAudioModal) await modPage.waitAndClick(e.joinAudio);
    await modPage.waitAndClick(e.listenOnlyButton);
    await modPage.wasRemoved(e.establishingAudioLabel);
    await modPage.waitForSelector(e.leaveListenOnly, listenOnlyCallTimeout);
    await modPage.waitAndClick(e.audioDropdownMenu);
    await modPage.hasElement(e.leaveAudio);
  }

  async joinMicrophone({ modPage, isFirstTestRun }) {
    if (!isFirstTestRun) await modPage.waitAndClick(e.leaveAudio);
    await connectMicrophone({ testPage: modPage, isFirstTestRun });
    await modPage.hasElement(e.muteMicButton);
    await modPage.waitAndClick(e.audioDropdownMenu);
    await modPage.hasElement(e.leaveAudio);
  }

  async muteYourselfByButton({ modPage, isFirstTestRun }) {
    if (isFirstTestRun) await connectMicrophone({ testPage: modPage, isFirstTestRun });
    else await modPage.press('Escape');   // close audio dropdown list

    // unmute user if their were muted in a previous test
    if (await modPage.isMuted()) {
      await modPage.waitAndClick(e.unmuteMicButton);
      await sleep(1000);
    }

    await modPage.waitAndClick(e.muteMicButton);
    await modPage.wasRemoved(e.isTalking);
    await modPage.hasElement(e.wasTalking);
    await modPage.wasRemoved(e.muteMicButton);
    await modPage.hasElement(e.unmuteMicButton);
    await modPage.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
  }

  async changeAudioInput({ modPage, isFirstTestRun }) {
    if (isFirstTestRun) await connectMicrophone({ testPage: modPage, isFirstTestRun });
    else await modPage.press('Escape');

    await modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(modPage, e.defaultInputAudioDevice);
    await modPage.waitAndClick(e.secondInputAudioDevice);
    await modPage.hasElement(e.isTalking);
    await modPage.hasElement(e.muteMicButton);
    await modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(modPage, e.secondInputAudioDevice);
  }

  async keepMuteStateOnRejoin({ modPage, isFirstTestRun }) {
    if (isFirstTestRun) await connectMicrophone({ testPage: modPage, isFirstTestRun });
    else await modPage.press('Escape');

    await modPage.waitAndClick(e.muteMicButton);
    await modPage.hasElement(e.wasTalking);
    await modPage.wasRemoved(e.muteMicButton);
    await modPage.hasElement(e.unmuteMicButton);
    await modPage.waitAndClick(e.audioDropdownMenu);
    await modPage.waitAndClick(e.leaveAudio);
    await modPage.waitAndClick(e.joinAudio);
    await modPage.waitAndClick(e.microphoneButton);
    await modPage.waitAndClick(e.joinEchoTestButton);
    await modPage.waitForSelector(e.establishingAudioLabel);
    await modPage.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    await modPage.hasElement(e.unmuteMicButton);
  }

  async muteYourselfBytalkingIndicator({ modPage, isFirstTestRun }) {
    if (isFirstTestRun) await connectMicrophone({ testPage: modPage, isFirstTestRun });
    else await modPage.press('Escape');   // close audio dropdown list

    // unmute user if their were muted in a previous test
    if (await modPage.isMuted()) {
      await modPage.waitAndClick(e.unmuteMicButton);
      await sleep(1000);
    }

    await modPage.waitAndClick(e.talkingIndicator);
    await modPage.hasElement(e.wasTalking);
    await modPage.wasRemoved(e.muteMicButton);
    await modPage.hasElement(e.unmuteMicButton);
    await modPage.wasRemoved(e.isTalking);
    await modPage.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
  }

  async muteAnotherUser({ modPage, userPage }) {
    if (await userPage.isMicrophoneConnected() && await userPage.isMuted()) await userPage.joinMicrophone();
    else await connectMicrophone({ testPage: userPage });

    if (await modPage.isAudioModalOpened()) await modPage.waitAndClick(e.closeModal);

    if (await modPage.isMicrophoneConnected()) {
      await modPage.leaveAudio();
    } else {
      await modPage.hasElement(e.joinAudio);
    }



    await modPage.waitAndClick(e.isTalking);
    await userPage.hasElement(e.unmuteMicButton);
    await modPage.hasElement(e.wasTalking);
    await userPage.hasElement(e.wasTalking);
    await userPage.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
    await modPage.wasRemoved(e.talkingIndicator);
  }
}

exports.Audio = Audio;
