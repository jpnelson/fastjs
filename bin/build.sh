#!/bin/bash
VERSION=$(npm version patch)
docker build -t jpnelson/fastjs . --tag $VERSION