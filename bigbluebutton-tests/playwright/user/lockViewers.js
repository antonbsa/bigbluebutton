const { MultiUsers } = require("./multiusers");
const { openLockViewers } = require('./util');
const e = require('../core/elements');

class LockViewers extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

  async lockShareWebcam() {
    await this.userPage.shareWebcam();
    // maybe it could be a separate function
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    // 
    
  }
}

exports.LockViewers = LockViewers;