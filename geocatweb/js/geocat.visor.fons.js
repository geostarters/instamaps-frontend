/**
 * TODO Cambiar a la carpeta de leaflet
 */
L.IM_ControlFons = L.Control.extend({
	options: {
		collapsed: true,
        position: 'bottomleft',
        title: 'Escollir el mapa de fons',
        langTitle: 'Escollir el mapa de fons',
        tooltip: 'right'
    },
    
    onAdd: function (map) {
    	this._initLayout();
    	
    	this._div = this._container;
    	
    	return this._container;
    },
    
    _initLayout: function(){
    	var self = this,
		options = self.options,
		className = 'control-btn-fons',
	    container = this._container = L.DomUtil.create('div', className);
    	
    	// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);
		
		container.title = options.title;
		container.dataset.toggle = 'tooltip';
		container.dataset.placement = options.tooltip;
		container.dataset.langTitle = options.langTitle;

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        var version = 11;
        if (msie > 0) version = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
		
        if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}
    	
	
		if (this.options.collapsed){
			//#499: Amb IE10 no es carreguen els visors
			if (msie==0){
				if (!L.Browser.android) {
						L.DomEvent.on(container, {
							mouseenter: this._expand,
							mouseleave: this._collapse
						}, this);
					}
			}
			
    		
    		
    		L.DomEvent.on(container, 'click', this._expand, this);
    		
    		this._map.on('click', this._collapse, this);
    	}else{
    		this._expand();
    	}
    	    	
    	var btllista = L.DomUtil.create('div','leaflet-bar btn btn-default btn-sm');
    	
    	if (this._map.getActiveMap() == "ortoMap"){
    		L.DomUtil.addClass(btllista, 'bt_topo');
    	}else{
    		L.DomUtil.addClass(btllista, 'bt_orto');
    	}
    	
		container.appendChild(btllista);
		this._btllista = btllista;
		btllista.innerHTML = '<small id="sm_tipus" lang="ca">Fons</small>';
				
		var llistaFons = L.DomUtil.create('div','leaflet-bar btn btn-default llista-fons');
		
		this._addLayers(llistaFons);
	
		container.appendChild(llistaFons);
						
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
    
    _update: function(){
    	
    },
    
    _expand: function(){
    	L.DomUtil.addClass(this._container, 'control-btn-fons-expanded');	
    },
    
    _collapse: function(){
    	L.DomUtil.removeClass(this._container, 'control-btn-fons-expanded');
    },
    
    _addLayers: function(container){
		

		
    	 this._addItem(container,{id:'topoMap',className:'div_fons_1',title:'Topogràfic'});
    	 this._addItem(container,{id:'topoMapGeo',className:'div_fons_12',title:'Simple'});
    	 this._addItem(container,{id:'hibridMap',className:'div_fons_13',title:'Mapa híbrid'});
    	 this._addItem(container,{id:'ortoMap',className:'div_fons_3',title:'Imatge'});    	
    	 this._addItem(container,{id:'terrainMap',className:'div_fons_4',title:'Terreny'});
    	 this._addItem(container,{id:'alcadaMap',className:'div_fons_15',title:'Model d\'elevacions'});
    	 this._addItem(container,{id:'historicOrtoMap',className:'div_fons_11',title:'Ortofoto històrica Catalunya 1956-57'});
    	 this._addItem(container,{id:'historicOrtoMap46',className:'div_fons_14',title:'Ortofoto històrica Catalunya 1946'});
    	 this._addItem(container,{id:'historicMap',className:'div_fons_10',title:'Mapa històric Catalunya 1936'});     	
    	 this._addItem(container,{id:'topoGrisMap',className:'div_fons_2',title:'Topogràfic gris'});
    	 this._addItem(container,{id:'nit',className:'div_fons_6',title:'Nit'});
    	 this._addItem(container,{id:'sepia',className:'div_fons_7',title:'Sèpia'});
    	 this._addItem(container,{id:'zombie',className:'div_fons_8',title:'Coure'});
    	 this._addItem(container,{id:'orquidea',className:'div_fons_9',title:'BluePrint'});
    	 this._addItem(container,{id:'naturalMap',className:'div_fons_16',title:'Natural'});
    	 this._addItem(container,{id:'divadminMap',className:'div_fons_17',title:'Divisions administratives'});		 
		 this._addItem(container,{id:'hibridTerrainMap',className:'div_fons_18',title:'Terreny híbrid'});		
		 this._addItem(container,{id:'colorBlankMapwhite',className:'div_fons_blank',title:'Fons neutre blanc'});
		 this._addItem(container,{id:'colorBlankMaplightgray',className:'div_fons_gris',title:'Fons neutre gris'} );
		 this._addItem(container,{id:'colorBlankMapgray',className:'div_fons_gris_fort',title:'Fons neutre gris fort'});
		 
		 
    },
    
    _addItem: function(container, properties){
		
	
    	var item = document.createElement('div');
    	item.id = properties.id;
    	item.className = properties.className;
    	item.setAttribute("data-toggle","tooltip");
    	item.setAttribute("data-lang-title",properties.title);
    	item.title = properties.title;
    	
    	L.DomEvent.on(item, 'click', L.DomEvent.stopPropagation);
    	L.DomEvent.on(item, 'click', this._onItemClick, this);
    	container.appendChild(item);
    	$(item).tooltip({placement : 'bottom',container : 'body'});
    },
    
    _onItemClick: function(evt){
    	var that = this;
    	var _this = evt.target;
    	var fons = $(_this).attr('id');
		
		
		_gaq.push(['_trackEvent', 'visor', tipus_user+'fons', fons, 1]);
		if (fons == 'topoMap'){
			this._map.topoMap();
		}else if (fons == 'topoMapGeo') {
			this._map.topoMapGeo();
		}else if (fons == 'ortoMap') {
			this._map.ortoMap();
		}else if (fons == 'terrainMap') {
			this._map.terrainMap();
		}else if (fons == 'topoGrisMap') {
			this._map.topoGrisMap();
		}else if (fons == 'historicOrtoMap') {
			this._map.historicOrtoMap();
		}else if (fons == 'historicMap') {
			this._map.historicMap();
		}else if (fons == 'hibridMap'){
			this._map.hibridMap();
		}else if (fons == 'historicOrtoMap46'){
			this._map.historicOrtoMap46();
		}else if (fons == 'alcadaMap'){
			this._map.alcadaMap();
			
		}else if (fons == 'naturalMap') {
			this._map.naturalMap();
			
		}else if (fons == 'divadminMap') {
			this._map.divadminMap();
		

		}else if (fons == 'hibridTerrainMap') {
			this._map.hibridTerrainMap();	
			
		}else if (fons.indexOf('colorBlankMap')!=-1) {
						
				
			this._map.colorBlankMap(fons);
			
		}else{
			this._map.colorMap(fons);			
		}
		if (fons == 'ortoMap'){
			L.DomUtil.removeClass(this._btllista, 'bt_orto');
			L.DomUtil.addClass(this._btllista, 'bt_topo');
		}else{
			L.DomUtil.removeClass(this._btllista, 'bt_topo');
			L.DomUtil.addClass(this._btllista, 'bt_orto');
		}
		this._collapse();
    }
});

L.IM_controlFons = function (options) {
    return new L.IM_ControlFons(options);
};

/*
//Control mapa orto/topo
	var ctr_llistaCapes = L.control({
        position : 'bottomright'
	});
	ctr_llistaCapes.onAdd = function (map) {

		
	};
	ctr_llistaCapes.addTo(map);
	
	jQuery('.div_barrabotons').on('click', function () {
		if (jQuery('div', this).hasClass('bt_orto')) {
	        map.ortoMap();
	        canvasTiles.bringToFront();
	        jQuery('#sm_tipus').text('Mapa');
	        jQuery('div', this).addClass('bt_topo');
	        jQuery('div', this).removeClass('bt_orto');
		}else{
	        map.topoMapGeo();
	        canvasTiles.bringToFront();
	        jQuery('#sm_tipus').text('Ortofoto');
	        jQuery('div', this).addClass('bt_orto');
	        jQuery('div', this).removeClass('bt_topo');
		}
	});
	
*/	