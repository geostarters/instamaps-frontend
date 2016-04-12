/**
 * L.Control.LocationControl control que hace lo mismo que el L.Control.Gps
 * 
 * require L.Control.Gps
 */
L.Control.LocationControl = L.Control.Gps.extend({
	onAdd: function(map) {
		var self = this;
		var container = L.Control.Gps.prototype.onAdd.call(self, map);
		self._div = container;
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
});

L.control.locationControl = function(options){
	return new L.Control.LocationControl(options);
};