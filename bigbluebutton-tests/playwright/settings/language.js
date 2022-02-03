const Page = require('../core/page');
const { openSettings, getLocaleValues } = require('./util');
const e = require('../core/elements');

class Language extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    const selectedKeysByElement = {
      [e.messageTitle]: 'app.userList.messagesTitle',
      [e.notesTitle]: 'app.userList.notesTitle',
      [e.userList]: 'app.navBar.userListToggleBtnLabel',
      [e.hidePublicChat]: 'app.chat.titlePublic',
      [e.sendButton]: 'app.chat.submitLabel',
      [e.actions]: 'app.actionsBar.actionsDropdown.actionsLabel',
      [e.joinAudio]: 'app.audio.joinAudio',
      [e.joinVideo]: 'app.video.joinVideo',
      [e.startScreenSharing]: 'app.actionsBar.actionsDropdown.desktopShareLabel',
      [e.minimizePresentation]: 'app.actionsBar.actionsDropdown.minimizePresentationLabel',
      [e.raiseHandBtn]: 'app.actionsBar.emojiMenu.raiseHandLabel',
      [e.connectionStatusBtn]: 'app.connection-status.label',
      [e.optionsButton]: 'app.navBar.settingsDropdown.optionsLabel',
    }

    for (const locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      const currentValuesByElement = await getLocaleValues(selectedKeysByElement, locale);

      await openSettings(this);
      await this.page.waitForSelector('#langSelector');
      const langDropdown = await this.page.$('#langSelector');
      await langDropdown.selectOption({ value: locale });
      await this.page.click(e.modalConfirmButton);
      await this.waitForSelector(e.toastContainer);

      for (const selector in currentValuesByElement) {
        await this.hasText(selector, currentValuesByElement[selector]);
      }
    }
  }
}

exports.Language = Language;
