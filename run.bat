@echo off
SETLOCAL

echo Select Protocol:
echo 1. HTTP
echo 2. HTTPS (Default)
set /p PROTO_CHOICE="Enter choice (1 or 2): "

if "%PROTO_CHOICE%"=="1" (
    set PROTOCOL=http
    set DEFAULT_PORT=80
) else (
    set PROTOCOL=https
    set DEFAULT_PORT=443
)

set /p PORT="Enter port (Default %DEFAULT_PORT%): "
if "%PORT%"=="" set PORT=%DEFAULT_PORT%

echo Starting %PROTOCOL% server on port %PORT%...
set NODE_ENV=production
set PROTOCOL=%PROTOCOL%
set PORT=%PORT%
node server.js
pause
