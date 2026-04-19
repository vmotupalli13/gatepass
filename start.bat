@echo off
title GatePass — Setup & Launch
color 0A

echo.
echo  =============================================
echo   GatePass - Visitor Management System
echo  =============================================
echo.

:: ── 1. Check Node.js is installed ───────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js is NOT installed on this computer.
    echo.
    echo  Please install it from:
    echo    https://nodejs.org/en/download
    echo.
    echo  Download the "LTS" version, install it, then
    echo  double-click this file again.
    echo.
    pause
    start https://nodejs.org/en/download
    exit /b 1
)

:: ── 2. Check Node version is >= 18 ──────────────────────────────────────────
for /f "tokens=1 delims=v." %%a in ('node --version') do set NODE_MAJOR=%%a
if %NODE_MAJOR% LSS 18 (
    color 0C
    echo  [ERROR] Node.js version is too old.
    echo  You have version %NODE_MAJOR%.x — this app needs version 18 or higher.
    echo.
    echo  Please update Node.js from:
    echo    https://nodejs.org/en/download
    echo.
    pause
    start https://nodejs.org/en/download
    exit /b 1
)

echo  [OK] Node.js found (version %NODE_MAJOR%.x)

:: ── 3. Install dependencies if node_modules missing ─────────────────────────
if not exist "node_modules\" (
    echo.
    echo  Installing dependencies — this takes about 1 minute on first run...
    echo  (You only need to do this once)
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo  [ERROR] npm install failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed successfully!
) else (
    echo  [OK] Dependencies already installed
)

:: ── 4. Launch the app ────────────────────────────────────────────────────────
echo.
echo  Starting GatePass...
echo  The app will open at:  http://localhost:5173
echo.
echo  Press Ctrl+C in this window to stop the server.
echo.

:: Wait 3 seconds then open the browser
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start the dev server
npm run dev

pause
