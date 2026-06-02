@echo off
echo ============================================
echo    SecureBank Phase 3 - Minikube Deploy
echo ============================================

echo.
echo [1/6] Starting Minikube...
minikube start --memory=4096 --cpus=4
if %errorlevel% neq 0 ( echo ERROR: Minikube failed to start & exit /b 1 )

echo.
echo [2/6] Pointing Docker to Minikube registry...
@FOR /f "tokens=*" %%i IN ('minikube -p minikube docker-env --shell cmd') DO @%%i

echo.
echo [3/6] Building Spring Boot jars...
call gradlew.bat :eureka-server:bootJar
call gradlew.bat :account-service:bootJar
call gradlew.bat :api-gateway:bootJar

echo.
echo [4/6] Building Docker images...
docker build -t eureka-server:latest ./eureka-server
docker build -t account-service:latest ./account-service
docker build -t api-gateway:latest ./api-gateway

echo.
echo [5/6] Applying Kubernetes manifests...
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
echo Waiting for Postgres and Redis to be ready...
kubectl wait --for=condition=ready pod -l app=postgres -n securebank --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n securebank --timeout=60s
kubectl apply -f k8s/eureka-server/
echo Waiting for Eureka to be ready...
kubectl wait --for=condition=ready pod -l app=eureka-server -n securebank --timeout=120s
kubectl apply -f k8s/account-service/
kubectl apply -f k8s/api-gateway/
kubectl apply -f k8s/monitoring/

echo.
echo [6/6] Getting service URLs...
minikube service api-gateway-service -n securebank --url
minikube service prometheus-service -n securebank --url
minikube service grafana-service -n securebank --url

echo.
echo ============================================
echo    Deployment complete!
echo    Grafana login: admin / securebank123
echo ============================================
