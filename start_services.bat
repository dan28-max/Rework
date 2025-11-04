@echo off
echo ========================================
echo  Spartan Data - Service Starter
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges...
) else (
    echo WARNING: Not running as administrator
    echo Some services may fail to start
    echo.
)

echo Starting XAMPP services...
echo.

REM Try to start Apache
echo [1/2] Starting Apache...
cd /d C:\xampp
start /B apache_start.bat >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Apache started successfully
) else (
    echo [WARN] Apache may already be running or failed to start
)
echo.

REM Try to start MySQL
echo [2/2] Starting MySQL...
cd /d C:\xampp
start /B mysql_start.bat >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] MySQL started successfully
) else (
    echo [WARN] MySQL may already be running or failed to start
)
echo.

echo ========================================
echo Services startup complete!
echo ========================================
echo.
echo Opening system check page in 3 seconds...
timeout /t 3 >nul

REM Open system check page
start http://localhost/Rework/check_system.html

echo.
echo Press any key to exit...
pause >nul
