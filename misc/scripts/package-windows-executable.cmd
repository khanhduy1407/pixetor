@ECHO off

SETLOCAL

  PUSHD ..\..
  set PIXETOR_HOME=%cd%
  POPD

  set RESOURCE_HACKER_PATH="C:\Program Files (x86)\Resource Hacker"

  set MISC_FOLDER=%PIXETOR_HOME%\misc
  set RELEASES_FOLDER=%PIXETOR_HOME%\dest\desktop
  set DEST_FOLDER=%RELEASES_FOLDER%\pixetor\win32

  ECHO "Updating Pixetor icon -- Using Resource Hacker"
    %RESOURCE_HACKER_PATH%\ResHacker -addoverwrite "%DEST_FOLDER%\pixetor.exe", "%DEST_FOLDER%\pixetor-logo.exe", "%MISC_FOLDER%\desktop\logo.ico", ICONGROUP, IDR_MAINFRAME, 1033
    DEL "%DEST_FOLDER%\pixetor.exe"
  ECHO "DONE"


  PAUSE
  explorer "%DEST_FOLDER%\"

ENDLOCAL