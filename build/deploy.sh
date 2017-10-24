#!/bin/bash -xe
lftp -e "mirror -R ./dist . &&exit" -u ${webappAuth} ftps://waws-prod-ty1-005.ftp.azurewebsites.windows.net/site/wwwroot