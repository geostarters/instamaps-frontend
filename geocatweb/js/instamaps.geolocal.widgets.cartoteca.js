/**
 * require: jquery, bootstrap
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var WidgetCartoteca = {
					
		init: function() {
			this.url = "http://cartotecadigital.icc.cat/cdm/search/searchterm/widget_id_llistamunis/mode/all/conn/and/cosuppress/";
        	this.containerId = '.drawWidgets';
			this.cache();
        	this.subscriptions();
        	this.bindEvents();
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
        	var that = this;
        	$('<div/>').addClass('widget-button').addClass('widget-cartoteca')
        	.on('click',function(){
        		$.publish('widgetActivated',{'target':this,'widget':that});
        		$.publish('trackEvent',{event:['_trackEvent', 'visor', 'widget_Cartoteca']});
        	})
        	.appendTo(container);
        },
        
        activate: function(){
        	this.active = true;
        },
        
        deactivate: function(){
        	this.active = false;
        	$(this.containerId).empty();
        },
        
        draw: function(data){
        	var that = this;
        	if(that.active){
        		$(that.containerId).empty();
        		var llistamunis = encodeURIComponent(data.municipi);
        		var url = that.url.replace("widget_id_llistamunis", llistamunis);
    			this.windowObjectReference = window.open(url,"PromoteFirefoxWindowName", "resizable=yes,scrollbars=yes,status=yes");  
    			this.windowObjectReference.focus();
    			
    			$('<p></p>').addClass('text').html('Municipi de <b>' + data.municipi + '</b>').appendTo($(that.containerId));
    			$('<div></div>').addClass('list').append(
	    			$('<a></a>', {
						'href' : url,
						'target' : '_blank'
					}).html(data.municipi + " a la cartoteca digital")).append(
					$('<span></span>',{'class':'glyphicon glyphicon-new-window'})).appendTo($(that.containerId));
            			
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
   		define([], function(){return WidgetCartoteca.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.WidgetCartoteca = WidgetCartoteca.init();
	
})( jQuery, window, document );