/**
 * L.Control.Control3D control que permite cambiar entre la vista 2d y 3d del mapa.
 * 
 * requiere: instamaps.mapa.3D
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
			.on(container, 'click', self._toggleView, self);
		
		map.on('loadconfig', self._addModul3D, self);
		
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
		map.off('map3dmode', this._map, this);
	},
	
	_toggleView: function(e){
		var _map = this._map;
		_map.fire('map3dmode'); //to track ga events
		//TODO crear el modulo
		activaVista3d_2d(this._div) //instamaps.mapa.3D
	},
	
	_addModul3D: function(config){
		//TODO crear el control del modulo de 3D
		addModul3D(config);
	}
});

L.control.control3d = function(options){
	return new L.Control.Control3D(options);
};