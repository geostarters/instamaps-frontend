/**
 * require: jquery
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var SelectMunicipis = {
		
		selectId : null,
		select: null,
			
		init: function() {
			this._createSelect();
        	this.cache();
			this.subscriptions();
        	this.bindEvents();
        	return this;
        },
        
        cache: function(){
        	var that = this;
        	$.get("/geocatweb/dades/municipis4326.json",function(data){
        		that.municipis = data;
        		var select = that.select;
        		that._populateSelect(select);
        		$.publish('populateMunicipis', {select: $('#'+that.selectId)});
        	});
        },
 
        _createSelect: function(){
        	var that = this;
        	var id = Date.now();
        	var selMuni = $('<select/>',{
        		id: id
        	})
        	.addClass('selectMunicipis')
        	.prop('title', "Escull un municipi")
        	.on('change',function(){
        		$.publish('changeSelectMunicipis',$(this).find(":selected").data('item'));
        	});
        	that.selectId = id;
        	that.select = selMuni;
        	
        	return that;
        },	
        
        createSelect: function(){
        	var that = this;
        	return that.select;
        },
        
        _populateSelect: function(select){
        	var that = this;
        	if(that.municipis){
        		$.each(that.municipis, function() {
            		var item = this;
            		var option = $('<option/>')
            		.prop('value',item.municipiCodi)
            		.data('item', item)
            		.html(item.municipi);
            		select.append(option);
            	});
        	}
        	return that;
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