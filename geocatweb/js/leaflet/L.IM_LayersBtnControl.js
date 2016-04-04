/**
 * 
 */
L.Control.LayersBtn = L.Control.extend({
	options: {
		position: 'topright',
		id: 'dv_bt_layers',
		className: 'leaflet-bar  btn btn-default btn-sm grisfort',
		title: 'Llista de capes',
		langTitle: 'Llista de capes',
		html: '<span class="glyphicon glyphicon-th-list"></span>'
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
		
		map.on('loadconfig', self._updateMapConfig, self);
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', L.DomEvent.preventDefault)
			.on(container, 'click', self._toggle, self);
		
		
		self.control = L.control.orderlayers(null, null, {
			collapsed : false,
			id : 'div_capes'
		}).addTo(map)
		
		controlCapes = self.control;

		map.on('addItemFinish',function(){
			$(".layers-list").mCustomScrollbar("destroy");
			$(".layers-list").mCustomScrollbar({
			   advanced:{
			     autoScrollOnFocus: false,
			     updateOnContentResize: true
			   }
			});
		});
				
		return container;
	},
	
	onRemove: function (map) {
		map.off('loadconfig', this._updateMapConfig, this);
	},
	
	hide: function() {
		L.DomUtil.removeClass(this._div, 'greenfort');
		L.DomUtil.addClass(this._div, 'grisfort');
		var div = this.control.getContainer();
		$(div).hide();
	},
	
	show: function(e){
		L.DomUtil.removeClass(this._div, 'grisfort');
		L.DomUtil.addClass(this._div, 'greenfort');
		var div = this.control.getContainer();
		$(div).show();
	},
	
	_toggle: function(e){
		var collapsed = L.DomUtil.hasClass(this._div, 'grisfort');
		this[collapsed ? 'show' : 'hide']();
	},
	
	_updateMapConfig: function(config){
		this.options.mapConfig = config;
	}
});

L.control.layersBtn = function(options){
	return new L.Control.LayersBtn(options);
};