(function () {
  "use strict";

  const platforms = [
    { id: "youtube", key: "reelsBlocker_youtube" },
    { id: "instagram", key: "reelsBlocker_instagram" },
    { id: "facebook", key: "reelsBlocker_facebook" },
    { id: "tiktok", key: "reelsBlocker_tiktok" },
  ];

  const toggleAllBtn = document.getElementById("toggle-all");

  function updateToggleAllButton() {
    const allChecked = platforms.every(
      (p) => document.getElementById("toggle-" + p.id).checked
    );
    toggleAllBtn.textContent = allChecked ? "Disable All" : "Enable All";
  }

  // Load saved states
  const keys = platforms.map((p) => p.key);
  chrome.storage.sync.get(keys, (result) => {
    platforms.forEach((p) => {
      const checkbox = document.getElementById("toggle-" + p.id);
      checkbox.checked = result[p.key] !== false;
    });
    updateToggleAllButton();
  });

  // Add change listeners for each toggle
  platforms.forEach((p) => {
    const checkbox = document.getElementById("toggle-" + p.id);
    checkbox.addEventListener("change", () => {
      chrome.storage.sync.set({ [p.key]: checkbox.checked });
      updateToggleAllButton();
    });
  });

  // Toggle all button
  toggleAllBtn.addEventListener("click", () => {
    const allChecked = platforms.every(
      (p) => document.getElementById("toggle-" + p.id).checked
    );
    const newState = !allChecked;

    const updates = {};
    platforms.forEach((p) => {
      updates[p.key] = newState;
      document.getElementById("toggle-" + p.id).checked = newState;
    });

    chrome.storage.sync.set(updates);
    updateToggleAllButton();
  });
})();
