FROM node:latest as build-stage
WORKDIR /app
COPY . .
RUN npm i typescript -g
RUN npm i
RUN npm run build

FROM node:alpine
WORKDIR /app
COPY --from=build-stage /app/node_modules /app/node_modules
COPY --from=build-stage /app/dist /app/dist
COPY --from=build-stage /app/package.json /app/package.json
COPY --from=build-stage /app/config /app/config

CMD ["npm", "start"]

