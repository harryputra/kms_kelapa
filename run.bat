@echo off
REM =====================================================================
REM  COCONEXUS KMS v2.0 - one-click runner (Windows)
REM  dev (default): MySQL(Docker) + API + Web (backend nyata)
REM  deploy/prod  : semua container, detached + auto-restart
REM =====================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

if "%PORT%"=="" set "PORT=5173"
set "PRODPORT=8090"
set "COMPOSE=docker compose -f infra/docker-compose.yml"

set "CMD=%~1"
if "%CMD%"=="" set "CMD=up"

if /i "%CMD%"=="up"           goto :up
if /i "%CMD%"=="deploy"       goto :deploy
if /i "%CMD%"=="prod"         goto :deploy
if /i "%CMD%"=="prod-logs"    goto :prodlogs
if /i "%CMD%"=="prod-down"    goto :proddown
if /i "%CMD%"=="prod-restart" goto :prodrestart
if /i "%CMD%"=="down"         goto :down
if /i "%CMD%"=="seed"         goto :seed
if /i "%CMD%"=="build"        goto :build
if /i "%CMD%"=="doctor"       goto :doctor
if /i "%CMD%"=="clean"        goto :clean
if /i "%CMD%"=="help"         goto :help
echo [X] Perintah tidak dikenal: %CMD%
goto :help

:checkprereq
where node >nul 2>nul || (echo [X] Node.js tidak ada. Instal Node 20+. & goto :end)
where docker >nul 2>nul || (echo [X] Docker tidak ada. & goto :end)
docker info >nul 2>nul || (echo [X] Docker daemon mati. Nyalakan Docker Desktop. & goto :end)
where pnpm >nul 2>nul || (call corepack enable >nul 2>nul || (echo [X] Jalankan: npm i -g pnpm & goto :end))
exit /b 0

:ensureenv
if not exist "apps\api\.env" copy "apps\api\.env.example" "apps\api\.env" >nul
if not exist "apps\web\.env" copy "apps\web\.env.example" "apps\web\.env" >nul
exit /b 0

:waitmysql
echo [>] Menunggu MySQL siap...
for /l %%i in (1,1,40) do (
  for /f "tokens=*" %%h in ('docker inspect --format "{{.State.Health.Status}}" coconexus-mysql 2^>nul') do set "H=%%h"
  if "!H!"=="healthy" (echo [v] MySQL siap. & exit /b 0)
  timeout /t 2 >nul
)
echo [X] MySQL tidak kunjung siap.
goto :end

:up
call :checkprereq
call :ensureenv
%COMPOSE% up -d mysql
call :waitmysql
echo [>] Memasang dependensi...
call pnpm install || goto :end
echo [>] Menyiapkan database...
call pnpm --filter @coconexus/api db:generate >nul
call pnpm --filter @coconexus/api db:push || goto :end
call pnpm --filter @coconexus/api db:seed || goto :end
> "apps\web\.env.local" echo VITE_USE_MOCK=false
>> "apps\web\.env.local" echo VITE_API_URL=/api/v1
echo.
echo ============================================================
echo   COCONEXUS - DEV (backend nyata)
echo   Web : http://localhost:%PORT%   API : http://localhost:3000/api/v1
echo   Quick Login: admin@coconexus.test / Admin#1234
echo   Stop: Ctrl+C
echo ============================================================
echo.
call pnpm -r --parallel run dev
goto :end

:deploy
call :checkprereq
if "%JWT_ACCESS_SECRET%"=="" echo [!] Secret produksi masih default - set JWT_ACCESS_SECRET/JWT_REFRESH_SECRET/ADMIN_PASSWORD sebelum publik.
echo [>] Build ^& start stack PRODUKSI...
%COMPOSE% --profile prod up -d --build || goto :end
echo [>] Menunggu web siap...
for /l %%i in (1,1,40) do (
  curl -sf -o nul "http://localhost:%PRODPORT%/" && goto :deploydone
  timeout /t 2 >nul
)
:deploydone
echo.
echo ============================================================
echo   COCONEXUS - PRODUKSI aktif (auto-restart)
echo   Lokal  : http://localhost:%PRODPORT%
echo   Publik : Cloudflare Public Hostname -^> localhost:%PRODPORT%
echo   Log: run.bat prod-logs  Stop: run.bat prod-down
echo ============================================================
echo.
goto :end

:prodlogs
%COMPOSE% --profile prod logs -f
goto :end
:proddown
%COMPOSE% --profile prod down
goto :end
:prodrestart
%COMPOSE% --profile prod restart
goto :end
:down
%COMPOSE% down
goto :end
:seed
call pnpm --filter @coconexus/api db:seed
goto :end
:build
call :checkprereq
call pnpm install
call pnpm -r build
goto :end

:doctor
for /f "tokens=*" %%i in ('node -v 2^>nul') do set "NV=%%i"
for /f "tokens=*" %%i in ('pnpm -v 2^>nul') do set "PV=%%i"
echo Node   : %NV%
echo pnpm   : %PV%
docker info --format "{{.ServerVersion}}" 2>nul
goto :end

:clean
echo [!] Menghapus node_modules/dist/.env.local...
if exist node_modules rmdir /s /q node_modules
if exist "apps\web\node_modules" rmdir /s /q "apps\web\node_modules"
if exist "apps\api\node_modules" rmdir /s /q "apps\api\node_modules"
if exist "apps\web\dist" rmdir /s /q "apps\web\dist"
if exist "apps\api\dist" rmdir /s /q "apps\api\dist"
if exist "apps\web\.env.local" del /q "apps\web\.env.local"
goto :end

:help
echo.
echo COCONEXUS - runner
echo.
echo   (kosong)^|up   DEV: MySQL(Docker) + API + Web (default)
echo   deploy^|prod   PRODUKSI: semua container, detached + auto-restart
echo   prod-logs     Lihat log produksi
echo   prod-down     Hentikan produksi
echo   prod-restart  Restart produksi
echo   down          Stop MySQL (dev)
echo   seed          Seed ulang database
echo   build         Build api + web
echo   doctor        Diagnosa lingkungan
echo   clean         Hapus node_modules/dist
echo   help          Bantuan ini
echo.
goto :end

:end
endlocal
pause
