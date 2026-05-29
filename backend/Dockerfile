FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src
EXPOSE 3000