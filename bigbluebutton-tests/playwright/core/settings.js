let settings;

async function generateSettingsData(page) {
  if (settings || !page) return settings;

  try {
    const settingsData = await page.evaluate(() => {
      return Meteor.settings.public;
    });

    settings = {
      autoJoinAudioModal: settingsData.app.autoJoin,
      listenOnlyMode: settingsData.app.listenOnlyMode,
      forceListenOnly: settingsData.app.forceListenOnly,
      skipEchoTest: settingsData.app.skipCheck,
      skipEchoTestOnJoin: settingsData.app.skipCheckOnJoin,
      listenOnlyCallTimeout: settingsData.media.listenOnlyCallTimeout,
      videoPreviewTimeout: settingsData.kurento.gUMTimeout,
    }
    console.log({settings})
    return settings;
  } catch (err) {
    console.log(`Unable to get public settings data: ${err}`);
  }
}

module.exports = exports = {
  getSettings: () => settings,
  generateSettingsData,
}
