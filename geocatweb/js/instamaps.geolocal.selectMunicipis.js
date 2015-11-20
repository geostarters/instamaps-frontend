/**
 * require: jquery
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var SelectMunicipis = {
					
		init: function() {
			this.cache();
        	this.subscriptions();
        	this.bindEvents();
        	return this;
        },
        
        cache: function(){
        	var that = this;
        	$.get("dades/municipis4326.json",function(data){
        		that.municipis = data;
        	});
        },
 
        createSelect: function(){
        	var that = this;
        	var selMuni = $('<select/>')
        	.addClass('selectMunicipis')
        	.prop('title', "Escull un municipi")
        	.on('change',function(){
        		$.publish('changeSelectMunicipis',$(this).find(":selected").data('item'));
        	});
        	$.each(that.municipis, function() {
        		var item = this;
        		var option = $('<option/>')
        		.prop('value',item.municipiCodi)
        		.data('item', item)
        		.html(item.municipi);
        		selMuni.append(option);
        	});
        	return selMuni;
        },
        
        getViewMunicipis: function(bbox){
        	
        },
                      
        /**********Events**************/
        bindEvents: function(){
        },
        
        subscriptions: function() {
        	
        }
	}
	
	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return SelectMunicipis.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.SelectMunicipis = SelectMunicipis.init();
	
})( jQuery, window, document );