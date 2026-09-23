@echo off
chcp 65001 >nul
echo ========================================================
echo   Weather Dashboard - GitHub 遠端推送 (git push)
echo ========================================================
echo.

set /p REPO_URL="請在此貼上您的 GitHub 倉庫網址 (例如 https://github.com/使用者名稱/倉庫名.git)： "

if "%REPO_URL%"=="" (
    echo.
    echo 錯誤：未輸入網址，請重新執行本腳本並貼上網址。
    pause
    exit /b
)

echo.
echo [1/2] 設定遠端倉庫 origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
echo 遠端位址已設定為：%REPO_URL%
echo.

echo [2/2] 正在推送至 GitHub main 分支 (git push -u origin main)...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================================
    echo   [提醒] 若推輸出錯，可能是因為：
    echo   1. 尚未登入 GitHub 認證憑證 (Personal Access Token 或 GitHub CLI)
    echo   2. GitHub 上新建倉庫時勾選了 "Initialize with README" 導致遠端衝突
    echo      解決方法：在終端機執行 git push -f origin main 強制覆蓋，或新建空倉庫。
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   ✓ 程式碼已成功推送至 GitHub！
    echo.
    echo   【發布 GitHub Pages 步驟】
    echo   1. 開啟您的 GitHub 倉庫頁面
    echo   2. 點擊頂部「Settings」
    echo   3. 點選左側選單「Pages」
    echo   4. 在 Build and deployment 選擇：
    echo      - Source: Deploy from a branch
    echo      - Branch: main, 資料夾: / (root)
    echo   5. 點擊「Save」，約 1 分鐘後即可取得公開網址！
    echo      所有人點開網址免輸入 API Key，即可直接使用！
    echo ========================================================
)

echo.
pause
