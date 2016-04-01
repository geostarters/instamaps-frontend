/**
 * L.Control.Home control que permite volver a la vista inicial del mapa
 */
L.Control.Home = L.Control.extend({
	options: {
		position: 'topleft',
		id: 'dv_bt_vistaInicial',
		className: 'leaflet-bar  btn btn-default btn-sm',
		title: 'Vista inicial',
		html: '<span id="span_bt_vistaInicial" class="fa fa-home grisfort"></span>'
	},
	
	onAdd: function(map){
		var options = this.options,
			stop = L.DomEvent.stopPropagation,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		container.innerHTML = options.html;
		container.title = options.title;
		
		map.on('loadconfig', this._updateMapConfig, this);
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', this._goHome, this);
		return container;
	},
	
	onRemove: function (map) {
		map.off('loadconfig', this._updateMapConfig, this);
	},
	
	_goHome: function(e){
		var mapConfig = this.options.mapConfig,
			_map = this._map;
		
		if(mapConfig){
			if (mapConfig.options.bbox){
				var bbox = mapConfig.options.bbox.split(",");
				var southWest = L.latLng(bbox[1], bbox[0]);
			    var northEast = L.latLng(bbox[3], bbox[2]);
			    var bounds = L.latLngBounds(southWest, northEast);
			    _map.fitBounds( bounds );
			}
			else if (mapConfig.options.center){
				var opcenter = mapConfig.options.center.split(",");
				_map.setView(L.latLng(opcenter[0], opcenter[1]), mapConfig.options.zoom);
			}
		}
	},
	
	_updateMapConfig: function(config){
		this.options.mapConfig = config;
	}
});

L.control.home = function(options){
	return new L.Control.Home(options);
};