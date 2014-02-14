L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
	onAdd: function (map) {
		// Triggered when the layer is added to a map.
		// Register a click listener, then do all the upstream WMS things
		L.TileLayer.WMS.prototype.onAdd.call(this, map);
		map.on('click', this.getFeatureInfo, this);
	},
	onRemove: function (map) {
		// Triggered when the layer is removed from a map.
		// Unregister a click listener, then do all the upstream WMS things
		L.TileLayer.WMS.prototype.onRemove.call(this, map);
		map.off('click', this.getFeatureInfo, this);
	},
	getFeatureInfo: function (evt) {
		// Make an AJAX request to the server and hope for the best
		var params = this.getFeatureInfoUrl(evt.latlng);
		//showResults = L.Util.bind(this.showGetFeatureInfo, this);
		$.ajax({
		url: paramUrl.proxy,
		data: {url: params},
		success: function (data, status, xhr) {
			var err = typeof data === 'string' ? null : data;
//			showResults(err, evt.latlng, data);
			showGetFeatureInfo(err, evt.latlng, data);
		},
		error: function (xhr, status, error) {
//			showResults(error);
			console.debug("Error:"+error);
		}
		});
	},
	getFeatureInfoUrl: function (latlng) {
		var bounds = this._map.getBounds();
		// Construct a GetFeatureInfo request URL given a point
		var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
		size = this._map.getSize(),
		params = {
			request: 'GetFeatureInfo',
			service: 'WMS',
			srs: this.wmsParams.srs,
			styles: this.wmsParams.styles,
			transparent: this.wmsParams.transparent,
			version: this.wmsParams.version,
			format: this.wmsParams.format,
			bbox: this._map.getBounds().toBBoxString(),
			//bbox: ""+bounds.getSouth()+","+bounds.getWest()+","+bounds.getNorth()+","+bounds.getEast()+"",
			height: size.y,
			width: size.x,
			layers: this.wmsParams.layers,
			query_layers: this.wmsParams.layers,
			info_format: 'text/html'
		};
		params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
		params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
		return this._url + L.Util.getParamString(params, this._url, true);
		return params;
	},
	showGetFeatureInfo: function (err, latlng, content) {
		if (err) { console.log(err); return; } // do nothing if there's an error
		// Otherwise show the content in a popup, or something.
		L.popup({ maxWidth: 800})
		.setLatLng(latlng)
		.setContent(content)
		.openOn(this._map);
	}
});
 
L.tileLayer.betterWms = function (url, options) {
return new L.TileLayer.BetterWMS(url, options);
};