async function disableNetwork(test) {
  const cdp = await test.page.context().newCDPSession(test.page);
  // await cdp.send('Network.disable');
  // await cdp.send('Network.emulateNetworkConditions', {
  //   'offline': true,
  //   'downloadThroughput': 0,
  //   'uploadThroughput': 0,
  //   'latency': 0,
  // });
  await test.browser.setOffline(true);
}

async function enableNetwork(test) {
  // const client = await test.page.context().newCDPSession(test.page);
  // await client.send('Network.enable');
  await test.browser.setOffline(false);
}

exports.disableNetwork = disableNetwork;
exports.enableNetwork = enableNetwork;
