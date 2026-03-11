(function () {
  "use strict";

  const STORAGE_KEY = "reelsBlocker_tiktok";
  let enabled = true;

  function blockTikTok() {
    if (!enabled) return;

    // Replace page content with a blocked message
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #121212;
        color: #fff;
        text-align: center;
        flex-direction: column;
      ">
        <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
        <h1 style="font-size: 28px; margin-bottom: 12px;">TikTok is Blocked</h1>
        <p style="font-size: 16px; color: #aaa; max-width: 400px;">
          Reels &amp; Shorts Blocker is preventing access to TikTok.
          You can disable this in the extension popup.
        </p>
      </div>
    `;
  }

  function unblockTikTok() {
    window.location.reload();
  }

  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    enabled = result[STORAGE_KEY] !== false;
    if (enabled) blockTikTok();
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      enabled = changes[STORAGE_KEY].newValue !== false;
      if (enabled) {
        blockTikTok();
      } else {
        unblockTikTok();
      }
    }
  });
})();
