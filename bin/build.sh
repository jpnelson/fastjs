#!/bin/bash
npm version patch
docker build -t jpnelson/fastjs . --tag 