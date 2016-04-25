(function (window, document, undefined) {
	L.Polyline.include({
	    bindLabelEx: function (map,content, options) {
	      this._map=map;
	      if (!this.label || this.label.options !== options) {
	        this.label = new L.Label(options, this);
	      }

	      var latlngs = this.getLatLngs();
	      var nPoint = latlngs.length;

	      var lats = [];
	      var lngs = [];
	      for(var i = 0; i < nPoint; i++) {
	        lats.push(latlngs[i].lat);
	        lngs.push(latlngs[i].lng);
	      }

	      var minLat = Math.min.apply(null, lats);
	      var maxLat = Math.max.apply(null, lats);
	      var minLng = Math.min.apply(null, lngs);
	      var maxLng = Math.max.apply(null, lngs);

	      var pointM = {
	        lat: (minLat + maxLat) / 2,
	        lng: (minLng + maxLng) / 2
	      };
	      //console.debug(pointM);
	      this.label.setContent(content);
	      this._showLabelAdded = true;
	      this._showLabel({
	        latlng: pointM
	      });
	    }
	});

	L.Polygon.include({
	    bindLabelEx: function (map,content, options) {
	    	this._map=map;
	      if (!this.label || this.label.options !== options) {
	        this.label = new L.Label(options, this);
	      }
	      var pointM = this.getBounds().getCenter();
	      //console.debug(pointM);
	      this.label.setContent(content);
	      this._showLabelAdded = true;
	      this._showLabel({
	        latlng: pointM
	      });
	    }
	  });
}(window, document));