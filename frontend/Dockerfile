# Stage 1
FROM node:12-stretch-slim  as react-build
WORKDIR /app
COPY . ./
RUN npm i && npm run build


# Stage 2 - the production environment
# https://daten-und-bass.io/blog/serving-a-vue-cli-production-build-on-a-sub-path-with-nginx/
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react-build /app/build /usr/share/nginx/html/app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# docker run --rm --name ft -it -d jantoth/frontend:v0.0.3
# docker exec -it ft sh
