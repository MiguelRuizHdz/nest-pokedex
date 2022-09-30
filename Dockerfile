# Install dependencies only when needed
# We just want to load the new dependencies or when We don't have the dependencies
# We are going to call this process "deps" like dependencies
FROM node:18-alpine3.15 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Creates the app directory in this image
WORKDIR /app
# The last segment "./" is where I want to copy the files
COPY package.json package-lock.json ./
# npm ci bypasses a package's package.json to install modules from a package's lockfile. 
# This ensures reproducible builds—you are getting exactly what you expect on every install.
RUN npm ci

# This creates a new image
# Build the app with cache dependencies
FROM node:18-alpine3.15 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# This creates a new image
# This is the one that is going to run the application
# Production image, copy all the files and run next
FROM node:18-alpine3.15 AS runner

# Set working directory
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

# We install only the packages of production
RUN npm install --prod

COPY --from=builder /app/dist ./dist

# # Copiar el directorio y su contenido
# RUN mkdir -p ./pokedex

# COPY --from=builder ./app/dist/ ./app
# COPY ./.env ./app/.env

# # Dar permiso para ejecutar la applicación
# RUN adduser --disabled-password pokeuser
# RUN chown -R pokeuser:pokeuser ./pokedex
# USER pokeuser

# EXPOSE 3000

CMD [ "node","dist/main" ]