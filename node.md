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


# Install docker
yum update
yum install docker
systemctl enable docker && systemctl start docker

# Create kubernetes yum repository
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

# Install important packages
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

firewall-cmd --zone=public --list-all

# Run join command generated at Kubernetes Master
kubeadm join ...
```
