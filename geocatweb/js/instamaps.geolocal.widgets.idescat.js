/**
 * require: jquery, bootstrap
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var WidgetIdescat = {
					
		init: function() {
			this.url = "http://api.idescat.cat/emex.ifr?bc=333333&lc=0000cc&c=000000&t=0&e=f&enc=utf-8&tc=ffffff&id=widget_id_municipi&i=f261,f321,f187,f188,f184,f91,f242,f122,f133,f134,f141,f144,f215,f219,f19&lang=cat";
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
        	$('<div/>').addClass('widget-button').addClass('widget-idescat')
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
        
        draw: function(data){
        	var that = this;
        	if(that.active){
        		var codi = data.municipiCodi;
        		if (codi){
            		var url = that.url.replace("widget_id_municipi", codi);
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
   		define([], function(){return WidgetIdescat.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.WidgetIdescat = WidgetIdescat.init();
	
})( jQuery, window, document );