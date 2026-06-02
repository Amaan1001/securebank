# SecureBank — Cloud-Native Banking Platform

A full-stack banking application built with Java microservices, 
Kubernetes, and a Next.js frontend.

## Tech Stack

**Backend:** Java 17, Spring Boot 3.2, Spring Cloud, Spring Security, JWT  
**Database:** PostgreSQL, Flyway, HikariCP  
**Infrastructure:** Docker, Kubernetes (Minikube), Prometheus, Grafana  
**Frontend:** Next.js 14, TypeScript, Tailwind CSS, SWR  

## Architecture

| Service | Description | Port |
|---|---|---|
| account-service | Core banking REST API | 8081 |
| api-gateway | Spring Cloud Gateway + rate limiting | 8080 |
| eureka-server | Service discovery | 8761 |
| frontend | Next.js BFF | 3000 |

## Features

- JWT authentication with BCrypt password hashing
- Account management (checking + savings)
- Deposits, withdrawals, transfers
- Async audit logging via Spring @Async thread pool
- Paginated transaction history
- Prometheus metrics + Grafana dashboards
- Full Kubernetes deployment with health probes

## Run Locally

```bash
# Start infrastructure
docker-compose up -d

# Start services (separate terminals from root)
gradlew.bat :eureka-server:bootRun
gradlew.bat :account-service:bootRun
gradlew.bat :api-gateway:bootRun

# Start frontend
cd frontend
npm run dev
```

Open http://localhost:3000

## Run on Kubernetes

```bash
minikube start --memory=4096 --cpus=4
deploy.bat
cd frontend && npm run dev
```

## API Docs

http://localhost:8080/swagger-ui.html

Requires JWT — register at `/auth/register` then click 
Authorize in Swagger UI.