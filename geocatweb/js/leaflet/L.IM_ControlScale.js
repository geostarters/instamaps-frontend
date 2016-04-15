/**
 * L.Control.Escala hace lo mismo que el L.Control.Scale
 * 
 * require L.Control.Scale
 */
L.Control.Escala = L.Control.Scale.extend({
	onAdd: function(map) {
		var self = this;
		var container = L.Control.Scale.prototype.onAdd.call(self, map);
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

L.control.escala = function(options){
	return new L.Control.Escala(options);
};