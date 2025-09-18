@echo off
echo 🚀 Starting BDC Stack Local Deployment...

echo.
echo 📦 Building React App...
call pnpm build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo 📁 Copying build files to server...
xcopy /E /I /Y dist server\dist

if %ERRORLEVEL% neq 0 (
    echo ❌ Copy failed!
    pause
    exit /b 1
)

echo.
echo 🔧 Starting static server...
cd server
start "BDC Static Server" node index.js

echo.
echo ✅ Deployment complete!
echo 🔗 BDC Stack: http://localhost:1737/
echo 🔗 React App: http://localhost:1737/app
echo 📊 Health Check: http://localhost:1737/health
echo.
echo Press any key to exit...
pause > nul
