(function () {
  "use strict";

  const STORAGE_KEY = "reelsBlocker_youtube";
  let enabled = true;

  // Redirect immediately on /shorts/ URLs — runs at document_start
  function redirectIfShorts() {
    if (window.location.pathname.startsWith("/shorts/") || window.location.pathname === "/shorts") {
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

  // Pause and mute any video elements on Shorts pages
  function muteAndPauseShortsVideos() {
    if (!enabled) return;
    if (!window.location.pathname.startsWith("/shorts")) return;

    document.querySelectorAll("video").forEach((video) => {
      video.muted = true;
      video.pause();
      video.removeAttribute("autoplay");
    });
  }

  // Hide Shorts elements via JS — catches anything CSS :has() might miss
  function hideShortsByJS() {
    if (!enabled) return;

    // Hide any element that contains a link to /shorts/
    document.querySelectorAll('a[href*="/shorts/"], a[href="/shorts"]').forEach((link) => {
      // Walk up to find the nearest meaningful container
      const renderer = link.closest(
        [
          "ytd-rich-item-renderer",
          "ytd-rich-shelf-renderer",
          "ytd-rich-section-renderer",
          "ytd-reel-shelf-renderer",
          "ytd-video-renderer",
          "ytd-compact-video-renderer",
          "ytd-grid-video-renderer",
          "ytd-reel-item-renderer",
          "ytd-guide-entry-renderer",
          "ytd-mini-guide-entry-renderer",
        ].join(", ")
      );
      if (renderer) {
        renderer.style.setProperty("display", "none", "important");
      }
    });

    // Also remove inline Shorts overlay links (e.g. "Shorts" badges on thumbnails)
    document.querySelectorAll('[overlay-style="SHORTS"]').forEach((el) => {
      const container = el.closest("ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer");
      if (container) {
        container.style.setProperty("display", "none", "important");
      }
    });

    // Hide Shorts tab on channel pages
    document.querySelectorAll('yt-tab-shape[tab-title="Shorts"]').forEach((tab) => {
      tab.style.setProperty("display", "none", "important");
    });
  }

  function showShortsByJS() {
    const selectors = [
      "ytd-rich-item-renderer",
      "ytd-rich-shelf-renderer",
      "ytd-rich-section-renderer",
      "ytd-reel-shelf-renderer",
      "ytd-video-renderer",
      "ytd-compact-video-renderer",
      "ytd-grid-video-renderer",
      "ytd-reel-item-renderer",
      "ytd-guide-entry-renderer",
      "ytd-mini-guide-entry-renderer",
    ].join(", ");

    document.querySelectorAll(selectors).forEach((el) => {
      if (el.style.display === "none") {
        el.style.removeProperty("display");
      }
    });
  }

  // Dynamic CSS injection (supplements the static youtube-early.css)
  let style = null;
  const CSS_RULES = `
    /* Belt-and-suspenders: duplicate key rules in JS-injected stylesheet */
    ytd-rich-section-renderer:has(a[href*="/shorts"]),
    ytd-rich-shelf-renderer:has(a[href*="/shorts"]),
    ytd-rich-item-renderer:has(a[href*="/shorts"]),
    ytd-reel-shelf-renderer,
    ytd-reel-item-renderer,
    ytd-guide-entry-renderer:has(a[href="/shorts"]),
    ytd-mini-guide-entry-renderer:has(a[href="/shorts"]),
    [overlay-style="SHORTS"] {
      display: none !important;
    }
  `;

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
    if (!enabled) deactivate();
  });

  // Listen for toggle changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      enabled = changes[STORAGE_KEY].newValue !== false;
      enabled ? activate() : deactivate();
    }
  });

  // Observe DOM changes for dynamically loaded Shorts content
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

  // YouTube SPA navigation events
  window.addEventListener("yt-navigate-start", () => {
    if (enabled) redirectIfShorts();
  });

  window.addEventListener("yt-navigate-finish", () => {
    if (enabled) activate();
  });

  // Fallback: intercept History API for SPA navigation
  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;

  history.pushState = function () {
    origPushState.apply(this, arguments);
    if (enabled) {
      redirectIfShorts();
      hideShortsByJS();
    }
  };

  history.replaceState = function () {
    origReplaceState.apply(this, arguments);
    if (enabled) {
      redirectIfShorts();
      hideShortsByJS();
    }
  };

  window.addEventListener("popstate", () => {
    if (enabled) {
      redirectIfShorts();
      hideShortsByJS();
    }
  });
})();
