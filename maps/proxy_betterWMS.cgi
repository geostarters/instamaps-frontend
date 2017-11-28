#!/usr/bin/env python

"""This is a blind proxy that we use to get around browser
restrictions that prevent the Javascript from loading pages not on the
same server as the Javascript.  This has several problems: it's less
efficient, it might break some sites, and it's a security risk because
people can use this proxy to browse the web and possibly do bad stuff
with it.  It only loads pages via http and https, but it can load any
content type. It supports GET and POST requests."""

import urllib2
import cgi
import sys, os
import logging

# Designed to prevent Open Proxy type stuff.

allowedHosts = ['www.icc.cat', 'openlayers.org', 
                'labs.metacarta.com', 'world.freemap.in', 
                'prototype.openmnnd.org', 'geo.openplans.org',
                'sigma.openplans.org', 'demo.opengeo.org',
                'www.openstreetmap.org', 'sample.azavea.com',
                'v2.suite.opengeo.org', 'v-swe.uni-muenster.de:8080', 
                'vmap0.tiles.osgeo.org', 'www.openrouteservice.org',
                '172.20.70.11','127.0.0.1','172.20.70.12',
                '84.88.72.121','172.30.2.33','172.30.2.34',
                '84.88.72.122','172.30.2.49','172.30.2.50'
                'localhost','localhost:8080','84.88.72.36']

method = os.environ["REQUEST_METHOD"]

if method == "GET":
    qs = os.environ["QUERY_STRING"]
    d = cgi.parse_qs(qs)
    #if d.has_key("uid"):
        #uid = d["uid"][0]
    if d.has_key("url"):
        url = d["url"][0]
    else:
        url = "http://instamapes.icgc.cat"	
else:
    fs = cgi.FieldStorage()
    url = fs.getvalue('url', "http://instamapes.icgc.cat")

try:
    host = url.split("/")[2]
    #if allowedHosts and not host in allowedHosts:
        #print "Status: 502 Bad Gateway"
        #print "Content-Type: text/plain"
        #print
        #print "This proxy does not allow you to access that location (%s)." % (host,)
        #print
        #print os.environ

    if url.startswith("http://") or url.startswith("https://"):
        if method == "POST":
            length = int(os.environ["CONTENT_LENGTH"])
            headers = {"Content-Type": os.environ["CONTENT_TYPE"]}
            body = sys.stdin.read(length)
            r = urllib2.Request(url, body, headers)
            r.add_header('Referer', 'http://'+ os.environ["SERVER_NAME"])
            #cookie = "axy="+uid.replace("@", "#_at_#");
            #r.add_header('Cookie', cookie)
            y = urllib2.urlopen(r)
        else:
            y = urllib2.urlopen(url)
        
        # print content type header
        i = y.info()
        if i.has_key("Content-Type"):
            print "Content-Type: %s" % (i["Content-Type"])
        else:
            print "Content-Type: text/plain"
        print
        
        print y.read()
        
        y.close()
    else:
        print "Content-Type: text/plain"
        print
        print "Illegal request."

except Exception, E:
    print "Status: 500 Unexpected Error"
    print "Content-Type: text/plain"
    print 
    print "Some unexpected error occurred. Error text was:", E
