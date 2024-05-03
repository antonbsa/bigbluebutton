class CustomReporter {
  onTestEnd(test, result) {
    const { status, error, retry } = result;
    const titlePath = test.titlePath();
    titlePath.shift();
    const logTitle = `[${titlePath.shift()}] > ${titlePath.join(' > ')}`;

    if (status === 'failed') {
      if (retries > 0 && retries != retry) return;
      console.log(`::error title=${logTitle}::  ${logTitle}\n${error.stack}`);
    }
  }
}

export default CustomReporter;
