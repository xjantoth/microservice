FROM python:3-alpine

RUN mkdir -p /data/microservice

# We copy just the requirements.txt first to leverage Docker cache
COPY ["requirements.txt","app.py", "/data/"]
COPY ["microservice/", "/data/microservice/"]

RUN apk update \
  && apk add --virtual build-deps gcc python3-dev musl-dev \
  && apk add postgresql-dev \
  && pip install --upgrade pip \
  && pip install -r /data/requirements.txt \
  && apk del build-deps

WORKDIR /data

ENTRYPOINT ["gunicorn"]

CMD ["--bind", "0.0.0.0:8000", "app:app"]

# cd backend/ && export FLASK_APP=app && flask run  # port 5000   
# docker build -t <account>/microservice:v0.0.1 .
# docker run --rm --name micro-service -it -e PSQL_DB_ADDRESS=192.168.1.45 -p 5001:8000 -d <account>/microservice:v0.0.1
