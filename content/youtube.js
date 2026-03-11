(function () {
  "use strict";

  const STORAGE_KEY = "reelsBlocker_youtube";
  let enabled = true;

  // Redirect immediately on /shorts/ URLs — don't wait for storage
  // This runs at document_start so it fires before any media loads
  function redirectIfShorts() {
    if (window.location.pathname.startsWith("/shorts/")) {
      const videoId = window.location.pathname.split("/shorts/")[1]?.split(/[?#/]/)[0];
      if (videoId) {
        window.location.replace("/watch?v=" + videoId);
      } else {
        window.location.replace("/");
      }
      return true;
    }
    return false;
  }

  // Redirect before anything else — enabled defaults to true
  if (redirectIfShorts()) return;

  // Pause and mute any video elements inside Shorts containers
  function muteAndPauseShortsVideos() {
    if (!enabled) return;
    if (!window.location.pathname.startsWith("/shorts/")) return;

    document.querySelectorAll("video").forEach((video) => {
      video.muted = true;
      video.pause();
      video.removeAttribute("autoplay");
      video.srcObject = null;
    });
  }

  // Inject CSS rules for robust hiding that persists across DOM changes
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

  let style = null;

  function enableCSS() {
    if (!style) {
      style = document.createElement("style");
      style.id = "reels-blocker-yt-styles";
    }
    style.textContent = CSS_RULES;
    (document.head || document.documentElement).appendChild(style);
  }

  function disableCSS() {
    if (style) style.textContent = "";
  }

  // Hide via JS for elements that :has() can't reach or for older browsers
  function hideShortsByJS() {
    if (!enabled) return;

    document.querySelectorAll('a[href*="/shorts/"]').forEach((link) => {
      const renderer = link.closest(
        "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-rich-section-renderer, ytd-reel-item-renderer"
      );
      if (renderer) renderer.style.display = "none";
    });

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
    if (redirectIfShorts()) return;
    muteAndPauseShortsVideos();
  }

  function deactivate() {
    disableCSS();
    showShortsByJS();
  }

  // Inject CSS immediately (before waiting for storage)
  enableCSS();

  // Load saved state — may disable if user toggled off
  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    enabled = result[STORAGE_KEY] !== false;
    if (!enabled) {
      deactivate();
    }
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
  // Wait for body since we run at document_start
  function startObserver() {
    const observer = new MutationObserver(() => {
      if (enabled) {
        hideShortsByJS();
        muteAndPauseShortsVideos();
        redirectIfShorts();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) {
    startObserver();
  } else {
    document.addEventListener("DOMContentLoaded", startObserver);
  }

  // Listen for YouTube SPA navigation via yt-navigate-finish event
  window.addEventListener("yt-navigate-finish", () => {
    if (enabled) {
      hideShortsByJS();
      if (redirectIfShorts()) return;
      muteAndPauseShortsVideos();
    }
  });

  // Also intercept yt-navigate-start for even earlier redirect
  window.addEventListener("yt-navigate-start", () => {
    if (enabled) redirectIfShorts();
  });
})();
