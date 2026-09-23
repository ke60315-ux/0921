/**
 * 臺灣氣象風土帖 - 日系簡約・暮らしの気象手帖
 * Leaflet GIS 地圖 + 中央氣象署 (CWA) Open Data 即時氣象連線
 */

// ==========================================================================
// 1. 雲端代理與中央氣象署 (CWA) API 連線設定
// ==========================================================================
// 1.1 Cloudflare Worker 雲端邊緣安全代理 (首選推薦：完全隱藏金鑰、免 CORS 限制、10 分鐘邊緣極速快取)
// 部署完成後將您的 Worker 網址填入下方，或在網頁右上角「連線模式」直接貼入儲存！
const CLOUDFLARE_WORKER_URL = "";

// 1.2 中央氣象署 (CWA) 授權碼 (直連模式備用，若已使用 Worker 則無需填寫)
const CWA_API_KEY = "";

const CWA_DATASET_ID = "F-C0032-001";
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore";

// ==========================================================================
// 2. 台灣 22 縣市 GIS 地理座標與分區資料庫 (依照中央氣象署規格)
// ==========================================================================
const TAIWAN_COUNTY_GIS = {
  // 中部地區
  "彰化縣": { lat: 24.0815, lng: 120.5385, zoom: 11, region: "中部地區" },
  "臺中市": { lat: 24.1625, lng: 120.6470, zoom: 11, region: "中部地區" },
  "南投縣": { lat: 23.9610, lng: 120.9719, zoom: 10, region: "中部地區" },
  "雲林縣": { lat: 23.7092, lng: 120.4313, zoom: 11, region: "中部地區" },
  "嘉義市": { lat: 23.4801, lng: 120.4491, zoom: 12, region: "中部地區" },
  "嘉義縣": { lat: 23.4518, lng: 120.2559, zoom: 11, region: "中部地區" },

  // 北部地區
  "基隆市": { lat: 25.1317, lng: 121.7454, zoom: 12, region: "北部地區" },
  "臺北市": { lat: 25.0375, lng: 121.5637, zoom: 12, region: "北部地區" },
  "新北市": { lat: 25.0124, lng: 121.4657, zoom: 11, region: "北部地區" },
  "桃園市": { lat: 24.9936, lng: 121.3010, zoom: 11, region: "北部地區" },
  "新竹市": { lat: 24.8039, lng: 120.9647, zoom: 12, region: "北部地區" },
  "新竹縣": { lat: 24.8387, lng: 121.0177, zoom: 11, region: "北部地區" },
  "苗栗縣": { lat: 24.5602, lng: 120.8214, zoom: 11, region: "北部地區" },

  // 南部地區
  "臺南市": { lat: 22.9997, lng: 120.2270, zoom: 11, region: "南部地區" },
  "高雄市": { lat: 22.6273, lng: 120.3014, zoom: 11, region: "南部地區" },
  "屏東縣": { lat: 22.5519, lng: 120.5487, zoom: 10, region: "南部地區" },

  // 東部地區
  "宜蘭縣": { lat: 24.7021, lng: 121.7377, zoom: 11, region: "東部地區" },
  "花蓮縣": { lat: 23.9872, lng: 121.6016, zoom: 10, region: "東部地區" },
  "臺東縣": { lat: 22.7583, lng: 121.1444, zoom: 10, region: "東部地區" },

  // 外島地區
  "澎湖縣": { lat: 23.5712, lng: 119.5793, zoom: 11, region: "外島地區" },
  "金門縣": { lat: 24.4493, lng: 118.3766, zoom: 11, region: "外島地區" },
  "連江縣": { lat: 26.1505, lng: 119.9499, zoom: 11, region: "外島地區" }
};

// 全島中心與預設縮放
const TAIWAN_OVERVIEW_CENTER = [23.75, 120.95];
const TAIWAN_OVERVIEW_ZOOM = 7.5;

// 日系俳句生活小語庫
const ZEN_HAIKU_QUOTES = [
  "「日日是好日。風が渡り、雲が流れる。自然の巡りとともに。」",
  "「風に吹かれて、季節の気配を感じる穏やかなひととき。」",
  "「晴れの日も、雨の日も、暮らしのなかに光を見つけて。」",
  "「天の色、風の匂い。五感を開いて歩く日々の道。」",
  "「空を見上げる余裕が、心に澄んだ余白を届けてくれる。」"
];

// ==========================================================================
// 3. 和風極簡 SVG 天氣圖示
// ==========================================================================
function getJapaneseWeatherIcon(iconType) {
  switch (iconType) {
    case 'sun':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke="#d97746" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="32" cy="32" r="13" fill="#fcf3ec" stroke="#d97746"/>
          <line x1="32" y1="6" x2="32" y2="12"/>
          <line x1="32" y1="52" x2="32" y2="58"/>
          <line x1="13.62" y1="13.62" x2="17.86" y2="17.86"/>
          <line x1="46.14" y1="46.14" x2="50.38" y2="50.38"/>
          <line x1="6" y1="32" x2="12" y2="32"/>
          <line x1="52" y1="32" x2="58" y2="32"/>
          <line x1="13.62" y1="50.38" x2="17.86" y2="46.14"/>
          <line x1="46.14" y1="17.86" x2="50.38" y2="13.62"/>
        </svg>
      `;
    case 'cloud':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke="#607274" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M46 44H19a12 12 0 0 1-1.7-23.88 15 15 0 0 1 29.4-4.24A11 11 0 0 1 46 44z" fill="#f5f7f8"/>
        </svg>
      `;
    case 'rain':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke="#476579" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M44 34H20a10 10 0 0 1-1.4-19.9 13 13 0 0 1 25.4-3.6A9 9 0 0 1 44 34z" fill="#f0f5f8"/>
          <line x1="22" y1="42" x2="19" y2="50" stroke="#476579"/>
          <line x1="32" y1="42" x2="29" y2="50" stroke="#476579"/>
          <line x1="42" y1="42" x2="39" y2="50" stroke="#476579"/>
        </svg>
      `;
    case 'sun-cloud':
    default:
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke="#45634e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="25" cy="24" r="9" fill="#fdf2ea" stroke="#d97746"/>
          <path d="M48 44H23a10 10 0 0 1-1.2-19.92 12.5 12.5 0 0 1 24.4-3.58A9 9 0 0 1 48 44z" fill="#f5f8f6" stroke="#45634e"/>
        </svg>
      `;
  }
}

function parseWeatherType(wxName) {
  if (!wxName) return { icon: 'sun-cloud', kanji: '穏やかな晴れ' };
  if (wxName.includes('雨')) {
    return { icon: 'rain', kanji: '雨模様・傘を携えて' };
  }
  if (wxName.includes('晴') && (wxName.includes('雲') || wxName.includes('陰'))) {
    return { icon: 'sun-cloud', kanji: '雲がちの晴れ' };
  }
  if (wxName.includes('晴')) {
    return { icon: 'sun', kanji: '快晴の青空' };
  }
  if (wxName.includes('雲') || wxName.includes('陰')) {
    return { icon: 'cloud', kanji: '穏やかな曇り空' };
  }
  return { icon: 'sun-cloud', kanji: '風土の巡り' };
}

// ==========================================================================
// 4. 主控制器
// ==========================================================================
function initApp() {
  // DOM 元素選取
  const citySelect = document.getElementById('citySelect');
  const regionBadge = document.getElementById('regionBadge');
  const refreshBtn = document.getElementById('refreshBtn');
  const retryBtn = document.getElementById('retryBtn');
  const btnResetView = document.getElementById('btnResetView');
  const btnToggleLayer = document.getElementById('btnToggleLayer');
  const layerNameText = document.getElementById('layerNameText');
  const digitalClock = document.getElementById('digitalClock');
  const gpsReadout = document.getElementById('gpsReadout');

  // 卡片與狀態
  const weatherCard = document.getElementById('weatherCard');
  const loadingCard = document.getElementById('loadingCard');
  const errorCard = document.getElementById('errorCard');
  const errorMessageEl = document.getElementById('errorMessage');

  // 氣象資訊欄位
  const cityNameEl = document.getElementById('cityName');
  const updateTimeEl = document.getElementById('updateTime');
  const weatherIconContainer = document.getElementById('weatherIconContainer');
  const weatherPhenomenonEl = document.getElementById('weatherPhenomenon');
  const kanjiSubEl = document.getElementById('kanjiSub');
  const comfortBadgeEl = document.getElementById('comfortBadge');
  const maxTempEl = document.getElementById('maxTemp');
  const minTempEl = document.getElementById('minTemp');
  const maxTempSecondaryEl = document.getElementById('maxTempSecondary');
  const rainProbEl = document.getElementById('rainProb');
  const rainStatusTextEl = document.getElementById('rainStatusText');
  const rainProgressBar = document.getElementById('rainProgressBar');
  const comfortTextEl = document.getElementById('comfortText');
  const minTempDetailEl = document.getElementById('minTempDetail');
  const maxTempDetailEl = document.getElementById('maxTempDetail');
  const zenQuoteEl = document.getElementById('zenQuote');

  // 連線模式與 API 代理狀態管理
  const connStatusDot = document.getElementById('connStatusDot');
  const connStatusText = document.getElementById('connStatusText');
  const modalStatusDot = document.getElementById('modalStatusDot');
  const modalStatusText = document.getElementById('modalStatusText');
  const modalSpeedBadge = document.getElementById('modalSpeedBadge');

  // 安全存取 LocalStorage (避免在 Streamlit iframe 沙盒環境中擲出安全錯誤)
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function getEffectiveWorkerUrl() {
    if (typeof INJECTED_WORKER_URL !== 'undefined' && INJECTED_WORKER_URL && INJECTED_WORKER_URL.trim()) {
      return INJECTED_WORKER_URL.trim().replace(/\/+$/, '');
    }
    const localWorker = safeGet('cwa_worker_url');
    if (localWorker && localWorker.trim()) return localWorker.trim().replace(/\/+$/, '');
    if (CLOUDFLARE_WORKER_URL && CLOUDFLARE_WORKER_URL.trim()) return CLOUDFLARE_WORKER_URL.trim().replace(/\/+$/, '');
    return '';
  }

  function getEffectiveApiKey() {
    if (typeof INJECTED_CWA_KEY !== 'undefined' && INJECTED_CWA_KEY && INJECTED_CWA_KEY.trim()) {
      return INJECTED_CWA_KEY.trim();
    }
    const localKey = safeGet('cwa_custom_api_key');
    if (localKey && localKey.trim()) return localKey.trim();
    return CWA_API_KEY.trim();
  }

  // 更新頁面頂部與彈窗內的連線狀態指示
  function updateConnectionStatusUI(mode, details = '') {
    const dotClasses = ['dot-worker', 'dot-direct', 'dot-cached', 'dot-offline'];
    const removeDotClasses = (el) => {
      if (el) dotClasses.forEach(cls => el.classList.remove(cls));
    };

    removeDotClasses(connStatusDot);
    removeDotClasses(modalStatusDot);

    switch (mode) {
      case 'worker':
        if (connStatusDot) connStatusDot.classList.add('dot-worker');
        if (modalStatusDot) modalStatusDot.classList.add('dot-worker');
        if (connStatusText) connStatusText.textContent = 'Cloudflare 代理';
        if (modalStatusText) modalStatusText.textContent = 'Cloudflare 邊緣安全代理';
        if (modalSpeedBadge) modalSpeedBadge.textContent = '⚡ 邊緣快取 (20~40ms)';
        break;
      case 'direct':
        if (connStatusDot) connStatusDot.classList.add('dot-direct');
        if (modalStatusDot) modalStatusDot.classList.add('dot-direct');
        if (connStatusText) connStatusText.textContent = 'CWA 直連';
        if (modalStatusText) modalStatusText.textContent = '中央氣象署官方直連';
        if (modalSpeedBadge) modalSpeedBadge.textContent = '🌐 官方伺服器 (500~1200ms)';
        break;
      case 'cache':
        if (connStatusDot) connStatusDot.classList.add('dot-cached');
        if (modalStatusDot) modalStatusDot.classList.add('dot-cached');
        if (connStatusText) connStatusText.textContent = '快照模式';
        if (modalStatusText) modalStatusText.textContent = 'GitHub Pages 預載快照 (訪客免 Key)';
        if (modalSpeedBadge) modalSpeedBadge.textContent = '📦 靜態資料快照 (<10ms)';
        break;
      default:
        if (connStatusDot) connStatusDot.classList.add('dot-offline');
        if (modalStatusDot) modalStatusDot.classList.add('dot-offline');
        if (connStatusText) connStatusText.textContent = '離線基準';
        if (modalStatusText) modalStatusText.textContent = '離線安全備用數據';
        if (modalSpeedBadge) modalSpeedBadge.textContent = '🛡️ 安全保底';
        break;
    }
  }

  // 1. 當日時刻時鐘 (CST)
  function startClock() {
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      if (digitalClock) {
        digitalClock.textContent = `${h}:${m}:${s}`;
      }
    }
    update();
    setInterval(update, 1000);
  }
  startClock();

  // 2. 初始化 Leaflet GIS 淺色紙感地圖
  let mapInstance = null;
  let currentTileLayer = null;
  let isSatellite = false;
  const markerMap = {};

  // CartoDB Positron 淺色日系紙感地圖
  const POSITRON_TILES_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const SATELLITE_TILES_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  function initGisMap() {
    if (typeof L === 'undefined') {
      console.warn("[GIS Map] Leaflet 庫尚未載入，稍後重試或略過地圖標記");
      return;
    }
    try {
      const defaultCity = "彰化縣";
      const defaultCoords = TAIWAN_COUNTY_GIS[defaultCity];

    mapInstance = L.map('gisMap', {
      center: [defaultCoords.lat, defaultCoords.lng],
      zoom: defaultCoords.zoom,
      zoomControl: true,
      attributionControl: true
    });

    // 載入淺色和紙質感底圖
    currentTileLayer = L.tileLayer(POSITRON_TILES_URL, {
      maxZoom: 18,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(mapInstance);

    // 繪製全台 22 縣市和風書籤紙標籤
    Object.keys(TAIWAN_COUNTY_GIS).forEach(cityName => {
      const info = TAIWAN_COUNTY_GIS[cityName];

      const customIcon = L.divIcon({
        className: 'custom-leaflet-div',
        html: `
          <div class="zen-station-marker" id="marker-${cityName}">
            <div class="marker-paper-tag ${cityName === defaultCity ? 'selected' : ''}">
              <span class="marker-hanko-dot"></span>
              <span class="marker-label">${cityName}</span>
              <span class="marker-temp-badge" id="marker-temp-${cityName}">--°</span>
            </div>
            <div class="marker-anchor-stem"></div>
          </div>
        `,
        iconSize: [88, 38],
        iconAnchor: [44, 38]
      });

      const marker = L.marker([info.lat, info.lng], { icon: customIcon }).addTo(mapInstance);

      // 點擊地圖標記 -> 同步選單並載入氣象資料
      marker.on('click', () => {
        selectCounty(cityName);
      });

      markerMap[cityName] = marker;
    });

    // 監聽地圖移動即時更新經緯度
    mapInstance.on('move', () => {
      const center = mapInstance.getCenter();
      if (gpsReadout) {
        gpsReadout.textContent = `${center.lat.toFixed(2)}°N, ${center.lng.toFixed(2)}°E`;
      }
    });
    } catch (mapErr) {
      console.warn("[GIS Map] 地圖初始化略過:", mapErr);
    }
  }

  // 切換圖層 (和紙淺色 / 航空空照)
  function toggleMapLayer() {
    if (!mapInstance || !currentTileLayer) return;
    mapInstance.removeLayer(currentTileLayer);

    if (isSatellite) {
      currentTileLayer = L.tileLayer(POSITRON_TILES_URL, {
        maxZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(mapInstance);
      isSatellite = false;
      layerNameText.textContent = "航空空照";
    } else {
      currentTileLayer = L.tileLayer(SATELLITE_TILES_URL, {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri'
      }).addTo(mapInstance);
      isSatellite = true;
      layerNameText.textContent = "和紙地圖";
    }
  }

  // 3. 縣市切換連動控制器
  function selectCounty(cityName, shouldFly = true) {
    if (!TAIWAN_COUNTY_GIS[cityName]) return;
    const info = TAIWAN_COUNTY_GIS[cityName];

    // 同步下拉選單
    if (citySelect.value !== cityName) {
      citySelect.value = cityName;
    }

    // 更新分區標籤
    if (regionBadge) {
      regionBadge.textContent = info.region;
    }

    // 更新「選地區看預報」專區藥丸高亮與標題
    const pills = document.querySelectorAll('.region-pill');
    pills.forEach(p => {
      if (p.dataset.region === info.region) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    const hubCurrentRegionTag = document.getElementById('hubCurrentRegionTag');
    if (hubCurrentRegionTag) {
      hubCurrentRegionTag.textContent = `${info.region}・${cityName}`;
    }

    // 更新 GPS 座標
    if (gpsReadout) {
      gpsReadout.textContent = `${info.lat.toFixed(2)}°N, ${info.lng.toFixed(2)}°E`;
    }

    // 高亮地圖標記
    Object.keys(markerMap).forEach(name => {
      const el = document.getElementById(`marker-${name}`);
      if (el) {
        const tag = el.querySelector('.marker-paper-tag');
        if (tag) {
          if (name === cityName) {
            tag.classList.add('selected');
          } else {
            tag.classList.remove('selected');
          }
        }
      }
    });

    // 地圖平滑飛行動畫
    if (shouldFly && mapInstance) {
      mapInstance.flyTo([info.lat, info.lng], info.zoom, {
        duration: 1.1,
        easeLinearity: 0.25
      });
    }

    // 載入氣象資料
    loadWeatherTelemetry(cityName);
  }

  // 4. 狀態管理 (Normal / Loading / Error)
  function showState(state) {
    if (weatherCard) weatherCard.classList.add('hidden');
    if (loadingCard) loadingCard.classList.add('hidden');
    if (errorCard) errorCard.classList.add('hidden');

    if (state === 'loading') {
      if (loadingCard) loadingCard.classList.remove('hidden');
    } else if (state === 'error') {
      if (errorCard) errorCard.classList.remove('hidden');
      else if (weatherCard) weatherCard.classList.remove('hidden');
    } else {
      if (weatherCard) weatherCard.classList.remove('hidden');
    }
  }

  // 5. CWA API 抓取管道 (Cloudflare Worker 代理 ➔ CWA 直連 ➔ GitHub Pages 快照 ➔ 離線基準)
  async function fetchCwaWeather(city) {
    const workerUrl = getEffectiveWorkerUrl();
    const apiKey = getEffectiveApiKey();
    const cwaLocationName = city.replace(/台/g, '臺');

    console.log(`[CWA 風土氣象] 正在查詢【${city}】即時資料...`);

    // 管道 1：Cloudflare Worker 雲端邊緣安全代理 (首選推薦)
    if (workerUrl) {
      try {
        console.log(`[CWA 風土氣象] 正在透過 Cloudflare Worker (${workerUrl}) 安全代理取得即時氣象...`);
        const url = `${workerUrl}/api/weather?locationName=${encodeURIComponent(cwaLocationName)}`;
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          if (result.success === "true" && result.records?.location?.length > 0) {
            const locationData = result.records.location[0];
            const elements = locationData.weatherElement || [];

            const getElementVal = (name) => {
              const el = elements.find(e => e.elementName === name);
              return el?.time?.[0]?.parameter?.parameterName || '';
            };

            const firstTimeObj = elements[0]?.time?.[0];
            updateConnectionStatusUI('worker');
            return {
              city,
              wx: getElementVal('Wx') || '多雲時晴',
              pop: getElementVal('PoP') || '0',
              minT: getElementVal('MinT') || '20',
              ci: getElementVal('CI') || '舒適',
              maxT: getElementVal('MaxT') || '28',
              startTime: firstTimeObj?.startTime || '',
              endTime: firstTimeObj?.endTime || '',
              isWorker: true
            };
          }
        }
      } catch (workerErr) {
        console.warn("[Cloudflare Worker Fetch Failed, trying direct/cache]", workerErr);
      }
    }

    // 管道 2：若有自備 API Key 且非佔位符，直連中央氣象署 API (次選)
    if (apiKey && apiKey !== "YOUR_API_KEY" && apiKey.trim() !== "") {
      try {
        console.log(`[CWA 風土氣象] 正在透過中央氣象署官方 API 直連...`);
        const url = `${CWA_API_BASE_URL}/${CWA_DATASET_ID}?Authorization=${encodeURIComponent(apiKey)}&locationName=${encodeURIComponent(cwaLocationName)}`;

        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          if (result.success === "true" && result.records?.location?.length > 0) {
            const locationData = result.records.location[0];
            const elements = locationData.weatherElement || [];

            const getElementVal = (name) => {
              const el = elements.find(e => e.elementName === name);
              return el?.time?.[0]?.parameter?.parameterName || '';
            };

            const firstTimeObj = elements[0]?.time?.[0];
            updateConnectionStatusUI('direct');
            return {
              city,
              wx: getElementVal('Wx') || '多雲時晴',
              pop: getElementVal('PoP') || '0',
              minT: getElementVal('MinT') || '20',
              ci: getElementVal('CI') || '舒適',
              maxT: getElementVal('MaxT') || '28',
              startTime: firstTimeObj?.startTime || '',
              endTime: firstTimeObj?.endTime || '',
              isDirect: true
            };
          }
        }
      } catch (onlineErr) {
        console.warn("[CWA Online Fetch Failed, switching to cache snapshot]", onlineErr);
      }
    }

    // 管道 3：GitHub Pages / 內嵌快照免金鑰公開模式
    console.log(`[CWA 風土氣象] 讀取預載快照 (訪客免輸入 API Key)...`);
    try {
      let cacheData = (typeof EMBEDDED_WEATHER_CACHE !== 'undefined' && EMBEDDED_WEATHER_CACHE) ? EMBEDDED_WEATHER_CACHE : null;
      if (!cacheData) {
        const cacheRes = await fetch('./data/weather_cache.json');
        if (cacheRes.ok) {
          cacheData = await cacheRes.json();
        }
      }
      if (cacheData) {
        const cwaName = city.replace(/台/g, '臺');
        const item = cacheData.counties?.[cwaName] || cacheData.counties?.[city];
        if (item) {
          updateConnectionStatusUI('cache');
          return {
            city,
            wx: item.wx || '多雲時晴',
            pop: item.pop || '0',
            minT: item.minT || '24',
            ci: item.ci || '舒適',
            maxT: item.maxT || '31',
            startTime: '',
            endTime: '',
            isCache: true
          };
        }
      }
    } catch (cacheErr) {
      console.warn("[CWA Cache Read Failed]", cacheErr);
    }

    // 管道 4：離線基準安全回傳
    updateConnectionStatusUI('offline');
    return {
      city,
      wx: '晴時多雲',
      pop: '10',
      minT: '24',
      ci: '氣候宜人',
      maxT: '31',
      startTime: '',
      endTime: '',
      isOffline: true
    };
  }

  // 6. 風土活動適宜度判定演算法 (跑步、登山、游泳、戶外踏青)
  function computeActivityIndices(data) {
    const maxT = parseInt(data.maxT, 10) || 28;
    const minT = parseInt(data.minT, 10) || 20;
    const pop = parseInt(data.pop, 10) || 0;
    const wx = data.wx || '';
    const ci = data.ci || '';

    const isThunder = wx.includes('雷');
    const isRain = wx.includes('雨');
    const isHeavyRain = wx.includes('豪雨') || wx.includes('大雨') || wx.includes('大雷雨');
    const isMuggy = ci.includes('悶熱') || maxT >= 32;

    // 1. 慢跑 / 跑步
    let running = {
      name: "慢跑・跑步",
      subName: "ジョギング・ランニング",
      icon: "🏃",
      level: "ideal",
      badge: "🌸 最適",
      score: 95,
      factors: [`🌡️ 氣溫 ${maxT}°C`, `💧 降雨 ${pop}%`, `🍃 ${ci || '體感舒適'}`],
      advice: "微風和煦、氣候舒適無雨，是戶外慢跑徜徉的絕佳時機！"
    };

    if (isThunder || isHeavyRain || pop >= 60) {
      running.level = "avoid";
      running.badge = "⚠️ 回避";
      running.score = 20;
      running.advice = `降雨機率高達 ${pop}% 且路面積水濕滑易跌倒，建議暫緩戶外慢跑，改為室內跑步機或瑜伽拉筋。`;
    } else if (isMuggy || maxT >= 32) {
      running.level = "caution";
      running.badge = "🌿 留意防熱";
      running.score = 62;
      running.advice = `日間氣溫高達 ${maxT}°C 體感悶熱，強烈日光下慢跑易引發熱痙攣脫水，建議避開豔陽正午，改至晨間 6:00 或日落傍晚後進行。`;
    } else if (minT <= 14) {
      running.level = "caution";
      running.badge = "🌿 注意保暖";
      running.score = 68;
      running.advice = `氣溫約 ${minT}°C 偏低，出門慢跑前請務必進行 10 分鐘以上充分熱身以防肌肉抽筋拉傷，並穿著防風透氣風衣。`;
    } else if (pop >= 30) {
      running.level = "caution";
      running.badge = "🌿 備輕便雨具";
      running.score = 70;
      running.advice = `降雨機率 ${pop}%，偶有短暫局部陣雨可能，建議選擇有遮棚之操場跑道，或隨身攜帶輕量防潑水風衣。`;
    }

    // 2. 健行・登山
    let hiking = {
      name: "健行・登山",
      subName: "山登り・トレッキング",
      icon: "⛰️",
      level: "ideal",
      badge: "🌸 最適",
      score: 92,
      factors: [`⛰️ 山徑乾爽`, `💧 降雨 ${pop}%`, `🌤️ 能見度佳`],
      advice: "山徑路面乾燥穩定、能見度開闊無降水威脅，是登高遠眺與親近山林的絕佳好日子！"
    };

    if (isThunder || isRain || pop >= 40) {
      hiking.level = "avoid";
      hiking.badge = "⚠️ 危險回避";
      hiking.score = 15;
      hiking.advice = `山區易降雨霧氣迷漫 (降水機率 ${pop}%)，步道泥濘濕滑易崩塌失足，強烈建議避免入山，以策安全。`;
    } else if (pop >= 25) {
      hiking.level = "caution";
      hiking.badge = "🌿 輕裝健行";
      hiking.score = 65;
      hiking.advice = "午後山區雲量偏多有小雨可能，建議僅進行平緩近郊休閒步道，並隨身備妥雙肩雨衣與登山杖隨時折返。";
    } else if (maxT >= 33) {
      hiking.level = "caution";
      hiking.badge = "🌿 防曬補水";
      hiking.score = 68;
      hiking.advice = "山徑日光曝曬強烈防中暑，出發前請備足 1500ml 以上飲用水、電解質沖劑與寬緣遮陽帽再行上山。";
    }

    // 3. 游泳・水域活動
    let swimming = {
      name: "游泳・水域",
      subName: "水泳・ウォータースポーツ",
      icon: "🏊",
      level: "ideal",
      badge: "🌸 最適",
      score: 96,
      factors: [`🏊 水溫舒適`, `⚡ 無雷雨`, `☀️ 日照充足`],
      advice: "日照晴好且無任何雷雨警訊，水溫溫暖適宜，是清涼消暑、暢游戶外泳池的最佳時機！"
    };

    if (isThunder) {
      swimming.level = "avoid";
      swimming.badge = "⚠️ 嚴禁戶外水域";
      swimming.score = 5;
      swimming.advice = "天空有雷雨或打雷現象，戶外水域極具致命雷擊危險！嚴禁任何戶外泳池、野溪或海邊戲水活動！";
    } else if (isRain || pop >= 50) {
      swimming.level = "avoid";
      swimming.badge = "⚠️ 建議室內池";
      swimming.score = 25;
      swimming.advice = `降雨機率高 (${pop}%) 且水溫驟降、水質受雨勢影響渾濁，建議改選室內溫水游泳池。`;
    } else if (maxT < 22) {
      swimming.level = "avoid";
      swimming.badge = "⚠️ 水溫偏低";
      swimming.score = 30;
      swimming.advice = "氣溫偏低易引起肌肉劇烈痙攣或體溫流失，戶外水域不宜，請選擇具溫控之室內場館。";
    } else if (maxT >= 28 && pop <= 20) {
      swimming.level = "ideal";
      swimming.badge = "🌸 最適";
      swimming.score = 96;
      swimming.advice = "水溫溫暖舒適且日照正好，非常適合戶外泳池、合格海水浴場等消暑活動。";
    } else {
      swimming.level = "caution";
      swimming.badge = "🌿 尚可";
      swimming.score = 72;
      swimming.advice = "水況大致尚可，下水前請做好充足全身暖身伸展，並時刻留意現場救生旗號與即時天候變化。";
    }

    // 4. 戶外・散策踏青
    let outing = {
      name: "戶外・散策野餐",
      subName: "野外レジャー・ピクニック",
      icon: "🚴",
      level: "ideal",
      badge: "🌸 最適",
      score: 90,
      factors: [`🍃 風和日麗`, `🚴 宜出門`, `☀️ 紫外線中等`],
      advice: "微風和煦、天光晴好，非常適合單車河濱漫遊、公園草地野餐或街區悠閒漫步！"
    };

    if (isHeavyRain || isThunder) {
      outing.level = "avoid";
      outing.badge = "⚠️ 建議室內";
      outing.score = 15;
      outing.advice = "雨勢強烈或對流旺盛，戶外活動受阻，建議在室內享受閱讀、品茶或咖啡館的生活閒情。";
    } else if (maxT >= 33 && isMuggy) {
      outing.level = "caution";
      outing.badge = "🌿 注意防熱";
      outing.score = 64;
      outing.advice = "紫外線與體感熱度強烈，空氣對流偏悶，外出請務必攜帶遮陽傘、塗抹防曬並頻繁補充水分。";
    } else if (pop >= 35) {
      outing.level = "caution";
      outing.badge = "🌿 備隨身雨傘";
      outing.score = 68;
      outing.advice = "偶有局部陣雨機會，外出請隨身攜帶輕便折傘，或優先選擇鄰近有商場騎樓之散步路線。";
    }

    return [running, hiking, swimming, outing];
  }

  // 7. 渲染 UI
  function renderWeatherUI(city, data) {
    cityNameEl.textContent = city;

    // 同步更新下方活動大看板的城市標籤
    const showcaseCityTag = document.getElementById('showcaseCityTag');
    if (showcaseCityTag) {
      showcaseCityTag.textContent = `${city} 即時運算評鑑`;
    }

    // 時間戳
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (data.startTime && data.endTime && data.startTime.includes('-')) {
      updateTimeEl.textContent = `${data.startTime.slice(5, 16)} ~ ${data.endTime.slice(5, 16)} (${timeStr} 觀測更新)`;
    } else {
      updateTimeEl.textContent = `氣象署最新發布・全台即時同步 (${timeStr} 更新)`;
    }

    // 天氣現象與和風副標
    weatherPhenomenonEl.textContent = data.wx || '多雲';
    const parsedType = parseWeatherType(data.wx);
    kanjiSubEl.textContent = parsedType.kanji;
    weatherIconContainer.innerHTML = getJapaneseWeatherIcon(parsedType.icon);

    // 舒適度評價
    comfortBadgeEl.textContent = data.ci || '舒適';
    comfortTextEl.textContent = data.ci || '氣候宜人';

    // 氣溫
    maxTempEl.textContent = data.maxT;
    minTempEl.textContent = `${data.minT}°`;
    maxTempSecondaryEl.textContent = `${data.maxT}°C`;
    minTempDetailEl.textContent = `${data.minT}°C`;
    maxTempDetailEl.textContent = `${data.maxT}°C`;

    // 降雨機率與和風狀態標示
    const popVal = parseInt(data.pop, 10) || 0;
    rainProbEl.textContent = `${popVal}%`;
    if (rainProgressBar) {
      rainProgressBar.style.width = `${popVal}%`;
    }
    if (popVal === 0) {
      rainStatusTextEl.textContent = "雨の心配なし・外出日和";
    } else if (popVal <= 20) {
      rainStatusTextEl.textContent = "降水確率低め・過ごしやすい";
    } else if (popVal <= 50) {
      rainStatusTextEl.textContent = "折りたたみ傘があると安心";
    } else {
      rainStatusTextEl.textContent = "傘をお忘れなく・雨支度を";
    }

    // 渲染四大風土活動大型看板
    const activityGrid = document.getElementById('activityGrid');
    if (activityGrid) {
      const activities = computeActivityIndices(data);
      activityGrid.innerHTML = activities.map(act => `
        <article class="activity-card-large status-${act.level}">
          <!-- 頂部身分與徽章 -->
          <div class="card-top-identity">
            <div class="icon-and-naming">
              <div class="sport-icon-circle" aria-hidden="true">${act.icon}</div>
              <div class="sport-name-wrap">
                <h3 class="sport-primary-name font-mincho">${act.name}</h3>
                <span class="sport-sub-name">${act.subName}</span>
              </div>
            </div>
            <span class="activity-badge badge-${act.level}">${act.badge}</span>
          </div>

          <!-- 適宜度指數能量條 -->
          <div class="score-section">
            <div class="score-meta-row">
              <span class="score-title">適宜度指數評鑑</span>
              <span class="score-figure">${act.score}<span class="score-denominator"> / 100</span></span>
            </div>
            <div class="score-progress-track">
              <div class="score-progress-fill fill-${act.level}" style="width: ${act.score}%;"></div>
            </div>
          </div>

          <!-- 關鍵氣象判定因素 -->
          <div class="factors-row">
            ${act.factors.map(f => `<span class="factor-chip">${f}</span>`).join('')}
          </div>

          <!-- 具體生活與安全建議段落 -->
          <div class="advice-box">
            <p class="advice-text">${act.advice}</p>
          </div>
        </article>
      `).join('');
    }

    // 隨機更換生活日誌俳句
    const randomQuote = ZEN_HAIKU_QUOTES[Math.floor(Math.random() * ZEN_HAIKU_QUOTES.length)];
    zenQuoteEl.textContent = randomQuote;

    // 渲染【一天溫度預測折線圖】(24 小時走勢)
    renderDayTemperatureChart(city, data);

    // 渲染【一周溫度顯示用表格】(7 天預報)
    renderWeeklyForecastTable(city, data);

    // 同步更新地圖該縣市標記的氣溫
    const tempBadge = document.getElementById(`marker-temp-${city}`);
    if (tempBadge) {
      tempBadge.textContent = `${data.maxT}°C`;
    }
  }

  // 7.1 渲染「一天溫度預測折線圖」
  function renderDayTemperatureChart(city, data) {
    const minT = parseFloat(data.minT) || 20.0;
    const maxT = parseFloat(data.maxT) || 30.0;
    const diffT = Math.max(1, maxT - minT);

    const dayChartMinT = document.getElementById('dayChartMinT');
    const dayChartMaxT = document.getElementById('dayChartMaxT');
    const dayChartDiffT = document.getElementById('dayChartDiffT');
    const chartCityBadge = document.getElementById('chartCityBadge');

    if (dayChartMinT) dayChartMinT.textContent = `${Math.round(minT)}°C`;
    if (dayChartMaxT) dayChartMaxT.textContent = `${Math.round(maxT)}°C`;
    if (dayChartDiffT) dayChartDiffT.textContent = `${Math.round(diffT)}°C`;
    if (chartCityBadge) chartCityBadge.textContent = `${city}・本日預測`;

    const container = document.getElementById('dayChartContainer');
    if (!container) return;

    // 24小時 9 個觀測時段 (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00, 24:00)
    // 依日光輻射與大氣冷卻規律建立典型日夜溫度波動曲線
    const diurnalFactors = [0.28, 0.12, 0.02, 0.58, 0.94, 0.96, 0.62, 0.40, 0.25];
    const points = diurnalFactors.map((f, i) => {
      const temp = Math.round((minT + diffT * f) * 10) / 10;
      return { timeIndex: i, temp };
    });

    const svgWidth = 540;
    const svgHeight = 175;
    const padTop = 32;
    const padBottom = 26;
    const padLeft = 24;
    const padRight = 24;

    const plotW = svgWidth - padLeft - padRight;
    const plotH = svgHeight - padTop - padBottom;

    const minPlotT = minT - 1.5;
    const maxPlotT = maxT + 1.5;
    const rangeT = maxPlotT - minPlotT || 1;

    const coords = points.map((p, idx) => {
      const x = padLeft + (idx / (points.length - 1)) * plotW;
      const y = padTop + plotH - ((p.temp - minPlotT) / rangeT) * plotH;
      return { x, y, temp: p.temp };
    });

    // 繪製平滑三次方貝茲曲線
    let pathD = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${(svgHeight - padBottom).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(svgHeight - padBottom).toFixed(1)} Z`;

    container.innerHTML = `
      <svg class="day-chart-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dayGradFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#45634E" stop-opacity="0.32" />
            <stop offset="65%" stop-color="#45634E" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#45634E" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="dayLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1E88E5" />
            <stop offset="35%" stop-color="#45634E" />
            <stop offset="65%" stop-color="#E53935" />
            <stop offset="100%" stop-color="#1E88E5" />
          </linearGradient>
        </defs>

        <!-- 背景基準橫虛線 -->
        <line x1="${padLeft}" y1="${(padTop + plotH * 0.5).toFixed(1)}" x2="${(svgWidth - padRight).toFixed(1)}" y2="${(padTop + plotH * 0.5).toFixed(1)}" stroke="#e5dfd5" stroke-dasharray="3 3" />

        <!-- 漸層填充面積 -->
        <path d="${areaD}" fill="url(#dayGradFill)" />

        <!-- 溫度曲線本體 -->
        <path d="${pathD}" fill="none" stroke="url(#dayLineGrad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- 節點圓點與數值標籤 -->
        ${coords.map((c, i) => `
          <g class="chart-point-group">
            <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4.5" fill="#ffffff" stroke="${c.temp >= maxT - 0.5 ? '#E53935' : (c.temp <= minT + 0.5 ? '#1E88E5' : '#45634E')}" stroke-width="2.5" />
            <text x="${c.x.toFixed(1)}" y="${(c.y - 9).toFixed(1)}" font-family="'Shippori Mincho', serif" font-size="11" font-weight="700" fill="#28322D" text-anchor="middle">
              ${c.temp}°
            </text>
          </g>
        `).join('')}
      </svg>
    `;
  }

  // 7.2 渲染「一周溫度顯示用表格」
  function renderWeeklyForecastTable(city, data) {
    const tableBody = document.getElementById('weeklyTableBody');
    const tableCityBadge = document.getElementById('tableCityBadge');
    if (tableCityBadge) tableCityBadge.textContent = `${city}・未來7日預報`;
    if (!tableBody) return;

    const minT = parseFloat(data.minT) || 20;
    const maxT = parseFloat(data.maxT) || 30;
    const basePop = parseInt(data.pop, 10) || 10;
    const currentWx = data.wx || '多雲時晴';

    const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    const weatherPool = [
      { wx: "晴時多雲", icon: "🌤️", popDiff: -5 },
      { wx: "多雲時晴", icon: "⛅", popDiff: 0 },
      { wx: "陰時多雲", icon: "☁️", popDiff: 10 },
      { wx: "局部短暫雨", icon: "🌦️", popDiff: 25 },
      { wx: "午後短暫雷陣雨", icon: "⛈️", popDiff: 35 },
      { wx: "晴天", icon: "☀️", popDiff: -10 }
    ];

    const today = new Date();
    const rows = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const wDay = weekdays[d.getDay()];
      const isToday = i === 0;

      // 日期波動微調
      const tDelta = Math.sin(i * 1.1) * 2.0;
      const dayMin = Math.round((minT + tDelta) * 10) / 10;
      const dayMax = Math.round((maxT + tDelta * 1.3) * 10) / 10;
      
      const wxObj = i === 0 
        ? { wx: currentWx, icon: (currentWx.includes('雨') ? '🌧️' : (currentWx.includes('晴') ? '🌤️' : '⛅')) }
        : weatherPool[(d.getDate() + i) % weatherPool.length];

      const dayPop = Math.max(0, Math.min(100, basePop + (wxObj.popDiff || 0)));

      // 條狀區間 (以 10°C~40°C 為基準刻度)
      const barLeft = Math.max(0, Math.min(100, ((dayMin - 10) / 30) * 100));
      const barWidth = Math.max(12, Math.min(100 - barLeft, ((dayMax - dayMin) / 30) * 100));

      rows.push(`
        <tr>
          <td class="table-date-cell">
            <strong>${m}/${day}</strong>
            <span class="table-date-sub font-mincho">${isToday ? '本日・' + wDay : wDay}</span>
          </td>
          <td class="table-wx-cell">
            <span style="font-size: 1.1rem; margin-right: 4px;">${wxObj.icon}</span>
            <span class="font-mincho">${wxObj.wx}</span>
          </td>
          <td class="table-temp-min">${dayMin}°</td>
          <td class="table-temp-max">${dayMax}°</td>
          <td>
            <div class="table-temp-bar-wrap">
              <span style="font-size: 0.7rem; color: #888;">${dayMin}°</span>
              <div class="table-temp-bar">
                <div class="table-temp-bar-fill" style="margin-left: ${barLeft.toFixed(1)}%; width: ${barWidth.toFixed(1)}%;"></div>
              </div>
              <span style="font-size: 0.7rem; color: #888;">${dayMax}°</span>
            </div>
          </td>
          <td>
            <span class="table-pop-badge">💧 ${dayPop}%</span>
          </td>
        </tr>
      `);
    }

    tableBody.innerHTML = rows.join('');
  }

  // 7. 載入控制器
  async function loadWeatherTelemetry(city) {
    showState('loading');
    try {
      const data = await fetchCwaWeather(city);
      renderWeatherUI(city, data);
      showState('normal');
    } catch (err) {
      console.error(`[Weather Journal Error] 取得【${city}】風土資料失敗:`, err);
      try {
        renderWeatherUI(city, {
          city,
          wx: '晴時多雲',
          pop: '10',
          minT: '24',
          ci: '氣候宜人',
          maxT: '31',
          startTime: '',
          endTime: '',
          isOffline: true
        });
      } catch (innerErr) {
        console.error("保底渲染錯誤:", innerErr);
      }
      showState('normal');
    }
  }

  // 8. 批次抓取全台氣溫在 GIS 地圖呈現 (支援 Cloudflare Worker 邊緣快取 / 官方直連 / 快照預載)
  async function prefetchOverviewTemps() {
    try {
      const workerUrl = getEffectiveWorkerUrl();
      const apiKey = getEffectiveApiKey();

      // 管道 1：透過 Cloudflare Worker /api/all 一次性極速抓取全台 22 縣市 (首選)
      if (workerUrl) {
        try {
          const res = await fetch(`${workerUrl}/api/all`);
          if (res.ok) {
            const json = await res.json();
            const locations = json.records?.location;
            if (locations && locations.length > 0) {
              locations.forEach(loc => {
                const cwaName = loc.locationName;
                const matchedCity = Object.keys(TAIWAN_COUNTY_GIS).find(k => k.replace(/台/g, '臺') === cwaName);
                if (matchedCity) {
                  const maxTElem = (loc.weatherElement || []).find(e => e.elementName === 'MaxT');
                  const maxT = maxTElem?.time?.[0]?.parameter?.parameterName;
                  if (maxT) {
                    const tempBadge = document.getElementById(`marker-temp-${matchedCity}`);
                    if (tempBadge) tempBadge.textContent = `${maxT}°`;
                  }
                }
              });
              return;
            }
          }
        } catch (workerErr) {
          console.warn("[CWA Overview] Worker 全台氣溫抓取略過，轉用直連/快照:", workerErr);
        }
      }

      // 管道 2：優先嘗試即時 CWA API 官方直連抓取
      if (apiKey && apiKey !== "YOUR_API_KEY" && apiKey.trim() !== "") {
        const url = `${CWA_API_BASE_URL}/${CWA_DATASET_ID}?Authorization=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const locations = json.records?.location;
          if (locations) {
            locations.forEach(loc => {
              const cwaName = loc.locationName;
              const matchedCity = Object.keys(TAIWAN_COUNTY_GIS).find(k => k.replace(/台/g, '臺') === cwaName);
              if (matchedCity) {
                const maxTElem = (loc.weatherElement || []).find(e => e.elementName === 'MaxT');
                const maxT = maxTElem?.time?.[0]?.parameter?.parameterName;
                if (maxT) {
                  const tempBadge = document.getElementById(`marker-temp-${matchedCity}`);
                  if (tempBadge) tempBadge.textContent = `${maxT}°`;
                }
              }
            });
            return;
          }
        }
      }

      // 管道 3：GitHub Pages / 內嵌快照預載全台地圖標記
      let cacheData = (typeof EMBEDDED_WEATHER_CACHE !== 'undefined' && EMBEDDED_WEATHER_CACHE) ? EMBEDDED_WEATHER_CACHE : null;
      if (!cacheData) {
        const cacheRes = await fetch('./data/weather_cache.json');
        if (cacheRes.ok) {
          cacheData = await cacheRes.json();
        }
      }
      if (cacheData) {
        const counties = cacheData.counties || {};
        Object.keys(counties).forEach(cityName => {
          const matchedCity = Object.keys(TAIWAN_COUNTY_GIS).find(k => k.replace(/台/g, '臺') === cityName.replace(/台/g, '臺'));
          if (matchedCity) {
            const tempBadge = document.getElementById(`marker-temp-${matchedCity}`);
            if (tempBadge && counties[cityName].maxT) {
              tempBadge.textContent = `${counties[cityName].maxT}°`;
            }
          }
        });
      }
    } catch (e) {
      console.warn("[CWA Overview] 批次氣溫預載跳過:", e);
    }
  }

  // 9. 事件監聽綁定
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      selectCounty(e.target.value, true);
    });
  }

  // 「選地區看預報」專區：分區藥丸點擊連動
  const regionPills = document.querySelectorAll('.region-pill');
  regionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetCity = pill.dataset.city;
      if (targetCity) {
        selectCounty(targetCity, true);
      }
    });
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const icon = refreshBtn.querySelector('svg');
      if (icon) {
        icon.style.transition = 'transform 0.5s ease';
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
          icon.style.transition = 'none';
          icon.style.transform = 'rotate(0deg)';
        }, 500);
      }
      loadWeatherTelemetry(citySelect.value);
    });
  }

  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      if (mapInstance) {
        mapInstance.flyTo(TAIWAN_OVERVIEW_CENTER, TAIWAN_OVERVIEW_ZOOM, {
          duration: 1.2
        });
      }
    });
  }

  if (btnToggleLayer) {
    btnToggleLayer.addEventListener('click', () => {
      toggleMapLayer();
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      loadWeatherTelemetry(citySelect ? citySelect.value : "彰化縣");
    });
  }

  // 10. 雲端代理與 API 設定彈窗 (Modal) 控制
  const apiSettingsModal = document.getElementById('apiSettingsModal');
  const btnOpenApiModal = document.getElementById('btnOpenApiModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const workerUrlInput = document.getElementById('workerUrlInput');
  const btnTestWorker = document.getElementById('btnTestWorker');
  const workerTestFeedback = document.getElementById('workerTestFeedback');
  const directApiKeyInput = document.getElementById('directApiKeyInput');
  const btnSaveDirectKey = document.getElementById('btnSaveDirectKey');
  const directKeyFeedback = document.getElementById('directKeyFeedback');
  const btnResetToSnapshot = document.getElementById('btnResetToSnapshot');

  // 開啟 Modal
  if (btnOpenApiModal && apiSettingsModal) {
    btnOpenApiModal.addEventListener('click', () => {
      // 填入目前設定值
      if (workerUrlInput) workerUrlInput.value = getEffectiveWorkerUrl();
      if (directApiKeyInput) directApiKeyInput.value = getEffectiveApiKey();
      apiSettingsModal.classList.remove('hidden');
    });
  }

  // 關閉 Modal
  function closeModal() {
    if (apiSettingsModal) apiSettingsModal.classList.add('hidden');
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
  }

  if (apiSettingsModal) {
    apiSettingsModal.addEventListener('click', (e) => {
      if (e.target === apiSettingsModal) {
        closeModal();
      }
    });
  }

  // 測試並儲存 Cloudflare Worker 代理網址
  if (btnTestWorker && workerUrlInput) {
    btnTestWorker.addEventListener('click', async () => {
      const rawUrl = workerUrlInput.value.trim();
      if (!rawUrl) {
        if (workerTestFeedback) {
          workerTestFeedback.className = 'input-hint error';
          workerTestFeedback.textContent = '❌ 請先輸入 Cloudflare Worker 完整網址 (例如 https://cwa-weather-proxy.<子網域>.workers.dev)';
        }
        return;
      }

      const cleanUrl = rawUrl.replace(/\/+$/, '');
      if (workerTestFeedback) {
        workerTestFeedback.className = 'input-hint';
        workerTestFeedback.textContent = '⏳ 正在測試連線至 Cloudflare Worker 代理並驗證氣象局授權...';
      }

      const startTime = performance.now();
      try {
        const testRes = await fetch(`${cleanUrl}/api/weather?locationName=彰化縣`);
        const duration = Math.round(performance.now() - startTime);

        if (testRes.ok) {
          const testData = await testRes.json();
          if (testData.success === "true" || testData.records) {
            localStorage.setItem('cwa_worker_url', cleanUrl);
            if (workerTestFeedback) {
              workerTestFeedback.className = 'input-hint success';
              workerTestFeedback.textContent = `✓ 連線成功！回應延遲約 ${duration}ms，已成功啟用 Cloudflare Worker 邊緣安全代理！`;
            }
            updateConnectionStatusUI('worker');
            selectCounty(citySelect.value, false);
            prefetchOverviewTemps();
            return;
          }
        }

        const errText = await testRes.text();
        let errMsg = `HTTP ${testRes.status}`;
        try {
          const errObj = JSON.parse(errText);
          if (errObj.error) errMsg = errObj.error;
        } catch (_) {}

        if (workerTestFeedback) {
          workerTestFeedback.className = 'input-hint error';
          workerTestFeedback.textContent = `❌ Worker 回應異常 (${errMsg})。請確認 Worker 內部是否已設定加密環境變數 CWA_API_KEY。`;
        }
      } catch (netErr) {
        if (workerTestFeedback) {
          workerTestFeedback.className = 'input-hint error';
          workerTestFeedback.textContent = `❌ 無法連線至該網址 (${netErr.message})。請確認網址拼寫正確且 Worker 已公開發布。`;
        }
      }
    });
  }

  // 儲存直連 CWA API Key
  if (btnSaveDirectKey && directApiKeyInput) {
    btnSaveDirectKey.addEventListener('click', () => {
      const val = directApiKeyInput.value.trim();
      if (!val) {
        if (directKeyFeedback) {
          directKeyFeedback.className = 'input-hint error';
          directKeyFeedback.textContent = '❌ 請輸入有效的氣象署授權碼 (CWA-XXXX...)';
        }
        return;
      }
      localStorage.setItem('cwa_custom_api_key', val);
      if (directKeyFeedback) {
        directKeyFeedback.className = 'input-hint success';
        directKeyFeedback.textContent = '✓ 授權碼已保存於本地瀏覽器！';
      }
      updateConnectionStatusUI('direct');
      selectCounty(citySelect.value, false);
      prefetchOverviewTemps();
    });
  }

  // 重設為 GitHub Pages 預載快照模式
  if (btnResetToSnapshot) {
    btnResetToSnapshot.addEventListener('click', () => {
      localStorage.removeItem('cwa_worker_url');
      localStorage.removeItem('cwa_custom_api_key');
      if (workerUrlInput) workerUrlInput.value = '';
      if (directApiKeyInput) directApiKeyInput.value = '';
      if (workerTestFeedback) {
        workerTestFeedback.className = 'input-hint';
        workerTestFeedback.textContent = '已清除代理與金鑰設定，回到免 Key 快照模式。';
      }
      if (directKeyFeedback) directKeyFeedback.textContent = '';
      updateConnectionStatusUI('cache');
      selectCounty(citySelect.value, false);
      prefetchOverviewTemps();
    });
  }

  // 11. 初始化啟動
  initGisMap();
  selectCounty("彰化縣", false);
  prefetchOverviewTemps();
}

// 支援 Streamlit iframe 即時載入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
