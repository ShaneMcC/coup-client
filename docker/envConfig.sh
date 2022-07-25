#!/bin/sh

CONFIGSOURCE="/usr/share/nginx/html/config.json"
CONFIGTEMP="/tmp/config.json"

if [ "${SITENAME}" != "" ]; then
    cat "${CONFIGSOURCE}" | jq '.siteName |= "'"${SITENAME}"'"' > "${CONFIGTEMP}"
fi;

if [ "${SERVERADDR}" != "" ]; then
    cat "${CONFIGSOURCE}" | jq '.server |= "'"${SERVERADDR}"'"' > "${CONFIGTEMP}"
fi;

cat "${CONFIGSOURCE}" | jq '.updated |= "'"$(date)"'"' > "${CONFIGTEMP}"

mv "${CONFIGTEMP}" "${CONFIGSOURCE}"

echo 'Site config is set: '
cat "${CONFIGSOURCE}"