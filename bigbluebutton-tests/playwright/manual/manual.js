const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');

class Manual extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

  async manualTest() {
    // Add/Modify the steps here
    this.modPage.hasElement(e.userListToggleBtn);
  }
}


exports.Manual = Manual;
