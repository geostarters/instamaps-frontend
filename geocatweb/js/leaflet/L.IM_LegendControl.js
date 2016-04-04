/**
 * L.Control.Legend control que crea el boton de la legenda y agrega la legenda al mapa
 * 
 * require /geocatweb/js/leaflet/L.IM_LegendDivControl.js
 */
L.Control.Legend = L.Control.extend({
	options: {
		position: 'bottomright',
		idBtn: 'dv_bt_legend',
		classNameBtn: 'leaflet-bar btn btn-default btn-sm bt_legend grisfort',
		title: 'Llegenda',
		html: '<span class="glyphicon glyphicon-list-alt"></span>',
		id: 'mapLegend',
		className: 'info legend visor-legend mCustomScrollbar'
	},
	
	initialize: function(options){
		L.setOptions(this, options);
	
		var self = this,
		options = self.options;
		
		self.button = L.control.legenbtn({
			position: options.position,
			id: options.idBtn,
			className: options.classNameBtn,
			html: options.html,
			title: options.title,
			control: self
		}).addTo(map);
	},
	
	onAdd: function(map){
		var self = this,
			options = self.options,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		
		
		self._div = container;
		
		map.on('loadconfig', this._updateLegend, this);
		
		//map.on('loadlegend', this._updateMapConfig, this);
		
		self.hide();
		
		return container;
	},
	
	onRemove: function (map) {
		map.off('loadconfig', this._updateLegend, this);
	},
	
	hide: function() {
		$(this._div).hide();
	},
	
	show: function(e){
		$(this._div).show();
	},
	
	_updateLegend: function(config){
		this.legend = (config.legend? $.parseJSON( config.legend):"");
		this._draw();
	},
	
	_draw: function(){
		var self = this,
		mapLegend = self.legend,
		div = self._div;
		if (self._checkEmptyMapLegend()){
			var legendhtml = [];
			jQuery.each(mapLegend, function(i, row){
		    	for (var i = 0; i < row.length; i++) {
		    		if(row[i].chck){
		    			if (row[i].symbol.indexOf("circle")>-1){
		    				var padding_left="0px";
		    				var midaStr = row[i].symbol.substring(row[i].symbol.indexOf("r="),row[i].symbol.indexOf("style"));
		    				midaStr=midaStr.substring(midaStr.indexOf("=")+2,midaStr.length-2);
		    				var mida=parseFloat(midaStr);
		    				if (mida>0 && mida<=6) padding_left="15px";
		    				else if (mida>6 && mida<=14) padding_left="10px";
		    				else if (mida>14 && mida<=22) padding_left="5px";
		    				legendhtml.push($('<div class="visor-legend-row">'+
					    			'<div class="visor-legend-symbol col-md-4 col-xs-4" style="padding-left:'+padding_left+'">'+row[i].symbol+'</div>'+
					    			'<div class="visor-legend-name col-md-8 col-xs-8" style="float:right;width:40%">'+row[i].name+'</div>'+
					    			'</div>'+
					    			'<div class="visor-separate-legend-row"></div>'));
		    			} else{
		    				legendhtml.push($('<div class="visor-legend-row">'+
					    			'<div class="visor-legend-symbol col-md-4 col-xs-4">'+row[i].symbol+'</div>'+
					    			'<div class="visor-legend-name col-md-8 col-xs-8" style="float:right;">'+row[i].name+'</div>'+
									'</div>'+
									'<div class="visor-separate-legend-row"></div>'));
		    			}	    			
		    		}
		    	}
		    });
			$(div).append(legendhtml);
			$(div).mCustomScrollbar();
		}
	},
	
	_checkEmptyMapLegend: function(){
		var trobat = false,
		self = this,
		mapLegend = self.legend;
		if(typeof mapLegend === "string" ){mapLegend = [mapLegend]};
		$.each(mapLegend, function(i, row){
	    	for (var i = 0; i < row.length && !trobat; i++) {
	    		if(row[i].chck){
	    			trobat = true;
	    		}
	    	}		
		});
		return trobat;
	},
});

L.control.legend = function(options){
	return new L.Control.Legend(options);
};