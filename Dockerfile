FROM node:18-alpine

WORKDIR /usr/src/app

# Install app dependencies

COPY package*.json ./
RUN npm install

COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=12121

EXPOSE 12121

CMD ["node", "src/index.js"]