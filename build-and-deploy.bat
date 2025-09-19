@echo off
echo 🚀 Building BDC Stack with mobile wallet fixes...
echo.

REM Build the React app with automatic post-build fixes
echo 📦 Building React app...
call pnpm build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.

REM Copy to server directory
echo 📁 Copying to server directory...
xcopy /E /I /Y dist server\dist

if %ERRORLEVEL% neq 0 (
    echo ❌ Copy to server failed!
    pause
    exit /b 1
)

echo.
echo ✅ Deployment completed successfully!
echo.
echo 🎯 Summary:
echo    ✅ React app built with mobile wallet fixes
echo    ✅ CSP automatically updated for mobile compatibility
echo    ✅ Files copied to server directory
echo.
echo 🔗 Ready to start server:
echo    cd server
echo    node index.js
echo.
echo 📱 Test URLs:
echo    Main App: http://localhost:1737/app
echo    Test Page: http://localhost:1737/app/mobile-wallet-test.html
echo.
pause
