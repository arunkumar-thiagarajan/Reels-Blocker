(function () {
  "use strict";

  const STORAGE_KEY = "reelsBlocker_youtube";
  let enabled = true;

  const SHORTS_SELECTORS = [
    // Shorts shelf on home page
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-reel-shelf-renderer',
    // Shorts tab in navigation
    'ytd-mini-guide-entry-renderer a[title="Shorts"]',
    'ytd-guide-entry-renderer a[title="Shorts"]',
    // Shorts in search results
    'ytd-video-renderer a[href*="/shorts/"]',
    // Shorts badges and links in recommendations
    'ytd-compact-video-renderer a[href*="/shorts/"]',
    'ytd-grid-video-renderer a[href*="/shorts/"]',
  ];

  function hideShorts() {
    if (!enabled) return;

    // Hide elements matching selectors
    SHORTS_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        // Walk up to the nearest renderer parent for clean removal
        const renderer = el.closest(
          "ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer"
        );
        const target = renderer || el;
        target.style.display = "none";
      });
    });

    // Redirect away from /shorts/ URLs
    if (window.location.pathname.startsWith("/shorts/")) {
      const videoId = window.location.pathname.split("/shorts/")[1]?.split("?")[0];
      if (videoId) {
        window.location.replace("/watch?v=" + videoId);
      } else {
        window.location.replace("/");
      }
    }
  }

  function showShorts() {
    SHORTS_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const renderer = el.closest(
          "ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer"
        );
        const target = renderer || el;
        target.style.display = "";
      });
    });
  }

  // Load saved state
  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    enabled = result[STORAGE_KEY] !== false;
    if (enabled) hideShorts();
  });

  // Listen for toggle changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      enabled = changes[STORAGE_KEY].newValue !== false;
      if (enabled) {
        hideShorts();
      } else {
        showShorts();
      }
    }
  });

  // Observe DOM changes for dynamically loaded content
  const observer = new MutationObserver(() => {
    if (enabled) hideShorts();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also run on navigation (YouTube is a SPA)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (enabled) hideShorts();
    }
  });
  urlObserver.observe(document.querySelector("title") || document.head, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
