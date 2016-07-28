(function (window, document, undefined) {
	L.Polyline.include({
	    bindLabelEx: function (map,content, options) {
	    	this._map=map;
	      if (!this.label || this.label.options !== options) {
	        this.label = new L.Label(options, this);
	      }
	      this
	  		.on('remove', this.hideLabel, this)
	  		.on('move', this._moveLabel, this)
	  		.on('add', this._onPolylineAdd, this);
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
	    },
	    unbindLabel: function () {
	    	this
			.off('remove', this.hideLabel, this)
			.off('move', this._moveLabel, this)
			.off('add', this._onPolylineAdd, this);
	    	if (this.label) {
				this._hideLabel();
				this.label = null;
				this._showLabelAdded = false;				
			}
	    	
			return this;
		},
	    hideLabel: function () {
			if (this.label) {
				this.label.close();
			}
			return this;
		},
		_showLabel: function (e) {
			this.label.setLatLng(e.latlng);
			if (this._map!=null) this._map.showLabel(this.label);
		},
		_onPolylineAdd: function () {
			if (this._labelNoHide) {
				this._showLabel();
			}
		}
	});

	L.Polygon.include({
	    bindLabelExPolygon: function (map,content, options) {
	       this._map=map;
	      if (!this.label || this.label.options !== options) {
	        this.label = new L.Label(options, this);
	      }
	  	 this
	  		.on('remove', this.hideLabel, this)
	  		.on('move', this._moveLabel, this)
	  		.on('add', this._onPolygonAdd, this);
	     
	  	 var pointM = this.getBounds().getCenter();
	     
	      this.label.setContent(content);
	      this._showLabelAdded = true;
	      this._showLabel({
	        latlng: pointM
	      });
	    },
	    unbindLabel: function () {
	    	this
			.off('remove', this.hideLabel, this)
			.off('move', this._moveLabel, this)
			.off('add', this._onPolygonAdd, this);
	    	if (this.label) {
				this._hideLabel();
				this.label = null;
				this._showLabelAdded = false;				
			}
			return this;
		},
		hideLabel: function () {
			if (this.label) {
				this.label.close();
			}
			return this;
		},
		_showLabel: function (e) {
			this.label.setLatLng(e.latlng);
			if (this._map!=null) this._map.showLabel(this.label);
		},
		_onPolygonAdd: function () {
			if (this._labelNoHide) {
				this._showLabel();
			}
		}
	  });
	
	L.MultiPolygon.include({
	    bindLabelExPolygon: function (map,content, options) {
	       this._map=map;
	      if (!this.label || this.label.options !== options) {
	        this.label = new L.Label(options, this);
	      }
	  	 this
	  		.on('remove', this.hideLabel, this)
	  		.on('move', this._moveLabel, this)
	  		.on('add', this._onPolygonAdd, this);
	     
	  	 var pointM = this.getBounds().getCenter();
	     
	      this.label.setContent(content);
	      this._showLabelAdded = true;
	      this._showLabel({
	        latlng: pointM
	      });
	    },
	    unbindLabel: function () {
	    	this
			.off('remove', this.hideLabel, this)
			.off('move', this._moveLabel, this)
			.off('add', this._onPolygonAdd, this);
	    	if (this.label) {
				this._hideLabel();
				this.label = null;
				this._showLabelAdded = false;				
			}
			return this;
		},
		hideLabel: function () {
			if (this.label) {
				this.label.close();
			}
			return this;
		},
		_showLabel: function (e) {
			this.label.setLatLng(e.latlng);
			if (this._map!=null) this._map.showLabel(this.label);
		},
		_onPolygonAdd: function () {
			if (this._labelNoHide) {
				this._showLabel();
			}
		}
	  });
}(window, document));