document.getElementById("reportPage").addEventListener("click", () => {
  window.location.href = "pages/reports.html";
});
document.getElementById("dashboardPage").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("settingsPage").addEventListener("click", () => {
  window.location.href = "pages/settings.html";
});

// API Declaration
const API_URL_LIVE_DL1 =
  "https://iot-humidity-datalogger.onrender.com/api/temperature/live/DL-01";
const API_URL_LOG_DL1 =
  "https://iot-humidity-datalogger.onrender.com/api/temperature/log/DL-01";
const API_URL_LIVE_DL2 =
  "https://iot-humidity-datalogger.onrender.com/api/temperature/live/DL-02";
const API_URL_LOG_DL2 =
  "https://iot-humidity-datalogger.onrender.com/api/temperature/log/DL-02";
const API_URL_LIVE_DL3 =
  "https://iot-humidity-datalogger.onrender.com/api/temperature/live/DL-03";
const API_URL_LOG_DL3 =
  "https://iot-humidity-datalogger.onrender.com/api/temperature/log/DL-03";

// Authentication token
const AUTH_TOKEN = "DL_Sirc_123321";

// Variable Declaretion for LiveData Insert
const liveTemp1 = document.getElementById("temp1");
const liveTemp2 = document.getElementById("temp2");
const liveTemp3 = document.getElementById("temp3");
const liveHumi1 = document.getElementById("humi1");
const liveHumi2 = document.getElementById("humi2");
const liveHumi3 = document.getElementById("humi3");

// Call Fetch Function for Live Data Collection
function fetchLiveDataDL(apiUrl, tempElement, humiElement) {
  fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const temperature = data.temperature || "--";
      const humidity = data.humidity || "--";
      tempElement.textContent = temperature;
      humiElement.textContent = humidity;
    })
    .catch((err) => console.log("Fetch error:", err));
}

// Initial + periodic fetch for Live Data
function updateAllLive() {
  fetchLiveDataDL(API_URL_LIVE_DL1, liveTemp1, liveHumi1);
  fetchLiveDataDL(API_URL_LIVE_DL2, liveTemp2, liveHumi2);
  fetchLiveDataDL(API_URL_LIVE_DL3, liveTemp3, liveHumi3);
}

updateAllLive();
setInterval(updateAllLive, 5000);

// End of Live Data Fetching

const MAX_POINTS = 1000;
const seenTimestamps = new Set();
const allLabels = []; // common timeline

// Separate datasets
const humiData_DL1 = [];
const humiData_DL2 = [];
const humiData_DL3 = [];
const tempData_DL1 = [];
const tempData_DL2 = [];
const tempData_DL3 = [];

// Purse Time
function parseTimestamp(ts) {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts === "string") {
    const [datePart, timePart, ampm] = ts.split(/,?\s/);
    const [month, day, year] = datePart.split("/");
    let [hours, minutes, seconds] = timePart.split(":");
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
  return new Date(ts);
}

// Merge function: keeps a sorted timeline of unique timestamps
function addTimestamp(timeStr) {
  if (!seenTimestamps.has(timeStr)) {
    seenTimestamps.add(timeStr);
    allLabels.push(timeStr);
    allLabels.sort((a, b) => new Date(a) - new Date(b));

    // pad nulls so all arrays match length
    while (humiData_DL1.length < allLabels.length) humiData_DL1.push(null);
    while (tempData_DL1.length < allLabels.length) tempData_DL1.push(null);
    while (humiData_DL2.length < allLabels.length) humiData_DL2.push(null);
    while (tempData_DL2.length < allLabels.length) tempData_DL2.push(null);
    while (humiData_DL3.length < allLabels.length) humiData_DL3.push(null);
    while (tempData_DL3.length < allLabels.length) tempData_DL3.push(null);

    // keep sliding window
    if (allLabels.length > MAX_POINTS) {
      allLabels.shift();
      humiData_DL1.shift();
      humiData_DL2.shift();
      humiData_DL3.shift();
      tempData_DL1.shift();
      tempData_DL2.shift();
      tempData_DL3.shift();
    }
  }
}

// Generic fetch for device logs
function fetchLogDataDL(apiUrl, targetArray) {
  fetch(apiUrl, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } })
    .then((res) => res.json())
    .then((data) => {
      const records = Array.isArray(data) ? data : [data];
      if (!records.length) return;

      records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      records.forEach((record) => {
        if (!record.timestamp) return;
        const timeStr = parseTimestamp(record.timestamp).toLocaleString();

        addTimestamp(timeStr);

        // find index of this timestamp in common timeline
        const idx = allLabels.indexOf(timeStr);

        // insert humidity & temperature value at correct position
        if (
          targetArray === humiData_DL1 ||
          targetArray === humiData_DL2 ||
          targetArray === humiData_DL3
        ) {
          targetArray[idx] = record.humidity;
        } else {
          targetArray[idx] = record.temperature;
        }
      });

      humiChart.update();
      tempChart.update();
    })
    .catch((err) => console.error("Fetch error:", err));
}

// Initial + periodic fetch
function updateAllLogs() {
  fetchLogDataDL(API_URL_LOG_DL1, humiData_DL1);
  fetchLogDataDL(API_URL_LOG_DL2, humiData_DL2);
  fetchLogDataDL(API_URL_LOG_DL3, humiData_DL3);
  fetchLogDataDL(API_URL_LOG_DL1, tempData_DL1);
  fetchLogDataDL(API_URL_LOG_DL2, tempData_DL2);
  fetchLogDataDL(API_URL_LOG_DL3, tempData_DL3);
}

updateAllLogs();
setInterval(updateAllLogs, 60000);

// Function to create gradient for each dataset
function createGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color.replace("1)", "0.2)")); // top
  gradient.addColorStop(1, color.replace("1)", "0)")); // bottom
  return gradient;
}

//CHART.JS FOR HUMIDITY
// Create humidity chart with 3 datasets
const humiCtx = document.getElementById("humiChart").getContext("2d");
const humiChart = new Chart(humiCtx, {
  type: "line",
  data: {
    labels: allLabels,
    datasets: [
      {
        label: "DL-01 Humidity (%)",
        data: humiData_DL1,
        borderColor: "rgba(0, 123, 255, 1)",
        backgroundColor: createGradient(humiCtx, "rgba(0, 123, 255, 1)"),
        tension: 0.4,
        pointRadius: function (context) {
          return context.dataIndex === 0 ||
            context.dataIndex === context.dataset.data.length - 1
            ? 6
            : 0;
        },
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(0, 123, 255, 1)",
        fill: true,
        spanGaps: true,
      },
      {
        label: "DL-02 Humidity (%)",
        data: humiData_DL2,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: createGradient(humiCtx, "rgba(255, 99, 132, 1)"),
        tension: 0.4,
        pointRadius: function (context) {
          return context.dataIndex === 0 ||
            context.dataIndex === context.dataset.data.length - 1
            ? 6
            : 0;
        },
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
        fill: true,
        spanGaps: true,
      },
      {
        label: "DL-03 Humidity (%)",
        data: humiData_DL3,
        borderColor: "rgba(40, 200, 120, 1)",
        backgroundColor: createGradient(humiCtx, "rgba(40, 200, 120, 1)"),
        tension: 0.4,
        pointRadius: function (context) {
          return context.dataIndex === 0 ||
            context.dataIndex === context.dataset.data.length - 1
            ? 6
            : 0;
        },
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(40, 200, 120, 1)",
        fill: true,
        spanGaps: true,
      },
    ],
  },
  options: {
    responsive: true,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "nearest",
      intersect: false,
      axis: "x",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 12,
          font: { size: 14, weight: "bold" },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#333",
        titleFont: { size: 16, weight: "bold" },
        bodyFont: { size: 14 },
        padding: 10,
        cornerRadius: 8,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          font: { size: 18, weight: "bold" },
          color: "#333",
        },
        ticks: {
          maxRotation: 60,
          minRotation: 30,
          color: "#555",
        },
        grid: {
          drawBorder: true,
          borderColor: "#aaa",
          color: "rgba(0,0,0,0.05)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Humidity (% RH)",
          font: { size: 20, weight: "bold" },
          color: "#333",
        },
        ticks: { color: "#555", beginAtZero: true },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
    hover: {
      mode: "nearest",
      intersect: false,
      onHover: function (event, chartElement) {
        event.native.target.style.cursor = chartElement.length
          ? "pointer"
          : "default";
      },
    },
  },
});

//CHART.JS FOR TEMPERATURE
// Temperature Chart (similar style, different colors)
function createGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color.replace("1)", "0.2)"));
  gradient.addColorStop(1, color.replace("1)", "0)"));
  return gradient;
}

// Temperature chart
const tempCtx = document.getElementById("tempChart").getContext("2d");
const tempChart = new Chart(tempCtx, {
  type: "line",
  data: {
    labels: allLabels,
    datasets: [
      {
        label: "DL-01 Temperature (°C)",
        data: tempData_DL1,
        borderColor: "rgba(160, 32, 240, 1)", // Tomato red
        backgroundColor: createGradient(tempCtx, "rgba(160, 32, 240, 1)"),
        tension: 0.4,
        pointRadius: (ctx) =>
          ctx.dataIndex === 0 || ctx.dataIndex === ctx.dataset.data.length - 1
            ? 6
            : 0,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(160, 32, 240, 1)",
        fill: true,
        spanGaps: true,
      },
      {
        label: "DL-02 Temperature (°C)",
        data: tempData_DL2,
        borderColor: "rgba(255, 140, 0, 1)", // Orange
        backgroundColor: createGradient(tempCtx, "rgba(255, 140, 0, 1)"),
        tension: 0.4,
        pointRadius: (ctx) =>
          ctx.dataIndex === 0 || ctx.dataIndex === ctx.dataset.data.length - 1
            ? 6
            : 0,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(255, 140, 0, 1)",
        fill: true,
        spanGaps: true,
      },
      {
        label: "DL-03 Temperature (°C)",
        data: tempData_DL3,
        borderColor: "rgba(255, 105, 180, 1)", // Hot pink
        backgroundColor: createGradient(tempCtx, "rgba(255, 105, 180, 1)"),
        tension: 0.4,
        pointRadius: (ctx) =>
          ctx.dataIndex === 0 || ctx.dataIndex === ctx.dataset.data.length - 1
            ? 6
            : 0,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgba(255, 105, 180, 1)",
        fill: true,
        spanGaps: true,
      },
    ],
  },
  options: {
    responsive: true,
    animation: { duration: 1000, easing: "easeOutQuart" },
    interaction: { mode: "nearest", intersect: false, axis: "x" },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 12,
          font: { size: 14, weight: "bold" },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#333",
        titleFont: { size: 16, weight: "bold" },
        bodyFont: { size: 14 },
        padding: 10,
        cornerRadius: 8,
      },
      title: { display: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          font: { size: 18, weight: "bold" },
          color: "#333",
        },
        ticks: { maxRotation: 60, minRotation: 30, color: "#555" },
        grid: {
          drawBorder: true,
          borderColor: "#aaa",
          color: "rgba(0,0,0,0.05)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
          font: { size: 20, weight: "bold" },
          color: "#333",
        },
        ticks: { color: "#555", beginAtZero: false },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
    hover: {
      mode: "nearest",
      intersect: false,
      onHover: (event, chartElement) => {
        event.native.target.style.cursor = chartElement.length
          ? "pointer"
          : "default";
      },
    },
  },
});
