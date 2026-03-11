(function () {
  "use strict";

  const STORAGE_KEY = "reelsBlocker_instagram";
  let enabled = true;

  const REELS_SELECTORS = [
    // Reels tab in navigation
    'a[href="/reels/"]',
    'a[href*="/reels/"]',
    // Reels suggestions in feed
    'div[style*="reels"]',
  ];

  function hideReels() {
    if (!enabled) return;

    // Hide Reels nav links
    REELS_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        // For nav items, hide the parent list item
        const navItem = el.closest("a")?.parentElement;
        if (navItem) navItem.style.display = "none";
      });
    });

    // Redirect away from /reels/ pages
    if (window.location.pathname.startsWith("/reels")) {
      window.location.replace("/");
    }
  }

  function showReels() {
    REELS_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const navItem = el.closest("a")?.parentElement;
        if (navItem) navItem.style.display = "";
      });
    });
  }

  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    enabled = result[STORAGE_KEY] !== false;
    if (enabled) hideReels();
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      enabled = changes[STORAGE_KEY].newValue !== false;
      if (enabled) {
        hideReels();
      } else {
        showReels();
      }
    }
  });

  const observer = new MutationObserver(() => {
    if (enabled) hideReels();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
