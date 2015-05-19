<<<<<<< HEAD
/*
 Copyright (c) 2012, Smartrak, David Leaver
 Leaflet.utfgrid is an open-source JavaScript library that provides utfgrid interaction on leaflet powered maps.
 https://github.com/danzel/Leaflet.utfgrid
*/
(function (window, undefined) {

L.Util.ajax = function (url, cb) {
	// the following is from JavaScript: The Definitive Guide
	// and https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest_in_IE6
	if (window.XMLHttpRequest === undefined) {
		window.XMLHttpRequest = function () {
			/*global ActiveXObject:true */
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch  (e) {
				throw new Error("XMLHttpRequest is not supported");
			}
		};
	}
	var response, request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function () {
		/*jshint evil: true */
		if (request.readyState === 4 && request.status === 200) {
			if (window.JSON) {
				if(request.responseText.toLowerCase().indexOf("error")!=-1){
					console.error("ResponseText WMS error:");
					console.error(request.responseText);
				}
				response = JSON.parse(request.responseText);
			} else {
				response = eval("(" + request.responseText + ")");
			}
			cb(response);
		}
	};
	request.send();
};
L.UtfGrid = L.Class.extend({
	includes: L.Mixin.Events,
	options: {
		subdomains: 'abc',

		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,

		resolution: 4,

		useJsonP: false,
		pointerCursor: true
	},
	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'utfgrid',
		transparent: false
	},

	//The thing the mouse is currently on
	_mouseOn: null,

	initialize: function (url, options) {
		
		this._url = url;
		this._cache = {};

		//Find a unique id in window we can use for our callbacks
		//Required for jsonP
		var i = 0;
		while (window['lu' + i]) {
			i++;
		}
		this._windowKey = 'lu' + i;
		window[this._windowKey] = {};

		var subdomains = this.options.subdomains;
		if (typeof this.options.subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
		var wmsParams = L.Util.extend({}, this.defaultWmsParams);
		wmsParams.width = wmsParams.height = this.options.tileSize;

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i)) {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.Util.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;
		this._container = this._map._container;

		this._update();

		var zoom = this._map.getZoom();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		map.on('click', this._click, this);
		map.on('mousemove', this._move, this);
		map.on('moveend', this._update, this);
	},

	onRemove: function () {
		var map = this._map;
		map.off('click', this._click, this);
		map.off('mousemove', this._move, this);
		map.off('moveend', this._update, this);
		if (this.options.pointerCursor) {
			this._container.style.cursor = '';
		}
	},

	_click: function (e) {
		this.fire('click', this._objectForEvent(e));
	},
	_move: function (e) {
		var on = this._objectForEvent(e);

		if (on.data !== this._mouseOn) {
			if (this._mouseOn) {
				this.fire('mouseout', { latlng: e.latlng, data: this._mouseOn });
				if (this.options.pointerCursor) {
					this._container.style.cursor = '';
				}
			}
			if (on.data) {
				this.fire('mouseover', on);
				if (this.options.pointerCursor) {
					this._container.style.cursor = 'pointer';
				}
			}

			this._mouseOn = on.data;
		} else if (on.data) {
			this.fire('mousemove', on);
		}
	},

	_objectForEvent: function (e) {
		var map = this._map,
		    point = map.project(e.latlng),
		    tileSize = this.options.tileSize,
		    resolution = this.options.resolution,
		    x = Math.floor(point.x / tileSize),
		    y = Math.floor(point.y / tileSize),
		    gridX = Math.floor((point.x - (x * tileSize)) / resolution),
		    gridY = Math.floor((point.y - (y * tileSize)) / resolution),
			max = map.options.crs.scale(map.getZoom()) / tileSize;

		x = (x + max) % max;
		y = (y + max) % max;
		
		var data = this._cache[map.getZoom() + '_' + x + '_' + y];
		if (!data) {
			return { latlng: e.latlng, data: null };
		}

		var idx = this._utfDecode(data.grid[gridY].charCodeAt(gridX)),
		    key = data.keys[idx],
		    result = data.data[key];

		if (!data.data.hasOwnProperty(key)) {
			result = null;
		}

		return { latlng: e.latlng, data: result};
	},

	//Load up all required json grid files
	//TODO: Load from center etc
	_update: function () {
		var bounds = this._map.getPixelBounds(),
		    zoom = this._map.getZoom(),
		    tileSize = this.options.tileSize;

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var nwTilePoint = new L.Point(
				Math.floor(bounds.min.x / tileSize),
				Math.floor(bounds.min.y / tileSize)),
			seTilePoint = new L.Point(
				Math.floor(bounds.max.x / tileSize),
				Math.floor(bounds.max.y / tileSize)),
				max = this._map.options.crs.scale(zoom) / tileSize;

		//Load all required ones
		for (var x = nwTilePoint.x; x <= seTilePoint.x; x++) {
			for (var y = nwTilePoint.y; y <= seTilePoint.y; y++) {

				var xw = (x + max) % max, yw = (y + max) % max;
				var key = zoom + '_' + xw + '_' + yw;

				if (!this._cache.hasOwnProperty(key)) {
					this._cache[key] = null;

					if (this.options.useJsonP) {
						this._loadTileP(zoom, xw, yw);
					} else {
						this._loadTile(zoom, xw, yw);
					}
				}
			}
		}
	},

	_loadTileP: function (zoom, x, y) {
		var head = document.getElementsByTagName('head')[0],
		    key = zoom + '_' + x + '_' + y,
		    functionName = 'lu_' + key,
		    wk = this._windowKey,
		    self = this;

		var url = L.Util.template(this._url, L.Util.extend({
			s: L.TileLayer.prototype._getSubdomain.call(this, { x: x, y: y }),
			z: zoom,
			x: x,
			y: y,
			cb: wk + '.' + functionName
		}, this.options));

		
		/*var map = this._map,
		crs = map.options.crs,

		tileSize = this.options.tileSize,

	
		
		bounds = this._map.getBounds();
		var SRS="EPSG:4326";
		var bbox=bounds.toBBoxString();
		if(SRS.indexOf('3857')!=-1){
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
				  
				 bbox=NW.x+","+SE.y+","+SE.x+","+NW.y;
			
			}
		*/
		var tilePoint = new L.Point(x,y);
				
		  var map = this._map,
	          crs = map.options.crs,
	          tileSize = this.options.tileSize,
		  nwPoint = tilePoint.multiplyBy(tileSize),
		  sePoint = nwPoint.add([tileSize, tileSize]),

		  //nw = crs.project(map.unproject(nwPoint, zoom)),
		  //se = crs.project(map.unproject(sePoint, zoom)),

		  bbox = [nwPoint.x, sePoint.y, sePoint.x, nwPoint.y].join(','),
			
		url = url + (L.Util.getParamString(this.wmsParams)).replace("?","") + "&bbox=" + bbox;
		
				
		var script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", url);

		window[wk][functionName] = function (data) {
			self._cache[key] = data;
			delete window[wk][functionName];
			//head.removeChild(script);
		};

		head.appendChild(script);
	},

	_loadTile: function (zoom, x, y) {
		var url = L.Util.template(this._url, L.Util.extend({
			s: L.TileLayer.prototype._getSubdomain.call(this, { x: x, y: y }),
			z: zoom,
			x: x,
			y: y
		}, this.options));
		
		
		/*bounds = this._map.getBounds();
		var SRS="EPSG:4326";
		var bbox=bounds.toBBoxString();
		if(SRS.indexOf('3857')!=-1){
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
				  
				 bbox=NW.x+","+SE.y+","+SE.x+","+NW.y;
			
			}
		*/


		  
		  
		  var tilePoint = new L.Point(x,y);
		  var tileSize = this.options.tileSize,
          nwPoint = tilePoint.multiplyBy(tileSize),
          sePoint = nwPoint.add([tileSize, tileSize]),
          nw = this._map.unproject(nwPoint),
          se = this._map.unproject(sePoint);
		  
		  var my_crs = this._map.options.crs; // get the CRS
		  var my_proj = my_crs.projection; // get the projection
		  // transform the lat lon Point to a utm point
		  var nw_utm = my_proj.project(nw); 
		  var se_utm = my_proj.project(se); 
          bbox = [nw.lng, se.lat, se.lng, nw.lat].join(','),
			
		url = url + (L.Util.getParamString(this.wmsParams)).replace("?","") + "&bbox=" + bbox;

		
		var key = zoom + '_' + x + '_' + y;
		var self = this;
		L.Util.ajax(url, function (data) {
			self._cache[key] = data;
		});
	},

	_utfDecode: function (c) {
		if (c >= 93) {
			c--;
		}
		if (c >= 35) {
			c--;
		}
		return c - 32;
	},
	openPopUp: function(data){
		
//		jQuery('#bt_info_geojsonvt_close').on('click', function (e) {
////			jQuery('#info_geojsonvt .div_popup_visor').html('');
//			jQuery('#info_geojsonvt').hide();
//		});
		
		var html ='';
		html+='<div class="popup_pres">';
		$.each( data, function( key, value ) {
			if(value!=undefined && value!=null && value != " "){
				html+='<div class="popup_data_row">';
				
				
					
					if(key.indexOf("ANY_ANTIC")!=-1) key = "ANY CONSTRUCCI&Oacute; LOCAL PRINCIPAL";
					else if(key.indexOf("TIPOLOGIA4")!=-1) key = "TIPOLOGIA";
					
					
					html+='<div class="popup_data_key">'+key+'</div>';
					html+='<div class="popup_data_value">'+value+'</div>';
				html+= '</div>';
			}
		});
		
		html+= '</div>';
		
		jQuery('#info_utfgrid .div_popup').html(html);
		jQuery('#info_utfgrid').css("border", "none");
		jQuery('#info_utfgrid').show();		
		
	}
	
});


L.utfGrid = function (url, options) {
	return new L.UtfGrid(url, options);
};





=======
/*
 Copyright (c) 2012, Smartrak, David Leaver
 Leaflet.utfgrid is an open-source JavaScript library that provides utfgrid interaction on leaflet powered maps.
 https://github.com/danzel/Leaflet.utfgrid
*/
(function (window, undefined) {

L.Util.ajax = function (url, cb) {
	// the following is from JavaScript: The Definitive Guide
	// and https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest_in_IE6
	if (window.XMLHttpRequest === undefined) {
		window.XMLHttpRequest = function () {
			/*global ActiveXObject:true */
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch  (e) {
				throw new Error("XMLHttpRequest is not supported");
			}
		};
	}
	var response, request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function () {
		/*jshint evil: true */
		if (request.readyState === 4 && request.status === 200) {
			if (window.JSON) {
				response = JSON.parse(request.responseText);
			} else {
				response = eval("(" + request.responseText + ")");
			}
			cb(response);
		}
	};
	request.send();
};
L.UtfGrid = L.Class.extend({
	includes: L.Mixin.Events,
	options: {
		subdomains: 'abc',

		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,

		resolution: 4,

		useJsonP: false,
		pointerCursor: true
	},
	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'utfgrid',
		transparent: false
	},

	//The thing the mouse is currently on
	_mouseOn: null,

	initialize: function (url, options) {
		
		this._url = url;
		this._cache = {};

		//Find a unique id in window we can use for our callbacks
		//Required for jsonP
		var i = 0;
		while (window['lu' + i]) {
			i++;
		}
		this._windowKey = 'lu' + i;
		window[this._windowKey] = {};

		var subdomains = this.options.subdomains;
		if (typeof this.options.subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
		var wmsParams = L.Util.extend({}, this.defaultWmsParams);
		wmsParams.width = wmsParams.height = this.options.tileSize;

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i)) {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.Util.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;
		this._container = this._map._container;

		this._update();

		var zoom = this._map.getZoom();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		map.on('click', this._click, this);
		map.on('mousemove', this._move, this);
		map.on('moveend', this._update, this);
	},

	onRemove: function () {
		var map = this._map;
		map.off('click', this._click, this);
		map.off('mousemove', this._move, this);
		map.off('moveend', this._update, this);
		if (this.options.pointerCursor) {
			this._container.style.cursor = '';
		}
	},

	_click: function (e) {
		this.fire('click', this._objectForEvent(e));
	},
	_move: function (e) {
		var on = this._objectForEvent(e);

		if (on.data !== this._mouseOn) {
			if (this._mouseOn) {
				this.fire('mouseout', { latlng: e.latlng, data: this._mouseOn });
				if (this.options.pointerCursor) {
					this._container.style.cursor = '';
				}
			}
			if (on.data) {
				this.fire('mouseover', on);
				if (this.options.pointerCursor) {
					this._container.style.cursor = 'pointer';
				}
			}

			this._mouseOn = on.data;
		} else if (on.data) {
			this.fire('mousemove', on);
		}
	},

	_objectForEvent: function (e) {
		var map = this._map,
		    point = map.project(e.latlng),
		    tileSize = this.options.tileSize,
		    resolution = this.options.resolution,
		    x = Math.floor(point.x / tileSize),
		    y = Math.floor(point.y / tileSize),
		    gridX = Math.floor((point.x - (x * tileSize)) / resolution),
		    gridY = Math.floor((point.y - (y * tileSize)) / resolution),
			max = map.options.crs.scale(map.getZoom()) / tileSize;

		x = (x + max) % max;
		y = (y + max) % max;
		
		var data = this._cache[map.getZoom() + '_' + x + '_' + y];
		if (!data) {
			return { latlng: e.latlng, data: null };
		}

		var idx = this._utfDecode(data.grid[gridY].charCodeAt(gridX)),
		    key = data.keys[idx],
		    result = data.data[key];

		if (!data.data.hasOwnProperty(key)) {
			result = null;
		}

		return { latlng: e.latlng, data: result};
	},

	//Load up all required json grid files
	//TODO: Load from center etc
	_update: function () {
		var bounds = this._map.getPixelBounds(),
		    zoom = this._map.getZoom(),
		    tileSize = this.options.tileSize;

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var nwTilePoint = new L.Point(
				Math.floor(bounds.min.x / tileSize),
				Math.floor(bounds.min.y / tileSize)),
			seTilePoint = new L.Point(
				Math.floor(bounds.max.x / tileSize),
				Math.floor(bounds.max.y / tileSize)),
				max = this._map.options.crs.scale(zoom) / tileSize;

		//Load all required ones
		for (var x = nwTilePoint.x; x <= seTilePoint.x; x++) {
			for (var y = nwTilePoint.y; y <= seTilePoint.y; y++) {

				var xw = (x + max) % max, yw = (y + max) % max;
				var key = zoom + '_' + xw + '_' + yw;

				if (!this._cache.hasOwnProperty(key)) {
					this._cache[key] = null;

					if (this.options.useJsonP) {
						this._loadTileP(zoom, xw, yw);
					} else {
						this._loadTile(zoom, xw, yw);
					}
				}
			}
		}
	},

	_loadTileP: function (zoom, x, y) {
		var head = document.getElementsByTagName('head')[0],
		    key = zoom + '_' + x + '_' + y,
		    functionName = 'lu_' + key,
		    wk = this._windowKey,
		    self = this;

		var url = L.Util.template(this._url, L.Util.extend({
			s: L.TileLayer.prototype._getSubdomain.call(this, { x: x, y: y }),
			z: zoom,
			x: x,
			y: y,
			cb: wk + '.' + functionName
		}, this.options));

		
		/*var map = this._map,
		crs = map.options.crs,

		tileSize = this.options.tileSize,

	
		
		bounds = this._map.getBounds();
		var SRS="EPSG:4326";
		var bbox=bounds.toBBoxString();
		if(SRS.indexOf('3857')!=-1){
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
				  
				 bbox=NW.x+","+SE.y+","+SE.x+","+NW.y;
			
			}
		*/
		var tilePoint = new L.Point(x,y);
				
		  var map = this._map,
	          crs = map.options.crs,
	          tileSize = this.options.tileSize,
		  nwPoint = tilePoint.multiplyBy(tileSize),
		  sePoint = nwPoint.add([tileSize, tileSize]),

		  //nw = crs.project(map.unproject(nwPoint, zoom)),
		  //se = crs.project(map.unproject(sePoint, zoom)),

		  bbox = [nwPoint.x, sePoint.y, sePoint.x, nwPoint.y].join(','),
			
		url = url + (L.Util.getParamString(this.wmsParams)).replace("?","") + "&bbox=" + bbox;
		
				
		var script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", url);

		window[wk][functionName] = function (data) {
			self._cache[key] = data;
			delete window[wk][functionName];
			//head.removeChild(script);
		};

		head.appendChild(script);
	},

	_loadTile: function (zoom, x, y) {
		var url = L.Util.template(this._url, L.Util.extend({
			s: L.TileLayer.prototype._getSubdomain.call(this, { x: x, y: y }),
			z: zoom,
			x: x,
			y: y
		}, this.options));
		
		
		/*bounds = this._map.getBounds();
		var SRS="EPSG:4326";
		var bbox=bounds.toBBoxString();
		if(SRS.indexOf('3857')!=-1){
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
				  
				 bbox=NW.x+","+SE.y+","+SE.x+","+NW.y;
			
			}
		*/


		  
		  
		  var tilePoint = new L.Point(x,y);
		  var tileSize = this.options.tileSize,
          nwPoint = tilePoint.multiplyBy(tileSize),
          sePoint = nwPoint.add([tileSize, tileSize]),
          nw = this._map.unproject(nwPoint),
          se = this._map.unproject(sePoint);
		  
		  var my_crs = this._map.options.crs; // get the CRS
		  var my_proj = my_crs.projection; // get the projection
		  // transform the lat lon Point to a utm point
		  var nw_utm = my_proj.project(nw); 
		  var se_utm = my_proj.project(se); 
          bbox = [nw.lng, se.lat, se.lng, nw.lat].join(','),
			
		url = url + (L.Util.getParamString(this.wmsParams)).replace("?","") + "&bbox=" + bbox;

		
		var key = zoom + '_' + x + '_' + y;
		var self = this;
		L.Util.ajax(url, function (data) {
			self._cache[key] = data;
		});
	},

	_utfDecode: function (c) {
		if (c >= 93) {
			c--;
		}
		if (c >= 35) {
			c--;
		}
		return c - 32;
	},
	openPopUp: function(data){
		
//		jQuery('#bt_info_geojsonvt_close').on('click', function (e) {
////			jQuery('#info_geojsonvt .div_popup_visor').html('');
//			jQuery('#info_geojsonvt').hide();
//		});
		
		var html ='';
		html+='<div class="popup_pres">';
		$.each( data, function( key, value ) {
			if(value!=undefined && value!=null && value != " "){
				html+='<div class="popup_data_row">';
				
				
					
					if(key.indexOf("ANY_ANTIC")!=-1) key = "ANY CONSTRUCCI&Oacute; LOCAL PRINCIPAL";
					else if(key.indexOf("TIPOLOGIA4")!=-1) key = "TIPOLOGIA";
					
					
					html+='<div class="popup_data_key">'+key+'</div>';
					html+='<div class="popup_data_value">'+value+'</div>';
				html+= '</div>';
			}
		});
		
		html+= '</div>';
		
		jQuery('#info_utfgrid .div_popup').html(html);
		jQuery('#info_utfgrid').css("border", "none");
		jQuery('#info_utfgrid').show();		
		
	}
	
});


L.utfGrid = function (url, options) {
	return new L.UtfGrid(url, options);
};





>>>>>>> branch 'master' of http://montmajor.icc.local/v.pascual/geocatonline.git
}(this));
