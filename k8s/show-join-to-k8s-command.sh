#!/bin/bash

CACERT=$(openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //')
IPETH0=$(ip a | grep eth0 | grep inet | awk -F" " '{print $2}' | awk -F"/" '{print $1}')
TOKEN=$(kubeadm token create)

# Copy and paste this string to Worker machine and execute it!
echo -e "kubeadm join ${IPETH0}:6443 --token ${TOKEN} --discovery-token-ca-cert-hash sha256:${CACERT}"
