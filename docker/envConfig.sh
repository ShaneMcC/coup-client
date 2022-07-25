#!/bin/sh

CONFIGSOURCE="/usr/share/nginx/html/config.json"
CONFIGTEMP="${CONFIGSOURCE}.temp"

echo "{}" > "${CONFIGSOURCE}"

if [ "${SITENAME}" != "" ]; then
    echo "Setting siteName: ${SITENAME}"
    cat "${CONFIGSOURCE}" | jq '.siteName |= "'"${SITENAME}"'"' > "${CONFIGTEMP}"
    cat ${CONFIGTEMP}
    mv "${CONFIGTEMP}" "${CONFIGSOURCE}"
fi;

if [ "${SERVERADDR}" != "" ]; then
    echo "Setting server: ${SERVERADDR}"
    cat "${CONFIGSOURCE}" | jq '.server |= "'"${SERVERADDR}"'"' > "${CONFIGTEMP}"
    mv "${CONFIGTEMP}" "${CONFIGSOURCE}"
fi;

UPDATED=$(date)
echo "Setting updated: ${UPDATED}"
cat "${CONFIGTEMP}" | jq '.updated |= "'"${UPDATED}"'"' > "${CONFIGTEMP}"
mv "${CONFIGTEMP}" "${CONFIGSOURCE}"

echo 'Site config is set: '
cat "${CONFIGSOURCE}"