# Use a lightweight official Node image
FROM node:22-slim

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Now copy your application source
COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
