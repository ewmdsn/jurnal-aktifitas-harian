@echo off
echo ============================================================
echo   Mendorong Proyek Jurnal ke GitHub ewmdsn/jurnal-aktifitas-harian
echo ============================================================
echo.

set GIT_PATH="C:\Users\Acer\AppData\Local\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe"

if not exist %GIT_PATH% (
    echo [ERROR] Git tidak ditemukan di %GIT_PATH%
    pause
    exit /b 1
)

echo Menjalankan git push -u origin main...
%GIT_PATH% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo [SUKSES] Seluruh file berhasil dipush ke GitHub!
    echo URL: https://github.com/ewmdsn/jurnal-aktifitas-harian
    echo ============================================================
) else (
    echo.
    echo [CATATAN] Jika muncul error 403 atau Repository Not Found:
    echo 1. Pastikan repositori sudah dibuat di https://github.com/new?name=jurnal-aktifitas-harian
    echo 2. Pastikan akun GitHub ewmdsn sudah login di Git Credential Manager atau GitHub Desktop.
)

echo.
pause
