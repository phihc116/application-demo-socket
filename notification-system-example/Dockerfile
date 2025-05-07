FROM node:alpine3.20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY . .

FROM node:alpine3.20
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000 50051
CMD ["node", "server.ts"]
