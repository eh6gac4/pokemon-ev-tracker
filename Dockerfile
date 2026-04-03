FROM python:3.11-slim
WORKDIR /app
COPY server.py index.html style.css icon.png icon-pokeball.png icon-pixel.png ./
COPY js/ js/
CMD ["python3", "server.py"]
