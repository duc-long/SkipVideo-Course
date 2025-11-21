document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("toggle");
    const skipButton = document.getElementById("skipTo89");
    const skip30sButton = document.getElementById("skip30s");
    const skipReadingButton = document.getElementById("skipReading");

    // Cập nhật trạng thái button bật/tắt extension
    chrome.storage.local.get("enabled", (data) => {
        button.textContent = data.enabled ? "Disable" : "Enable";
    });

    // Bật/tắt extension
    button.addEventListener("click", () => {
        chrome.storage.local.get("enabled", (data) => {
            const newState = !data.enabled;
            chrome.storage.local.set({ enabled: newState }, () => {
                button.textContent = newState ? "Disable" : "Enable";

                // Gửi message đến content.js để cập nhật ngay lập tức
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach((tab) => {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: (state) => {
                                chrome.runtime.sendMessage({ action: "toggleExtension", state });
                            },
                            args: [newState]
                        });
                    });
                });
            });
        });
    });

    // Skip đến 89% video
    skipButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: skipTo89Percent
            });
        });
    });

    // Skip 30s video
    skip30sButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: skip30Seconds
            });
        });
    });

    // Skip thời gian đọc
    skipReadingButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: skipReadingTime
            });
        });
    });
});

// Hàm skip đến 89% video
function skipTo89Percent() {
    let video = document.querySelector("video");
    if (video) {
        video.currentTime = video.duration * 0.89;
    }
}

// Hàm skip thời gian đọc
function skipReadingTime() {
    let readingContainer = document.querySelector(".reading-content, .content-container, .text-section");
    if (!readingContainer) return;

    // Giả lập thời gian đọc đủ 30 giây
    let startTime = performance.now() - 30000;
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });

    // Gửi sự kiện giả để đánh lừa hệ thống
    document.dispatchEvent(new Event("scroll"));
    document.dispatchEvent(new Event("mousemove"));
    document.dispatchEvent(new Event("keydown"));
    document.dispatchEvent(new Event("visibilitychange"));

    console.log("⏩ Đã skip 30 giây đọc ngay lập tức.");
}
