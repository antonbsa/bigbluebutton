const { expect } = require("@playwright/test");

// Common
function checkElement([element, index = 0]) {
  return document.querySelectorAll(element)[index] !== undefined;
}

// Length
function checkElementLengthEqualTo([element, count]) {
  return document.querySelectorAll(element).length == count;
}

function checkIncludeClass([selector, className]) {
  return document.querySelectorAll(`${selector} > div`)[0].className.includes(className);
}

async function checkTextContent(baseContent, checkData) {
  if (typeof checkData === 'string' ) checkData = checkData.split();

  const check = checkData.every(word => baseContent.includes(word));
  await expect(check).toBeTruthy();
}

exports.checkElement = checkElement;
exports.checkElementLengthEqualTo = checkElementLengthEqualTo;
exports.checkIncludeClass = checkIncludeClass;
exports.checkTextContent = checkTextContent;
