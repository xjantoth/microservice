
## Run PostgreSQL database locally as docker container

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

## Backend - Python Flask

#### Overview of backend env. variables 

Following environmental variables are used inside docker image.

```bash
PSQL_DB_USER        default='micro'
PSQL_DB_PASS        default='password'
PSQL_DB_NAME        default='microservice'
PSQL_DB_ADDRESS     default='127.0.0.1'
PSQL_DB_PORT        default='5432'
```

#### Run backend locally

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

#### Run backend as docker container locally

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


#### Backend helm chart deployment

Backend (Python Flask) helm chart (micro-chart) is dependent on a database PostgreSQL.<br>
There is the way how one can include database as dependency for<br>
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
```

Verify your backend deployment via:

```bash
curl http://<ip_address>:30222/api/saveip
```

## Frontend - React 

#### Run frontend locally

Please execute following lines when running React frontend app<br>
locally (e.g. at your laptop)

```bash
cd ../frontend/
npm install
# npm audit fix --force
npm start
npm run build
```

#### Helm chart deployment

```bash
helm install \
--name frontend \
helm-charts/micro-front \
--tls
```

## Nginx Controller Proxy

If want to avoid exposing **NodePort** service <br>
type for each app deployed in Kubenretes - please <br>
use following deployment:

```bash
helm install --name ingress stable/nginx-ingress --tls
```

## Dummy helm chart deployment

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

## Start Kubernetes Master node 

```bash
# Please generate ssh key pair if required
ssh-keygen -t rsa -b 2048 -f ~/.ssh/devops -C "devops@devops.com"

master
cd data/
kubeadm init --service-cidr=192.168.1.0/24
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
curl -L -o weave_custom.yaml "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')&env.IPALLOC_RANGE=192.168.0.0/24"
kubectl create -f weave_custom.yaml
./securing_helm_tiller.sh
./join_worker.sh
```


```
# Retrive join token from master to join worker to Kubernetes cluster
#!/bin/bash

CACERT=$(openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //')
IPETH0=$(ip a | grep eth0 | grep inet | awk -F" " '{print $2}' | awk -F"/" '{print $1}')
TOKEN=$(kubeadm token create)

# Copy and paste this string to Worker machine and execute it!
echo -e "kubeadm join ${IPETH0}:6443 --token ${TOKEN} --discovery-token-ca-cert-hash sha256:${CACERT}"
```

##### Run this command on Wokrer machine to join Kubenrtes cluster
```
kubeadm join ${IPETH0}:6443 --token 3byhoj.k..er --discovery-token-ca-cert-hash sha256:${CACERT}
```


## Setup Kubernetes Node/Worker


```bash
# Disable Selinux
getenforce
setenforce 0
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
reboot

# Disable SWAP
swapoff -a


# Setup bridge interface
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
sysctl --system


# Install docker, kubelet, kubeadm, kubectl
yum update
yum install docker
systemctl enable docker && systemctl start docker

cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
exclude=kube*
EOF

yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
systemctl enable kubelet && systemctl start kubelet




# setup particular firewall rules to allow master/worker comunication
yum install firewalld -y
systemctl enable firewalld && systemctl start firewalld

firewall-cmd --permanent --add-port=30000-32767/tcp
firewall-cmd --permanent --add-port=10250/tcp
firewall-cmd --permanent --add-port=6783/tcp
firewall-cmd --permanent --add-port=6783/udp
firewall-cmd --permanent --add-port=6784/udp
firewall-cmd --permanent --direct --add-rule ipv4 filter FORWARD 0 -j ACCEPT
# firewall-cmd --add-masquerade --permanent
firewall-cmd --reload
```

#### Articles to read
https://kubernetes.io/docs/tasks/access-application-cluster/connecting-frontend-backend/
https://mherman.org/blog/dockerizing-a-react-app/
https://medium.com/greedygame-engineering/so-you-want-to-dockerize-your-react-app-64fbbb74c217
ENV VAR for REACT APP: https://www.jeffgeerling.com/blog/2018/deploying-react-single-page-web-app-kubernetes
