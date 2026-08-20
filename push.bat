@echo off
cd /d %~dp0
echo === git add ===
git add -A
echo === git commit ===
git commit -m "update"
echo === git push ===
git push
echo.
echo 完了。GitHub Actionsのビルドが自動で始まります。
pause
