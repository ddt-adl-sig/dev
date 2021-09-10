@echo off
PATH=C:\Program Files\Git\bin;%PATH%
echo.
echo #  Attention : configuration AVEC proxy MTES !
git config --global http.proxy http://direct.proxy.i2:8080
	::set http_proxy=http://pfrie-std.proxy.e2.rie.gouv.fr:8080
set http_proxy=direct.proxy.i2:8080


echo.&echo ######## Branche ACTUELLE ?
git branch
echo.

echo  IMPORTANT : si la branche actuelle n'est pas celle que vous voulez commit+push
echo    quitter ce batch, puis changer de branche ( # git branch la_branche )
echo.&pause
echo.

set /P BRANCHE= IMPORTANT : indiquer le nom de la branche sur laquelle commiter : 

::if "%BRANCHE%"=="" goto STATUS
::echo.&echo =============  Branche actuelle : %BRANCHE%

:STATUS
echo.&echo ######## Git STATUS :
git status

echo.&echo.&echo ######## A suivre : Git ADD (stage files) :
pause
git add --verbose .

::goto PULL

echo.&echo.&echo ######## Git COMMIT :
set /P MESSAGE=- Saisir le message du commit : 
if "%MESSAGE%"==""  set MESSAGE=mon commit
set MESSAGE=%MESSAGE:"='%
git commit --verbose -m"%MESSAGE%"


:PULL
echo.&echo.&echo ######## A suivre : Git PULL (parfois requis avant le Push) :
pause
git pull


echo.&echo.&echo ######## A suivre : Git PUSH :
pause
if "%BRANCHE%"=="" (
 git push --verbose
) else (
 git push --verbose -u origin %BRANCHE%
)


git config --global --unset http.proxy

echo.&echo.&echo. ################   FIN   ################
echo.&pause

