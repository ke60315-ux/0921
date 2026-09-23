@echo off
chcp 65001 >nul
title Taiwan Weather Forecast - Streamlit 啟動器
echo ========================================================
echo   AI 創新微課程 Taiwan Weather Forecast - Streamlit 啟動器
echo ========================================================
echo.

:: 1. 自動偵測可用之 Python 指令 (python 或 py)
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
    echo ❌【找不到 Python 環境】
    echo.
    echo 常見原因：
    echo 1. 本地電腦尚未安裝 Python。
    echo 2. 已安裝 Python，但安裝時未勾選「Add python.exe to PATH」（加入環境變數）。
    echo.
    echo 💡 解決方法：
    echo - 請至 https://www.python.org 下載安裝 Python，安裝時請務必勾選底部的「Add Python to PATH」。
    echo.
    pause
    exit /b 1
)

echo [✓] 偵測到 Python 指令：%PY_CMD%
echo.

:: 2. 透過 python -m pip 安裝套件 (避免 Scripts 沒在 PATH 中的問題)
echo [1/3] 檢查必要套件 (requests, pandas, streamlit, folium, altair)...
%PY_CMD% -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ⚠ pip 安裝可能有警告或網路延遲，嘗試繼續啟動...
)

echo.
echo [2/3] 初始化 SQLite 資料庫 (data.db)...
%PY_CMD% init_db.py

echo.
echo [3/3] 正在透過 Python 模組啟動 Streamlit 伺服器...
echo 瀏覽器即將自動開啟 http://localhost:8501
echo 若要結束應用程式，請在此視窗按下 Ctrl + C
echo.

:: 使用 python -m streamlit run 可 100% 避開 "'streamlit' 不是內部或外部命令" 的問題
%PY_CMD% -m streamlit run app.py

if %errorlevel% neq 0 (
    echo.
    echo ❌【Streamlit 啟動失敗】
    echo 常見排查：
    echo 1. 執行 pip install streamlit 安裝失敗（可能需檢查網路或代理）
    echo 2. 連接埠 8501 被其他背景程式佔用
    echo.
)

pause
