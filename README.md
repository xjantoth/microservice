#### Run postgres instance

```bash
docker ps --filter status=dead --filter status=exited -aq | xargs -r docker rm -v
docker run --name micro-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
a138091fa815a92d000bf0defaea791acc8daff5d22309289feee120589fd050

psql --host=localhost --port=5432 -U postgres

```          

#### Create database microservice

```sql
psql --host=localhost --port=5432 -U postgres # password
CREATE DATABASE  microservice;
CREATE USER micro WITH ENCRYPTED PASSWORD 'password'; 
GRANT ALL PRIVILEGES ON DATABASE microservice TO micro;
ALTER DATABASE microservice OWNER TO micro;
```

#### Connect to database
```sql
psql --host=localhost --port=5432 -U micro -d microservice
select * from request_ips;


```
#### Enviromental variables 
```bash
PSQL_DB_USER        default='micro'
PSQL_DB_PASS        default='password'
PSQL_DB_NAME        default='microservice'
PSQL_DB_ADDRESS     default='127.0.0.1'
PSQL_DB_PORT        default='5432'
```

#### Run microservice app
```bash
docker rm micro-service
docker build -t microservice:v0.0.1 .
docker run --rm --name micro-service -it -e PSQL_DB_ADDRESS=192.168.1.45 -p 5001:8000 -d microservice:v0.0.1

```