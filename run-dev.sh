#!/usr/bin/env bash

# search if podman or docker is installed
if command -v podman &> /dev/null
then
    echo "Podman is installed"
    # if mongodb container is running, skip
    if podman ps -a | grep -q mongodb
    then
        echo "MongoDB container is already running"
        exit 0
    fi
    podman run -d --name mongodb -p 27017:27017 docker.io/mongodb/mongodb-community-server:latest
elif command -v docker &> /dev/null
then
    if docker ps -a | grep -q mongodb
    then
        echo "MongoDB container is already running"
        exit 0
    fi
    echo "Docker is installed"
    docker run -d --name mongodb -p 27017:27017 docker.io/mongodb/mongodb-community-server:latest
else
    echo "Neither Podman nor Docker is installed"
    exit 1
fi

yarn dev
