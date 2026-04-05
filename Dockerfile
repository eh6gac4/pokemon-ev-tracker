FROM python:3.11-slim
WORKDIR /app
COPY server.py index.html style.css manifest.json icon.png icon-pokeball.png icon-pixel.png icon-192.png icon-512.png ./
COPY js/ js/
CMD ["python3", "server.py"]
