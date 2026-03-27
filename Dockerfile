FROM python:3.11-slim
WORKDIR /app
COPY server.py index.html ./
CMD ["python3", "server.py"]
