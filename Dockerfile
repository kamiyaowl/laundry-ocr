FROM node:10.12

COPY . /app
WORKDIR /app

RUN apt update && apt install -y fswebcam
RUN npm i
RUN npm i -g pm2

CMD ["pm2", "--no-daemon", "start", "index.js"]