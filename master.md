## Configure Kubernetes Master 

#### Please generate ssh key pair if required

```bash
# *****************************************
# Please generate ssh key pair if required
# *****************************************
ssh-keygen -t rsa -b 2048 -f ~/.ssh/devops -C "devops@devops.com"
```

#### SSH to you Kubenretes master server

```bash
# *****************************************
# SSH to you Kubernetes master server
# *****************************************
ssh <user>@<ip-address>
```

#### Disable Selinux

```bash
# *****************************************
# Disable Selinux
# *****************************************
getenforce
setenforce 0
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
reboot
```

#### Disable SWAP

```bash
# *****************************************
# Disable SWAP
# *****************************************
swapoff -a
```


#### Setup firewall rules for Kubernetes Master

```bash
# *****************************************
# Setup firewall rules to allow 
# Master/Worker communication within cluster
# *****************************************
yum install firewalld -y
systemctl enable firewalld && systemctl start firewalld

firewall-cmd --permanent --add-port=6443/tcp
firewall-cmd --permanent --add-port=2379-2380/tcp
firewall-cmd --permanent --add-port=10250/tcp
firewall-cmd --permanent --add-port=10251/tcp
firewall-cmd --permanent --add-port=10252/tcp
# firewall-cmd --permanent --add-port=10255/tcp
firewall-cmd --permanent --add-port=6783/tcp
firewall-cmd --permanent --add-port=6783/udp
firewall-cmd --permanent --add-port=6784/udp
firewall-cmd --permanent --direct --add-rule ipv4 filter FORWARD 0 -j ACCEPT
# firewall-cmd --add-masquerade --permanent
firewall-cmd --reload

firewall-cmd --zone=public --list-all
```

#### Setup bridge interface

```bash
# *****************************************
# Setup bridge interface
# *****************************************
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
sysctl --system
```

#### Install docker

```bash
# *****************************************
# Install docker
# *****************************************
yum update && yum install docker
systemctl enable docker && systemctl start docker
```


#### Install kubelet kubeadm kubectl packages

```bash
# *****************************************
# Install kubelet kubeadm kubectl packages
# Create kubernetes yum repository
# *****************************************
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
```


#### Start/Initiate Kubernetes Master

```bash
# *****************************************
# Start/Initiate Kubernetes Master
# *****************************************
kubeadm init --service-cidr=192.168.1.0/24
```


#### Copy admin.conf to a proper location 

```bash
# *****************************************
# Copy admin.conf to a proper location 
# to be able to use kubectl
# *****************************************
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
```

#### Download file: weave_custom.yaml 

```bash
# *****************************************
# Download file: weave_custom.yaml 
# *****************************************
curl \
-L \
-o weave_custom.yaml \
"https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')&env.IPALLOC_RANGE=192.168.0.0/24"
# Execute previously downloaded file: file
kubectl create -f weave_custom.yaml
```

#### Install helm binary

```bash
# *****************************************
# Install helm binary
# *****************************************
function install_helm {
  curl https://raw.githubusercontent.com/helm/helm/master/scripts/get > get_helm.sh
  chmod 700 get_helm.sh
  ./get_helm.sh
}
install_helm
```

#### Setting up helm-tiller communication

```bash
# *****************************************
# Setting up helm-tiller communication
# *****************************************
function generate_certs {
  dir="certs"
  if [ ! -d $dir ]
  then
      mkdir $dir
  else
    echo "Directory: ${dir} exists!"  
  fi
  
  cd ${dir}

  # Create CA authority
  openssl genrsa -out ca.key.pem 4096
  openssl req -key ca.key.pem -subj "/C=EU/ST=SD/L=AM/O=devopsinuse/CN=Authority" -new -x509 -days 7300 -sha256 -out ca.cert.pem -extensions v3_ca

  # Generate keys for tiller && helm
  openssl genrsa -out tiller.key.pem 4096
  openssl genrsa -out helm.key.pem 4096
  
  # Generate CSR tiller && helm
  openssl req -key tiller.key.pem -new -sha256 -out tiller.csr.pem -subj "/C=EU/ST=SD/L=AM/O=devopsinuse/CN=tiller"
  openssl req -key helm.key.pem -new -sha256 -out helm.csr.pem -subj "/C=EU/ST=SD/L=AM/O=devopsinuse/CN=tiller"

  # Sign CSR with self-signed CA
  openssl x509 -req -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -in tiller.csr.pem -out tiller.cert.pem -days 365
  openssl x509 -req -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -in helm.csr.pem -out helm.cert.pem  -days 365

}

function create_sa_crb {
# Create tiller account and clusterrolebinding
cat <<EOF > rbac-tiller-config.yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tiller
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: tiller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: tiller
    namespace: kube-system
EOF
}
# Create ServiceAccount && ClusterRoleBinding for tiller

function secure_helm_tiller {
  echo  -e "\nGenerating certificates"
  generate_certs
  echo -e "\nCreating ServiceAccount and CRB"
  create_sa_crb
  kubectl create -f rbac-tiller-config.yaml
  
  # Allow application scheduling on Kubernetes master
  kubectl taint nodes --all node-role.kubernetes.io/master-
  
  # Deploy tiller pod with SSL
  helm init --service-account=tiller --tiller-tls --tiller-tls-cert ./tiller.cert.pem --tiller-tls-key ./tiller.key.pem --tiller-tls-verify --tls-ca-cert ca.cert.pem
  
  echo -e "helm ls --tls --tls-ca-cert ca.cert.pem --tls-cert helm.cert.pem --tls-key helm.key.pem"
  echo -e "executing: cp helm.cert.pem ~/.helm/cert.pem"
  yes | cp -rf helm.cert.pem ~/.helm/cert.pem
  echo -e "executing: cp helm.key.pem ~/.helm/key.pem"
  yes | cp -rf helm.key.pem ~/.helm/key.pem
  cd ..
}

secure_helm_tiller
```

#### Retrive join token from master to join worker to Kubernetes cluster

```bash
cat <<EOF >  /tmp/show-join-to-k8s-command.sh
#!/bin/bash

CACERT=$(openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //')
IPETH0=$(ip a | grep eth0 | grep inet | awk -F" " '{print $2}' | awk -F"/" '{print $1}')
TOKEN=$(kubeadm token create)

# Copy and paste this string to Worker machine and execute it!
echo -e "kubeadm join ${IPETH0}:6443 --token ${TOKEN} --discovery-token-ca-cert-hash sha256:${CACERT}"
EOF

# Grant executable permissions 
chmod +x /tmp/show-join-to-k8s-command.sh

# Execute show-join-to-k8s-command.sh script to retrive join to k8s command
/tmp/./show-join-to-k8s-command.sh
```