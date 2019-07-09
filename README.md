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
# npm audit fix --force
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

##### Generate SSH key-pair

```bash
ssh-keygen -t rsa -b 2048 -f ~/.ssh/devops -C "devops@devops.com"
```

##### Start Kubernetes Master node 
```bash
master
cd data/
kubeadm init --service-cidr=192.168.1.0/24
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
curl -L -o weave_custom.yaml "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')&env.IPALLOC_RANGE=192.168.0.0/24"
kubectl create -f weave_custom.yaml
./securing_helm_tiller.sh
./join_worker.sh
```

##### Retrive join token from master to join worker to Kubernetes cluster
```
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


### Setup worker

##### Disable Selinux
```
getenforce
setenforce 0
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
reboot
```        

# Disable SWAP
```
swapoff -a
```

# Setup bridge interface
```
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

sysctl --system
```

# Install docker, kubelet, kubeadm, kubectl
```
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
```

##### Setup firewalld at Worker 

```
# If firewalld not installed at the worker machine
yum install firewalld -y
systemctl enable firewalld && systemctl start firewalld

# setup particular firewall rules to allow master/worker comunication
firewall-cmd --permanent --add-port=30000-32767/tcp
firewall-cmd --permanent --add-port=10250/tcp
firewall-cmd --permanent --add-port=6783/tcp
firewall-cmd --permanent --add-port=6783/udp
firewall-cmd --permanent --add-port=6784/udp
firewall-cmd --permanent --direct --add-rule ipv4 filter FORWARD 0 -j ACCEPT
firewall-cmd --reload
```

