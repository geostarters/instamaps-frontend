/**
 * 
 */
L.Twitter = L.FeatureGroup.extend({
	options: {
		hashtag: 'Instamapes', 
		geocode: '41.387,2.168,100' 
	},

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
		
		for (var i = 0; i < data.length; i++) {
			var obj = data[i];
			var icoTwitter = L.AwesomeMarkers.icon({
				icon : 'twitter',
				markerColor : 'blue',
				iconAnchor : new L.Point(14, 42),
				iconSize : new L.Point(28, 42),
				iconColor : '#000000',
				prefix : 'fa'
			});				
			var coord = obj.coord.split(","); 
			var m = new L.Marker([coord[1],coord[0]], {icon: icoTwitter});
			m.bindPopup('<div class="twitter_layer_popup"><a href="'+obj.profile_url+'" target="_new"><img src="'+obj.profile_image_url+'"/></a></div><br><div>'+obj.text_message+'</div>');
			this.fire('addlayer', {
				layer: m
			});
			this.addLayer(m);			
		}
		
		/*SENSE MAXIM
		var ks = [];
		for(var key in this._layers)
			ks.push(key);
		for(var i = 0; i < ks.length-this.options.maxTotal; i++)
			this.removeLayer(this._layers[ks[i]]);*/
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
	
		var data = {hashtag: this.options.hashtag,
					mapCenter: map.getCenter().lat+','+map.getCenter().lng,
					mapBbox: map.getBounds().toBBoxString()
        			}
			getTwitterLayer(data).then(function(results){
			if(results.status==='OK'){
				console.debug('twitter ok');
				_this._load(results.results)
			}else{
				console.debug('Error al carregar capa twitter');
			}				
		},function(results){
			//$('#modal_login_ko').modal('toggle');
			console.debug('Error al carregar capa twitter');
		});			

	}

});