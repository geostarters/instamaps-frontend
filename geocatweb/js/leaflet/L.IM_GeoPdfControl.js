/**
 * L.Control.Geopdf control que permite obtener un geopdf del mapa
 * 
 * require: geocat.mapa.canvas
 */
L.Control.Geopdf = L.Control.extend({
	options: {
		position: 'topright',
		id: 'dv_bt_geopdf',
		className: 'leaflet-bar btn btn-default btn-sm bt_geopdf',
		title: 'Descarrega mapa en format GeoPDF',
		langTitle: 'Descarrega mapa en format GeoPDF',
		html: '<span class="fa fa-file-pdf-o geopdf"></span>'
	},
	
	onAdd: function(map){
		var options = this.options,
			stop = L.DomEvent.stopPropagation,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		container.innerHTML = options.html;
		container.title = options.title;
		container.dataset.toggle = 'tooltip';
		container.dataset.langTitle = options.langTitle;
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', this._geoPdfMap, this);
		return container;
	},
	
	onRemove: function (map) {
		map.off('mapgeopdf', this._map, this);
	},
	
	_geoPdfMap: function(e){
		var _map = this._map;
		_map.fire('mapgeopdf'); //to track ga events
		//TODO crear el modulo de captura
		capturaPantalla(CAPTURA_GEOPDF);  //geocat.mapa.canvas
	}
});

L.control.geopdf = function(options){
	return new L.Control.Geopdf(options);
};
