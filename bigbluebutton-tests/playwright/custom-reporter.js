class CustomReporter {
  onTestEnd(test, result) {
    const { retries } = test;
    const { status, error, retry } = result;
    const titlePath = test.titlePath();
    titlePath.shift();
    const logTitle = `[${titlePath.shift()}] › ${titlePath.join(' › ')}`.replace('@ci', '').trim();

    if (status === 'failed') {
      let logType = 'error';
      const message = (retry > 0)
        ? `Retry #${retry} ───────────────────────────────────────────────────────────────────────────────────────\n${logTitle}\n${error.stack}`
        : `${logTitle}\n${error.stack}`;

      if (retries != retry) logType = 'warning';
      console.log(`::${logType} title=${logTitle}::  ${message}`.replace(/\n/g, '%0A  '));
    }
  }
}

export default CustomReporter;
