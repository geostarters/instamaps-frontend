/**
 * require: jquery, bootstrap-select2
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var WidgetsGeolocal = {
		
			
		init: function() {
			this.widgets = {};
			this.toolbarContainerId = '.div_barrabotons',
        	this.cache();
        	this.subscriptions();
        	this.bindEvents();
        	this.uiLoaded = false;                    	
            return this;
        },
        
        cache: function(){
        	this.toolbarContainer = $($(this.toolbarContainerId)[0]) || $([]);
        },
        
        setUiLoaded: function(loaded){
        	this.uiLoaded = loaded;
        },
        
        initUi: function(){
        	var that = this;
        	that.addBotonWidgets();
        	that.addModalWidgets();
        	this.uiLoaded = true;
        },
        
        addBotonWidgets: function(){
        	var that = this;
        	var btwidgets = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_widgets\" title=\"Ginys\" data-lang-title=\"Ginys\"><span class='fa fa-cogs widgets'></span></div>");
        	that.toolbarContainer.append(btwidgets);
        	btwidgets.tooltip({
        		placement : 'left',
        		container : 'body'
        	});
        	btwidgets.on('click',function(){
        		//TODO ver como quitar el id y guardar el modal en el objeto
        		$('#dialgo_widgets').modal('show');
        	});
        	
        },
        
        addModalWidgets: function(){
        	var that = this;
        	$.get("templates/modalWidgets.html",function(data){
   				//TODO ver como pasar el modal container
        		$('#mapa_modals').append(data);
        		var modalbody = $('#dialgo_widgets div.widgets-list');
        		var selectdiv = $('#dialgo_widgets div.selectMunicipi');
        		var listdiv = $('#dialgo_widgets div.listMunicipis');
        		that._addSelectMunicipis(selectdiv);
        		that._addListViewMunicipis(listdiv);
        		that._addIdescatWidget(modalbody);
        		that._addRPUCWidget(modalbody);
        		that._addCartotecaWidget(modalbody);
        		that._addMeteoWidget(modalbody);
            	that._addCadastreWidget(modalbody);
            });
        },
        
        _addSelectMunicipis: function(container){
        	var select = SelectMunicipis.createSelect();
        	container.append(select);
        	$(select).addClass("selectpicker").selectpicker({liveSearch:true});
        },
        
        _addListViewMunicipis: function(container){
        	ListViewMunicipis.createList(container);
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
                
        /**********Events**************/
        bindEvents: function(){
        },
        
        subscriptions: function() {
        	var that = this;
        	$.subscribe('loadMap',function(e, data){
        		that.cache();
        		that.map = data;
        		if(that.uiLoaded){
        			that.initUi();
        		}
        	});
        	
        	$.subscribe('changeSelectMunicipis',function(e, data){
        		that.activeMunicipi = data;
        		//zoom al municipio
        		if(data && that.map){
        			var bbox = data.bbox.split(",");
        			var southWest = L.latLng(bbox[1], bbox[0]),
        		    northEast = L.latLng(bbox[3], bbox[2]),
        		    bounds = L.latLngBounds(southWest, northEast);
        			that.map.fitBounds(bounds)
        		}
        	});
        	
        	$.subscribe('widgetActivated',function(e, data){
        		that.deactivateWidgets();
        		$(data.target).addClass("widget-button-active");
        		data.widget.activate();
        		if(that.activeMunicipi){
        			data.widget.draw(that.activeMunicipi);
        		}
        	});
        	
        }
	}
	
	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return WidgetsGeolocal.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.WidgetsGeolocal = WidgetsGeolocal.init();
	
})( jQuery, window, document );