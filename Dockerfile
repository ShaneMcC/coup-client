FROM node:latest AS install
WORKDIR /app
COPY ./package.json ./package-lock.json /app/
RUN npm install

FROM install AS build
COPY *.js *.json /app/
COPY src /app/src
COPY public /app/public
RUN npm run build

FROM nginx:mainline-alpine AS nginx
COPY --from=build /app/dist /usr/share/nginx/html
ADD docker/nginx.conf /etc/nginx/nginx.conf
ADD docker/ramdisk.sh /docker-entrypoint.d/99-ramdisk.sh
ADD docker/envConfig.sh /docker-entrypoint.d/99-envConfig.sh
ADD docker/jq /bin/jq