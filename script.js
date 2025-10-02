const API_KEY = 'c87064f29ceb28115ccf465338fd12ba';
const city = 'Yamanouchi';
const dateDisplay = document.getElementById('date');
const refreshBtn = document.getElementById('refresh-btn');
const forecastList = document.getElementById('forecast-list');
const cuteCharacter = document.getElementById('cute-character');

const starCharacters = {
    'excellent': 'url("takase02.png")',
    'good': 'url("takase02.png")',
    'average': 'url("takase02.png")',
    'bad': 'url("takase02.png")',
};

const messages = {
    'excellent': '✨🚀 最高の星空日和だよ！流れ星が見えるかも？',
    'good': '🌠 星が見える条件は整った！',
    'average': '☁️ 今日はちょっと雲が多いみたい…。でも、あきらめないっ！',
    'bad': '☔ 今夜の星空は、、、厳しいですね。。。',
};

document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData();
    dateDisplay.textContent = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
});

refreshBtn.addEventListener('click', () => {
    fetchWeatherData();
});

async function fetchWeatherData() {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&lang=ja&units=metric`;
    
    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error('天気情報を取得できませんでした。APIキーを確認してください。');
        }
        const forecastData = await response.json();
        
        displayForecast(forecastData);

    } catch (error) {
        alert('ごめんね！' + error.message);
        clearDisplay();
    }
}

function displayForecast(forecastData) {
    forecastList.innerHTML = '';
    const today = new Date();

    // 21時以降の夜間予報のみを抽出
    const nighttimeForecasts = forecastData.list.filter(item => {
        const forecastDate = new Date(item.dt * 1000);
        return forecastDate.getHours() >= 18 || forecastDate.getHours() < 6;
    });

    nighttimeForecasts.forEach(item => {
        const forecastDate = new Date(item.dt * 1000);
        const moonPhaseValue = calculateMoonPhase(forecastDate.getFullYear(), forecastDate.getMonth() + 1, forecastDate.getDate());
        const starIndex = calculateStarIndex(item, moonPhaseValue);
        const characterKey = getCharacterKey(starIndex);

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        
        forecastItem.innerHTML = `
            <div class="forecast-time">${forecastDate.getHours()}時</div>
            <div class="forecast-details">
                <p class="forecast-message">${messages[characterKey]}</p>
                <p>天気: ${item.weather[0].description} / 雲の量: ${item.clouds.all}%</p>
                <p>月齢: ${moonPhaseValue}日</p>
            </div>
            <div class="forecast-index">${starIndex}</div>
        `;
        forecastList.appendChild(forecastItem);
    });

    // メインのキャラクター画像を表示
    cuteCharacter.style.backgroundImage = starCharacters['excellent'];
}

function calculateMoonPhase(year, month, day) {
    const moonCycle = 29.530589;
    const baseDate = new Date(2000, 0, 6);
    const today = new Date(year, month - 1, day);
    const diffDays = (today - baseDate) / (1000 * 60 * 60 * 24);
    const moonPhase = (diffDays % moonCycle);
    return Math.floor(moonPhase);
}

function calculateStarIndex(data, moonPhaseValue) {
    let index = 0;
    const weatherMain = data.weather[0].main;
    
    if (weatherMain === 'Clear') {
        index += 50;
    } else if (weatherMain === 'Clouds') {
        index += 20;
    } else {
        index = 0;
    }
    
    const clouds = data.clouds.all;
    if (clouds <= 20) {
        index += 30;
    } else if (clouds <= 50) {
        index += 15;
    } else {
        index -= 20;
    }

    if (moonPhaseValue >= 0 && moonPhaseValue <= 3 || moonPhaseValue >= 26) {
        index += 20;
    } else if (moonPhaseValue >= 13 && moonPhaseValue <= 16) {
        index -= 30;
    }

    index = Math.max(0, Math.min(100, index));
    return index;
}

function getCharacterKey(starIndex) {
    if (starIndex >= 80) return 'excellent';
    if (starIndex >= 50) return 'good';
    if (starIndex >= 20) return 'average';
    return 'bad';
}

function clearDisplay() {
    forecastList.innerHTML = '<p>情報取得中にエラーが発生しました。</p>';
    cuteCharacter.style.backgroundImage = 'none';
}

// 画像をCSSアニメーションで動かすためのJS
document.addEventListener('DOMContentLoaded', () => {
    const takase02 = document.getElementById('takase02');
    const iwaya02 = document.getElementById('iwaya02');
    
    setInterval(() => {
        if (Math.random() < 0.3) {
            takase02.style.animationName = 'takase-move, takase-blink';
        } else {
            takase02.style.animationName = 'takase-move';
        }
    }, 5000);

    setInterval(() => {
        if (Math.random() < 0.3) {
            iwaya02.style.animationName = 'iwaya-move, iwaya-pulse';
        } else {
            iwaya02.style.animationName = 'iwaya-move';
        }
    }, 5000);
});
