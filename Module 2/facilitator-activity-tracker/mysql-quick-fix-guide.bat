@echo off
echo.
echo ============================================
echo   Quick MySQL User Creation Guide
echo ============================================
echo.
echo If you can access MySQL through ANY of these methods:
echo - MySQL Workbench (try empty password, or remember installation password)
echo - phpMyAdmin (if using XAMPP/WAMP)
echo - Command line mysql client
echo - Any other MySQL management tool
echo.
echo Then run this SQL command to create a dedicated user:
echo.
echo ----------------------------------------
echo CREATE USER 'fat_user'@'localhost' IDENTIFIED BY 'fat_password123';
echo GRANT ALL PRIVILEGES ON *.* TO 'fat_user'@'localhost' WITH GRANT OPTION;
echo FLUSH PRIVILEGES;
echo ----------------------------------------
echo.
echo This will create a new user that our application can use.
echo.
echo ALTERNATIVE: If you're using XAMPP/WAMP:
echo - XAMPP: Default root password is usually empty
echo - WAMP: Default root password is usually empty
echo - Try connecting with username 'root' and NO password
echo.
echo ============================================
echo   Installation Type Detection
echo ============================================
echo.

if exist "C:\xampp\mysql" (
    echo ✅ XAMPP Installation Detected!
    echo    Location: C:\xampp\mysql
    echo    Default root password: (empty)
    echo    Try MySQL Workbench with:
    echo      - Username: root
    echo      - Password: (leave empty)
    echo.
)

if exist "C:\wamp64" (
    echo ✅ WAMP Installation Detected!
    echo    Location: C:\wamp64
    echo    Default root password: (empty)
    echo    Access via: http://localhost/phpmyadmin
    echo.
)

if exist "C:\Program Files\MySQL" (
    echo ✅ Standalone MySQL Installation Detected!
    echo    Location: C:\Program Files\MySQL
    echo    Password was set during installation
    echo    Check installation notes or reset password
    echo.
)

echo ============================================
echo   Next Steps
echo ============================================
echo.
echo 1. **Try MySQL Workbench with empty password:**
echo    - Host: localhost or 127.0.0.1
echo    - Username: root
echo    - Password: (leave blank)
echo.
echo 2. **If that works, create our dedicated user**
echo.
echo 3. **If not, run the password reset script:**
echo    .\reset-mysql-root-password.bat
echo.
echo 4. **Or check if you have phpMyAdmin:**
echo    http://localhost/phpmyadmin
echo.
pause
