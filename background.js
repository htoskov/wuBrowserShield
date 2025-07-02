const BLOCKLIST_URLS = [
    'https://easylist.to/easylist/easylist.txt', // EasyList
    'https://raw.githubusercontent.com/kboghdady/youTube_ads_4_pi-hole/master/black.list' // YouTube ad block list
];

let adBlockList = [];

// Function to fetch the block lists
async function fetchBlockLists() {
    try {
        const fetchPromises = BLOCKLIST_URLS.map(url => fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}`);
            }
            return response.text();
        }));

        const results = await Promise.all(fetchPromises);
        adBlockList = results.flatMap(text => 
            text.split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('[') && !line.startsWith('!'))
        );

        console.log('Ad Block List Loaded:', adBlockList);
    } catch (error) {
        console.error('Error fetching block lists:', error);
    }
}

// Call the function to fetch the block lists
fetchBlockLists();

// Block ads and trackers
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        for (let url of adBlockList) {
            // Check if the request URL matches any of the blocked URLs
            if (details.url.includes(url)) {
                return { cancel: true }; // Block the request
            }
        }
        return { cancel: false }; // Allow the request
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Enforce HTTPS
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.url.startsWith("http://")) {
            return { redirectUrl: details.url.replace("http://", "https://") };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
