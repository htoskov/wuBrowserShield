const BLOCKLIST_URLS = [
    'https://easylist.to/easylist/easylist.txt',
    'https://raw.githubusercontent.com/kboghdady/youTube_ads_4_pi-hole/master/black.list',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-1.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-2.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-3.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-4.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-5.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-6.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-7.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-8.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/YouTube/YoutubeAdblock-9.txt',
    'https://raw.githubusercontent.com/jerryn70/GoodbyeAds/refs/heads/master/Core/GoodbyeAds-Database.txt'
];

let adBlockList = [];

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
            text.split('\n')
                .map(line => line.trim())
                .filter(line =>
                    line && 
                    !line.startsWith('#') &&
                    !line.startsWith('[') &&
                    !line.startsWith('!')
                )
                .map(line => {
                    // If it's a hosts line like "0.0.0.0 domain.com", extract the domain
                    const parts = line.split(/\s+/);
                    if (parts.length >= 2 && parts[0].match(/^0\.0\.0\.0|127\.0\.0\.1$/)) {
                        return parts[1];
                    }
                    // Otherwise assume it's a domain or pattern on its own
                    return line;
                })
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
