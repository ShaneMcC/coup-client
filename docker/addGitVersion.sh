#!/bin/sh

CONFIGSOURCE="/app/public/config.json"
CONFIGTEMP="${CONFIGSOURCE}.temp"

GITVERSION=$(git describe --tags)
echo "Setting Git Version: ${GITVERSION}"
cat "${CONFIGSOURCE}" | jq '.gitVersion |= "'"${GITVERSION}"'"' > "${CONFIGTEMP}"
mv "${CONFIGTEMP}" "${CONFIGSOURCE}"
