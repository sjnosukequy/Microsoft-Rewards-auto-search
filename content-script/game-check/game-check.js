console.log('script injected!!!!!');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const object = { message: "", status: false, data: [] };

window.addEventListener('load', async (event) => {
    console.log('page is fully loaded');
    await delay(2000);
    messageListener();
    try {
        const items = document.querySelectorAll('.parent .item');
        for (let item of items) {
            const img = item.querySelector('img').src;
            // console.log(img);
            const title = item.querySelector('.title').innerText;
            const shop = item.querySelector('.shop').innerText;
            const link = item.querySelector('.info a').href;
            const expire = item.querySelector('.expiry').innerText;
            object.data.push({ img: img, title: title, link: link, shop: shop, expire: expire });
        }
        object.status = true;
        object.message = "completed";
    }
    catch (e) {
        console.log(e);
        object.status = false;
        object.message = "error";
    }
})

function messageListener() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            console.log(request);
            sendResponse(object);
            return true;
        }
    );
}