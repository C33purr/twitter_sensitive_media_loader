browser.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	if (request.command === 'init') {
		initAutoLoader();
	}

	loadImageButtons();
});

function loadImageButtons() {
	let articles = document.querySelectorAll("article[data-testid='tweet']");
	for (const [articleKey, article] of Object.entries(articles)) {
		try {
			let childNodesSelector = article.querySelector("div > div");
			if (childNodesSelector === null) {
				continue;
			}
			
			let mainTweetNode = childNodesSelector.childNodes[childNodesSelector.childNodes.length - 1];
			let mainTweetExtraNode = mainTweetNode.childNodes[mainTweetNode.childNodes.length - 1];
			
			// Check if tweet has an image, tweet text div always present
			// 1 username, 2 tweet text, 3 media (if any), 4 analytics
			if (mainTweetExtraNode.childNodes.length !== 4) {
				continue;
			}
			
			let mainTweetInteractionNode = mainTweetExtraNode.childNodes[mainTweetExtraNode.childNodes.length - 1].childNodes[0].childNodes[0];
			
			if (mainTweetInteractionNode === undefined || mainTweetInteractionNode.querySelector(".image-loader-button") !== null) {
				continue;
			}
			
			const regex = /\/.*\/status\//i
			const analyticsSelector = mainTweetInteractionNode.querySelector('div > a');
			if (analyticsSelector === null) {
				continue;
			}
			
			const tweetId = analyticsSelector.getAttribute('href').replace(regex, '').replace('/analytics', '');
			
			const loadImageButton = document.createElement("button");
			loadImageButton.className = "image-loader-button";
			loadImageButton.innerText = "Load images";
			loadImageButton.setAttribute('fetched-tweet-id', tweetId);
			
			loadImageButton.addEventListener("click", (event) => {
				loadedImages = loadImagesFromExternalSource(loadImageButton.getAttribute('fetched-tweet-id')).then((value) => {
					const loadedImagesDiv = document.createElement("div");
					loadedImagesDiv.className = "loaded-images";
					article.parentNode.appendChild(loadedImagesDiv);
					const videoRegex = /https:\/\/video.twimg.com\/.*/i;
					
					for (const image in value) {
						let media = document.createElement("img");
						if (value[image].match(videoRegex) === null) {
							media.src = value[image];
							if (value.length === 1) {
								media.className = 'only-image';
							}
						} else {
							media = document.createElement("video");
							media.controls = true;
							const source = document.createElement("source");
							source.src = value[image];
							media.appendChild(source);
						}
						loadedImagesDiv.appendChild(media);
					}
					
					loadImageButton.className = 'image-loader-button hidden-button';
				});
			});
			mainTweetInteractionNode.appendChild(loadImageButton);
		} catch (error) {
			console.error(error)
		}
	}
}

function initAutoLoader() {
	const targetNode = document.querySelector("main section > div > div");
	if (targetNode === null) {
		return;
	}

	// Options for the observer (which mutations to observe)
	const config = { attributes: true, childList: true, subtree: true };
	const callback = (mutationList, observer) => {
	  for (const mutation of mutationList) {
		if (mutation.type === "attributes" && mutation.attributeName === 'style') {
		  loadImageButtons();
		}
	  }
	};
	const observer = new MutationObserver(callback);

	observer.observe(targetNode, config);
}

async function loadImagesFromExternalSource(tweetId) {
	const url = 'https://api.fxtwitter.com/2/status/' + tweetId;
	const response = await browser.runtime.sendMessage({ 
		  action: "fetchTwitterLoadedMedias", 
		  url: url 
	});

	return await response.data;
}

