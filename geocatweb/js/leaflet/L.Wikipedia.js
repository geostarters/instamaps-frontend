/**
 * 
 */
// Panoramio plugin for Leaflet
// https://github.com/shurshur/Leaflet.Panoramio

L.Wikipedia = L.FeatureGroup.extend({
//	options: {
//		maxLoad: 100, // max photos loaded in one request (should be less or equal 100)
//		maxTotal: 300 // max total photos
//	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		L.Util.setOptions(this, options);
	},

	onAdd: function(map, insertAtTheBottom) {
		this._map = map;
		this._insertAtTheBottom = insertAtTheBottom;
		this._update('map');
		map.on('moveend', this._update, this);
		this.fire('add');
	},

	onRemove: function(map) {
		map.off('moveend', this._update, this);
		this.eachLayer(map.removeLayer, map);
		this.fire('remove');
	},

	_load: function(data) {
		
		for (var i = 0; i < data.geonames.length; i++) {
			var wikiL = data.geonames[i];
			var ico = new L.Icon({
				iconUrl: '/geocatweb/img/network_groc.png',//TODO canviar imatge
				shadowUrl: null,
				iconAnchor: [9,9],
				popupAnchor: [0,-10],
				className: 'wikipedia_marker'
			});
			var m = new L.Marker([wikiL.lat,wikiL.lng], {icon: ico});
			m.bindPopup('<a  href="http://'+wikiL.wikipediaUrl+'" target="_new">'+wikiL.title+'</a><br/>');
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
  		if(this._zoom && this._bbox)
    			if(this._zoom == zoom && minll.lng >= this._bbox[0] && minll.lat >= this._bbox[1] && maxll.lng <= this._bbox[2] && maxll.lat <= this._bbox[3])
      				return;
  		var bbox = [];
  		bbox[0] = minll.lng;
  		bbox[1] = minll.lat;
  		bbox[2] = maxll.lng;
  		bbox[3] = maxll.lat;
		this._bbox = bbox;
		this._zoom = zoom;
		var _this = this;
		
		var language = localStorage.getItem('langJs_currentLang'); 
		if (language == null) language = 'ca';
		var data={
				north: maxll.lat,
				south: minll.lat,
				east: maxll.lng,
				west: minll.lng,
				username: 'geostarters',
				lang: language
		};
		
		getWikipediaLayer(data).then(function(results){
//					console.debug('get wikipedia ok');
					_this._load(results);
			},function(results){
//				console.debug('error getting wikipedia layer:'+results);
		});
	}

});
