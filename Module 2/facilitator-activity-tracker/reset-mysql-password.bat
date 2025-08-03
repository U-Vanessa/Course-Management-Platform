@echo off
echo 🔧 MySQL Password Reset Script
echo.

echo Step 1: Stopping MySQL service...
net stop MySQL80 2>nul
if %errorlevel% neq 0 (
    echo ❌ Failed to stop MySQL80 service. Trying MySQL...
    net stop MySQL 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Could not stop MySQL service. Please stop it manually.
        echo    - Open Services (services.msc)
        echo    - Find MySQL service and stop it
        echo    - Then run this script again
        pause
        exit /b 1
    )
)
echo ✅ MySQL service stopped.

echo.
echo Step 2: Creating temporary init file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234'; > %TEMP%\mysql-init.txt
echo FLUSH PRIVILEGES; >> %TEMP%\mysql-init.txt

echo.
echo Step 3: Finding MySQL installation...
set MYSQL_DIR=""
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" (
    set MYSQL_DIR=C:\Program Files\MySQL\MySQL Server 8.0\bin
) else if exist "C:\MySQL\bin\mysqld.exe" (
    set MYSQL_DIR=C:\MySQL\bin
) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
    set MYSQL_DIR=C:\xampp\mysql\bin
) else (
    echo ❌ MySQL installation not found in common locations.
    echo Please locate your MySQL installation and run:
    echo    mysqld --init-file=%TEMP%\mysql-init.txt
    pause
    exit /b 1
)

echo ✅ Found MySQL at: %MYSQL_DIR%

echo.
echo Step 4: Starting MySQL with password reset...
"%MYSQL_DIR%\mysqld" --init-file=%TEMP%\mysql-init.txt --console
if %errorlevel% neq 0 (
    echo ❌ Failed to reset password. 
    echo Try manual approach:
    echo 1. Open MySQL Workbench
    echo 2. Create new connection with current password
    echo 3. Run: ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mine@1234';
    echo 4. Run: FLUSH PRIVILEGES;
)

echo.
echo Step 5: Cleaning up and restarting service...
del %TEMP%\mysql-init.txt 2>nul
net start MySQL80 2>nul
if %errorlevel% neq 0 (
    net start MySQL 2>nul
)

echo.
echo ✅ Password reset complete! Try connecting with password: Mine@1234
pause
