(function () {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;
  const STORAGE_KEY = "reelsBlocker_instagram";
  let enabled = true;

  const REELS_SELECTORS = [
    'a[href="/reels/"]',
    'a[href*="/reels/"]',
    'div[style*="reels"]',
  ];

  function hideReels() {
    if (!enabled) return;

    REELS_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const navItem = el.closest("a")?.parentElement;
        if (navItem) navItem.style.display = "none";
      });
    });

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

  api.storage.sync.get(STORAGE_KEY, (result) => {
    enabled = result[STORAGE_KEY] !== false;
    if (enabled) hideReels();
  });

  api.storage.onChanged.addListener((changes) => {
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
