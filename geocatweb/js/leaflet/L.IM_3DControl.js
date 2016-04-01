/**
 * 
 */
L.Control.Control3D = L.Control.extend({
	options: {
		position: 'topright',
		id: 'dv_bt_geopdf',
		className: 'leaflet-bar btn btn-default btn-sm bt_3D_2D',
		title: 'Canviar vista',
		langTitle: 'Canviar vista',
		html: '<span class="text3D">3D</span>'
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
		
		/*
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', this._toggleView, this);
		*/
		
		//TODO crear el control del modulo de 3D 
		addModul3D();
		
		return container;
	},
	
	onRemove: function (map) {
		//map.off('mapgeopdf', this._map, this);
	},
	
	_toggleView: function(e){
		var _map = this._map;
		//_map.fire('mapgeopdf'); //to track ga events
		//TODO crear el modulo de captura
		//capturaPantalla(CAPTURA_GEOPDF);  //geocat.mapa.canvas
	}
});

L.control.control3d = function(options){
	return new L.Control.Control3D(options);
};