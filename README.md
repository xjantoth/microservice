# Table of contents
1. [Database](#database)
2. [Backend Python Flask app](#backend)
    1. [Env. variables](#env-variables)
    2. [Run backend locally](#run-backend-locally)
    3. [Run backend as docker container locally](#run-backend-as-docker-container-locally)
    4. [Backend helm chart deployment](#backend-helm-chart-deployment)
3. [Frontend](#frontend)
    1. [Run frontend locally](#run-frontend-locally)
    2. [Run frontend as docker container locally](#run-frontend-as-docker-container-locally)
    3. [Frontend helm chart deployment](#frontend-helm-chart-deployment)
4. [Nginx Controller Proxy](#nginx-controller-proxy)
5. [Dummy helm chart deployment](#dummy-helm-chart-deployment)
6. [Master Kubernetes configuration](master.md)
7. [Node/Worker Kubernetes configuration](node.md)


## Run PostgreSQL database locally as docker container <a name="database"></a>

```bash
# Clean all docker images/processes/... if neceassary
docker rmi $(docker images -q) -f
docker ps --filter status=dead --filter status=exited -aq | xargs -r docker rm -v

# Start postgress as docker instance
docker run --name micro-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:alpine

# Connect to PostgreSQL from your laptop
psql --host=localhost --port=5432 -U postgres

# Create database, user and grant privileges
CREATE DATABASE  microservice;
CREATE USER micro WITH ENCRYPTED PASSWORD 'password'; 
GRANT ALL PRIVILEGES ON DATABASE microservice TO micro;
ALTER DATABASE microservice OWNER TO micro;

# Connect to databse and check request_ips table
psql --host=localhost --port=5432 -U micro -d microservice
select * from request_ips;
```

## Backend - Python Flask <a name="backend"></a>

#### Overview of backend env. variables <a name="env-variables"></a>

Following environmental variables are used inside docker image.

```bash
PSQL_DB_USER        default='micro'
PSQL_DB_PASS        default='password'
PSQL_DB_NAME        default='microservice'
PSQL_DB_ADDRESS     default='127.0.0.1'
PSQL_DB_PORT        default='5432'
```

#### Run backend locally <a name="run-backend-locally"></a>

```bash
# Create python virtualenv
python3 -m venv venv_micro

# Activate virtualenv 
source venv_micro/bin/activate

# Install requirements from requirements.txt
pip install -r requirements.txt

# Start Flask in non-production mode
cd ../backend
export FLASK_APP=app
flask run
```

#### Run backend as docker container locally <a name="run-backend-as-docker-container-locally"></a>

```bash
# Stop and remove docker container process if previously started
docker stop micro-service && docker rm micro-service || :

# Build docker image
docker build -t <account>/microservice:v0.0.1 .

# Run docker container locally
docker run \
--rm \
--name micro-service \
-it \
-e PSQL_DB_ADDRESS=192.168.1.45 \
-p 5001:8000 \
-d microservice:v0.0.1
```


#### Backend helm chart deployment <a name="backend-helm-chart-deployment"></a>

Backend (Python Flask) helm chart (micro-chart) is dependent on a database PostgreSQL.<br>
There are two options how one can include database (postgresql) as dependency for this helm chart:<br>
backend helm chart.

1) create **requirements.yaml** file inside **micro-chart**

```bash
# Create requirements.yaml file
cat <<EOF > requirements.yaml
dependencies:
- name: postgresql
  repository: https://kubernetes-charts.storage.googleapis.com
  version: 3.18.3
EOF

# Update dependencies
helm dependency update
```

2) download **postgresql** helm chart by using `helm fetch <repo>/<chart-name>` <br>and copy it to **charts/** folder inside your helm chart (micro-chart)

```bash
helm fetch stable/postgresql
cp postgresql*.tgz charts/
```

```bash
# Deploy backend helm chart
helm install \
--name microsi \
--set service.type=NodePort \
--set service.nodePort=30222 \
helm-charts/micro-chart \
--tls

# Update already deployed helm chart
helm upgrade microsi helm-charts/micro-chart --tls

# Delete helm chart deployment 
helm delete --purge microsi --tls
```

Verify your backend deployment via:

```bash
curl http://<ip_address>:30222/api/saveip
```

## Frontend - React app <a name="frontend"></a>

#### Run frontend locally <a name="run-frontend-locally"></a>

Please execute following lines when running React frontend app<br>
locally (e.g. at your laptop)

```bash
cd ../frontend/
npm install
# npm audit fix --force
npm start
npm run build
```

#### Run frontend as docker container locally <a name="run-frontend-as-docker-container-locally"></a>

```bash
cd frontend
# Build frontend docker image
docker build -t <account>/frontend:v0.0.3 .

# Run front-end React as docker container locally
docker run --rm --name ft -it -p 3001:80 -d <account>/frontend:v0.0.3

# Get inside docker container
docker exec -it ft sh
```

#### Frontend helm chart deployment <a name="frontend-helm-chart-deployment"></a>

If want to quickly expose frontend app as service type NodePort<br>
to be able to access it immediately - please use following command:

```bash
helm install \
--name frontend \
--set service.type=NodePort \
--set service.nodePort=30333 \
helm-charts/micro-front \
--tls
```

![](images/react-frontend.png)

## Nginx Controller Proxy <a name="nginx-controller-proxy"></a>

If want to avoid exposing **NodePort** service <br>
type for each app deployed in Kubenretes - please <br>
use following deployment:

```bash
helm install \
--name ingress \
--set controller.service.type=NodePort \
--set controller.service.nodePorts.http=30444 \
stable/nginx-ingress \
--tls

# Delete nginx ingress controller
helm delete --purge ingress --tls
```

## Dummy helm chart deployment <a name="dummy-helm-chart-deployment"></a>

If there is someone who does not know anything about <br>
helm charts there is a simple deployment available <br>
Dummy Dokuwiki deployment by using helm chart

```bash
helm install \
--name dw \
--set service.type=NodePort \
--set service.nodePorts.http=30111 \
--set persistence.enabled=false \
--set dokuwikiUsername=admin,dokuwikiPassword=password \
stable/dokuwiki \
--tls
```
