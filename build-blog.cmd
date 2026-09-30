@echo off
setlocal

set "SITE_ROOT=%~dp0"
set "ZONER=%SITE_ROOT%zoner2000-2025.12.08\zoner.exe"
set "ZONE_SOURCE=%SITE_ROOT%blog-zone"
set "GENERATED_BLOG=%SITE_ROOT%blog-zone-built"
set "PUBLISHED_BLOG=%SITE_ROOT%public\blog"

if not exist "%ZONER%" (
  echo Zoner2000 executable not found: "%ZONER%"
  exit /b 1
)

if not exist "%ZONE_SOURCE%\index_*.md" (
  echo Blog source needs an index.md or index_*.md homepage: "%ZONE_SOURCE%"
  exit /b 1
)

if exist "%GENERATED_BLOG%" rmdir /s /q "%GENERATED_BLOG%"
"%ZONER%" "%ZONE_SOURCE%"
if errorlevel 1 exit /b 1

if not exist "%GENERATED_BLOG%\index.html" (
  echo Zoner2000 did not generate its expected index.html.
  exit /b 1
)

if not exist "%PUBLISHED_BLOG%" mkdir "%PUBLISHED_BLOG%"
xcopy "%GENERATED_BLOG%\*" "%PUBLISHED_BLOG%\" /e /i /y >nul
if errorlevel 1 exit /b 1

echo Blog built and copied to "%PUBLISHED_BLOG%".
