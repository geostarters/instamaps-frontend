/**
 * L.Control.Minimapa igual que el L.Control.MiniMap
 * 
 * require L.Control.MiniMap
 */
L.Control.Minimapa = L.Control.MiniMap.extend({
	onAdd: function(map) {
		var self = this;
		var container = L.Control.MiniMap.prototype.onAdd.call(self, map);
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
	}
});

L.control.minimapa = function(layer, options){
	return new L.Control.Minimapa(layer, options);
};
