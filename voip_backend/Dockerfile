FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for mysqlclient/pymysql if compiling)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .

CMD ["sh", "-c", "python setup.py && gunicorn --worker-class gevent --workers 4 --bind 0.0.0.0:5000 app:app"]