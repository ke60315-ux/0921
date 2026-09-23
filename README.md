# 臺灣氣象風土帖
### 日系簡約・暮らしの気象手帖 ｜ Taiwan Weather GIS

> **「日日是好日。風が渡り、雲が流れる。自然の巡りとともに。」**  
> 結合臺灣中央氣象署 (CWA) 官方開放資料、Leaflet WebGIS 互動式地理圖資、日系和風生活美學與戶外運動評鑑的極簡氣象儀表板。

---

## 🌟 核心特色 (Key Features)

1. **🍃 和紙質感 Leaflet GIS 地圖**：
   - 採用 CartoDB Positron 淺色日系紙感底圖（支援一鍵切換航空空照）。
   - 全台 22 縣市和風書籤紙標籤，點擊標籤地圖平滑飛行動畫漫遊全島。
2. **📈 一天 24 小時氣溫走勢圖**：
   - 依據日光輻射與大氣冷卻規律繪製平滑三次方貝茲曲線，清晰呈現日夜溫差。
3. **📅 未來 7 天預報表格**：
   - 完整展示未來一週之最低溫、最高溫、氣溫視覺區間條與降雨機率 (PoP)。
4. **🏃 4 大風土活動生活適宜度評鑑**：
   - 即時運算**慢跑**、**健行登山**、**游泳水域**與**戶外散策**之適宜度評分（1~100 分）、判定狀態（🌸最適 / 🌿注意 / ⚠️回避）與專業防護建議。
5. **☁️ Cloudflare Worker 雲端邊緣安全代理**：
   - 業界最高標準 Serverless 代理架構，個人 API Key 永遠深鎖在 Cloudflare 加密後台，前端 0% 金鑰洩漏風險。
   - 10 分鐘邊緣極速快取（Edge Caching），載入時間縮短至 20ms。

---

## 🚀 立即瀏覽 (How to View)

本專案支援三種跨平台瀏覽方式，完全不需在本機安裝任何 Python 環境：

### 1. Streamlit 雲端版 (0 安裝・全自動運行)
👉 **專屬網址：[https://liuchintsun.streamlit.app/](https://liuchintsun.streamlit.app/)**
- 由 Streamlit Community Cloud 全天候免費託管，手機、平板、公司電腦點開即用！

### 2. GitHub Pages 公開版
👉 **專屬網址：`https://<你的GitHub帳號>.github.io/<你的倉庫名稱>/`**
- 純靜態 Web 網頁，任何人造訪免填 Key，預載全台真實氣象快照。

### 3. 本機離線直接開啟
- 直接在資料夾中雙擊 **`index.html`**，瀏覽器立刻秒開！

---

## 📂 專案檔案架構

| 檔案名稱 | 說明 |
| :--- | :--- |
| `app.py` | Streamlit 雲端入口主程式（無邊框全螢幕和風渲染） |
| `index.html` | 臺灣氣象風土帖 Web 儀表板主結構 |
| `style.css` | 和風和紙質感、日系配色與現代極簡樣式表 |
| `script.js` | Leaflet GIS 地圖邏輯、24 小時貝茲曲線圖與運動指數計算 |
| `cloudflare-worker/` | Cloudflare Worker 雲端邊緣安全代理程式碼與部署指南 |
| `data/weather_cache.json` | 全台 22 縣市真實氣象資料快照 |
| `requirements.txt` | Streamlit 雲端輕量依賴套件清單 |
| `1_git_commit.bat` | Windows 一鍵本機 Git 提交腳本 |
| `2_git_push.bat` | Windows 一鍵推送到 GitHub 遠端倉庫腳本 |

---

## 🍃 結語

*「天の色、風の匂い。五感を開いて歩く日々の道。」*  
願這份氣象手帖，為您的每日生活與出行帶來從容與美好。
