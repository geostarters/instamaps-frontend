#!/bin/bash

cd /usr/local/nginx/html/
sudo su nginx
git fetch origin production
git fetch --tags
git pull origin production
chown -R nginx:nginx *
chmod 777 -Rf maps
chmod 777 -Rf mapcache
