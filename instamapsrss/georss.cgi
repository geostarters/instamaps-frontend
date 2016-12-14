#!/usr/bin/env python
# -*- coding: utf-8 -*-
import urllib2
import cgi
import sys, os
import logging
import json
import datetime
import re
# Designed to prevent Open Proxy type stuff.

method = os.environ["REQUEST_METHOD"]

if method == "GET":
    qs = os.environ["QUERY_STRING"]
    d = cgi.parse_qs(qs)
    #if d.has_key("uid"):
        #uid = d["uid"][0]
    if d.has_key("urlXXX"):
        url = d["urlXXX"][0]
    else:
        url = "http://localhost/geocat/aplications/map/getAllPublicsMaps.action"    
else:
    fs = cgi.FieldStorage()
    url = fs.getvalue('url', "http://localhost/geocat/aplications/map/getAllPublicsMaps.action")

try:
    host = url.split("/")[2]
    
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
            #print "Content-Type: %s" % (i["Content-Type"])
            print "Content-Type: text/xml"
        else:
            print "Content-Type: application/rss+xml"
        print
        
        #print y.read()
        data = json.load(y) 

        #print data['results'][0]
        lastBuildDate = datetime.datetime.now()
        ts= str('Mapes públics, creats per usuaris utilitzant InstaMaps')
       
        capRSS=("<?xml version=\"1.0\" encoding=\"utf-8\"?><feed xmlns=\"http://www.w3.org/2005/Atom\" "
        "xmlns:georss=\"http://www.georss.org/georss\" "
        "xmlns:atom=\"http://www.w3.org/2005/Atom\" "
        "xmlns:gml=\"http://www.opengis.net/gml\">"
        "<atom:link href=\"http://www.instamaps.cat/instamapsrss/georss.cgi\" rel=\"self\" type=\"application/rss+xml\" />"
        "<title>InstaMaps GeoRSS</title>"
        "<subtitle>"+ts+"</subtitle>"
        "<link href=\"http://www.instamaps.cat/\"/>"
        "<updated>"+str(lastBuildDate)+"</updated>"
        "<author><name>Instamaps</name><email>instamaps@icgc.cat</email></author>"
        "<id>urn:uuid:4cca74fb-a0ee-11dd-a834-8dd3749edb99</id>")
        print (capRSS)
        
        sitemap = open("../sitemap.xml", "w")
        capSitemap = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\">"
        "<url>"
        "  <loc>http://www.instamaps.cat/</loc>"
        "  <changefreq>weekly</changefreq>"
        "  <priority>1.0</priority>"
        "</url>"
        "<url>"
        "  <loc>http://www.instamaps.cat/index.html</loc>"
        "  <changefreq>weekly</changefreq>"
        "  <priority>0.8</priority>"
        "</url>"
        "<url>"
        "  <loc>http://www.instamaps.cat/geocatweb/galeria.html</loc>"
        "  <changefreq>weekly</changefreq>"
        "  <priority>0.8</priority>"
        "</url>"
        "<url>"
        "  <loc>http://www.instamaps.cat/geocatweb/mapa.html</loc>"
        "  <changefreq>weekly</changefreq>"
        "  <priority>0.8</priority>"
        "</url>"
        "<url>"
        "  <loc>http://www.instamaps.cat/geocatweb/registre.html</loc>"
        "  <changefreq>weekly</changefreq>"
        "  <priority>0.8</priority>"
        "</url>")
        print >> sitemap, capSitemap

        for i in range (len(data["results"])):
            codi = (data["results"][i]["businessId"])
            Name = (data["results"][i]["nomAplicacio"]).encode('utf-8')
            if(None != data["results"][i]["options"]):
                Prop = (data["results"][i]["options"]).encode('utf-8')
                des = json.loads(Prop)
                descripcio = (des["description"]).encode('utf-8')
                dataPub = data["results"][i]["dataPublicacio"]
                Bbox = des["bbox"].split(",")
                NameParam = Name.decode("utf-8").replace('"', '&quot;').replace("'", "&apos;").replace("&", "&amp;").replace(">", "&gt;").replace("<", "&lt;")
                NameDec = Name.decode("utf-8")
                descripcioDec = descripcio.decode("utf-8")
                dataRSS = ("<entry><link target=\"_blank\" href=\"http://www.instamaps.cat/geocatweb/visor.html?businessid="+codi+"&amp;title="+((NameParam))+"\"/>"
                "<updated>"+dataPub+"</updated>"
                "<id>"+codi+"</id>"
                "<title><![CDATA["+(NameDec)+" ]]></title>"
                "<summary><![CDATA["+(descripcioDec)+" ]]></summary>"
                "<georss:where>"
                "<gml:Envelope>"
                "<gml:lowerCorner>"+Bbox[1]+" "+Bbox[0]+"</gml:lowerCorner>"
                "<gml:upperCorner>"+Bbox[3]+" "+Bbox[2]+"</gml:upperCorner>"
                "</gml:Envelope>"
                "</georss:where>"
                "</entry>").encode("utf-8")
                
                print dataRSS

                urlVisor = "http://www.instamaps.cat/geocatweb/visor.html?businessid="+codi
                dataSitemap = ("<url>"
                "  <loc>" + urlVisor + "</loc>"
                "  <lastmod>" + dataPub + "</lastmod>"
                "  <changefreq>weekly</changefreq>"
                "  <priority>0.9</priority>"
                "</url>")

                print >> sitemap, dataSitemap
        
        y.close()
        cuaRSS="</feed>"
        cuaSitemap = "</urlset>"
        
        print cuaRSS
        print >> sitemap, cuaSitemap
        sitemap.close()
    else:
        print "Content-Type: text/plain"
        print
        print "Illegal request."

except Exception, E:
    print "Status: 500 Unexpected Error"
    print "Content-Type: text/plain"
    print 
    print "Some unexpected error occurred. Error text was:", E
