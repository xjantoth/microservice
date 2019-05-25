#!/bin/bash

kubectl get pods -n kube-system

curl -L -o weave_custom.yaml "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')&env.IPALLOC_RANGE=192.168.0.0/24"

