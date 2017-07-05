/**
 * L.Control.LocationControl control que hace lo mismo que el L.Control.Gps
 * 
 * require L.Control.Gps
 */
L.Control.LocationControl = L.Control.Gps.extend({
	
	options: {
		position: 'topleft',
		id: 'dv_bt_Location',
		title: 'Centrar mapa a la seva ubicació',
		langTitle: 'Centrar mapa a la seva ubicació',
		tooltip: 'right'
	},
	
	initialize: function(options){
		var self = this,
		_options = self.options;
		
		if(options){
			options = L.Util.extend({}, _options, options);
		}
		L.Util.setOptions(self, options);
		L.Control.Gps.prototype.initialize.call(self, options);
	},
	
	onAdd: function(map) {
		var self = this,
		options = self.options;
		var container = L.Control.Gps.prototype.onAdd.call(self, map);
		
		container.title = options.title;
		container.dataset.toggle = 'tooltip';
		container.dataset.placement = options.tooltip;
		container.dataset.langTitle = options.langTitle;
		
		self._map
			.on('locationfound', this._publishFound, self)
			.on('locationerror', this._publishError, self);
		
		self._div = container;
		return container;
	},
	
	_publishFound:function(){
		$.publish('analyticsEvent',{event:['visor','input#GPS_OK','label GPS', 10]});
	},	
	
	_publishError:function(){
		$.publish('analyticsEvent',{event:['visor','input#GPS_FAIL','label GPS', 10]});
	},	
	
	hideBtn: function(){
		var self = this;
		$(self._div).hide();
	},
	
	showBtn: function(){
		var self = this;
		$(self._div).show();
	},
});

L.control.locationControl = function(options){
	return new L.Control.LocationControl(options);
};