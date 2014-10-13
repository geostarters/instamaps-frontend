// Panoramio plugin for Leaflet
// https://github.com/shurshur/Leaflet.Panoramio

L.Panoramio.custom = L.Panoramio.extend({

	_load: function(data) {
		for (var i = 0; i < data.photos.length; i++) {
			var p = data.photos[i];
			var ico = new L.Icon({
				iconUrl: p.photo_file_url,//'http://www.panoramio.com/img/panoramio-marker.png',
				shadowUrl: null,
				iconAnchor: [9,9],
				popupAnchor: [0,-10],
				className: 'photo-panoramio'
			});
			var m = new L.Marker([p.latitude,p.longitude], {icon: ico});
			m.bindPopup('<img src="http://www.panoramio.com/img/glass/components/logo_bar/panoramio.png"><br/>'+p.photo_title+'<br/><a id="'+p.photo_id+'" title="'+p.photo_title+'" rel="pano" href="'+p.photo_url+'" target="_new"><img src="'+p.photo_file_url +'" alt="'+p.photo_title+'" width="167"/></a><br/>&copy;&nbsp;<a href="'+p.owner_url+'" target="_new">'+p.owner_name+'</a>, '+p.upload_date);
			this.fire('addlayer', {
				layer: m
			});
			this.addLayer(m);
		}
		var ks = [];
		for(var key in this._layers)
			ks.push(key);
		for(var i = 0; i < ks.length-this.options.maxTotal; i++)
			this.removeLayer(this._layers[ks[i]]);
		this.fire("loaded");
	},

	_update: function() {
		var zoom = this._map.getZoom();
		var bounds = this._map.getBounds();
		var minll = bounds.getSouthWest();
		var maxll = bounds.getNorthEast();
  		/*if(this._zoom && this._bbox)
    			if(this._zoom == zoom && minll.lng >= this._bbox[0] && minll.lat >= this._bbox[1] && maxll.lng <= this._bbox[2] && maxll.lat <= this._bbox[3])
      				return;*/
		
		//Abans de recarregar elimino tots els markers
		this.clearLayers();  		
		
		var bbox = [];
  		bbox[0] = minll.lng;
  		bbox[1] = minll.lat;
  		bbox[2] = maxll.lng;
  		bbox[3] = maxll.lat;
  		
		this._bbox = bbox;
		this._zoom = zoom;
		var _this = this;
		var cbid = '_leaflet_panoramio';
		window[cbid] = function (json) {
			_this.json = json;
			window[cbid] = undefined;
			var e = document.getElementById(cbid);
			e.parentNode.removeChild(e);
			_this._load(json);
		};
		
		var url = 'http://www.panoramio.com/map/get_panoramas.php?order=upload_date&set=public&from=0&to='+this.options.maxLoad+'&minx='+
		  minll.lng+'&miny='+minll.lat+'&maxx='+maxll.lng+'&maxy='+maxll.lat+'&size=small&mapfilter=true&callback='+cbid;
		
		var boundsICGC = L.latLngBounds(L.latLng(41.368060902971166, 2.1521562337875366), 
					 L.latLng(41.37156735542552, 2.158936858177185));
		 
		if(boundsICGC.contains(bounds)){
			console.info("geostarters!");
			var url = 'http://www.panoramio.com/map/get_panoramas.php?order=upload_date&set=8024775&from=0&to='+this.options.maxLoad+'&minx='+
			  minll.lng+'&miny='+minll.lat+'&maxx='+maxll.lng+'&maxy='+maxll.lat+'&size=medium&mapfilter=true&callback='+cbid;			
		}
		//var url = 'http://api.geonames.org/wikipediaBoundingBox?north=43.25320494908846&south=39.554883059924016&east=4.6142578125&west=-2.3291015625&username=geostarters&callback=_leaflet_panoramio';
		
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.id = cbid;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

});
