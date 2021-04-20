FROM node:15.13.0-alpine3.13 AS builder
RUN apk --no-cache add python2 build-base
WORKDIR /src
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile
ADD . .
RUN npx browserslist@latest --update-db
RUN yarn run build --standalone

FROM nginxinc/nginx-unprivileged:1.19-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /src/build/app .
USER nginx
