@echo off
REM =====================================================================
REM  COCONEXUS KMS v2.0 - one-click runner (Windows)
REM  Tahap saat ini: FRONTEND (Vue 3 + TS) dengan mock API in-memory.
REM  Backend & deploy Docker menyusul - lihat rencana_pengembangan.md.
REM =====================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

if "%PORT%"=="" set "PORT=5173"
if "%PREVIEW_PORT%"=="" set "PREVIEW_PORT=4173"

set "CMD=%~1"
if "%CMD%"=="" set "CMD=up"

if /i "%CMD%"=="up"        goto :up
if /i "%CMD%"=="build"     goto :build
if /i "%CMD%"=="preview"   goto :preview
if /i "%CMD%"=="typecheck" goto :typecheck
if /i "%CMD%"=="deploy"    goto :deploy
if /i "%CMD%"=="prod"      goto :deploy
if /i "%CMD%"=="clean"     goto :clean
if /i "%CMD%"=="doctor"    goto :doctor
if /i "%CMD%"=="help"      goto :help
echo [X] Perintah tidak dikenal: %CMD%
goto :help

:checkprereq
where node >nul 2>nul || (echo [X] Node.js tidak ditemukan. Instal Node 20+ dari https://nodejs.org & goto :end)
where pnpm >nul 2>nul || (
  echo [!] pnpm tidak ditemukan, mengaktifkan via corepack...
  call corepack enable >nul 2>nul || (echo [X] Gagal. Jalankan: npm i -g pnpm & goto :end)
)
exit /b 0

:ensureenv
if not exist "apps\web\.env" (
  copy "apps\web\.env.example" "apps\web\.env" >nul
  echo [v] apps\web\.env dibuat dari .env.example ^(mode mock aktif^).
)
exit /b 0

:installdeps
if not exist "apps\web\node_modules" (
  echo [>] Memasang dependensi ^(pnpm install^)...
  call pnpm install || goto :end
) else (
  echo [v] Dependensi sudah terpasang ^(lewati^).
)
exit /b 0

:up
call :checkprereq
call :ensureenv
call :installdeps
call :summary
echo [>] Menjalankan dev server ^(mode DEV lokal^)...
call pnpm --filter @coconexus/web dev -- --port %PORT%
goto :end

:build
call :checkprereq
call :ensureenv
call :installdeps
echo [>] Build produksi...
call pnpm --filter @coconexus/web build
echo [v] Hasil build di apps\web\dist
goto :end

:preview
call :build
echo [>] Menyajikan hasil build di http://localhost:%PREVIEW_PORT%
call pnpm --filter @coconexus/web preview -- --port %PREVIEW_PORT%
goto :end

:typecheck
call :checkprereq
call :installdeps
call pnpm --filter @coconexus/web typecheck
goto :end

:deploy
echo [!] Deploy produksi PENUH ^(Docker + backend + Cloudflare^) menyusul setelah backend dibangun.
echo [!] Lihat rencana_pengembangan.md bagian 11. Sementara ini, build statis frontend:
call :build
goto :end

:clean
echo [!] Menghapus node_modules ^& dist...
if exist node_modules rmdir /s /q node_modules
if exist "apps\web\node_modules" rmdir /s /q "apps\web\node_modules"
if exist "apps\web\dist" rmdir /s /q "apps\web\dist"
echo [v] Bersih. Jalankan run.bat untuk setup ulang.
goto :end

:doctor
for /f "tokens=*" %%i in ('node -v 2^>nul') do set "NV=%%i"
for /f "tokens=*" %%i in ('pnpm -v 2^>nul') do set "PV=%%i"
echo Node    : %NV%
echo pnpm    : %PV%
if exist "apps\web\.env" (echo .env    : ada) else (echo .env    : belum ^(akan dibuat otomatis^))
if exist "apps\web\node_modules" (echo deps    : terpasang) else (echo deps    : belum)
goto :end

:summary
echo.
echo ============================================================
echo   COCONEXUS KMS - Frontend siap!
echo ============================================================
echo   URL Dev      : http://localhost:%PORT%
echo.
echo   Quick Login (demo):
echo     - Admin     : admin@coconexus.test     / Admin#1234
echo     - Moderator : moderator@coconexus.test / Mod#1234
echo     - Pengguna  : user@coconexus.test      / User#1234
echo     (tersedia juga tombol Quick Login di halaman /login)
echo.
echo   Stop: Ctrl+C  -  Bantuan: run.bat help
echo ============================================================
echo.
exit /b 0

:help
echo.
echo COCONEXUS KMS - runner (frontend)
echo.
echo Penggunaan: run.bat [perintah]
echo.
echo   (kosong) ^| up   Setup penuh + jalankan DEV lokal (default)
echo   build           Build produksi (apps\web\dist)
echo   preview         Build lalu sajikan hasil build (port %PREVIEW_PORT%)
echo   typecheck       Cek tipe TypeScript (vue-tsc)
echo   deploy ^| prod   Info deploy + build statis (Docker menyusul)
echo   clean           Hapus node_modules ^& dist
echo   doctor          Diagnosa lingkungan
echo   help            Tampilkan bantuan ini
echo.
echo Variabel: set PORT=5174 ^& run.bat   (ganti port dev)
echo.
goto :end

:end
endlocal
pause
