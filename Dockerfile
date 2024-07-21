# docker file for node version 20 
FROM node:20-alpine

# Install curl
RUN apk add --no-cache curl

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
