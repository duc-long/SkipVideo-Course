chrome.runtime.onInstalled.addListener(() => {
    console.log("Coursera Keep Alive Extension Installed");
    chrome.storage.local.set({ enabled: true });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.includes("coursera.org")) {
        chrome.storage.local.get("enabled", (data) => {
            if (data.enabled) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["content.js"]
                });
            }
        });
    }
});