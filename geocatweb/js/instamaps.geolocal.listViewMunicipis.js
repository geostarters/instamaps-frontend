/**
 * require: jquery, leafletjs
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var ListViewMunicipis = {
					
		init: function() {
			this.filtered = [];
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
 
        createList: function(container){
        	var that = this;
        	that.container = container;
        	$('<div/>').prop('lang','ca').addClass('listlabel').html('Municipis en vista').appendTo(container);
        	that.label = that.container.find('.listlabel');
        	var listMuni = $('<ul/>')
        	.addClass('listMunicipis')
        	.on('click','li',function(){
        		$.publish('changeSelectMunicipis',$(this).data('item'));
        	});
        	listMuni.appendTo(container);
        	that.listMuni = listMuni;
        	that.drawList();
        },
        
        drawList: function(){
        	var that = this;
        	if(that.label){
        		that.label.show();
        	}
        	$.each(that.filtered, function() {
        		var item = this;
        		var option = $('<li/>')
        		.data('item', item)
        		.html(item.municipi);
        		that.listMuni.append(option);
        	});
        },
        
        cleanList: function(){
        	var that = this;
        	if(that.label){
        		that.label.hide();
        	}
        	if(that.listMuni){
        		that.listMuni.empty();
        	}
        	that.filtered = [];
        },
                
        getViewMunicipis: function(bbox){
        	var that = this;
        	var arrayLength = that.municipis.length;
        	var municipi, mbbox;
        	that.cleanList();
        	for(var i = 0; i < arrayLength; i++){
        		municipi = that.municipis[i];
        		mbbox = municipi.bbox.split(",");
        		mbbox = L.latLngBounds([[parseFloat(mbbox[1]),parseFloat(mbbox[0])],[parseFloat(mbbox[3]),parseFloat(mbbox[2])]]);
        		if(bbox.intersects(mbbox)){
        			that.filtered.push(municipi);
        		}
        	}
        	that.drawList();
        },
                      
        /**********Events**************/
        bindEvents: function(){
        },
        
        subscriptions: function() {
        	var that = this;
        	$.subscribe('mapMoveend',function(e, data){
        		var map = data;
        		if (map.getZoom() >= 13){
        			that.getViewMunicipis(map.getBounds());
        		}else{
        			that.cleanList();
        		}
        	});
        }
	}
	
	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return ListViewMunicipis.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.ListViewMunicipis = ListViewMunicipis.init();
	
})( jQuery, window, document );