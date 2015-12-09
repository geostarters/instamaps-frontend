/**
 * 
 * require: WidgetsGeolocal, 
 */
(function ( $, window, document, undefined ) {
	"use strict";
   	var VisorGeolocal = {
		init: function() {
        	this.logosContainerId = '#logos',
        	this.cache();
        		
        	this.subscriptions();
        	this.bindEvents();
        	
            return this;
        },
        
        cache: function(){
        	this.logosContainer = $(this.logosContainerId);
        },
   			
        initUi: function(){
        	this.addLogosGeolocal();        	
        	WidgetsGeolocal.setUiLoaded(true);
        },
        
   		addLogosGeolocal: function(){
   			var that = this;
   			$.get("templates/logosGeolocal.html",function(data){
   				that.logosContainer.append(data);
   			});
   		},
   		
   		addWidgets: function(){
   			var that = this;
   			that.widgets = WidgetsGeolocal.getWidgets();
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