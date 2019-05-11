#### Run docker-compose to start frontend/backend/database

This command will start up all three components:
 
 * frontend
 * backend
 * postgres database


```
docker-compose up
```

#### Helm Charts

##### nginx-controller

```
helm install --name ingress stable/nginx-ingress --tls
```

##### Backend Helm Chart(Flask)
```
helm install --name microsi helm-charts/micro-chart  --tls
kubectl edit svc microsi-micro-chart
curl http://<ip_address>:31637/api/saveip
```

##### Frontend Helm Chart(React)

Running within a simple Nginx docker container.
```
helm install --name frontend helm-charts/micro-front --tls
```

##### Run REACT app manually at your laptop

```
cd ../frontend/
npm install
npm audit fix --force
npm start
npm run build
```

##### Run FLASK app manually
Create python virtualenv
```
python3 -m venv venv_micro
```

Activate virtualenv 
```
source venv_micro/bin/activate
```

Install requirements from requirements.txt
```
pip install -r requirements.txt
```

Start Flask in non-production mode
```
cd ../backend
export FLASK_APP=app
flask run
```    

#### Run postgres instance
Clean all docker images/processes/... if neceassary
```
docker rmi $(docker images -q) -f
docker ps --filter status=dead --filter status=exited -aq | xargs -r docker rm -v
docker ps -a
docker images -a
```

Start postgress as docker instance
```bash
docker run --name micro-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:alpine
```          

Connect to PostgreSQL from your laptop
```
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

#### Connect to database and do a simple search 
```sql
psql --host=localhost --port=5432 -U micro -d microservice
select * from request_ips;
```

##### Stop docker container
```
docker ps
docker stop micro-postgres
docker rm micro-postgres
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



#### Articles to read
https://kubernetes.io/docs/tasks/access-application-cluster/connecting-frontend-backend/
https://mherman.org/blog/dockerizing-a-react-app/
https://medium.com/greedygame-engineering/so-you-want-to-dockerize-your-react-app-64fbbb74c217
ENV VAR for REACT APP: https://www.jeffgeerling.com/blog/2018/deploying-react-single-page-web-app-kubernetes

#### helm chart backend/frontend

```
helm create micro-service
cd micro-service

cat <<EOF > requirements.yaml
dependencies:
- name: postgresql
  repository: https://kubernetes-charts.storage.googleapis.com
  version: 3.18.3

EOF

helm dependency update

```
