const API_KEY = 'c87064f29ceb28115ccf465338fd12ba';
const city = 'Yamanouchi';
const palaceHotelCity = 'Yamanouchi'; // 長野県下高井郡山ノ内町

const dateDisplay = document.getElementById('date');
const timeDisplay = document.getElementById('time-display');
const indexValue = document.getElementById('index-value');
const indexMessage = document.getElementById('index-message');
const weatherDisplay = document.getElementById('weather');
const cloudsDisplay = document.getElementById('clouds');
const moonPhaseDisplay = document.getElementById('moon-phase');
const cuteCharacter = document.getElementById('cute-character');
const refreshBtn = document.getElementById('refresh-btn');

const palaceWeatherEl = document.getElementById('palace-weather');
const palaceTempEl = document.getElementById('palace-temp');
const palaceHumidityEl = document.getElementById('palace-humidity');

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
    fetchPalaceHotelWeather();
    dateDisplay.textContent = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
});

refreshBtn.addEventListener('click', () => {
    fetchWeatherData();
    fetchPalaceHotelWeather();
});

async function fetchWeatherData() {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&lang=ja&units=metric`;
    
    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error(`天気情報を取得できませんでした。エラーコード: ${response.status}`);
        }
        const forecastData = await response.json();
        
        // 今日の20時の予報を探す
        const today = new Date();
        // OpenWeatherMapの`dt`はUTCなので、ローカルタイムゾーンで比較する際は注意が必要だが、今回は日付が合えばOKとする
        const forecast20h = forecastData.list.find(item => {
            const forecastDate = new Date(item.dt * 1000);
            return forecastDate.getDate() === today.getDate() && forecastDate.getHours() >= 20;
        });

        if (!forecast20h) {
            throw new Error('本日20時の予報が見つかりませんでした。');
        }

        const forecastTime = new Date(forecast20h.dt * 1000);
        timeDisplay.textContent = `本日 ${forecastTime.getHours()}時時点`;

        const moonPhaseValue = calculateMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const starIndex = calculateStarIndex(forecast20h, moonPhaseValue);
        displayStarIndex(starIndex, forecast20h, moonPhaseValue);

    } catch (error) {
        alert('ごめんね！' + error.message);
        clearDisplay();
    }
}

async function fetchPalaceHotelWeather() {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${palaceHotelCity}&appid=${API_KEY}&lang=ja&units=metric`;
    
    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error(`志賀パレスホテルの天気情報を取得できませんでした。エラーコード: ${response.status}`);
        }
        const data = await response.json();
        
        palaceWeatherEl.textContent = data.weather[0].description;
        palaceTempEl.textContent = `${Math.round(data.main.temp)}°C`;
        palaceHumidityEl.textContent = `${data.main.humidity}%`;
    } catch (error) {
        console.error('Error fetching palace hotel weather:', error);
        palaceWeatherEl.textContent = '--';
        palaceTempEl.textContent = '--°C';
        palaceHumidityEl.textContent = '--%';
    }
}


function calculateMoonPhase(year, month, day) {
    // 2000年1月6日を基準（新月の日）
    const moonCycle = 29.530589; // 月の周期（日数）
    const baseDate = new Date(2000, 0, 6); // JavaScriptの月は0から始まるため、1月は0
    const today = new Date(year, month - 1, day);
    
    const diffDays = (today - baseDate) / (1000 * 60 * 60 * 24);
    const moonPhase = (diffDays % moonCycle);
    
    return Math.floor(moonPhase); // 月齢を整数で返す
}


function calculateStarIndex(data, moonPhaseValue) {
    let index = 0;
    const weatherId = data.weather[0].id; // 天気IDを使用
    const clouds = data.clouds.all;
    
    // 天気による評価
    if (weatherId >= 200 && weatherId < 600) { // 雷、雨、雪など悪天候
        index += 0; // ほぼ見えない
    } else if (weatherId === 800) { // Clear (快晴)
        index += 60; // 快晴は高得点
    } else if (weatherId > 800 && weatherId < 900) { // Clouds (曇り)
        if (clouds <= 20) { // 雲が少ない
            index += 50;
        } else if (clouds <= 50) { // 雲がやや多い
            index += 30;
        } else { // 雲が多い
            index += 10;
        }
    } else { // その他の天気（霧など）
        index += 20;
    }

    // 雲の量による評価 (天気評価と重複する部分もあるが、より細かく調整)
    // 既に天気で評価されているので、ここでは調整程度に
    if (clouds <= 10) { // ほぼ雲なし
        index += 20;
    } else if (clouds <= 30) { // 少量の雲
        index += 10;
    } else if (clouds <= 60) { // 中程度の雲
        index += 0;
    } else { // 雲が多い
        index -= 15;
    }

    // 月齢による評価
    // 新月付近（0-3日、26-29日）は月明かりが少なく高評価
    if (moonPhaseValue >= 0 && moonPhaseValue <= 3 || moonPhaseValue >= 26 && moonPhaseValue <= 29) {
        index += 20;
    } 
    // 満月付近（13-16日）は月明かりが強く低評価
    else if (moonPhaseValue >= 13 && moonPhaseValue <= 16) {
        index -= 25;
    }
    // それ以外は中立
    else {
        index += 5;
    }

    // 最終的な指数を0～100の範囲に収める
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
