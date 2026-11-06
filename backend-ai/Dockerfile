FROM python:3.11-slim

WORKDIR /app

# Ngăn python tạo file .pyc và bật unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./

# Cài đặt thư viện Python (tất cả đều có pre-built binary wheels trên PyPI)
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
