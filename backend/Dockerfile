FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
# We use npm ci for production, but install for dev here to ensure we have devDependencies if needed
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
