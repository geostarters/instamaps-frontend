/**
 * L.Control.LayersBtn control que agrega el control de capas
 * 
 * require /geocatonline/geocatweb/js/leaflet/L.IM_ControlLayerManager.js
 * require /geocatonline/llibreries/js/jquery/plugins/jquery.transit.js
 */
L.Control.LayersBtn = L.Control.extend({
	options: {
		position: 'topright',
		id: 'dv_bt_layers',
		className: 'leaflet-bar btn btn-default btn-sm grisfort',
		title: 'Llista de capes',
		langTitle: 'Llista de capes',
		html: '<span class="glyphicon glyphicon-th-list"></span>',
		transition: true,
		button: true,
		tooltip: 'left'
	},
	
	onAdd: function(map){
		var self = this,
			options = self.options,
			container,
			stop = L.DomEvent.stopPropagation;
		
		if(options.button){
			container = L.DomUtil.create('div', options.className);
			container.id = options.id;
			container.innerHTML = options.html;
			container.title = options.title;
			container.dataset.toggle = 'tooltip';
			container.dataset.placement = options.tooltip;
			container.dataset.langTitle = options.langTitle;
		}else{
			container = L.DomUtil.create('div', '');
		}
		
		self._div = container;
		
		map.on('loadconfig', self._updateMapConfig, self);
		map.on('visorconfig', self._updateMapConfig, self);
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', L.DomEvent.preventDefault)
			.on(container, 'click', self._toggle, self);
		
		self.control = L.control.orderlayers(null, null, {
			collapsed : false,
			id : 'div_capes',
			editMode: false,
			autoUpdate: false,
			mapConfig: self.options.mapConfig
		}).addTo(map);
		
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
		
		self.hide();
		
		return container;
	},
	
	onRemove: function (map) {
		var self = this;
		map.off('loadconfig', self._updateMapConfig, self);
		map.off('visorconfig', self._updateMapConfig, self);
	},
	
	hideBtn: function(){
		var self = this;
		$(self._div).hide();
		var div = self.control.getContainer();
		$(div).hide();
	},
	
	showBtn: function(){
		var self = this;
		$(self._div).show();
		if(!self.control.options.collapsed){
			var div = self.control.getContainer();
			$(div).show();
			
		}
	},
	
	hide: function() {
		var self = this;
		L.DomUtil.removeClass(self._div, 'greenfort');
		L.DomUtil.addClass(self._div, 'grisfort');
		var div = self.control.getContainer();
		self.control.options.collapsed = true;
		if(self.options.transition){
			$(div).fadeOut({duration: 'fast'});
		}else{
			$(div).hide();
		}
	},
	
	show: function(e){
		var self = this;
		L.DomUtil.removeClass(self._div, 'grisfort');
		L.DomUtil.addClass(self._div, 'greenfort');
		var div = self.control.getContainer();
		self.control.options.collapsed = false;
		if(self.options.transition){
			$(div).fadeIn({duration: 'fast'});
		}else{
			$(div).show();
		}
		$.publish('analyticsEvent',{event:['visor','button#llistaCapes','label llistaCapes', 3]});
	},
	
	_toggle: function(e){
		var self = this;
		var collapsed = L.DomUtil.hasClass(self._div, 'grisfort');
		this[collapsed ? 'show' : 'hide']();
		
	},
	
	_updateMapConfig: function(config){
		this.options.mapConfig = config;
	}
});

L.control.layersBtn = function(options){
	return new L.Control.LayersBtn(options);
};