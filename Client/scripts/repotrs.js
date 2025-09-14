document.getElementById("reportPage").addEventListener("click", () => {
  window.location.href = "reports.html";
});
document.getElementById("dashboardPage").addEventListener("click", () => {
  window.location.href = "../index.html";
});
document.getElementById("settingsPage").addEventListener("click", () => {
  window.location.href = "settings.html";
});
const AUTH_TOKEN = "DL_Sirc_123321";

// Device-specific API URLs
const API_URLS = {
  "DL-01":
    "https://iot-humidity-datalogger.onrender.com/api/temperature/log/DL-01",
  "DL-02":
    "https://iot-humidity-datalogger.onrender.com/api/temperature/log/DL-02",
  "DL-03":
    "https://iot-humidity-datalogger.onrender.com/api/temperature/log/DL-03",
};

// Elements
const reportForm = document.getElementById("reportForm");
const reportMeta = document.getElementById("reportMeta");
const kpiAvgT = document.getElementById("kpiAvgT");
const kpiMinT = document.getElementById("kpiMinT");
const kpiMaxT = document.getElementById("kpiMaxT");
const kpiAvgH = document.getElementById("kpiAvgH");
const kpiMinH = document.getElementById("kpiMinH");
const kpiMaxH = document.getElementById("kpiMaxH");
const reportTableBody = document.querySelector("#reportTable tbody");
const generatedOn = document.getElementById("generatedOn");
let reportChart;

// Form submit
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const device = document.getElementById("deviceSelect").value;
  const fromDate = document.getElementById("fromDate").value;
  const fromTime = document.getElementById("fromTime").value;
  const toDate = document.getElementById("toDate").value;
  const toTime = document.getElementById("toTime").value;

  if (!device || !fromDate || !toDate) return alert("Please fill all fields");

  const fromTimestamp = new Date(`${fromDate}T${fromTime}`).getTime();
  const toTimestamp = new Date(`${toDate}T${toTime}`).getTime();

  const apiUrl = API_URLS[device];
  if (!apiUrl) return alert("Invalid device selected");

  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Network response was not ok: ${res.status} - ${text}`);
    }

    const data = await res.json();

    // Filter by selected range
    const filteredData = data.filter((d) => {
      const ts = new Date(d.timestamp).getTime();
      return ts >= fromTimestamp && ts <= toTimestamp;
    });

    if (filteredData.length === 0)
      return alert("No data found in the selected range");

    // Update report meta
    reportMeta.textContent = `Device: ${device} | Range: ${fromDate} ${fromTime} → ${toDate} ${toTime}`;

    // KPIs
    const temps = filteredData.map((d) => d.temperature);
    const hums = filteredData.map((d) => d.humidity);

    kpiAvgT.textContent = (
      temps.reduce((a, b) => a + b, 0) / temps.length
    ).toFixed(2);
    kpiMinT.textContent = Math.min(...temps).toFixed(2);
    kpiMaxT.textContent = Math.max(...temps).toFixed(2);

    kpiAvgH.textContent = (
      hums.reduce((a, b) => a + b, 0) / hums.length
    ).toFixed(2);
    kpiMinH.textContent = Math.min(...hums).toFixed(2);
    kpiMaxH.textContent = Math.max(...hums).toFixed(2);

    // Table
    reportTableBody.innerHTML = "";
    filteredData.forEach((d, i) => {
      reportTableBody.innerHTML += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${new Date(d.timestamp).toLocaleString()}</td>
                    <td>${d.temperature}</td>
                    <td>${d.humidity}</td>
                </tr>`;
    });

    // Chart
    function createGradient(ctx, color) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, color.replace("1)", "0.2)"));
      gradient.addColorStop(1, color.replace("1)", "0)"));
      return gradient;
    }

    const ctx = document.getElementById("reportChart").getContext("2d");
    const labels = filteredData.map((d) =>
      new Date(d.timestamp).toLocaleString()
    );
    const tempData = filteredData.map((d) => d.temperature);
    const humData = filteredData.map((d) => d.humidity);

    if (reportChart) reportChart.destroy();
    reportChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: tempData,
            borderColor: "rgba(255,99,132,1)",
            backgroundColor: "rgba(255,99,132,0.4)",
            tension: 0.4,
            pointRadius: (ctx) =>
              ctx.dataIndex === 0 ||
              ctx.dataIndex === ctx.dataset.data.length - 1
                ? 6
                : 0,
            pointHoverRadius: 8,
            spanGaps: true,
          },
          {
            label: "Humidity (%)",
            data: humData,
            borderColor: "rgba(0, 123, 255, 1)",
            backgroundColor: "rgba(0, 123, 255,0.4)",
            tension: 0.4,
            pointRadius: (ctx) =>
              ctx.dataIndex === 0 ||
              ctx.dataIndex === ctx.dataset.data.length - 1
                ? 6
                : 0,
            pointHoverRadius: 8,
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
            ticks: { maxRotation: 60, minRotation: 30, color: "#555" },
            grid: {
              drawBorder: true,
              borderColor: "#aaa",
              color: "rgba(0,0,0,0.05)",
            },
          },
          y: {
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

    generatedOn.textContent = new Date().toLocaleString();
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error fetching data. Check console for details.");
  }
});

// Reset
document.getElementById("btnReset").addEventListener("click", () => {
  reportForm.reset();
  reportTableBody.innerHTML = "";
  kpiAvgT.textContent = kpiMinT.textContent = kpiMaxT.textContent = "—";
  kpiAvgH.textContent = kpiMinH.textContent = kpiMaxH.textContent = "—";
  reportMeta.textContent = "Device: — | Range: —";
  if (reportChart) reportChart.destroy();
});

// Download PDF
document
  .getElementById("btnDownloadPDF")
  .addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // === Centered Report Title ===
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    const title = "Humidity Data Logger Report";
    const titleWidth = pdf.getTextWidth(title);
    const titleY = 20;
    pdf.text(title, (pageWidth - titleWidth) / 2, titleY);

    // === Metadata ===
    const device = "DL-001 (Lab)";
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80); // Dark gray

    // --- Dynamic Range from table timestamps ---
    const timestamps = Array.from(
      document.querySelectorAll("#reportTable tbody tr td:nth-child(2)")
    ).map((td) => new Date(td.textContent));

    let range = "N/A";
    if (timestamps.length > 0) {
      const startDate = new Date(Math.min(...timestamps));
      const endDate = new Date(Math.max(...timestamps));
      const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
      range = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString(
        [],
        timeOptions
      )} - ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString(
        [],
        timeOptions
      )}`;
    }

    // Generated on with current time
    const generated = new Date();
    const generatedStr = `${generated.toLocaleDateString()} ${generated.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit", hour12: true }
    )}`;

    // --- Center each metadata row below the title ---
    const lineSpacing = 7; // space between rows

    // Device
    let textWidth = pdf.getTextWidth(`Device: ${device}`);
    pdf.text(`Device: ${device}`, (pageWidth - textWidth) / 2, titleY + 10);

    // Range
    textWidth = pdf.getTextWidth(`Range: ${range}`);
    pdf.text(
      `Time Duration: ${range}`,
      (pageWidth - textWidth) / 2,
      titleY + 10 + lineSpacing
    );

    // Generated on
    textWidth = pdf.getTextWidth(`Generated On: ${generatedStr}`);

    // === Add chart as image ===
    const chartCanvas = document.getElementById("reportChart");
    const chartImg = chartCanvas.toDataURL("image/png");
    const pageWidthImg = pdf.internal.pageSize.getWidth();
    const chartWidth = pageWidthImg - 20; // margins
    const chartHeight = (chartCanvas.height * chartWidth) / chartCanvas.width;
    pdf.addImage(chartImg, "PNG", 14, 45, chartWidth, chartHeight);

    // === Table below chart ===
    const startY = 45 + chartHeight + 10;

    const tableData = Array.from(
      document.querySelectorAll("#reportTable tbody tr")
    ).map((tr) =>
      Array.from(tr.querySelectorAll("td")).map((td) => td.textContent)
    );

    pdf.autoTable({
      head: [["#", "Timestamp", "Temperature (°C)", "Humidity (%)"]],
      body: tableData,
      startY: startY,
      theme: "grid",
      headStyles: {
        fillColor: [54, 162, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    // Add "Generated on" at the bottom
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100); // subtle gray
    const bottomY = pdf.internal.pageSize.getHeight() - 10; // 10 mm from bottom
    const generatedBottomText = `Generated on: ${generatedStr}`;
    const generatedWidth = pdf.getTextWidth(generatedBottomText);
    pdf.text(generatedBottomText, (pageWidth - generatedWidth) / 2, bottomY); // centered

    pdf.save(`Humidity_Report_${Date.now()}.pdf`);
  });
