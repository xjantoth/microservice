# Welcome to this course

# Main Goals

- Learn how to setup Kubernetes cluster (on-premise)
- Write helm charts from scratch (with dependencies)
- Deployment to Kubernetes cluster

## Introduction

- **Setup Single Master Kubernetes (On-premise)**
  - create VM at Scaleway (master)
  - selinux
  - firewalld
  - set up bridge interface
  - install docker, kubeadm, kubectl, kubelet
  - start Kubernetes cluster
  - deploy weave
  - install helm binary, deploy tiller
  - SSL communication helm && tiller 

- **Join Worker node to Single Node Kubernetes cluster**
  - create VM at Scaleway (worker)
  - configure worker 
  - join **worker** to Kubernetes cluster

- **Write a simple back-end Python app**
  - explain Python Flask app
  - run Python Flask app locally
  - docerize Python Flask app
  - push to "https://hub.docker.com"
  - run docker container locally

- **Front-end React app**
  - explain React frontend app
  - run React frontend app locally
  - docerize React frontend app
  - run React frontend app as docker container
  - push to "https://hub.docker.com"
  
- **Get used to helm chart deployment - Dokuwiki**
  - Intro - Deploy simple helm chart 
  - Demo - Deploy simple helm chart

- **Helm Charts - Python Flask Backend**
  - create helm chart for Python Flask app from scratch
  - deployment to Kubernetes
  - access app via nodePort (port 30222)
  - access app via busybox (port 80)
  - access app from inside of the POD itself (port 8000)

- **Helm Charts - React Frontend**
  - create helm chart for React app from scratch
  - deployment to Kubernetes
  - nginx-ingres helm chart

- **Scale your back-end/front-end deployments**
  - scale up your micro-backend deployment to 3 pods
  - Scale up your micro-frontend deployment to 2 pods

- **Setup your own helm chart repository**
  - own private helm chart repository by using Chartmuseum 
  - Chartmuseum - deployment micro-frontend && micro-backend
  - chart repository made out of Github repository
  - Github helm repo - deployment micro-frontend && micro-backend

