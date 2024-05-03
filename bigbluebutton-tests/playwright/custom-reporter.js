class CustomReporter {
  onTestEnd(test, result) {
    const { retries } = test;
    const { status, error, retry } = result;
    const titlePath = test.titlePath();
    titlePath.shift();
    const logTitle = `[${titlePath.shift()}] > ${titlePath.join(' > ')}`;

    if (status === 'failed') {
      if (retries > 0 && retries != retry) return;
      console.log(`::error title=${logTitle}::  ${logTitle}\n${error.stack}`.replace(/\n/g, '%0A'));
    }
  }
}

export default CustomReporter;
