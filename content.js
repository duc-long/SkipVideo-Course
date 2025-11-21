let active = false;
let activityTimeout;

function stopAllFunctions() {
    console.log("❌ Stopping all functions.");
    active = false;
    clearTimeout(activityTimeout);
    document.removeEventListener("visibilitychange", overrideVisibilityAPI, true);
    window.removeEventListener("blur", overrideVisibilityAPI, true);
}

chrome.storage.local.get("enabled", (data) => {
    if (!data.enabled) {
        console.log("❌ Extension is disabled.");
        return;
    }

    console.log("✅ Extension is enabled!");
    active = true;

    overrideVisibilityAPI();
    keepTabActive();
    simulateUserActivity();
    preventVideoPause();
    createFloatingToggle();
    injectPopupUI();
    autoCompleteAndNext();
    autoSkipTo89Percent();
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
        if (changes.enabled.newValue === false) {
            stopAllFunctions();
        } else {
            console.log("✅ Extension re-enabled!");
            active = true;
            keepTabActive();
            simulateUserActivity();
            preventVideoPause();
            createFloatingToggle();
            injectPopupUI();
            autoCompleteAndNext();
            autoSkipTo89Percent();
        }
    }
});

function simulateUserActivity() {
    if (!active) return;
    let eventTypes = ["mousemove", "keydown", "scroll", "click"];
    let eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    document.dispatchEvent(new Event(eventType));
    let nextInterval = Math.floor(Math.random() * 15000) + 10000;
    activityTimeout = setTimeout(simulateUserActivity, nextInterval);
}

function keepTabActive() {
    if (!active) return;
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    window.dispatchEvent(new Event("focus"));
}

function overrideVisibilityAPI() {
    if (!active) return;
    document.addEventListener("visibilitychange", (event) => {
        event.stopImmediatePropagation();
    }, true);

    window.addEventListener("blur", (event) => {
        event.stopImmediatePropagation();
        window.dispatchEvent(new Event("focus"));
    }, true);
}

function preventVideoPause() {
    if (!active) return;
    let video = document.querySelector("video");
    if (video) {
        video.play();
        video.addEventListener("pause", () => {
            if (active) video.play();
        });
    }
}

function autoCompleteAndNext() {
    if (!active) return;

    function clickMarkComplete() {
        const btn = document.querySelector("button[data-testid='mark-complete']");
        if (btn && !btn.disabled) {
            console.log("✅ Clicking 'Mark as completed'...");
            btn.click();

            setTimeout(() => {
                const nextBtn = document.querySelector("button[data-testid='next-item']");
                if (nextBtn && !nextBtn.disabled) {
                    console.log("➡️ Clicking 'Next item'...");
                    nextBtn.click();
                } else {
                    console.log("⚠️ 'Next item' button not found or disabled.");
                }
            }, 2000);
        } else {
            console.log("⌛ Waiting for 'Mark as completed' button...");
            setTimeout(clickMarkComplete, 3000);
        }
    }

    setTimeout(clickMarkComplete, 5000);
}

function autoSkipTo89Percent() {
    if (!active) return;

    setTimeout(() => {
        const video = document.querySelector("video");
        if (video && video.duration > 60) {
            console.log("⏩ Skipping video to 89%...");
            video.currentTime = video.duration * 0.89;
            video.play();

            // Đợi thêm 2-3 giây rồi cố gắng click nút "Next"
            const delay = Math.floor(Math.random() * 1000) + 2000;
            setTimeout(() => tryClickNextItem(1), delay);
        } else {
            console.log("🎥 No valid video found or too short.");
        }
    }, 5000); // đợi 5s để video sẵn sàng

    function tryClickNextItem(attempt) {
        const nextBtn = document.querySelector("button[aria-label='Next Item']");

        if (nextBtn && !nextBtn.disabled) {
            console.log(`✅ [Attempt ${attempt}] Clicking 'Next Item'`);
            nextBtn.click();
        } else if (attempt < 6) {
            console.log(`⏳ [Attempt ${attempt}] Waiting for 'Next Item'...`);
            setTimeout(() => tryClickNextItem(attempt + 1), 1500); // thử lại sau 1.5s
        } else {
            console.log("❌ Failed to click 'Next Item' after multiple attempts.");
        }
    }
}


function createFloatingToggle() {
    if (document.getElementById("coursera-toggle-btn")) return;

    const btn = document.createElement("button");
    btn.id = "coursera-toggle-btn";
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "9999";
    btn.style.padding = "10px 15px";
    btn.style.backgroundColor = "#007bff";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    btn.style.cursor = "pointer";
    btn.textContent = "Coursera: On";

    chrome.storage.local.get("enabled", (data) => {
        btn.textContent = "Coursera: " + (data.enabled ? "On" : "Off");
        btn.style.backgroundColor = data.enabled ? "#28a745" : "#dc3545";
    });

    btn.addEventListener("click", () => {
        chrome.storage.local.get("enabled", (data) => {
            const newState = !data.enabled;
            chrome.storage.local.set({ enabled: newState });
            btn.textContent = "Coursera: " + (newState ? "On" : "Off");
            btn.style.backgroundColor = newState ? "#28a745" : "#dc3545";
        });
    });

    document.body.appendChild(btn);
}

function injectPopupUI() {
    if (document.getElementById("coursera-ui")) return;

    const container = document.createElement("div");
    container.id = "coursera-ui";
    container.style.position = "fixed";
    container.style.bottom = "80px";
    container.style.right = "20px";
    container.style.background = "rgba(30, 30, 40, 0.95)";
    container.style.color = "#fff";
    container.style.padding = "16px";
    container.style.borderRadius = "12px";
    container.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
    container.style.zIndex = "9999";
    container.style.fontFamily = "'Segoe UI', sans-serif";
    container.style.fontSize = "14px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.backdropFilter = "blur(8px)";
    container.style.border = "1px solid rgba(255,255,255,0.1)";
    container.style.minWidth = "180px";

    container.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; text-align:center;">🎓 Coursera Tools</div>
        <button id="toggle" class="coursera-btn">Loading...</button>
        <button id="skipTo89" class="coursera-btn">⏩ Skip to 89%</button>
        <button id="skip30s" class="coursera-btn">⏭️ Skip 30s</button>
        <button id="skipReading" class="coursera-btn">📖 Skip Reading</button>
    `;

    document.body.appendChild(container);

    // Inject CSS cho button đẹp hơn
    const style = document.createElement("style");
    style.textContent = `
        .coursera-btn {
            background: linear-gradient(135deg, #00c6ff, #0072ff);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s, transform 0.2s;
        }
        .coursera-btn:hover {
            background: linear-gradient(135deg, #0072ff, #00c6ff);
            transform: scale(1.03);
        }
        .coursera-btn:active {
            transform: scale(0.96);
        }
    `;
    document.head.appendChild(style);

    const toggleBtn = container.querySelector("#toggle");
    const skipTo89Btn = container.querySelector("#skipTo89");
    const skip30sBtn = container.querySelector("#skip30s");
    const skipReadingBtn = container.querySelector("#skipReading");

    chrome.storage.local.get("enabled", (data) => {
        toggleBtn.textContent = data.enabled ? "Disable ⛔" : "Enable ✅";
    });

    toggleBtn.addEventListener("click", () => {
        chrome.storage.local.get("enabled", (data) => {
            const newState = !data.enabled;
            chrome.storage.local.set({ enabled: newState }, () => {
                toggleBtn.textContent = newState ? "Disable ⛔" : "Enable ✅";
            });
        });
    });

    skipTo89Btn.addEventListener("click", () => {
        const video = document.querySelector("video");
        if (video) {
            video.currentTime = video.duration * 0.89;
            video.play();
        }
    });

    skip30sBtn.addEventListener("click", () => {
        const video = document.querySelector("video");
        if (video) {
            video.currentTime += 30;
            video.play();
        }
    });

    skipReadingBtn.addEventListener("click", () => {
        let readingContainer = document.querySelector(".reading-content, .content-container, .text-section");
        if (!readingContainer) return;

        Object.defineProperty(document, "hidden", { value: false, configurable: true });
        Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
        document.dispatchEvent(new Event("scroll"));
        document.dispatchEvent(new Event("mousemove"));
        document.dispatchEvent(new Event("keydown"));
        document.dispatchEvent(new Event("visibilitychange"));

        console.log("⏩ Skipped reading wait time.");
    });
}

