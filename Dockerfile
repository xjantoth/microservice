FROM python:3.7

RUN mkdir -p /data/microservice

# We copy just the requirements.txt first to leverage Docker cache
COPY ["requirements.txt","app.py", "/data/"]
COPY ["microservice/", "/data/microservice/"]

WORKDIR /data

RUN pip install --upgrade pip && pip install -r /data/requirements.txt

ENTRYPOINT ["gunicorn"]

CMD ["--bind", "0.0.0.0:8000", "app:app"]

# docker build -t microservice:v0.0.1 .
# docker run --rm --name micro-service -it -e PSQL_DB_ADDRESS=192.168.1.45 -p 5001:8000 -d microservice:v0.0.1




