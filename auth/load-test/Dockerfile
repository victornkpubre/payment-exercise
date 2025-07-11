FROM grafana/k6:latest

COPY load-test-auth.js /tests/load-test-auth.js

ENTRYPOINT ["k6", "run", "/tests/load-test-auth.js"]
