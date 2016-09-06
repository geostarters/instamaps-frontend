/**
 * require: jquery, bootstrap
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var WidgetMeteo = {
					
		init: function() {
			this.url = "http://www.aemet.es/ca/eltiempo/prediccion/municipios/mostrarwidget/widget_prov_id_municipi?w=g3p11111110ohmffffffw350z252x333333t999999r1s1n1";
        	this.containerId = '.drawWidgets';
			this.cache();
        	this.subscriptions();
        	this.bindEvents();
        	this.uiLoaded = false;                    	
            return this;
        },
        
        cache: function(){
        	var that = this;
        	that.container = $(that.containerId);
        	$.get("/geocatweb/dades/municipisAemet.json",function(data){
        		that.municipis = data;
        	});
        },
        
        getWidget: function(){
        	return this;
        },
        
        drawButton: function(container){
        	var that = this;
        	$('<div/>').addClass('widget-button').addClass('widget-meteo')
        	.on('click',function(){
        		$.publish('widgetActivated',{'target':this,'widget':that});
        	})
        	.appendTo(container);
        },
        
        activate: function(){
        	this.active = true;
        },
        
        deactivate: function(){
        	this.active = false;
        	this.iframe = false;
        	$(this.containerId).empty();
        },
        
        getMunicipi: function(codigo){
        	var that = this;
        	var codiMeteo;
        	if (codigo != null){
        		if (codigo.length > 5){
        			codigo = codigo.substring(0,5);
        		}
        		var arrayLength = that.municipis.length;
        		for (var i = 0; i < arrayLength; i++) {
        			if (that.municipis[i].indexOf(codigo) != -1){
        				codiMeteo = that.municipis[i];
        				break;
        			}
        		}
        	}
        	return codiMeteo;
        },
        
        draw: function(data){
        	var that = this;
        	if(that.active){
        		var codi = that.getMunicipi(data.municipiCodi);
        		if (codi){
            		var url = that.url.replace("widget_prov_id_municipi", codi);
            		if (that.iframe){
            			$(that.containerId).find('iframe').prop('src',url);
                	}else{
                		$('<iframe/>').prop('src',url)
                		.attr('seamless','seamless').attr('scrolling','no')
                		.appendTo($(that.containerId));
                		that.iframe = true;
                	}
            	}else{
            		$(that.containerId).empty();
            	}
        	}
        },
                
        /**********Events**************/
        bindEvents: function(){
        },
        
        subscriptions: function() {
        	var that = this;
        	$.subscribe('changeSelectMunicipis',function(e, data){
        		if(data){
        			that.draw(data);
        		}
        	});
        }
	}
	
	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return WidgetMeteo.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.WidgetMeteo = WidgetMeteo.init();
	
})( jQuery, window, document );