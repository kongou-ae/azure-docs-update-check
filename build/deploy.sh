#!/bin/bash -eu
lftp -e "mirror -R --no-perms ./dist . &&exit" ftps://${webappName}:${webappPass}@waws-prod-ty1-005.ftp.azurewebsites.windows.net/site/wwwroot