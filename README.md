#### Run postgres instance

```bash
docker run --name micro-postgres -e POSTGRES_PASSWORD=password --net=host -d postgres
a138091fa815a92d000bf0defaea791acc8daff5d22309289feee120589fd050

psql --host=localhost --port=5432 -U postgres

```          

#### Create database microservice

```sql
psql --host=localhost --port=5432 -U postgres
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