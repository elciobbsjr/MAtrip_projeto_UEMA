@echo off
echo Iniciando servidor backend...
cd /d "%~dp0backend"
node src/server.js
pause
