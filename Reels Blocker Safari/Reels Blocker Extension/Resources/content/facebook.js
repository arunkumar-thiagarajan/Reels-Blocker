(function () {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;
  const STORAGE_KEY = "reelsBlocker_facebook";
  let enabled = true;

  function hideReels() {
    if (!enabled) return;

    document.querySelectorAll('a[href*="/reel/"], a[href*="/reels"]').forEach((el) => {
      const container = el.closest('[role="listitem"], [data-pagelet]') || el.parentElement;
      if (container) container.style.display = "none";
    });

    document.querySelectorAll('[aria-label*="Reels"], [aria-label*="reels"]').forEach((el) => {
      el.style.display = "none";
    });

    if (
      window.location.pathname.startsWith("/reel/") ||
      window.location.pathname.startsWith("/reels")
    ) {
      window.location.replace("/");
    }
  }

  function showReels() {
    document.querySelectorAll('a[href*="/reel/"], a[href*="/reels"]').forEach((el) => {
      const container = el.closest('[role="listitem"], [data-pagelet]') || el.parentElement;
      if (container) container.style.display = "";
    });

    document.querySelectorAll('[aria-label*="Reels"], [aria-label*="reels"]').forEach((el) => {
      el.style.display = "";
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
