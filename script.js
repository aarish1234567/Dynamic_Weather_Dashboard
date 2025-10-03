const apiKey = ""; //use your api key

// Get weather by city name
async function getWeather(city) {
  try {
    const unit = document.getElementById("converter").value === "°F" ? "imperial" : "metric";

    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`
    );
    if (!currentRes.ok) throw new Error("Current weather fetch failed");
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`
    );
    if (!forecastRes.ok) throw new Error("Forecast fetch failed");
    const forecastData = await forecastRes.json();

    updateCurrentWeather(currentData, unit);
    updateForecast(forecastData.list, unit);
  } catch (err) {
    console.error(err);
    showError("Something went wrong while fetching weather.");
  }
}

// Update current weather (left panel)
function updateCurrentWeather(data, unit) {
  const tempUnit = unit === "imperial" ? "°F" : "°C";

  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.querySelector(".temperature").textContent = `${Math.round(data.main.temp)}${tempUnit}`;
  document.querySelector(".feelsLike").textContent = `Feels like ${Math.round(data.main.feels_like)}${tempUnit}`;
  document.querySelector(".description").textContent = capitalize(data.weather[0].description);
  document.querySelector(".city").textContent = `${data.name}, ${data.sys.country}`;
  document.querySelector(".date").textContent = new Date(data.dt * 1000).toLocaleString();

  document.getElementById("HValue").textContent = data.main.humidity + "%";
  document.getElementById("WValue").textContent = data.wind.speed + " m/s";
  document.getElementById("CValue").textContent = data.clouds.all + "%";
  document.getElementById("VValue").textContent = (data.visibility / 1000).toFixed(1) + " km";
  document.getElementById("PValue").textContent = data.main.pressure + " hPa";

  document.getElementById("SRValue").textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("SSValue").textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Update forecast section (next 7 days from 3-hour intervals)
function updateForecast(list, unit) {
  const forecastContainer = document.querySelector(".Forecast");
  forecastContainer.innerHTML = "";

  const tempUnit = unit === "imperial" ? "°F" : "°C";
  const dailyMap = new Map();

  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

    // Prefer midday icon (12 PM)
    if (!dailyMap.has(dayKey) || date.getHours() === 12) {
      dailyMap.set(dayKey, {
        min: item.main.temp_min,
        max: item.main.temp_max,
        icon: item.weather[0].icon
      });
    } else {
      const existing = dailyMap.get(dayKey);
      existing.min = Math.min(existing.min, item.main.temp_min);
      existing.max = Math.max(existing.max, item.main.temp_max);
    }
  });

  Array.from(dailyMap.entries()).slice(0, 7).forEach(([dayLabel, { min, max, icon }]) => {
    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <p>${dayLabel}</p>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather-icon">
      <p>${Math.round(min)}${tempUnit} – ${Math.round(max)}${tempUnit}</p>
    `;
    forecastContainer.appendChild(card);
  });
}

// Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Search input handling
function findUserLocation() {
  const city = document.getElementById("userLocation").value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  getWeather(city);
}

// Show error in UI
function showError(message) {
  const errorBox = document.createElement("div");
  errorBox.textContent = message;
  errorBox.style.color = "red";
  errorBox.style.marginTop = "1rem";
  document.querySelector(".weather-input").appendChild(errorBox);
  setTimeout(() => errorBox.remove(), 3000);
}

// Unit toggle listener
document.getElementById("converter").addEventListener("change", () => {
  const cityText = document.querySelector(".city")?.textContent;
  if (cityText) {
    const city = cityText.split(",")[0];
    getWeather(city);
  }
});

// Load default city on startup
window.onload = () => {
  getWeather("Bengaluru");
};
