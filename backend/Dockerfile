FROM node:20-alpine

WORKDIR /app

# Install all deps (dev deps needed for the TypeScript build)
COPY package*.json ./
RUN npm install

# Prisma needs the schema to generate the client
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Compile TypeScript -> dist
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
