const apiKey = '9d39f7ad85e6efa3ba2df0ea29295dd8'; 
const baseUrl = 'https://api.openweathermap.org/data/2.5/';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationName = document.getElementById('location-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');
const forecast = document.getElementById('forecast');
const recentCities = document.getElementById('recent-cities');
const cityList = document.getElementById('city-list');

let recentSearchedCities = JSON.parse(localStorage.getItem('recentCities')) || [];

const displayWeatherData = (data) => {
  locationName.innerText = data.name;
  temperature.innerText = `Temperature: ${Math.round(data.main.temp - 273.15)}°C`;
  humidity.innerText = `Humidity: ${data.main.humidity}%`;
  windSpeed.innerText = `Wind Speed: ${data.wind.speed} m/s`;
  
  const iconCode = data.weather[0].icon;
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon">`;

  document.getElementById('current-weather').classList.remove('hidden');
};

const displayForecastData = (forecastData) => {
  forecast.innerHTML = '';
  forecastData.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    const temp = Math.round(day.main.temp - 273.15);
    const iconCode = day.weather[0].icon;
    
    const forecastCard = `
      <div class="bg-blue  p-4 rounded shadow">
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon">
        <p>Temp: ${temp}°C</p>
        <p>Wind: ${day.wind.speed} m/s</p>
        <p>Humidity: ${day.main.humidity}%</p>
      </div>
    `;
    forecast.innerHTML += forecastCard;
  });
  forecastContainer.classList.remove('hidden');
};

const fetchWeatherData = async (city) => {
  try {
    const response = await fetch(`${baseUrl}weather?q=${city}&appid=${apiKey}`);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    displayWeatherData(data);
    
    const forecastResponse = await fetch(`${baseUrl}forecast?q=${city}&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();
    displayForecastData(forecastData.list.filter((_, index) => index % 8 === 0));
    
    saveRecentCity(city);
  } catch (error) {
    alert(error.message);
  }
};

const saveRecentCity = (city) => {
  if (!recentSearchedCities.includes(city)) {
    recentSearchedCities.push(city);
    if (recentSearchedCities.length > 5) recentSearchedCities.shift();
    localStorage.setItem('recentCities', JSON.stringify(recentSearchedCities));
    updateRecentCities();
  }
};

const updateRecentCities = () => {
  cityList.innerHTML = '';
  if (recentSearchedCities.length > 0) {
    recentCities.classList.remove('hidden');
    recentSearchedCities.forEach(city => {
      const cityItem = document.createElement('li');
      cityItem.innerText = city;
      cityItem.classList.add('cursor-pointer', 'text-blue-500');
      cityItem.onclick = () => fetchWeatherData(city);
      cityList.appendChild(cityItem);
    });
  }
};

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    alert('Please enter a city name');
  }
});

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const response = await fetch(`${baseUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
      const data = await response.json();
      displayWeatherData(data);
    });
  }

  updateRecentCities();
};
