# Payment Exercise Project
## Assumptions
Operating System: Windows

Docker Desktop installed

## Technology Stack
Node.js / Express

Kubernetes

Skaffold

Prometheus

k6 (load testing)

## How Idempotency Works
This project utilizes a transaction table that stores details including the idempotency_key.
The transaction table is used to validate that a payment is processed only once, ensuring idempotency.

## Automated Testing
To run automated tests for the auth service:

cd auth
npm install
npm run test


## Running the Stack
Install the NGINX Ingress Controller:
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.1/deploy/static/provider/cloud/deploy.yaml

Start Skaffold in development mode:
skaffold dev

Forward the auth service port to your local machine:
kubectl port-forward service/auth-srv 3000:3000

## PCI Recommendations
Sanitize logs to exclude sensitive fields
E2EE
Domain based tokenization
VPS / Firewall
Prometheus alert rules


## Performance Metrics
HELP http_request_duration_summary_ms Summary of HTTP request durations in ms
http_request_duration_summary_ms{quantile="0.95"} 12.35
