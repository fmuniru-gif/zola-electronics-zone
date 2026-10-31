@echo off
REM Owner-only photo/video file picker. No public upload endpoint.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Manage-Zola-Gallery.ps1"
echo.
echo Press any key to close this gallery management window.
pause >nul
