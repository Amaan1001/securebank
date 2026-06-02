# SecureBank Phase 3 — Kubernetes Deployment

## Prerequisites
- Docker Desktop running
- Minikube installed: `winget install Minikube`
- kubectl installed: `winget install Kubernetes.kubectl`

## One-Command Deploy
From the root securebank/ folder:
```
deploy.bat
```

## Manual Step-by-Step

### 1. Start Minikube
```
minikube start --memory=4096 --cpus=4
```

### 2. Point Docker at Minikube
```
minikube -p minikube docker-env --shell cmd
# Run each line it outputs
```

### 3. Build jars
```
gradlew.bat :eureka-server:bootJar
gradlew.bat :account-service:bootJar
gradlew.bat :api-gateway:bootJar
```

### 4. Build Docker images
```
docker build -t eureka-server:latest ./eureka-server
docker build -t account-service:latest ./account-service
docker build -t api-gateway:latest ./api-gateway
```

### 5. Deploy to Kubernetes
```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/eureka-server/
kubectl apply -f k8s/account-service/
kubectl apply -f k8s/api-gateway/
kubectl apply -f k8s/monitoring/
```

### 6. Get URLs
```
minikube service api-gateway-service -n securebank --url
minikube service prometheus-service -n securebank --url
minikube service grafana-service -n securebank --url
```

## Useful kubectl Commands
```
# See all pods
kubectl get pods -n securebank

# See logs for a pod
kubectl logs -f deployment/account-service -n securebank

# See all services
kubectl get services -n securebank

# Restart a deployment
kubectl rollout restart deployment/account-service -n securebank

# Scale account-service
kubectl scale deployment/account-service --replicas=3 -n securebank
```

## Service Ports
| Service         | Internal Port | Access Via                          |
|-----------------|---------------|-------------------------------------|
| API Gateway     | 8080          | minikube service api-gateway-service|
| Account Service | 8081          | ClusterIP only (via gateway)        |
| Eureka          | 8761          | ClusterIP only                      |
| Prometheus      | 9090          | minikube service prometheus-service |
| Grafana         | 3000          | minikube service grafana-service    |

## Grafana Setup
1. Open Grafana URL from minikube service command
2. Login: admin / securebank123
3. Prometheus datasource is auto-provisioned
4. Import dashboard ID 4701 (JVM Micrometer) for JVM metrics
5. Import dashboard ID 11378 (Spring Boot) for app metrics
