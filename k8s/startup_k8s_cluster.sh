#!/bib/bash

# useful prechecks
docker ps
docker images
swapon --summary
cat /proc/swaps

# start your Kubernetes cluster
kubeadm init --service-cidr=192.168.1.0/24 
