@echo off
echo ============================================
echo   MySQL Password Recovery Solution
echo ============================================
echo.
echo This script will reset your MySQL root password
echo Current status: MySQL80 service is RUNNING
echo.
echo ⚠️  WARNING: This will temporarily stop MySQL
echo    Make sure no critical applications are using it
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo Step 1: Stopping MySQL service...
net stop MySQL80
if %errorlevel% neq 0 (
    echo ❌ Failed to stop MySQL80 service
    echo Try running as Administrator
    pause
    exit /b 1
)

echo ✅ MySQL service stopped
echo.

echo Step 2: Creating password reset script...
set "RESET_FILE=%TEMP%\mysql_reset.sql"
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234'; > "%RESET_FILE%"
echo FLUSH PRIVILEGES; >> "%RESET_FILE%"

echo ✅ Reset script created: %RESET_FILE%
echo.

echo Step 3: Starting MySQL with password reset...
echo This may take a moment...

cd /d "C:\Program Files\MySQL\MySQL Server 8.0\bin"
start "MySQL Reset" /wait mysqld.exe --init-file="%RESET_FILE%" --console --standalone

if %errorlevel% equ 0 (
    echo ✅ Password reset completed successfully
) else (
    echo ⚠️  Reset process completed (exit code: %errorlevel%)
)

echo.
echo Step 4: Cleaning up...
del "%RESET_FILE%" 2>nul

echo Step 5: Restarting MySQL service...
net start MySQL80

if %errorlevel% equ 0 (
    echo ✅ MySQL service restarted successfully
    echo.
    echo 🎉 Password reset complete!
    echo    Username: root
    echo    Password: Mine@1234
    echo.
    echo Next steps:
    echo 1. Test connection: node test-db-connection.js
    echo 2. Create database: npm run db:create
    echo 3. Run migrations: npm run db:migrate
) else (
    echo ❌ Failed to restart MySQL service
    echo Try: net start MySQL80
)

echo.
pause
