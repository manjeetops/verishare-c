#!/bin/sh

docker build . -f ./Dockerfile -t registry.ng.bluemix.net/fandomsports/cloud-swagger:fandom-platform --no-cache
