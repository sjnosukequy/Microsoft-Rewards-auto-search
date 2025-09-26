console.log('script injected!!!!!');
// const point = document.querySelector('mee-rewards-counter-animation').innerText;
// chrome.storage.local.set({ rewardPoints: point }).then(() => {
//     console.log("Value is set");
// });
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fillSearchBox(querry) {
    document.querySelector('#sb_form_q').click();
    document.querySelector('#sb_form_q').focus();
    await delay(500);
    document.querySelector('#sb_form_q').value = querry;
    await delay(500);
    document.querySelector('#sb_form_q').click();
    await delay(2000);
}

window.addEventListener('load', async (event) => {
    console.log('page is fully loaded');
    await delay(2000);
    chrome.runtime.sendMessage({ message: "finished loading", status: true });
    console.log('send status Message');

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            console.log(request);
            try {
                fillSearchBox(request.querry);
                sendResponse({ message: "completed", status: true });
            }
            catch (e) {
                sendResponse({ message: e, status: false });
            }
            return true;
        }
    );
    // document.querySelectorAll('input')[1].value = 123
});