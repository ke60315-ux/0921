@echo off
chcp 65001 >nul
echo ========================================================
echo   Weather Dashboard - 本地 Git Commit (版本提交)
echo ========================================================
echo.

echo [1/4] 初始化本地 Git 倉庫 (git init)...
git init
echo.

echo [2/4] 將專案安全檔案加入暫存區 (git add .)...
git add .
echo.

echo [3/4] 提交版本記錄 (git commit)...
git commit -m "feat: Taiwan Weather Dashboard with GIS and GitHub Pages"
echo.

echo [4/4] 設定主要分支為 main (git branch -M main)...
git branch -M main
echo.

echo ========================================================
echo   ✓ 本地 Git Commit 已經順利完成！
echo.
echo   下一步：
echo   1. 請至 https://github.com/new 建立一個新的倉庫 (Repository)
echo   2. 雙擊執行【2_git_push.bat】即可一鍵推送到 GitHub！
echo ========================================================
echo.
pause
