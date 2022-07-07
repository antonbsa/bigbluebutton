const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const Page = require('../core/page');
const { createMeeting } = require('../core/helpers');
const parameters = require('../core/parameters');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');

class Manual extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

  async manualTest() {
    // Add/Modify the steps here
    const PAGE_COUNT = 10;
    const meetingId = await createMeeting(parameters);
    for (let i = 1; i <= PAGE_COUNT; i++) {
      const userName = `Moderator-${i}`;
      console.log(`Joining ${userName}`);
      const currentPage = new Page(this.browser, await this.browser.newPage());
      await currentPage.init(true, true, { fullName: userName, meetingId });
      currentPage.hasElement(e.userListToggleBtn);
      console.log(`User ${userName} stabilized`);
    }
    console.log('All users joined!')
  }
}


exports.Manual = Manual;
