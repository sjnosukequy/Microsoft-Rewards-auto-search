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

const responseMessage = { message: "", status: false, data: [] };
function resetResponseMessage() {
    responseMessage.message = "";
    responseMessage.status = false;
    responseMessage.data = [];
}

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
    const parentDiv = document.querySelector('mee-rewards-daily-set-section')
    Object.assign(parentDiv.style, {
        display: 'flex',
        flexDirection: 'column-reverse',
    });
    const childDiv = document.createElement('div');
    childDiv.id = 'game-deals';
    const gameDiv = document.createElement('div');
    const loadingP = document.createElement('h2');
    const Header = document.createElement('h2');
    const More = document.createElement('a');
    More.innerText = 'More Games';
    Header.innerText = 'Deals from IsThereAnyDeal.com';
    loadingP.innerText = 'Loading Game Deals...';
    loadingP.style.textAlign = 'center';
    childDiv.appendChild(Header);
    childDiv.appendChild(loadingP);
    Object.assign(childDiv.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '20px',
    });
    Object.assign(gameDiv.style, {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        padding: '10px',
        overflow: 'auto',
        width: '100%',
    });

    More.style.textDecoration = 'underline';
    More.addEventListener('click', async (event) => {
        event.preventDefault();
        More.remove();
        await MoreGames();
    });
    parentDiv.appendChild(childDiv);

    const tabId = await openNewTabFromContentScript('https://isthereanydeal.com/giveaways/')
    console.log(tabId)
    await pingGameService(tabId);
    console.log('donne')
    console.log(responseMessage);
    loadingP.remove();

    const dataList = responseMessage.data;
    for (let data of dataList) {
        const card = new GameDealCard(data.title, data.img, data.shop, data.link, data.expire);
        gameDiv.appendChild(card.generateHTML());
    }
    childDiv.appendChild(gameDiv);
    childDiv.appendChild(More);
    await cleanUpNewTab(tabId);
});

// BRO THERE IS ALREADY A GAME DEALS API EXISTING
async function MoreGames() {
    const childDiv = document.querySelector('#game-deals');
    const Header = document.createElement('h2');
    const loadingP = document.createElement('h2');
    loadingP.innerText = 'Loading Game Deals...';
    Header.innerText = 'Deals from GamerPower.com';
    const gameDiv = document.createElement('div');
    childDiv.appendChild(Header);
    childDiv.appendChild(loadingP);
    const dataAPI = await (await fetch('https://mynt-proxy.rhythmcorehq.com/proxy?url=https://www.gamerpower.com/api/giveaways')).json();

    Object.assign(gameDiv.style, {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        padding: '10px',
        overflow: 'auto',
        width: '100%',
    });
    loadingP.remove();
    for (let data of dataAPI) {
        const card = new GameDealCard(data.title, data.thumbnail, data.platforms, data.open_giveaway_url, data.end_date);
        gameDiv.appendChild(card.generateHTML());
    }
    childDiv.appendChild(gameDiv);
}

async function pingGameService(tabId) {
    while (!responseMessage.status && responseMessage.message != "error") {
        const response = await chrome.runtime.sendMessage({
            action: "comunicate",
            receiverID: tabId
        });
        if (chrome.runtime.lastError) {
            console.error("Error sending message to Service Worker:", chrome.runtime.lastError.message);
        }
        if (response) {
            responseMessage.message = response.message ? response.message : "";
            responseMessage.status = response.status ? response.status : false;
            responseMessage.data = response.data ? response.data : [];
        }
        else {
            console.log('null response');
        }
        await delay(1000);
        console.log('pinging game service');
    }
}

async function openNewTabFromContentScript(url) {
    const response = await chrome.runtime.sendMessage({
        action: "openNewTab",
        url: url
    });
    if (chrome.runtime.lastError) {
        console.error("Error sending message to Service Worker:", chrome.runtime.lastError.message);
        return null;
    }
    console.log("Service Worker successfully opened tab:", response);
    return response.data.tabId;
}

async function cleanUpNewTab(tabId) {
    const response = await chrome.runtime.sendMessage({
        action: "removeTab",
        receiverID: tabId
    });
    console.log(response);
}

class GameDealCard {
    constructor(title, img, shop, link, expire) {
        this.title = title;
        this.img = img;
        this.shop = shop;
        this.link = link;
        this.expire = expire;
    }
    generateHTML() {
        const a = document.createElement('a')
        const div = document.createElement('div')
        const img = document.createElement('img');
        const title = document.createElement('h3');
        const shop = document.createElement('p');
        const expire = document.createElement('p');

        a.classList.add('c-card')
        a.style.color = 'black';
        div.classList.add('c-card-content')
        Object.assign(div.style, {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            // width: '400px',
        });
        a.href = this.link;
        a.target = "_blank";
        img.src = this.img;
        Object.assign(img.style, {
            width: '300px',
            height: '450px',
            'object-fit': 'cover'
        });
        title.innerText = this.title;
        shop.innerText = this.shop;
        expire.innerText = this.expire;
        div.appendChild(img);
        div.appendChild(title);
        div.appendChild(shop);
        div.appendChild(expire);
        a.appendChild(div);
        return a;
    }

}