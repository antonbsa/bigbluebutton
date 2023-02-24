const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const c = require('../core/constants');
const parameters = require('../core/parameters');
const { checkIsPresenter } = require('../user/util');
const { createMeeting, sleep } = require('../core/helpers');
const { uploadSinglePresentation } = require('../presentation/util');

class Stress {
  constructor(browser, context, page) {
    this.modPage = new Page(browser, page);
    this.browser = browser;
    this.context = context;
    this.userPages = [];
  }

  async getNewPageTab() {
    return this.browser.newPage();
  }

  async moderatorAsPresenter() {
    const maxFailRate = c.JOIN_AS_MODERATOR_TEST_ROUNDS * c.MAX_JOIN_AS_MODERATOR_FAIL_RATE;
    let failureCount = 0;
    for (let i = 1; i <= c.JOIN_AS_MODERATOR_TEST_ROUNDS; i++) {
      await this.modPage.init(true, true, { fullName: `Moderator-${i}` });
      await this.modPage.waitForSelector(e.userAvatar);
      const isPresenter = await checkIsPresenter(this.modPage);
      await this.modPage.waitAndClick(e.actions);
      const canStartPoll = await this.modPage.checkElement(e.polling);
      if (!isPresenter || !canStartPoll) {
        failureCount++;
      }

      const newPage = await this.context.newPage();
      await this.modPage.page.close();
      this.modPage.page = newPage;
      console.log(`Loop ${i} of ${c.JOIN_AS_MODERATOR_TEST_ROUNDS} completed`);
      await expect(failureCount).toBeLessThanOrEqual(maxFailRate);
    }
  }

  async breakoutRoomInvitation() {
    await this.modPage.init(true, true, { fullName: 'Moderator' });
    for (let i = 1; i <= c.BREAKOUT_ROOM_INVITATION_TEST_ROUNDS; i++) {
      const userName = `User-${i}`;
      const newPage = await this.getNewPageTab();
      const userPage = new Page(this.browser, newPage);
      await userPage.init(false, true, { fullName: userName, meetingId: this.modPage.meetingId });
      console.log(`${userName} joined`);
      this.userPages.push(userPage);
    }

    // Create breakout rooms with the allow choice option enabled
    await this.modPage.bringToFront();
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.allowChoiceRoom);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.bringToFront();
      await page.hasElement(e.modalConfirmButton, c.ELEMENT_WAIT_LONGER_TIME);
      await page.hasElement(e.labelGeneratingURL, c.ELEMENT_WAIT_LONGER_TIME);
    }

    // End breakout rooms
    await this.modPage.bringToFront();
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.endBreakoutRoomsButton);
    await this.modPage.closeAudioModal();

    // Create breakout rooms with the allow choice option NOT enabled (randomly assign)
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    for (const page of this.userPages) {
      await page.bringToFront();
      await page.hasElement(e.modalConfirmButton);
    }
  }

  async twoUsersJoinSameTime() {
    for (let i = 1; i <= c.JOIN_TWO_USERS_ROUNDS; i++) {
      console.log(`loop ${i} of ${c.JOIN_TWO_USERS_ROUNDS}`);
      const meetingId = await createMeeting(parameters);
      const modPage = new Page(this.browser, await this.getNewPageTab());
      const userPage = new Page(this.browser, await this.getNewPageTab());
      await Promise.all([
        modPage.init(true, false, { meetingId }),
        userPage.init(false, false, { meetingId }),
      ]);
      await modPage.waitForSelector(e.audioModal);
      await userPage.waitForSelector(e.audioModal);
      await modPage.page.close();
      await userPage.page.close();
    }
  }

  async usersJoinKeepingConnected() {
    const meetingId = await createMeeting(parameters);
    const pages = [];

    for (let i = 1; i <= c.JOIN_TWO_USERS_KEEPING_CONNECTED_ROUNDS / 2; i++) {
      console.log(`joining ${i * 2} users of ${c.JOIN_TWO_USERS_KEEPING_CONNECTED_ROUNDS}`);
      const modPage = new Page(this.browser, await this.getNewPageTab());
      const userPage = new Page(this.browser, await this.getNewPageTab());
      pages.push(modPage);
      pages.push(userPage);
      await Promise.all([
        modPage.init(true, false, { meetingId, fullName: `Mod-${i}` }),
        userPage.init(false, false, { meetingId, fullName: `User-${i}` }),
      ]);
      await modPage.waitForSelector(e.audioModal, c.ELEMENT_WAIT_LONGER_TIME);
      await userPage.waitForSelector(e.audioModal, c.ELEMENT_WAIT_LONGER_TIME);
    }

    pages.forEach(async (currentPage) => {
      await currentPage.page.close();
    })
  }

  async usersJoinExceddingParticipantsLimit() {
    for (let i = 1; i <= c.JOIN_TWO_USERS_EXCEEDING_MAX_PARTICIPANTS; i++) {
      console.log(`loop ${i} of ${c.JOIN_TWO_USERS_EXCEEDING_MAX_PARTICIPANTS}`);

      const pages = [];
      const meetingId = await createMeeting(parameters, `maxParticipants=${c.MAX_PARTICIPANTS_TO_JOIN}`);

      for (let j = 1; j <= c.MAX_PARTICIPANTS_TO_JOIN + 1; j++) {
        pages.push(new Page(this.browser, await this.getNewPageTab()));
      }

      for (let j = 1; j < c.MAX_PARTICIPANTS_TO_JOIN; j++) {
        console.log(`- joining user ${j} of ${c.MAX_PARTICIPANTS_TO_JOIN}`);
        await pages[j - 1].init(true, false, { meetingId, fullName: `User-${j}` });
      }
      console.log('- joining two users at the same time');

      const lastPages = [
        pages[pages.length - 1],
        pages[pages.length - 2],
      ]

      Promise.all(lastPages.map((page, index) => {
        return page.init(true, false, { meetingId, fullName: `User-last-${index}` })
      }));

      try {
        await lastPages[0].waitForSelector(e.audioModal);
        await lastPages[1].waitForSelector(e.errorScreenMessage);
      } catch (err) {
        await lastPages[1].waitForSelector(e.audioModal);
        await lastPages[0].waitForSelector(e.errorScreenMessage);
      }

      pages.forEach(async (currentPage) => {
        await currentPage.page.close();
      })
    }
  }

  async occasionalNpe() {
    const MEETINGS_COUNT = 12;
    const PARTICIPANTS_COUNT = 5;
    this.meetingPages = [];
    for (let i = 1; i <= MEETINGS_COUNT; i++) {
      const meetingId = await createMeeting(parameters)
      console.log(`meeting ${i} (${meetingId}) created`)
      const newModPage = await this.getNewPageTab();
      const modPage = new Page(this.browser, newModPage);
      await modPage.init(true, true, { fullName: 'Moderator', meetingId })
      console.log('joining users')
      this.meetingPages.push({
        meetingId,
        modPage,
        pages: []
      })
      for (let j = 1; j <= PARTICIPANTS_COUNT; j++) {
        const userName = `User-${j}`;
        const newPage = await this.getNewPageTab();
        const userPage = new Page(this.browser, newPage);
        await userPage.init(false, true, { fullName: userName, meetingId });
        console.log(`meeting ${i}: ${userName} joined`);
        const meetingIndex = this.meetingPages.findIndex(obj => obj.meetingId === meetingId)
        this.meetingPages[meetingIndex].pages.push(userPage)
      }
      console.log(`= all users for meeting ${i} joined`)
      console.log(`Mod in meeting ${i} is uploading a new presentation`)
      await uploadSinglePresentation(modPage, e.questionSlideFileName)
      console.log('presentation uploaded')
    }
    console.log('== actions done. 10 mins left until to test')

    setInterval(async () => {
      await Promise.all(this.meetingPages.reduce((ac, current) => {
        return ac.concat(...current.pages)
      }, []).map(async userPage => {
        await this.sendMessage(userPage)
      }))
      console.log('All users just sent a message in the chat')
      console.log('= Leaving meetings with a user')
      await this.leaveAndRejoinUser(PARTICIPANTS_COUNT - 1)
      console.log('All users has rejoined in the meetings')
    }, 30000) // 30 secs
    await sleep(600000) // 10 mins
  }

  async sendMessage(page) {
    await page.page.fill(e.chatBox, "I'm online, baby")
    await page.waitAndClick(e.sendButton)
  }

  async leaveAndRejoinUser(expectedUsersAfterLogout) {
    await Promise.all(this.meetingPages.map(async meetingUserPages => {
      const { modPage, pages } = meetingUserPages;
      const lastPage = pages.pop();
      await lastPage.logoutFromMeeting();
      await modPage.waitUntilHaveCountSelector(e.userListItem, expectedUsersAfterLogout, 0)
    }))
    await Promise.all(this.meetingPages.map(async meetingUserPages => {
      const { meetingId, modPage, pages } = meetingUserPages
      const { browser } = modPage
      const newPageTab = await browser.newPage();
      const newPage = new Page(browser, newPageTab);
      await newPage.init(false, true, { fullName: 'New-user', meetingId })
      pages.push(newPage)
    }))
  }
}

exports.Stress = Stress;
