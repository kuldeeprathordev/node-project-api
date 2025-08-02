FROM node:20-alpine

WORKDIR ./

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN npm install pm2 -g

# ENV PM2_PUBLIC_KEY <YOUR_PUBLIC_KEY>

# ENV PM2_SECRET_KEY <YOUR_SECRET_KEY>

CMD ["pm2-runtime", "index.js"]