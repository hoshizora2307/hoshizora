const API_KEY = 'YOUR_API_KEY_HERE'; // ★ここにあなたのAPIキーを貼り付けてください
const cityInput = document.getElementById('city');
const searchBtn = document.getElementById('search-btn');
const dateDisplay = document.getElementById('date');
const indexValue = document.getElementById('index-value');
const indexMessage = document.getElementById('index-message');
const weatherDisplay = document.getElementById('weather');
const cloudsDisplay = document.getElementById('clouds');
const moonPhaseDisplay = document.getElementById('moon-phase');
const cuteCharacter = document.getElementById('cute-character');
const detailsSection = document.getElementById('details');

const starCharacters = {
    'excellent': 'url("https://i.imgur.com/G4Yt04o.png")', // 流れ星
    'good': 'url("https://i.imgur.com/wVjJ4Gg.png")',    // 笑顔の星
    'average': 'url("https://i.imgur.com/e5Y3g0o.png")',  // ちょっと困った顔の雲
    'bad': 'url("https://i.imgur.com/7bQj70U.png")',      // 泣いている雲
};

const messages = {
    'excellent': '✨🚀 最高の星空日和だよ！流れ星が見えるかも？',
    'good': '🌠 星が見えるかも！雲のすきまから探してみてね。',
    'average': '☁️ 今日はちょっと雲が多いみたい…。明日また見てみよう！',
    'bad': '☔ お星様はおやすみ中だよ。また今度見に来てね。',
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
    // OpenWeatherMapのForecast APIを呼び出す
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&lang=ja&units=metric`;
    
    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) {
            throw new Error('都市が見つかりません。');
        }
        const forecastData = await response.json();
        
        // 当日の夜の予報を特定する（例：21時の予報）
        const today = new Date();
        const todayForecast = forecastData.list.find(item => {
            const forecastDate = new Date(item.dt * 1000);
            return forecastDate.getFullYear() === today.getFullYear() && 
                   forecastDate.getMonth() === today.getMonth() && 
                   forecastDate.getDate() === today.getDate() &&
                   forecastDate.getHours() >= 18 && forecastDate.getHours() <= 24; // 夜間の予報を探す
        });

        if (todayForecast) {
            const moonPhaseValue = calculateMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate());
            const starIndex = calculateStarIndex(todayForecast, moonPhaseValue);
            displayCurrentIndex(starIndex, todayForecast, moonPhaseValue);
        } else {
            // 当日の夜のデータがない場合はカレンダーを表示
            buildCalendar(forecastData);
        }

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

function displayCurrentIndex(starIndex, data, moonPhaseValue) {
    indexValue.textContent = starIndex;
    const characterKey = getCharacterKey(starIndex);
    indexMessage.textContent = messages[characterKey];
    weatherDisplay.textContent = data.weather[0].description;
    cloudsDisplay.textContent = `${data.clouds.all}%`;
    moonPhaseDisplay.textContent = `${moonPhaseValue}日`;
    cuteCharacter.style.backgroundImage = starCharacters[characterKey];
    detailsSection.innerHTML = `
        <h2>詳細</h2>
        <p>天気: <span id="weather">${data.weather[0].description}</span></p>
        <p>雲の量: <span id="clouds">${data.clouds.all}%</span></p>
        <p>月齢: <span id="moon-phase">${moonPhaseValue}日</span></p>
    `;
}

function getCharacterKey(starIndex) {
    if (starIndex >= 80) return 'excellent';
    if (starIndex >= 50) return 'good';
    if (starIndex >= 20) return 'average';
    return 'bad';
}

function buildCalendar(forecastData) {
    const days = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split('T')[0];
        if (!days[dayKey]) {
            days[dayKey] = { date, nightData: null };
        }
        if (date.getHours() >= 18 && date.getHours() <= 24) {
            days[dayKey].nightData = item;
        }
    });

    let calendarHtml = '<h2 class="calendar-title">週間星空カレンダー</h2><div class="calendar-grid">';
    for (const dayKey in days) {
        const dayInfo = days[dayKey];
        const date = dayInfo.date;
        const nightData = dayInfo.nightData;
        const moonPhaseValue = calculateMoonPhase(date.getFullYear(), date.getMonth() + 1, date.getDate());
        
        let starIndex = '--';
        let emoji = '❓';
        let message = '予報なし';

        if (nightData) {
            starIndex = calculateStarIndex(nightData, moonPhaseValue);
            const characterKey = getCharacterKey(starIndex);
            message = messages[characterKey];
            
            if (characterKey === 'excellent') emoji = '✨';
            else if (characterKey === 'good') emoji = '⭐';
            else if (characterKey === 'average') emoji = '☁️';
            else emoji = '💧';
        }

        calendarHtml += `
            <div class="calendar-item">
                <div class="calendar-date">${date.getMonth() + 1}/${date.getDate()}</div>
                <div class="calendar-emoji">${emoji}</div>
                <div class="calendar-index">${starIndex}</div>
            </div>
        `;
    }
    calendarHtml += '</div>';

    indexValue.textContent = '';
    indexMessage.textContent = '';
    cuteCharacter.style.backgroundImage = 'none';
    detailsSection.innerHTML = calendarHtml;
    
    // カレンダー用のスタイルを追加
    const style = document.createElement('style');
    style.innerHTML = `
        .calendar-title { font-size: 1.2em; color: #4a4a9c; margin-bottom: 10px; border-bottom: none; }
        .calendar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px; }
        .calendar-item { background-color: rgba(255, 255, 255, 0.5); padding: 15px; border-radius: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .calendar-date { font-weight: bold; font-size: 1.1em; color: #666; }
        .calendar-emoji { font-size: 2em; margin: 5px 0; }
        .calendar-index { font-weight: bold; color: #ff69b4; font-size: 1.5em; }
    `;
    document.head.appendChild(style);
}

clearDisplay();

function clearDisplay() {
    indexValue.textContent = '--';
    indexMessage.textContent = '場所を入力してね！';
    weatherDisplay.textContent = '--';
    cloudsDisplay.textContent = '--';
    moonPhaseDisplay.textContent = '--';
    cuteCharacter.style.backgroundImage = 'none';
    detailsSection.innerHTML = `
        <h2>詳細</h2>
        <p>天気: <span id="weather">--</span></p>
        <p>雲の量: <span id="clouds">--</span></p>
        <p>月齢: <span id="moon-phase">--</span></p>
    `;
}
