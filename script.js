const API_KEY = 'c87064f29ceb28115ccf465338fd12ba'; // ★ここにあなたのAPIキーを貼り付けてください
const city = 'Yamanouchi'; // 長野県下高井郡山ノ内町に固定
const dateDisplay = document.getElementById('date');
const indexValue = document.getElementById('index-value');
const indexMessage = document.getElementById('index-message');
const weatherDisplay = document.getElementById('weather');
const cloudsDisplay = document.getElementById('clouds');
const moonPhaseDisplay = document.getElementById('moon-phase');
const cuteCharacter = document.getElementById('cute-character');
const refreshBtn = document.getElementById('refresh-btn');

// ここを修正：全ての星空指数でtakase02.pngを表示するように変更
const starCharacters = {
    'excellent': 'url("takase02.png")',
    'good': 'url("takase02.png")',
    'average': 'url("takase02.png")',
    'bad': 'url("takase02.png")',
};

const messages = {
    'excellent': '✨🚀 最高の星空日和だよ！流れ星が見えるかも？',
    'good': '🌠 条件は悪くない！',
    'average': '☁️ 今日はちょっと雲が多いみたい…。でも、あきらめない！',
    'bad': '☔ お星様はおやすみ中。今日はダメかも。。。',
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
        
        // 当日の20時時点の予報を見つける
        const today = new Date();
        const forecast20h = forecastData.list.find(item => {
            const forecastDate = new Date(item.dt * 1000);
            return forecastDate.getDate() === today.getDate() && forecastDate.getHours() >= 20;
        });

        if (!forecast20h) {
            throw new Error('本日20時の予報が見つかりませんでした。');
        }

        const moonPhaseValue = calculateMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const starIndex = calculateStarIndex(forecast20h, moonPhaseValue);
        displayStarIndex(starIndex, forecast20h, moonPhaseValue);

    } catch (error) {
        alert('ごめんね！' + error.message);
        clearDisplay();
    }
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

function displayStarIndex(starIndex, data, moonPhaseValue) {
    indexValue.textContent = starIndex;
    const characterKey = getCharacterKey(starIndex);
    indexMessage.textContent = messages[characterKey];
    weatherDisplay.textContent = data.weather[0].description;
    cloudsDisplay.textContent = `${data.clouds.all}%`;
    moonPhaseDisplay.textContent = `${moonPhaseValue}日`;
    cuteCharacter.style.backgroundImage = starCharacters[characterKey];
}

function getCharacterKey(starIndex) {
    if (starIndex >= 80) return 'excellent';
    if (starIndex >= 50) return 'good';
    if (starIndex >= 20) return 'average';
    return 'bad';
}

function clearDisplay() {
    indexValue.textContent = '--';
    indexMessage.textContent = '情報取得中...';
    weatherDisplay.textContent = '--';
    cloudsDisplay.textContent = '--';
    moonPhaseDisplay.textContent = '--';
    cuteCharacter.style.backgroundImage = 'none';
}
