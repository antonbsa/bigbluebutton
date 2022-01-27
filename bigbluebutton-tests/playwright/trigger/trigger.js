const { expect, test } = require('@playwright/test');
const Page = require('../core/page');
const { exec } = require("child_process");
const { CLIENT_RECONNECTION_TIMEOUT, ELEMENT_WAIT_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');
const screenshareUtil = require('../screenshare/util');
const { disableNetwork, enableNetwork } = require('./util');
const e = require('../core/elements');
const { checkElement } = require('../core/util');

class Trigger extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async triggerMeteorDisconnect() {
    await sleep(2000);
    await this.page.evaluate(() => Meteor.disconnect());
    await sleep(CLIENT_RECONNECTION_TIMEOUT);
    const meteorStatus = await this.page.evaluate(() => Meteor.status());
    const meteorStatusConfirm = await meteorStatus.status === "offline";
    await expect(meteorStatusConfirm).toBeTruthy();

    const getAudioButton = await this.page.evaluate((joinAudioSelector) => {
      return document.querySelectorAll(joinAudioSelector)[0].getAttribute('aria-disabled') === "true";
    }, e.joinAudio);
    await expect(getAudioButton).toBeTruthy();

    await this.page.evaluate(() => Meteor.reconnect());
    await sleep(3000);
    // await this.hasElement(e.errorScreenMessage);
    await this.hasElement(e.unauthorized);
  }

  async triggerNetworkServiceDisconnection() {
    await exec('sh trigger/stop-network.sh', async (error, data, getter) => {
      if (error || getter) return;
    });
    // await this.runScript('sudo nmcli networking off', {
    //   handleOutput: (output) => console.log('output: ', output)
    // });
    // await disableNetwork(this);
    await sleep(5000);
    const meteorStatus = await this.page.evaluate(() => Meteor.status());
    const meteorStatusConfirm = await meteorStatus.status === "offline";
    await expect(meteorStatusConfirm).toBeTruthy();

    await sleep(CLIENT_RECONNECTION_TIMEOUT);
    await exec('sh trigger/restart-network.sh', async (error, data, getter) => {
      if (error || getter) return;
    });
    // await this.runScript('sudo nmcli networking on', {
    //   handleOutput: (output) => console.log('output: ', output)
    // });
    await enableNetwork(this);

    await this.page.reload();
    await this.closeAudioModal();
    const getAudioButton = await this.page.evaluate((joinAudioSelector) => {
      return document.querySelectorAll(joinAudioSelector)[0].getAttribute('aria-disabled') === "true";
    }, e.joinAudio);
    await expect(getAudioButton).toBeTruthy();
    await sleep(3000);
    await this.hasElement(e.unauthorized);
  }

  async meteorReconnection(browserPid) {
    const checkSudo = await this.runScript('timeout -k 1 1 sudo id', {
      handleOutput: (output) => output ? true : false
    })
    if (!checkSudo) {
      console.log('Sudo failed: need to run this test with sudo (can be fixed by running "sudo -v" and entering the password)');
      test.fail();
    }

    const checkTcpKill = await this.runScript('tcpkill', {
      handleError: (output) => output.includes('not found') ? false : true
    })
    if (!checkTcpKill) {
      console.log('tcpkill failed: must have the "dsniff" package installed');
      return false;
    }

    await this.init(true, true);
    // await this.page.setRequestInterception(true);
    // this.page.on('request', (request) => {
    //   const headers = request.headers();
    //   headers['connection'] = 'close';
    //   request.continue({
    //     headers
    //   });
    // });

    const hostname = new URL(this.page.url()).hostname;
    const remoteIp = await this.runScript(`ping ${hostname}`, {
      timeout: 1000,
      handleOutput: (output) => {
        const splitLog = output.split(/\s+/)[2];
        const ip = splitLog.slice(1, -1);

        return ip;
      }
    })

    // const modPid = this.browser.process().pid;
    await sleep(7000);
    const ipArgs = await this.runScript(`lsof -n -p ${browserPid} | grep ${remoteIp}`, {
      handleOutput: (output) => {
        const completeLog = output.trim().split(/\s+/);

        const ips = completeLog[8].split('->');
        const [localIp, port] = ips[0].split(':');

        return { localIp, port };
      }
    })

    const tcpInterface = await this.runScript(`ip addr | grep ${ipArgs.localIp}`, {
      handleOutput: (output) => {
        const outputArray = output.trim().split(/\s+/);
        return outputArray[outputArray.length - 1];
      }
    })

    // Media connections
    await this.waitAndClick(e.joinAudio);
    await this.joinMicrophone();
    await this.shareWebcam(true);
    await screenshareUtil.startScreenshare(this);

    await this.runScript(`sudo tcpkill -i ${tcpInterface} port ${ipArgs.port} and host ${remoteIp}`, { timeout: 7500 });

    await this.hasElement(e.isTalking);
    await this.hasElement(e.webcamVideo);
    await this.hasElement(e.stopScreenSharing);
  }

  async runScript(script, { handleError, handleOutput, timeout }) {
    return new Promise((res, rej) => {
      return exec(script, { timeout }, (err, stdout, stderr) => {
        res(handleError ? handleError(stderr) : handleOutput ? handleOutput(stdout) : null)
      })
    })
  }
}

exports.Trigger = Trigger;
