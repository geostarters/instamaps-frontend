/**
 * require: jquery, bootstrap
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var WidgetMascara = {
					
		init: function() {
			
			
			this.url = "/geotimeservices/aoc?";
			this.layerFiltreCom='filtre_comarca';
			this.layerFiltreMuni='filtre_municipi'
			this.layerWMS=null;
			this.itemActive=null;
			this.containerId = '.drawWidgets';
			this.cache();
        	this.subscriptions();
        	//this.bindEvents();			
        	this.uiLoaded = false;                    	
            return this;
        },
        
        cache: function(){
        	this.container = $(this.containerId);
        },
        
        getWidget: function(){
        	return this;
        },
                
        drawButton: function(container){
			
			var selMask = $('<input/>')
        	.addClass('chk_mascara')
        	.prop('type', "checkbox")
			
			.prop('id', "id_chk_mascara")
        	.on('click',function(){
        		$.publish('changeMask',$(this).prop('checked'));
        		$.publish('trackEvent',{event:['_trackEvent', 'visor', 'widget_Mascara']});
        	});
			
			var selMaskdiv = $('<div/>').addClass('checkbox');
			selMask.appendTo(selMaskdiv);
			
			var selLabelMask=$('<label />')
			.prop('for', "id_chk_mascara")
			.text( "Aplicar màscara");
			selLabelMask.appendTo(selMaskdiv);
			container.append( selMaskdiv);
			
			
			this.bindEvents();	
			
        },
        
        activate: function(){
        	this.active = true;
        },
        
        deactivate: function(){
        	this.active = false;
        	$(this.containerId).empty();
        },
        getActiveItem:function(){
		
			return this.itemActive;
		
		},	
		
		setActiveItem:function(data){
			 this.itemActive=data;
			
		},	
		draw:function(data,input){
			
			var that = this;
				
			if(this.layerWMS !=null && map.hasLayer(this.layerWMS)){map.removeLayer(this.layerWMS);}	
			
			if(input){

			var layerFiltre=that.layerFiltreMuni;

				this.itemActive.tipusMunicipi?layerFiltre=that.layerFiltreMuni:layerFiltre=that.layerFiltreCom;
					
					this.layerWMS= L.tileLayer.betterWms(that.url, {
					layers : layerFiltre,
					//crs : '3857',
					
					transparent : true,
					CODIENS : this.itemActive.municipiMunicat,
					exceptions:'application/vnd.ogc.se_blank',
					//exceptions:checkExceptionsType(wms.url),
					format : 'image/png',
					wmstime:false,
					tileSize:512
				}).addTo(map).bringToFront();
			
			}
			
			
		
		},
		
        
                
        /**********Events**************/
        bindEvents: function(){
			var _that =this;
			map.on('layeradd',function(e){
				
				if(_that.layerWMS !=null && map.hasLayer(_that.layerWMS)){_that.layerWMS.bringToFront()}	
				
			});	
			
			
        },
        
        subscriptions: function() {
        	var _that = this;
        	$.subscribe('changeSelectMunicipis',function(e, data){
				
				_that.setActiveItem(data);
				
        		if(data && $('#id_chk_mascara').prop('checked')){
     
				_that.draw(data, true);	
					
					
        		}
        	});
			
			
			
			$.subscribe('changeMask',function(e, input){
				
				
			
				var data=_that.getActiveItem();
								
        		if(input && data ){					
					
					_that.draw(data, true);	

        		}else{
				
				_that.draw(null, false);	
				
				}	
        	});
			
			
        }
	}
	
	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return WidgetMascara.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.WidgetMascara = WidgetMascara.init();
	
})( jQuery, window, document );