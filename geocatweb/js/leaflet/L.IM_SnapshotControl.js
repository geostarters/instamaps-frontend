/**
 * L.Control.Snapshot control que permite obtener una captura de pantalla del mapa
 * 
 * require: geocat.mapa.canvas
 */
L.Control.Snapshot = L.Control.extend({
	options: {
		position: 'topright',
		id: 'dv_bt_captura',
		className: 'leaflet-bar btn btn-default btn-sm bt_captura',
		title: 'Capturar la vista del mapa',
		langTitle: 'Capturar la vista del mapa',
		html: '<span class="glyphicon glyphicon-camera grisfort"></span>'
	},
	
	onAdd: function(map){
		var self = this,
			options = self.options,
			stop = L.DomEvent.stopPropagation,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		container.innerHTML = options.html;
		container.title = options.title;
		container.dataset.toggle = 'tooltip';
		container.dataset.langTitle = options.langTitle;
		
		self._div = container;
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', self._captureMap, self);
		
		return container;
	},
	
	hideBtn: function(){
		var self = this;
		$(self._div).hide();
	},
	
	showBtn: function(){
		var self = this;
		$(self._div).show();
	},
	
	onRemove: function (map) {
		map.off('mapsnapshot', this._map, this);
	},
	
	_captureMap: function(e){
		var _map = this._map;
		_map.fire('mapsnapshot'); //to track ga events
		//TODO crear el modulo de captura
		capturaPantalla(CAPTURA_MAPA);  //geocat.mapa.canvas
	}
});

L.control.snapshot = function(options){
	return new L.Control.Snapshot(options);
};