@echo off
title Iniciando Crystal Hunter Fusion
color 0A
echo ===================================================
echo   PREPARANDO JUEGO PARA PRESENTACION
echo ===================================================
echo.
echo 1. Iniciando Servidor (Vite)...
start "Servidor Juego" cmd /k "npm run dev"

echo Espere 5 segundos...
timeout /t 5 >nul

echo 2. Abriendo Tunel Seguro...
start "Tunel AR" cmd /k "npx localtunnel --port 5173 --subdomain crystal-hunter-fusion"

echo.
echo ===================================================
echo   ¡TODO LISTO!
echo   URL: https://crystal-hunter-fusion.loca.lt
echo   
echo   Si te pide PASSWORD:
echo   Tu IP publica suele ser el password.
echo   Puedes verla aqui: https://ipv4.icanhazip.com
echo ===================================================
echo.
pause
