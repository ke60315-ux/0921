@echo off
chcp 65001 >nul
title Taiwan Weather Forecast - 資料抓取工具
echo ========================================================
echo   AI 創新微課程 - 中央氣象署 (CWA) 資料抓取器
echo ========================================================
echo.

set "PY_CMD="
where python >nul 2>nul
if %errorlevel% equ 0 (
    set "PY_CMD=python"
) else (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set "PY_CMD=py"
    )
)

if "%PY_CMD%"=="" (
    echo ❌ 找不到 Python，請先安裝 Python 並加入 PATH。
    pause
    exit /b 1
)

echo 正在執行 fetch_data.py 連線中央氣象署 / Cloudflare Worker (步驟 3~10)...
%PY_CMD% fetch_data.py
echo.
echo 執行完畢！您可以雙擊 run_app.bat 開啟 Web App 檢視最新預報。
pause
