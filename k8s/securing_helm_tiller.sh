#!/bin/bash

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
