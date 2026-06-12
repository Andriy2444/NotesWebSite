FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src
EXPOSE 5173

CMD ["npm", "run", "dev"]