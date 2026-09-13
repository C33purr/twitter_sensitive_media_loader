function sendMessageToTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs
      .sendMessage(tab.id, { command: "init" })
  }
}

browser.tabs.query({
      currentWindow: true,
      active: true,
    })
	.then(sendMessageToTabs);
	