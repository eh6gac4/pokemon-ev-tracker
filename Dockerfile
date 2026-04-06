FROM node:24-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY server.py .
COPY --from=builder /app/dist ./dist
CMD ["python3", "server.py"]
