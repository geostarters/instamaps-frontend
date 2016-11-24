/**
 * L.Control.Legend control que crea el boton de la legenda y agrega la legenda al mapa
 * 
 * require /geocatweb/js/leaflet/L.IM_LegendDivControl.js
 * require /geocatonline/llibreries/js/jquery/plugins/jquery.transit.js
 */
L.Control.Legend = L.Control.extend({
	options: {
		position: 'bottomright',
		idBtn: 'dv_bt_legend',
		classNameBtn: 'leaflet-bar btn btn-default btn-sm bt_legend grisfort',
		title: 'Llegenda',
		html: '<span class="fa fa-list-alt"></span>',
		id: 'mapLegend',
		className: 'info legend visor-legend ',
		tipusllegenda: 'dinamica',
		llegendaOpt: 'tancada',
		transition: true
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
			stop = L.DomEvent.stopPropagation,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		
		self._div = container;
		
		map.on('loadconfig', self._updateLegend, self);
		map.on('visorconfig', self._updateLegend, self);				
		map.on('activaLegendTab', self._updateTabLegend, self);
		map.on('onRedrawLegend', self._redraw, self);
			
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', L.DomEvent.preventDefault);
		
		self.hide();
		
		return container;
	},
	
	onRemove: function (map) {
		var self = this;
		map.off('loadconfig', self._updateLegend, self);
		map.off('visorconfig', self._updateLegend, self);				
		map.off('activaLegendTab', self._updateTabLegend, self);
		map.off('onRedrawLegend', self._redraw, self);
	},
	
	hideBtn: function(){
		var self = this;
		$(self._div).hide();
		self.button.hideBtn();
	},
	
	showBtn: function(){
		var self = this;
		$(self._div).show();
		self.button.showBtn();
	},
	
	hide: function() {
		var _$this = $(this._div),
		y2 = _$this.height() +50;
		if(this.options.transition){
			//_$this.fadeOut({duration: 'fast'});
			_$this.hide();
		}else{
			_$this.hide();
		}
		this._redrawTabs();
	},
	
	show: function(e){
		var self = this;
		var _$this = $(self._div);
		_$this.show();
		if(self.options.transition){
			_$this.fadeIn({duration: 'fast'});
		}
		self._redrawTabs();
		
	},
	
	_updateLegend: function(config){
		var self = this;
		self.servidorsWMS=config.servidorsWMS;		
		self.legend = (config.legend? $.parseJSON( config.legend):"");		
		
		self._draw();
		$('#nav_legend').tabdrop({offsetTop: -5},'layout');
	},
		
	_redraw: function(config){
		var self = this;
		//this.servidorsWMS=config.servidorsWMS;						
		if(self.options && self.options.origenllegenda=="mapa"){
			self.legend=generallegendaMapaEdicio();
		}else{
			self.legend = (config.legend? $.parseJSON( config.legend):"");			
		}				
		$(self._div).html('');	
		self._draw();
		$('#nav_legend').tabdrop({offsetTop: -5},'layout');
	},
	
	_redrawTabs: function(){
		var self = this;
		if(!$('#nav_legend li:first-child').hasClass('dropdown') || $("#nav_legend li").length > 1){
			$('#nav_legend').tabdrop({offsetTop: -5},'layout');
		}
	},
	
	_updateTabLegend:function(obje){
		
		var self = this;
		self.fromLayer = true;
		if(obje.activo){
			$('#nav_legend a[href="#tab'+obje.id+'"]').tab('show');	
		}else{			
			var lastActive=controlCapes.getCountActiveLayers();	
			lastActive.total >0?$('#nav_legend a[href="#tab'+lastActive.lastActive+'"]').tab('show'):$('#nav_legend a[href="#tab'+obje.id+'"]').tab('show');										
		}
	},	
	
	_getLastActived:function(){	
		var self = this,
		mapLegend = self.legend;
		var lastPos={indexPos:0};
		var indexPos=0;			
		var k=0;
		
		try{
		jQuery.each(self.servidorsWMS, function(j, row){
			
			
			if (self.servidorsWMS[j].capesActiva=="true"){
				k=0;
				jQuery.each(mapLegend, function(index, row){
					k++;
					for (var i = 0; i < row.length; i++) {							
			    		if(row[i].chck){
			    			if (self.servidorsWMS[j].businessId==index){				    				
			    				lastPos.indexPos=k-1;
			    			}
			    		}
			    	}
				});
			}			
		});				
		
		if(lastPos.indexPos==-1){lastPos.indexPos=0}
			return lastPos;		
		}catch(Err){
			return lastPos;
		}	
		
	},
	
	_draw: function(){
		var self = this,
		mapLegend = self.legend,
		div = self._div;
		if (self._checkEmptyMapLegend()){
			var legendhtml = [];
			if (self.options.tipusllegenda && self.options.tipusllegenda=="estatica"){
				jQuery.each(mapLegend, function(i, row){
					var layerType=self._getNameLayer(i);
					if (row.length>=1 && row[0].chck){
						legendhtml.push($('<div class="visor-legend-row">'+
			    			'<div class="visor-legend-name">'+layerType.serverName+'</div>'+
			    			'</div>'+
			    			'<div class="visor-separate-legend-row"></div>'));
					}
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
			else {
				var legendTab=[];
				var legendCont=[];
				var legendTabContent=[];
				
				
				
				legendCont.push('<div id="legend_cont">');
				legendTab.push('<div id="legend_cont"><ul id="nav_legend" class="nav nav-tabs">');
				legendTabContent.push('<div class="legendTabCont tab-content">');
				
				var index=0;
				
				var lastPos=self._getLastActived();
				
				jQuery.each(mapLegend, function(j, row){
				var layerType=self._getNameLayer(j);
				index==lastPos.indexPos?active=' active':active="";
								
				if(layerType.capesOrdre && layerType.capesOrdre.indexOf('sublayer') ==-1){
					legendTabContent.push('<div style="padding-top:10px;" class="dv_lleg tab-pane'+active+'" id="tab'+j+'">');
				}
				
				for (var i = 0; i < row.length; i++) {
					if(row[i].chck || self.options.origenllegenda=='mapa'){
						var padding_left="";
						var textalg='left';
						if (row[i].symbol.indexOf("circle")>-1){
							padding_left="padding-left:0px";
							textalg='center';
				    		var midaStr = row[i].symbol.substring(row[i].symbol.indexOf("r="),row[i].symbol.indexOf("style"));
				    		midaStr=midaStr.substring(midaStr.indexOf("=")+2,midaStr.length-2);
				    		var mida=parseFloat(midaStr);
				    		if (mida>0 && mida<=6) padding_left="padding-left:15px";
				    		else if (mida>6 && mida<=14) padding_left="padding-left:10px";
				    		else if (mida>14 && mida<=22) padding_left="padding-left:5px";
						}
						var isWMS=false;
						if (row[i].symbol.indexOf("GetLegendGraphic")>-1){
							isWMS=true;
						}
						
						index==lastPos.indexPos?active=' active':active="";
						index==lastPos.indexPos?self.options.currentTab=j:null;	
										
						
						if(i==0){legendTab.push('<li class="'+active+'"><a href="#tab'+j+'" data-toggle="tab">'+shortString(layerType.serverName,25)+'</a></li>');}	
						
						/*if(layerType.capesOrdre && layerType.capesOrdre.indexOf('sublayer') ==-1){
							legendTabContent.push(row[i].symbol);
							legendTabContent.push('<br/>');
						}else{*/
							if(i==0){legendTabContent.push('<div  class="dv_lleg tab-pane'+active+'" id="tab'+j+'">');}
							legendTabContent.push('<div class="visor-legend-row">'+
						    	'<div class="visor-legend-symbol col-md-4 col-xs-4" style="padding-top:1px;'+padding_left+'">'+row[i].symbol+'</div>');
							if (isWMS){
								legendTabContent.push('</div><div class="visor-separate-legend-row"></div>');	
							}
							else {
								legendTabContent.push('<div class="visor-legend-name col-md-8 col-xs-8" style="text-align:'+textalg+' ;padding-top:5px;">'+row[i].name+'</div>'+
						    	'</div><div class="visor-separate-legend-row"></div>');	
							}
										
							if(i==row.length-1){legendTabContent.push('</div>');}			
						//}
					}
				}
				index=index+1;
				if(layerType.capesOrdre && layerType.capesOrdre.indexOf('sublayer') ==-1){
					legendTabContent.push('</div>');
				}
			    });
				
				legendTab.push('</ul>');
				legendTabContent.push('</div></div>');
				
				$(div).append(legendTab.join(""));
				$(div).append(legendTabContent.join(""));
				$('#nav_legend').tabdrop({offsetTop: -5},'layout');
			
				$("#nav_legend").on('click', function(event){ //enables click event
					$("#nav_legend .dropdown-menu").toggle();			
				});
				$("#nav_legend .dropdown-menu a").on('click', function(event){
					var href = $(location).attr('href');
					href=href.substring(0,href.indexOf("#"));
				    var objecthref=event.target.href;
				    objecthref= objecthref.replace(href+'#tab',"");
				    $('#nav_legend a[href="#tab'+objecthref+'"]').tab('show');
				});
				
				$(div).on('click', function(e){			
					changeWMSQueryable(false);
				});	
				 
				$(div).on('mouseout', function(e){				
					changeWMSQueryable(true);
				});	
								
				$('.dv_lleg').on('click', function(e){			
					aturaClick(e);
				});	
								
				$('.legendTabCont').on('click', function(e){			
					aturaClick(e);
				});	
								
				$('.legendTabCont').on('mousedown', function(e){			
					aturaClick(e);
				});	
			
				$(' #nav_legend a[data-toggle="tab"]').on('shown.bs.tab', self._activaCapaTab.bind(self));
			}
		}
	},
	
	_activaCapaTab: function(e){
		var self = this;
		self._redrawTabs();
		if(!self.fromLayer){
			var idLayer=$(e.target).attr('href').replace('#tab','');
			$( "#input-"+idLayer).attr("checked")==undefined ? $("#input-"+idLayer).click():null;
		}else{
			self.fromLayer = false;
		}
	},
	
	_getNameLayer:function(idLayer){		
		var self = this;
		servidorsWMS = self.servidorsWMS;
		var layerType={};
		if(typeof servidorsWMS === "string" ){servidorsWMS = [servidorsWMS]};
		$.each(servidorsWMS, function(i, row){			
				if(row.businessId==idLayer){
					layerType.serverName=row.serverName.replace('##1','');
					layerType.capesOrdre=row.capesOrdre;

				}						
		});	

	if(!layerType.serverName && getModeMapa()){
		
		layerType=obteLListatCapesEditor(idLayer);
	}	
		
		
		return layerType;		
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