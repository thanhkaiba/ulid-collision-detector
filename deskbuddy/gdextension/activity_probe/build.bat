@echo off
rem Build ActivityProbe cho Windows bằng MSVC (chạy trong "x64 Native Tools Command Prompt").
cd /d %~dp0
if not exist ..\..\bin mkdir ..\..\bin
cl /nologo /O2 /LD /W3 activity_probe.c user32.lib /Fe:..\..\bin\activity_probe.windows.x86_64.dll
if errorlevel 1 exit /b 1
del activity_probe.obj activity_probe.exp activity_probe.lib 2>nul
echo built ..\..\bin\activity_probe.windows.x86_64.dll
