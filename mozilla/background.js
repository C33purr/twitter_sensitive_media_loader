async function loadImagesFromExternalSource(url) {
	const response = await fetch(url);
	const result = await response.json();

	let mediaUrls = [];
	for (const media in result["status"]["media"]["all"]) {
		mediaUrls.push(result["status"]["media"]["all"][media]["url"]);
	}

	return mediaUrls;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchTwitterLoadedMedias") {
	  loadImagesFromExternalSource(message.url)
		.then(data => sendResponse({ success: true, data: data }))
		.catch(error => sendResponse({ success: false, error: error.message }));
  }

  return true;
});