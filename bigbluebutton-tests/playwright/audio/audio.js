const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Audio extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async joinAudio() {
    const { autoJoinAudioModal, listenOnlyCallTimeout } = this.settings;
    if (!autoJoinAudioModal) await this.waitAndClick(e.joinAudio);

    await this.waitAndClick(e.listenOnlyButton);
    await this.wasRemoved(e.connecting);
    await this.waitForSelector(e.leaveAudio, parseInt(listenOnlyCallTimeout));
    await this.waitForSelector(e.whiteboard);
    await this.hasElement(e.leaveAudio);
  }

  async joinMicrophone() {
    const { autoJoinAudioModal, listenOnlyCallTimeout } = this.settings;
    if (!autoJoinAudioModal) await this.waitAndClick(e.joinAudio);

    await this.waitAndClick(e.microphoneButton);
    await this.waitForSelector(e.connectingToEchoTest);
    await this.wasRemoved(e.connectingToEchoTest, ELEMENT_WAIT_LONGER_TIME);
    await this.waitAndClick(e.echoYesButton, parseInt(listenOnlyCallTimeout));
    await this.waitForSelector(e.whiteboard);
    await this.hasElement(e.isTalking);
  }
}

exports.Audio = Audio;
