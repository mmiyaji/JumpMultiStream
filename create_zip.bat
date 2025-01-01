@echo off
setlocal enabledelayedexpansion

rem ZIPファイルの名前と出力先
set VERSION=1.0
set ZIP_NAME=JumpMultiStream_%VERSION%.zip
set OUTPUT_DIR=%~dp0

rem 除外リストを定義（スペース区切り）
set EXCLUDE_FILES=".gitignore create_zip.bat"
set EXCLUDE_DIRS=".git screenshot"

rem 一時作業ディレクトリを作成
set TEMP_DIR=%~dp0temp_zip
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

rem 既存のZIPファイルを削除
if exist "%OUTPUT_DIR%%ZIP_NAME%" (
    echo ZIPファイルを削除: %OUTPUT_DIR%%ZIP_NAME%
    del "%OUTPUT_DIR%%ZIP_NAME%"
)

echo START FILE COPY
rem 必要なファイルをフィルタしてコピー
for %%F in (*.*) do (
    set "EXCLUDE=0"
    for %%E in (%EXCLUDE_FILES%) do (
        if "%%~nxF"=="%%~E" set "EXCLUDE=1"
    )
    if "!EXCLUDE!"=="0" (
        echo Copying file: %%F
        copy "%%F" "%TEMP_DIR%" >nul
    )
)

echo START DIR COPY
rem 必要なフォルダをフィルタしてコピー
for /d %%D in (*) do (
    set "EXCLUDE=0"
    for %%E in (%EXCLUDE_DIRS% %EXCLUDE_FILES%) do (
        if "%%~nxD"=="%%~E" set "EXCLUDE=1"
    )
    if "!EXCLUDE!"=="0" (
        echo Copying directory: %%D
        xcopy "%%D" "%TEMP_DIR%\%%D" /s /e /i /q >nul
    )
)

echo START MAKE ZIP
rem ZIPファイルを作成
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%OUTPUT_DIR%%ZIP_NAME%'"

rem 一時作業ディレクトリを削除
rmdir /s /q "%TEMP_DIR%"

echo ZIPファイルが作成されました: %OUTPUT_DIR%%ZIP_NAME%
endlocal
pause
