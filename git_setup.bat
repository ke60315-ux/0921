@echo off
chcp 65001 >nul
echo ========================================================
echo   Weather Dashboard - Git 倉庫初始化與 GitHub Pages 準備
echo ========================================================
echo.

echo [1/3] 正在執行 git init 初始化本地倉庫...
git init
echo.

echo [2/3] 將安全檔案加入 Git 暫存區 (Stage)...
git add .
echo.

echo [3/3] 檢查當前 Git 暫存狀態 (git status)...
git status
echo.

echo ========================================================
echo   【GitHub Pages 免 API Key 安全上線確認】
echo   1. script.js 與 fetch_data.py 的個人金鑰已全數移除！
echo   2. 前端預設讀取 data/weather_cache.json 快照
echo   3. 任何人開啟 GitHub Pages 網址皆可直接使用，免輸 Key！
echo.
echo   【注意】依據您的指示：
echo   「尚未執行 commit，亦完全沒有執行 push」
echo   請在確認狀態無誤後，手動或依照指示進行 Commit 與 Push。
echo ========================================================
pause
