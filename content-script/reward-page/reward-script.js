console.log('script injected!!!!!');
// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         console.log(request);
//         if (request.greeting === "hello") {
//             console.log("sendResponse called");
//             sendResponse({ farewell: "goodbye" });
//         }
//     }
// );

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('load', async (event) => {
    console.log('page is fully loaded');
    await delay(1000);
    const point = document.querySelector('mee-rewards-counter-animation').innerText;
    chrome.storage.local.set({ rewardPoints: point }).then(() => {
        console.log("Value is set: " + point);
    });
});