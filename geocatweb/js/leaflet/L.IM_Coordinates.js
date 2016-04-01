
/*
Exemple 
L.control.coordinates({
			position : 'bottomright', 
			'emptystring':' ',
			'numDigits': 2,
			'prefix': 'ETRS89 UTM 31N',
			'separator': ' '
		}).addTo(map);
*/

L.Control.Coordinates = L.Control.extend({
  options: {
    position: 'bottomleft',
    separator: ' : ',
    emptyString: '',
    lngFirst: false,
    numDigits: 2,
    numDigits2: 6,
	crs:new L.Proj.CRS('EPSG:25831',  '+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs'),
    lngFormatter: undefined,
    latFormatter: undefined,
    prefix: "",
    prefix2: "",
    showETRS89: true
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    L.DomEvent.disableClickPropagation(this._container);
    map.on('mousemove', this._onMouseMove, this);
    this._container.innerHTML=this.options.emptyString;
    return this._container;
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove)
  },

  _onMouseMove: function (e) {
	var map = this._map;  
	
	var sC=map.miraBBContains(map.getBounds());
  
    
	var _CRS=this.options.crs.project( {lat:e.latlng.lat,lng:e.latlng.lng});
  
    //var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    //var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    
	var lng = this.options.lngFormatter ? this.options.lngFormatter(_CRS.x) : L.Util.formatNum(_CRS.x, this.options.numDigits);
    var lat =this.options.latFormatter ? this.options.latFormatter(_CRS.y) : L.Util.formatNum(_CRS.y, this.options.numDigits);
	
	var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
	
	var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits2);
	var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits2);
	
	var value2 = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
	
    var prefixAndValue = this.options.prefix + ' ' + value;
    var prefixAndValue2 = this.options.prefix2 + ' ' +value2;
    if((sC==0)){
    	this._container.innerHTML = prefixAndValue2;
    }
    else if((sC==1 || sC==2)){  
	    if (this.options.showETRS89) this._container.innerHTML = prefixAndValue + '<br/>'+ prefixAndValue2;
	    else this._container.innerHTML = prefixAndValue2;
    }
  }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.Coordinates();
        this.addControl(this.positionControl);
    }
});

L.control.coordinates = function (options) {
    return new L.Control.Coordinates(options);
};
