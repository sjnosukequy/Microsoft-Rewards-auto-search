
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "openNewTab" && request.url) {
        // Use the chrome.tabs.create API, which is only available to the Service Worker.
        chrome.tabs.create({ url: request.url, active: false }, (newTab) => {
            sendResponse({
                message: "Opened a new tab",
                status: true,
                data: {
                    tabId: newTab.id
                }
            });
        });
    }

    if (request.action == "comunicate" && request.receiverID) {
        chrome.tabs.sendMessage(request.receiverID, { ...request }, (response) => {
            sendResponse(response);
        })
    }

    if (request.action == "removeTab" && request.receiverID) {
        try {
            chrome.tabs.remove(request.receiverID, () => { 
                sendResponse({ message: "removed tab", status: true });
            });
        } catch (e) {
            sendResponse({ message: e, status: false });
        }
    }

    // IMPORTANT: Return true to indicate that sendResponse will be called asynchronously
    // after the chrome.tabs.create operation completes.
    return true;
});