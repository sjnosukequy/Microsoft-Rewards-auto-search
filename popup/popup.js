const btn = document.getElementById("start-btn");
const searches = document.getElementById("searches");
const progress = document.querySelector("progress");
const points = document.getElementById("points");
const link_element = document.getElementById("rewards-link");
const current_search = document.getElementById("current-search");

const responseMessage = { message: "", status: false };

function resetResponseMessage() {
    responseMessage.message = "";
    responseMessage.status = false;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.storage.local.get(["rewardPoints"]).then((result) => {
    if (result.rewardPoints)
        points.innerText = result.rewardPoints;
    else {
        link_element.classList.remove("hidden");
        points.classList.add("hidden");
    }
});

document.getElementById("start-btn").addEventListener("click", function () {
    main();
});

document.addEventListener('DOMContentLoaded', (event) => {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            responseMessage.message = request.message;
            responseMessage.status = request.status;
        }
    )
});

async function main() {
    const numSearches = parseInt(searches.value);
    progress.max = numSearches;
    progress.value = 0;
    btn.disabled = true;
    btn.querySelector(".loading").classList.remove("hidden");
    const reqs = []
    const keywords = await fetch(`https://random-word-api.vercel.app/api?words=${numSearches}`).then(response => { return response.json() })

    for (let i of keywords) {
        reqs.push(fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(i)}&type=list`))
    }

    let index = 1;
    for (let req of reqs) {
        let randomDelay = Math.floor(Math.random() * 2000) + 1000;
        let res = await req.then(response => { return response.json() })
        let tab = await chrome.tabs.create({ url: `https://www.bing.com/`, active: false })
        current_search.innerText = 'opening tab ...';
        await delayTillLoad();
        resetResponseMessage();
        const response = await chrome.tabs.sendMessage(tab.id, { querry: res[1][0] })
        current_search.innerText = response ? response.status ? res[1][0] : response.message : 'error';
        progress.value = index;
        await delay(randomDelay);
        index++;
    }
    btn.innerText = "Done";
    // const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    // const response = await chrome.tabs.sendMessage(tab.id, { greeting: "hello" })
    // document.getElementById("start-btn").textContent = response.farewell;

    // let tab = await chrome.tabs.create({ url: `https://www.bing.com/`, active: false })
    // await delayTillLoad();
    // document.getElementById("start-btn").textContent = "nice"
}

async function delayTillLoad() {
    while (!responseMessage.status) {
        await delay(1000);
    }
}