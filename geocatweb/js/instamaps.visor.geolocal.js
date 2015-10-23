/**
 * 
 */
(function ( $, window, document, undefined ) {
	"use strict";
   	var VisorGeolocal = {
		init: function() {
        	this.containerId = '#logos',
        	this.cache();
        	this.subscriptions();
        	this.bindEvents();
                                    
            return this;
        },
        
        cache: function(){
        	this.container = $(this.containerId);
        },
   			
   		addLogosGeolocal: function(){
   			var that = this;
   			$.get("templates/logosGeolocal.html",function(data){
   				that.container.append(data);
   			});
   		},
        
        /**********Events**************/
        
        bindEvents: function(){
        },
        
        subscriptions: function() {
        }
   	}
	
	
	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return VisorGeolocal.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.VisorGeolocal = VisorGeolocal.init();
})( jQuery, window, document );