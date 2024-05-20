FROM python:3.7.0-alpine3.7

ENV API_DIR=/swagger-api

EXPOSE 8080

ADD swagger $API_DIR/

ENTRYPOINT ["python", "-m", "http.server", "8080"]
