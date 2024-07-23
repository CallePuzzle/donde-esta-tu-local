#!/bin/bash

# Run a mongodb container using podman
podman run -d --name mongodb -p 27017:27017 docker.io/mongodb/mongodb-community-server:latest
yarn dev
