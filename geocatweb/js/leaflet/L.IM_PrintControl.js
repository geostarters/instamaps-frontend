/**
 * L.Control.Printmap control que permite obtener una impresion del mapa
 * 
 * require: geocat.mapa.canvas
 */
L.Control.Printmap = L.Control.extend({
	options: {
		position: 'topright',
		id: 'dv_bt_captura',
		className: 'leaflet-bar btn btn-default btn-sm bt_print',
		title: 'Imprimir la vista del mapa',
		langTitle: 'Imprimir la vista del mapa',
		html: '<span class="glyphicon glyphicon-print grisfort"></span>'
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
			.on(container, 'click', this._printMap, this);
		return container;
	},
	
	onRemove: function (map) {
		map.off('mapprint', this._map, this);
	},
	
	_printMap: function(e){
		var _map = this._map;
		_map.fire('mapprint'); //to track ga events
		//TODO crear el modulo de captura
		capturaPantalla(CAPTURA_INFORME);  //geocat.mapa.canvas
	}
});

L.control.printmap = function(options){
	return new L.Control.Printmap(options);
};
