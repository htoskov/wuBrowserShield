// List of ads and trackers
const BLOCKLIST_URL = 'https://easylist.to/easylist/easylist.txt'; 

let adBlockList = [];

// Function to fetch the block list
async function fetchBlockList() {
    try {
        const response = await fetch(BLOCKLIST_URL);
        const text = await response.text();
        adBlockList = text.split('\n').filter(line => line && !line.startsWith('!')); // Filter out comments and empty lines
        console.log('Ad Block List Loaded:', adBlockList);
    } catch (error) {
        console.error('Error fetching block list:', error);
    }
}

fetchBlockList();

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        for (let url of adBlockList) {
            if (details.url.includes(url)) {
                return { cancel: true };
            }
        }
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// HTTP blocker and redirects to HTTPS
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.url.startsWith("http://")) {
            return { redirectUrl: details.url.replace("http://", "https://") };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
