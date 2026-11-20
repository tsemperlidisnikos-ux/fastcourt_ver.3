@echo off
setlocal EnableExtensions
title FastCourt Local
cd /d "%~dp0"
if errorlevel 1 (
  echo [FastCourt] Cannot open folder.
  pause
  exit /b 1
)

REM Keep a log so we can see what failed on double-click.
set "LOG=%~dp0start-log.txt"
echo ===== FastCourt start %DATE% %TIME% ===== > "%LOG%"
echo Folder: %CD%>> "%LOG%"

REM Ensure Node is on PATH even when launched from Explorer.
if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%"
if exist "%APPDATA%\npm" set "PATH=%APPDATA%\npm;%PATH%"

echo ========================================
echo   FastCourt - local start
echo ========================================
echo.
echo Log: %LOG%
echo.

where node >> "%LOG%" 2>&1
where npm.cmd >> "%LOG%" 2>&1

where node >nul 2>&1
if errorlevel 1 (
  echo [FastCourt] Node.js not found.
  echo Install from https://nodejs.org and restart the PC.
  echo.>> "%LOG%"
  echo FAIL: node not found>> "%LOG%"
  pause
  exit /b 1
)

where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo [FastCourt] npm.cmd not found.
  echo Reinstall Node.js from https://nodejs.org
  echo FAIL: npm.cmd not found>> "%LOG%"
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo [FastCourt] Node %NODE_VER%
echo Node %NODE_VER%>> "%LOG%"
echo [FastCourt] Folder: %CD%
echo.

if not exist "node_modules\" (
  echo [FastCourt] Installing dependencies first time...
  echo Running npm install>> "%LOG%"
  call npm.cmd install >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo [FastCourt] npm install failed. See start-log.txt
    pause
    exit /b 1
  )
  echo.
)

echo [FastCourt] Starting server on http://localhost:3000
echo [FastCourt] Browser will open in a few seconds.
echo [FastCourt] Keep this window open while using the app.
echo.
echo Running npm.cmd run dev>> "%LOG%"

REM Open browser after a short delay (separate window).
start "FastCourt-open-browser" /min cmd /c "ping -n 8 127.0.0.1 >nul & start http://localhost:3000/login"

call npm.cmd run dev
set "EXITCODE=%ERRORLEVEL%"
echo.
echo Exit code: %EXITCODE%>> "%LOG%"
echo [FastCourt] Server stopped. Code: %EXITCODE%
echo See start-log.txt if something went wrong.
pause
exit /b %EXITCODE%
