#!/usr/bin/env bash
set -e
docker network inspect trading-saas-net >/dev/null 2>&1 || docker network create trading-saas-net
echo "OK: trading-saas-net"