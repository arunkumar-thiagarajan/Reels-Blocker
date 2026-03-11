(function () {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;

  const platforms = [
    { id: "instagram", key: "reelsBlocker_instagram" },
    { id: "facebook", key: "reelsBlocker_facebook" },
  ];

  const toggleAllBtn = document.getElementById("toggle-all");

  function updateToggleAllButton() {
    const allChecked = platforms.every(
      (p) => document.getElementById("toggle-" + p.id).checked
    );
    toggleAllBtn.textContent = allChecked ? "Disable All" : "Enable All";
  }

  const keys = platforms.map((p) => p.key);
  api.storage.sync.get(keys, (result) => {
    platforms.forEach((p) => {
      const checkbox = document.getElementById("toggle-" + p.id);
      checkbox.checked = result[p.key] !== false;
    });
    updateToggleAllButton();
  });

  platforms.forEach((p) => {
    const checkbox = document.getElementById("toggle-" + p.id);
    checkbox.addEventListener("change", () => {
      api.storage.sync.set({ [p.key]: checkbox.checked });
      updateToggleAllButton();
    });
  });

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

    api.storage.sync.set(updates);
    updateToggleAllButton();
  });
})();
