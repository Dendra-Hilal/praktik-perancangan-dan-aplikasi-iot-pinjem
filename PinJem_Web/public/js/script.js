const MAX_DATA_POINTS_CHART = 20;

const modeStateEl = document.getElementById("mode-state");
const roofStateEl = document.getElementById("roof-state");
const rainStateEl = document.getElementById("rain-state");
const weatherStateEl = document.getElementById("weather-state");

const btnOpen = document.getElementById("btn-open");
const btnClose = document.getElementById("btn-close");
const btnAuto = document.getElementById("btn-auto");

const ctx = document.getElementById("sensor-chart").getContext("2d");

const sensorChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "LDR Value",
        data: [],
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        yAxisID: "yLDR",
        tension: 0.1,
      },
      {
        label: "Rain State",
        data: [],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        yAxisID: "yRain",
        stepped: true,
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: "Waktu" },
      },
      yLDR: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "LDR Value" },
        min: 0,
        max: 1024,
        grid: {
          drawOnChartArea: true,
        },
      },
      yRain: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "Rain State" },
        min: -0.1,
        max: 1.1,
        ticks: {
          stepSize: 1,
          callback: function (value, index, ticks) {
            if (value === 0) return "Tidak";
            if (value === 1) return "Hujan";
            return null;
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
  },
});

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function updateStatusElement(element, text, statusPrefix) {
  if (!element) return;
  element.textContent = text;
  const classesToRemove = Array.from(element.classList).filter((cls) => cls.startsWith(statusPrefix + "-"));
  element.classList.remove(...classesToRemove);
  element.classList.add(`${statusPrefix}-${text.toLowerCase().replace(/\s+/g, "-")}`);
  if (!element.classList.contains("box-state")) {
    element.classList.add("box-state");
  }
  if (!element.classList.contains("value")) {
    element.classList.add("value");
  }
}

function updateRainStatus(element, isRaining) {
    if (!element) return;
    const text = isRaining === null ? element.textContent : (isRaining ? "Hujan" : "Tidak Hujan"); // Handle null case better
    const stateClass = isRaining === null ? null : (isRaining ? "state-hujan" : "state-tidak-hujan");
    element.textContent = text;

    // Define all possible rain state classes to remove
    const possibleClasses = ["state-hujan", "state-tidak-hujan", "state-memuat", "state-offline", "state-error", "state-unknown", "state-n/a"];
    element.classList.remove(...possibleClasses);

    if (stateClass) {
      element.classList.add(stateClass);
    }

    if (!element.classList.contains("box-state")) {
      element.classList.add("box-state");
    }
    if (!element.classList.contains("value")) {
      element.classList.add("value");
    }
  }


function addDataToChart(timeLabel, ldrValue, rainStateValue) {
  const labels = sensorChart.data.labels;
  const ldrData = sensorChart.data.datasets[0].data;
  const rainData = sensorChart.data.datasets[1].data;

  labels.push(timeLabel);
  ldrData.push(ldrValue);
  rainData.push(rainStateValue);

  if (labels.length > MAX_DATA_POINTS_CHART) {
    labels.shift();
    ldrData.shift();
    rainData.shift();
  }
  sensorChart.update();
}

const socket = io();

socket.on("connect", () => {
  console.log("Terhubung ke server via Socket.IO:", socket.id);
  fetchInitialData();
});

socket.on("disconnect", () => {
  console.warn("Terputus dari server Socket.IO");
  updateStatusElement(modeStateEl, "Offline", "state");
  updateStatusElement(roofStateEl, "Offline", "state");
  updateRainStatus(rainStateEl, null);
  updateStatusElement(rainStateEl, "Offline", "state");
  updateStatusElement(weatherStateEl, "Offline", "state");
});


socket.on("updateData", (data) => {
  console.log("Data baru diterima:", data);
  const time = formatTime(new Date(data.timestamp));
  const rainValueForChart = data.is_raining ? 1 : 0;

  let weatherText;
  if (data.ldr_value <= 200) {
    weatherText = "Cerah";
  } else {
    weatherText = "Gelap";
  }

  updateStatusElement(modeStateEl, data.mode, "state");
  updateStatusElement(roofStateEl, data.roof_state, "state");
  updateRainStatus(rainStateEl, data.is_raining);
  updateStatusElement(weatherStateEl, weatherText, "state");

  addDataToChart(time, data.ldr_value, rainValueForChart);
});

btnOpen.addEventListener("click", () => {
  console.log("Tombol BUKA ditekan");
  socket.emit("sendServoCommand", "OPEN");
});

btnClose.addEventListener("click", () => {
  console.log("Tombol TUTUP ditekan");
  socket.emit("sendServoCommand", "CLOSE");
});

btnAuto.addEventListener("click", () => {
  console.log("Tombol AUTO ditekan");
  socket.emit("sendModeCommand", "AUTO");
});

async function fetchInitialData() {
  updateStatusElement(modeStateEl, "Memuat", "state");
  updateStatusElement(roofStateEl, "Memuat", "state");
  updateRainStatus(rainStateEl, null);
  updateStatusElement(rainStateEl, "Memuat", "state");
  updateStatusElement(weatherStateEl, "Memuat", "state");


  try {
    const response = await fetch("/api/history");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const historyData = await response.json();
    console.log("History data loaded:", historyData);

    sensorChart.data.labels = [];
    sensorChart.data.datasets[0].data = [];
    sensorChart.data.datasets[1].data = [];

    if (historyData.length > 0) {
      const dataToLoad = historyData.slice(-MAX_DATA_POINTS_CHART);

      dataToLoad.forEach((dataPoint) => {
        const time = formatTime(new Date(dataPoint.timestamp));
        const rainValueForChart = dataPoint.is_raining ? 1 : 0;

        sensorChart.data.labels.push(time);
        sensorChart.data.datasets[0].data.push(dataPoint.ldr_value);
        sensorChart.data.datasets[1].data.push(rainValueForChart);
      });

      sensorChart.update();

      const lastData = historyData[historyData.length - 1];

      let initialWeatherText;
      if (lastData.ldr_value <= 200) {
        initialWeatherText = "Cerah";
      } else {
        initialWeatherText = "Mendung";
      }

      updateStatusElement(modeStateEl, lastData.mode, "state");
      updateStatusElement(roofStateEl, lastData.roof_state, "state");
      updateRainStatus(rainStateEl, lastData.is_raining);
      updateStatusElement(weatherStateEl, initialWeatherText, "state");

    } else {
      updateStatusElement(modeStateEl, "N/A", "state");
      updateStatusElement(roofStateEl, "N/A", "state");
      updateRainStatus(rainStateEl, null);
      updateStatusElement(rainStateEl, "N/A", "state");
      updateStatusElement(weatherStateEl, "N/A", "state");
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    updateStatusElement(modeStateEl, "Error", "state");
    updateStatusElement(roofStateEl, "Error", "state");
    updateRainStatus(rainStateEl, null);
    updateStatusElement(rainStateEl, "Error", "state");
    updateStatusElement(weatherStateEl, "Error", "state");
  }
}