@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   MySQL Root Password Reset Utility
echo ============================================
echo.

echo Step 1: Locating MySQL installation...
set "MYSQL_DIR="
set "SERVICE_NAME="

rem Check common MySQL installation paths
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" (
    set "MYSQL_DIR=C:\Program Files\MySQL\MySQL Server 8.0\bin"
    set "SERVICE_NAME=MySQL80"
    echo ✅ Found MySQL 8.0 at: !MYSQL_DIR!
) else if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" (
    set "MYSQL_DIR=C:\Program Files\MySQL\MySQL Server 8.4\bin"
    set "SERVICE_NAME=MySQL84"
    echo ✅ Found MySQL 8.4 at: !MYSQL_DIR!
) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
    set "MYSQL_DIR=C:\xampp\mysql\bin"
    set "SERVICE_NAME=mysql"
    echo ✅ Found XAMPP MySQL at: !MYSQL_DIR!
) else if exist "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqld.exe" (
    set "MYSQL_DIR=C:\wamp64\bin\mysql\mysql8.0.31\bin"
    set "SERVICE_NAME=wampmysqld64"
    echo ✅ Found WAMP MySQL at: !MYSQL_DIR!
) else (
    echo ❌ MySQL installation not found in common locations.
    echo.
    echo Please check these locations manually:
    echo - C:\Program Files\MySQL\
    echo - C:\xampp\mysql\
    echo - C:\wamp64\bin\mysql\
    echo.
    echo Or find your MySQL installation and note the path.
    pause
    exit /b 1
)

echo.
echo Step 2: Stopping MySQL service...
echo Attempting to stop service: !SERVICE_NAME!
net stop "!SERVICE_NAME!" 2>nul
if !errorlevel! neq 0 (
    echo ⚠️  Could not stop !SERVICE_NAME!. Trying alternative service names...
    net stop MySQL 2>nul
    net stop mysql 2>nul
    net stop mysqld 2>nul
    echo.
    echo If MySQL is still running, please:
    echo 1. Open Task Manager
    echo 2. End any mysqld.exe processes
    echo 3. Or restart your computer
    echo.
    echo Press any key when MySQL is stopped...
    pause >nul
)
echo ✅ MySQL service stopped (or wasn't running).

echo.
echo Step 3: Creating password reset file...
set "INIT_FILE=%TEMP%\mysql-reset-password.sql"
echo -- MySQL Password Reset Script > "!INIT_FILE!"
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234'; >> "!INIT_FILE!"
echo FLUSH PRIVILEGES; >> "!INIT_FILE!"
echo -- Reset complete >> "!INIT_FILE!"

echo ✅ Reset file created at: !INIT_FILE!

echo.
echo Step 4: Starting MySQL in recovery mode...
echo This will reset the root password to: Mine@1234
echo.
echo Starting MySQL with init file...

cd /d "!MYSQL_DIR!"
start "MySQL Recovery" /wait mysqld.exe --init-file="!INIT_FILE!" --console --standalone

echo.
echo Step 5: Cleaning up and restarting MySQL service...
del "!INIT_FILE!" 2>nul

echo Starting MySQL service...
net start "!SERVICE_NAME!" 2>nul
if !errorlevel! neq 0 (
    net start MySQL 2>nul
    if !errorlevel! neq 0 (
        echo ⚠️  Could not start MySQL service automatically.
        echo Please start it manually:
        echo - Open Services (services.msc)
        echo - Find MySQL service and start it
        echo - Or restart your computer
    )
)

echo.
echo ============================================
echo   Password Reset Complete!
echo ============================================
echo.
echo ✅ MySQL root password should now be: Mine@1234
echo.
echo Next steps:
echo 1. Test the connection: node test-db-connection.js
echo 2. Create database: npm run db:create
echo 3. Run migrations: npm run db:migrate
echo.
pause
