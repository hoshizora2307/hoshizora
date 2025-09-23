const API_KEY = 'c87064f29ceb28115ccf465338fd12ba'; // ★ここにあなたのAPIキーを貼り付けてください
const cityInput = document.getElementById('city');
const searchBtn = document.getElementById('search-btn');
const dateDisplay = document.getElementById('date');
const indexValue = document.getElementById('index-value');
const indexMessage = document.getElementById('index-message');
const weatherDisplay = document.getElementById('weather');
const cloudsDisplay = document.getElementById('clouds');
const moonPhaseDisplay = document.getElementById('moon-phase');
const cuteCharacter = document.getElementById('cute-character');

const starCharacters = {
    'excellent': 'url("https://i.imgur.com/G4Yt04o.png")', // 流れ星
    'good': 'url("https://i.imgur.com/wVjJ4Gg.png")',    // 笑顔の星
    'average': 'url("https://i.imgur.com/e5Y3g0o.png")',  // ちょっと困った顔の雲
    'bad': 'url("https://i.imgur.com/7bQj70U.png")',      // 泣いている雲
};

document.addEventListener('DOMContentLoaded', () => {
    dateDisplay.textContent = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeatherData(city);
    }
});

async function fetchWeatherData(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&lang=ja&units=metric`;
    
    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error('都市が見つかりません。');
        }
        const weatherData = await response.json();
        
        // 月齢データを計算（簡略化されたロジック）
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const moonPhaseValue = calculateMoonPhase(year, month, day);

        const starIndex = calculateStarIndex(weatherData, moonPhaseValue);
        displayStarIndex(starIndex, weatherData, moonPhaseValue);

    } catch (error) {
        alert('ごめんね！' + error.message);
        clearDisplay();
    }
}

function calculateMoonPhase(year, month, day) {
    // 朔望月（新月から新月までの周期）の平均日数は29.530589日
    const moonCycle = 29.530589;
    
    // 2000年1月6日を基準日（新月）とする
    const baseDate = new Date(2000, 0, 6);
    const today = new Date(year, month - 1, day);
    
    const diffDays = (today - baseDate) / (1000 * 60 * 60 * 24);
    const moonPhase = (diffDays % moonCycle);
    
    return Math.floor(moonPhase);
}

function calculateStarIndex(weatherData, moonPhaseValue) {
    let index = 0;
    
    // 天気の評価
    const weatherMain = weatherData.weather[0].main;
    if (weatherMain === 'Clear') {
        index += 50;
    } else if (weatherMain === 'Clouds') {
        index += 20;
    } else {
        index = 0; // 雨や雪の場合は星空指数を0にする
    }
    
    // 雲の量の評価
    const clouds = weatherData.clouds.all;
    if (clouds <= 20) {
        index += 30;
    } else if (clouds <= 50) {
        index += 15;
    } else {
        index -= 20;
    }

    // 月齢の評価
    if (moonPhaseValue >= 0 && moonPhaseValue <= 3 || moonPhaseValue >= 26) {
        index += 20; // 新月付近
    } else if (moonPhaseValue >= 13 && moonPhaseValue <= 16) {
        index -= 30; // 満月付近
    }

    // 0から100の範囲に調整
    index = Math.max(0, Math.min(100, index));
    
    return index;
}

function displayStarIndex(starIndex, weatherData, moonPhaseValue) {
    indexValue.textContent = starIndex;
    
    let message = '';
    let characterKey = '';
    if (starIndex >= 80) {
        message = '✨🚀 最高の星空日和だよ！流れ星が見えるかも？';
        characterKey = 'excellent';
    } else if (starIndex >= 50) {
        message = '🌠 星が見えるかも！雲のすきまから探してみてね。';
        characterKey = 'good';
    } else if (starIndex >= 20) {
        message = '☁️ 今日はちょっと雲が多いみたい…。明日また見てみよう！';
        characterKey = 'average';
    } else {
        message = '☔ お星様はおやすみ中だよ。また今度見に来てね。';
        characterKey = 'bad';
    }
    
    indexMessage.textContent = message;
    weatherDisplay.textContent = weatherData.weather[0].description;
    cloudsDisplay.textContent = `${weatherData.clouds.all}%`;
    moonPhaseDisplay.textContent = `${moonPhaseValue}日`;

    cuteCharacter.style.backgroundImage = starCharacters[characterKey];
}

function clearDisplay() {
    indexValue.textContent = '--';
    indexMessage.textContent = '場所を入力してね！';
    weatherDisplay.textContent = '--';
    cloudsDisplay.textContent = '--';
    moonPhaseDisplay.textContent = '--';
    cuteCharacter.style.backgroundImage = 'none';
}

clearDisplay();
