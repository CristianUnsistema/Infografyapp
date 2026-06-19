FROM ghcr.io/puppeteer/puppeteer:latest

USER root

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN npm install -g pnpm && pnpm install --prod --config.ignore-scripts=false

COPY . .

EXPOSE 36000

CMD ["node", "server.js"]