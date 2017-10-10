/**
 * 
 */
L.Control.Widgets = L.Control.extend({
	options: {
		position: 'topright',
		id: 'dv_bt_widgets',
		className: 'leaflet-bar btn btn-default btn-sm bt_widgets',
		title: 'Ginys',
		langTitle: 'Ginys',
		html: '<span class="fa fa-cogs widgets"></span>',
		modalContainer: '#mapa_modals',
		tooltip: 'left'
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
		container.dataset.placement = options.tooltip;
		container.dataset.langTitle = options.langTitle;
		
		self._div = container;
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', self._showWidgets, self);
		
		self.widgets = {};
		self.subscriptions();
		self._addModalWidgets();
		
		//iniciar la lista de municipios
		$.publish('mapMoveend', map);
		
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
		map.off('mapprint', this._map, this);
		
		//remove dialog
		$('.dialgo_widgets').remove();
		
	},
	
	_showWidgets: function(e){
		var _map = this._map;
		
		$('.dialgo_widgets').modal('show');
		//TODO crear los eventos
		_map.fire('showwigets'); //to track ga events
		//TODO crear el modulo de captura
		//capturaPantalla(CAPTURA_INFORME);  //geocat.mapa.canvas
	}, 
	
	_addModalWidgets: function(){
		var that = this;
    	$.get("/geocatweb/templates/modalWidgets.html",function(data){
			//TODO ver como pasar el modal container
    		$(that.options.modalContainer).append(data);
    		var modalbody = $('.dialgo_widgets div.widgets-list');
    		var selectdiv = $('.dialgo_widgets div.selectMunicipi');
    		var listdiv = $('.dialgo_widgets div.listMunicipis');			
    		that._addSelectMunicipis(selectdiv);
    		that._addListViewMunicipis(listdiv);
    		that._addIdescatWidget(modalbody);
    		that._addRPUCWidget(modalbody);
    		that._addCartotecaWidget(modalbody);
    		//that._addMeteoWidget(modalbody);
        	that._addCadastreWidget(modalbody);
        	that._addInfoParcelaWidget(modalbody);
			that._addMascaraWidget(selectdiv);
        });
    },
    
    _addSelectMunicipis: function(container){
    	var select = SelectMunicipis.createSelect();
    	container.append(select);
    	$(select).addClass("selectpicker").selectpicker({liveSearch:true});
    },
    
    _addListViewMunicipis: function(container){
    	var _map = this._map;
    	ListViewMunicipis.createList(container);
    	_map.on('moveend',function(e){
      		$.publish('mapMoveend', this);
      	});
    },
    	
    _addMeteoWidget: function(container){
    	this.widgets.meteo = WidgetMeteo.getWidget();
    	WidgetMeteo.drawButton(container);
    },
    
    _addIdescatWidget: function(container){
    	this.widgets.idescat = WidgetIdescat.getWidget();
    	WidgetIdescat.drawButton(container);
    	WidgetIdescat.activate();
    	$('.widgets-list .widget-idescat').addClass("widget-button-active");
    },
    
    _addCadastreWidget: function(container){
    	this.widgets.cadastre = WidgetCadastre.getWidget();
    	WidgetCadastre.drawButton(container);
    },
    
    _addRPUCWidget: function(container){
    	this.widgets.rpuc = WidgetRPUC.getWidget();
    	WidgetRPUC.drawButton(container);
    },
    
    _addInfoParcelaWidget: function(container){
    	this.widgets.rpuc = WidgetInfoparcela.getWidget();
    	WidgetInfoparcela.drawButton(container);
    },
	
	
	 _addMascaraWidget: function(container){
    	WidgetMascara.getWidget();
    	WidgetMascara.drawButton(container);
    },
	
	_addCartotecaWidget: function(container){
    	this.widgets.cartoteca = WidgetCartoteca.getWidget();
    	WidgetCartoteca.drawButton(container);
    },
    
    deactivateWidgets: function(){
    	var that = this;
    	for(var widget in that.widgets){
    		that.widgets[widget].deactivate();
    	}
    	$('.widgets-list .widget-button').removeClass("widget-button-active");
    },
    
    getWidgets: function(){
    	var that = this;
    	return that.widgets;
    },
    
    subscriptions: function() {
    	var that = this,
    		_map = this._map;
    	
    	$.subscribe('populateMunicipis',function(e, data){
    		var select = data.select;
    		select.selectpicker('refresh');
    	});
    	
    	$.subscribe('changeSelectMunicipis',function(e, data){
    		that.activeMunicipi = data;
    		//zoom al municipio
    		if(data && _map){
    			var bbox = data.bbox.split(",");
    			var southWest = L.latLng(bbox[1], bbox[0]),
    		    northEast = L.latLng(bbox[3], bbox[2]),
    		    bounds = L.latLngBounds(southWest, northEast);
    			_map.fitBounds(bounds)
    		}
    	});
    	
    	$.subscribe('widgetActivated',function(e, data){
    		that.deactivateWidgets();
    		var classWidget = $(data.target).attr('class').split(" ")[1];
    		$.publish('analyticsEvent',{event:[ 'visor', 'widgets', classWidget, 1]});
    		$(data.target).addClass("widget-button-active");
    		data.widget.activate();
    		if(that.activeMunicipi){
				console.info(that.activeMunicipi);
    			data.widget.draw(that.activeMunicipi);
    		}
    	});
    	
    }
});

L.control.widgets = function(options){
	return new L.Control.Widgets(options);
};