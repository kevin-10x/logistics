FROM python:3.11-slim
WORKDIR /app
COPY predict.py .
EXPOSE 8000
CMD ["python", "-m", "http.server", "8000"]
