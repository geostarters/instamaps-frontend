#!/bin/bash

# In case that something fails, stops execution
set -e

cd /usr/local/nginx/html/
su nginx
git fetch origin production
git fetch --tags
rm geocatweb/dist/template_visor.html
rm geocatweb/templates/template_visor.html
rm geocatweb/templates/visor.html
rm geocatweb/visor.html
rm geocatweb/mapa.html
rm geocatweb/js/instamaps.version.js
rm geocatweb/js/instamaps.version.json
git pull origin production
chown -R nginx:nginx *
chmod 777 -Rf maps
chmod 777 -Rf mapcache
cd geocatweb
rm -fr node_modules
npm install 
gulp build+