#!/bin/bash -xe
lftp -e "mirror -R --delete-first ./dist . &&exit" ftps://${webappName}:${webappPass}@waws-prod-ty1-005.ftp.azurewebsites.windows.net/site/wwwroot