// ==============================
// Constants and DOM Elements
// ==============================
const AUTH_TOKEN = "DL_Sirc_123321";

const deviceSelect = document.getElementById("deviceSelect");
const samplingIntervalInput = document.getElementById("samplingInterval"); // in minutes
const settingsForm = document.getElementById("settingsForm");
const btnSaveSettings = document.getElementById("btnSaveSettings");
const btnResetSettings = document.getElementById("btnResetSettings");
const reportPageBtn = document.getElementById("reportPage");
const dashboardPageBtn = document.getElementById("dashboardPage");

// ==============================
// Navigation
// ==============================
reportPageBtn.addEventListener("click", () => {
  window.location.href = "reports.html";
});

dashboardPageBtn.addEventListener("click", () => {
  window.location.href = "../index.html";
});

// ==============================
// Reset Form
// ==============================
btnResetSettings.addEventListener("click", (e) => {
  e.preventDefault();
  settingsForm.reset();
});

// ==============================
// Load settings for selected device (show in minutes)
// ==============================
const loadDeviceSettings = (deviceId) => {
  if (!deviceId) return;

  const apiUrl = `https://iot-humidity-datalogger.onrender.com/api/config/${deviceId}`;

  fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Convert seconds to minutes for display
      const intervalMinutes = Math.round((data.loggingInterval || 60) / 60);
      samplingIntervalInput.value = intervalMinutes;
    })
    .catch((error) => {
      console.error("Error loading device settings:", error);
      alert("Failed to load device settings.");
    });
};

// Load settings when device selection changes
deviceSelect.addEventListener("change", () => {
  const deviceId = deviceSelect.value;
  loadDeviceSettings(deviceId);
});

// ==============================
// Save Settings (convert minutes to seconds)
// ==============================
btnSaveSettings.addEventListener("click", (e) => {
  e.preventDefault();

  const deviceId = deviceSelect.value.trim();
  const intervalMinutes = Number(samplingIntervalInput.value);

  // Validation
  if (!deviceId) {
    alert("Please select a device.");
    return;
  }
  if (!intervalMinutes || intervalMinutes <= 0) {
    alert("Please enter a valid interval in minutes.");
    return;
  }

  // Convert minutes to seconds before sending to API
  const intervalSeconds = intervalMinutes * 60;

  const apiUrl = `https://iot-humidity-datalogger.onrender.com/api/config/${deviceId}`;

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      deviceId: deviceId,
      loggingInterval: intervalSeconds,
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert("Settings saved successfully!");
        settingsForm.reset(); // optional: reset after save
      } else {
        alert("Failed to save settings.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while saving settings.");
    });
});

// ==============================
// Optional: Load initial device settings on page load
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  if (deviceSelect.value) {
    loadDeviceSettings(deviceSelect.value);
  }
});
