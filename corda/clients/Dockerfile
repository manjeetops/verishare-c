FROM openjdk:8-jdk-alpine

RUN mkdir -p /opt
WORKDIR /opt

VOLUME /tmp

ARG JAR_FILE=./build/libs/*.jar
COPY ${JAR_FILE} app.jar
COPY ./entrypoint.sh entrypoint.sh

RUN chmod 777 app.jar entrypoint.sh