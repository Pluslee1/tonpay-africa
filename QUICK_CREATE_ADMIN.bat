@echo off
echo ========================================
echo Creating Admin Account in Production
echo ========================================
echo.

cd /d "%~dp0server"

set MONGODB_URI=mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0

echo Connecting to Production MongoDB...
echo.

if "%1"=="" (
    echo Usage: QUICK_CREATE_ADMIN.bat admin@tonpay.com yourpassword
    echo.
    echo Example:
    echo   QUICK_CREATE_ADMIN.bat admin@tonpay.com mypassword123
    echo.
    exit /b 1
)

if "%2"=="" (
    echo Error: Password is required!
    echo Usage: QUICK_CREATE_ADMIN.bat admin@tonpay.com yourpassword
    echo.
    exit /b 1
)

node scripts/create-admin.js %1 %2

echo.
echo ========================================
echo Done! Now try logging in at:
echo https://tonpay-africa.vercel.app/admin
echo ========================================
pause

