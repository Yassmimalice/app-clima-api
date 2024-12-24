const API_KEY = '0d3b42600fc1ec24b9419acabc5ec5ab';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const currentTemp = document.getElementById('current-temp');
const weatherDescription = document.getElementById('weather-description');
const highLow = document.getElementById('high-low');
const hourlyContainer = document.getElementById('hourly-container');
const dailyContainer = document.getElementById('daily-container');

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherData(cityInput.value);
    }
});

async function getWeatherData(city) {
    try {
        const [currentWeather, forecast] = await Promise.all([
            fetch(`${BASE_URL}/weather?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`).then(res => res.json()),
            fetch(`${BASE_URL}/forecast?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`).then(res => res.json())
        ]);

        updateCurrentWeather(currentWeather);
        updateHourlyForecast(forecast);
        updateDailyForecast(forecast);
    } catch (error) {
        console.error('Erro ao buscar dados do clima:', error);
        alert('Não foi possível obter os dados do clima. Por favor, tente novamente.');
    }
}

function updateCurrentWeather(data) {
    cityName.textContent = data.name;
    currentTemp.textContent = `${Math.round(data.main.temp)}°`;
    weatherDescription.textContent = data.weather[0].description;
    highLow.textContent = `Máx: ${Math.round(data.main.temp_max)}° Mín: ${Math.round(data.main.temp_min)}°`;
}

function updateHourlyForecast(data) {
    hourlyContainer.innerHTML = '';
    for (let i = 0; i < 24; i += 3) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const hour = date.getHours();
        
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <div class="hourly-time">${hour}:00</div>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <div class="hourly-temp">${Math.round(forecast.main.temp)}°</div>
        `;
        hourlyContainer.appendChild(hourlyItem);
    }
}

function updateDailyForecast(data) {
    dailyContainer.innerHTML = '';
    const dailyData = getDailyForecast(data.list);
    
    dailyData.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        const dailyItem = document.createElement('div');
        dailyItem.classList.add('daily-item');
        dailyItem.innerHTML = `
            <div class="daily-day">${index === 0 ? 'Hoje' : dayName}</div>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <div class="daily-temp">${Math.round(day.temp.max)}° ${Math.round(day.temp.min)}°</div>
        `;
        dailyContainer.appendChild(dailyItem);
    });
}

function getDailyForecast(forecastList) {
    const dailyData = [];
    const today = new Date().setHours(0, 0, 0, 0);
    
    for (let i = 0; i < forecastList.length; i += 8) {
        const forecast = forecastList[i];
        const forecastDate = new Date(forecast.dt * 1000).setHours(0, 0, 0, 0);
        
        if (forecastDate > today) {
            dailyData.push({
                dt: forecast.dt,
                temp: {
                    min: forecast.main.temp_min,
                    max: forecast.main.temp_max
                },
                weather: forecast.weather
            });
        }
        
        if (dailyData.length === 7) break;
    }
    
    return dailyData;
}

// Inicializar com uma cidade padrão
getWeatherData('São Paulo');