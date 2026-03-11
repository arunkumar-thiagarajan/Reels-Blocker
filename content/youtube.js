(function () {
  "use strict";

  const STORAGE_KEY = "reelsBlocker_youtube";
  let enabled = true;

  // Inject CSS rules for robust hiding that persists across DOM changes
  const style = document.createElement("style");
  style.id = "reels-blocker-yt-styles";
  document.head.appendChild(style);

  const CSS_RULES = `
    /* Shorts shelf on home/subscriptions page */
    ytd-rich-shelf-renderer[is-shorts],
    ytd-reel-shelf-renderer {
      display: none !important;
    }

    /* Shorts tab in sidebar navigation */
    ytd-guide-entry-renderer a[title="Shorts"],
    ytd-mini-guide-entry-renderer a[title="Shorts"] {
      display: none !important;
    }

    /* Shorts in search results and recommendations */
    ytd-video-renderer:has(a[href*="/shorts/"]),
    ytd-compact-video-renderer:has(a[href*="/shorts/"]),
    ytd-grid-video-renderer:has(a[href*="/shorts/"]),
    ytd-rich-item-renderer:has(a[href*="/shorts/"]) {
      display: none !important;
    }

    /* Shorts badge/chip in various places */
    ytd-rich-section-renderer:has(a[href*="/shorts/"]),
    ytd-reel-item-renderer {
      display: none !important;
    }

    /* Shorts notification chips */
    yt-chip-cloud-chip-renderer:has([title="Shorts"]) {
      display: none !important;
    }

    /* Shorts pivot bar item (tab bar on channel pages) */
    yt-tab-shape[tab-title="Shorts"],
    tp-yt-paper-tab:has(a[href*="/shorts"]) {
      display: none !important;
    }

    /* Shorts page content itself */
    ytd-shorts {
      display: none !important;
    }
  `;

  function enableCSS() {
    style.textContent = CSS_RULES;
  }

  function disableCSS() {
    style.textContent = "";
  }

  function redirectIfShorts() {
    if (!enabled) return;

    if (window.location.pathname.startsWith("/shorts/")) {
      const videoId = window.location.pathname.split("/shorts/")[1]?.split(/[?#/]/)[0];
      if (videoId) {
        window.location.replace("/watch?v=" + videoId);
      } else {
        window.location.replace("/");
      }
    }
  }

  // Also hide via JS for elements that :has() can't reach or for older browsers
  function hideShortsByJS() {
    if (!enabled) return;

    // Hide any link containers pointing to shorts
    document.querySelectorAll('a[href*="/shorts/"]').forEach((link) => {
      const renderer = link.closest(
        "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-rich-section-renderer, ytd-reel-item-renderer"
      );
      if (renderer) renderer.style.display = "none";
    });

    // Hide Shorts guide entries
    document
      .querySelectorAll(
        'ytd-guide-entry-renderer a[title="Shorts"], ytd-mini-guide-entry-renderer a[title="Shorts"]'
      )
      .forEach((el) => {
        const entry = el.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer");
        if (entry) entry.style.display = "none";
      });
  }

  function showShortsByJS() {
    document
      .querySelectorAll(
        "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-rich-section-renderer, ytd-reel-item-renderer, ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer"
      )
      .forEach((el) => {
        if (el.style.display === "none") {
          el.style.display = "";
        }
      });
  }

  function activate() {
    enableCSS();
    hideShortsByJS();
    redirectIfShorts();
  }

  function deactivate() {
    disableCSS();
    showShortsByJS();
  }

  // Load saved state
  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    enabled = result[STORAGE_KEY] !== false;
    if (enabled) activate();
  });

  // Listen for toggle changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      enabled = changes[STORAGE_KEY].newValue !== false;
      if (enabled) {
        activate();
      } else {
        deactivate();
      }
    }
  });

  // Observe DOM changes for dynamically loaded content
  const observer = new MutationObserver(() => {
    if (enabled) {
      hideShortsByJS();
      redirectIfShorts();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for YouTube SPA navigation via yt-navigate-finish event
  window.addEventListener("yt-navigate-finish", () => {
    if (enabled) {
      hideShortsByJS();
      redirectIfShorts();
    }
  });
})();
