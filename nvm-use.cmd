@echo off
setlocal

rem Check if nvm is installed
where nvm >nul 2>nul
if errorlevel 1 (
  echo NVM is not installed. Please download it from here:
  echo https://github.com/coreybutler/nvm-windows
  goto exit
)

rem Check if .nvmrc exists
if not exist ".nvmrc" (
  echo .nvmrc doesn't seem to exist. Please check that it does. You must also be in the same directory as it.
  goto exit
)

rem Get the Node.js version from .nvmrc
set /p version=<.nvmrc
echo Going to use Node.js %version%
echo This may trigger one or two UAC prompts. Don't be alarmed.

rem Install and use the version we want
nvm install %version%
nvm use %version%

:exit
