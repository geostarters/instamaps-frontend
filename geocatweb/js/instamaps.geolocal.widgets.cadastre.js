/**
 * require: jquery, bootstrap
 */
(function ( $, window, document, undefined ) {
	"use strict";
	var WidgetCadastre = {
					
		init: function() {
			this.rutaUrbanaCadastre = "http://www.catastro.minhap.es/INSPIRE/CadastralParcels/_provincia_/_codi_-_nom_/A.ES.SDGC.CP.U._codi_.zip";
			this.rutaRuralCadastre = "http://www.catastro.minhap.es/INSPIRE/CadastralParcels/_provincia_/_codi_-_nom_/A.ES.SDGC.CP.R._codi_.zip";
			this.containerId = '.drawWidgets';
			this.m_SGDC = "Els arxius es descarregaran en el format GML 3.2. Si tens problemes per visualitzar-los consulta la <a href='http://www.geoportal.cat/geoportal/cat/documentacio/manuals/index.jsp' target='_blank' class='alert-link'>Guia IDEC de visualització GML</a> <br><br><i>Font dades:<a href='http://www.catastro.minhap.es/INSPIRE/CadastralParcels/ES.SDGC.CP.Atom.xml' target='_blank' class='alert-link'>Servei INSPIRE-ATOM SDGC</a></i>";
			this.cache();
        	this.subscriptions();
        	this.bindEvents();
        	this.uiLoaded = false;                    	
            return this;
        },
        
        cache: function(){
        	var that = this;
        	that.container = $(that.containerId);
        },
        
        getWidget: function(){
        	return this;
        },
        
        drawButton: function(container){
        	var that = this;
        	$('<div/>').addClass('widget-button').addClass('widget-cadastre')
        	.on('click',function(){
        		$.publish('widgetActivated',{'target':this,'widget':that});
        		$.publish('trackEvent',{event:['_trackEvent', 'visor', 'widget_Cadastre']});
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
        	if(that.active   && data.tipusMunicipi){
        		$(that.containerId).empty();
        		var codi = data.codiCadastre;
        		var urlUrbana = that.rutaUrbanaCadastre.replace('_nom_',data.municipiCadastre);
        		urlUrbana = urlUrbana.replace('_provincia_',data.provinciaCodi);
        		urlUrbana = urlUrbana.replace(/_codi_/g,data.codiCadastre);
        		
        		var urlRural = that.rutaRuralCadastre.replace('_nom_',data.municipiCadastre);
        		urlRural = urlRural.replace('_provincia_',data.provinciaCodi);
        		urlRural = urlRural.replace(/_codi_/g,data.codiCadastre);
        		
        		if (codi){
        			$('<p></p>').addClass('text').html('Municipi de <b>' + data.municipi + '</b>').appendTo($(that.containerId));
        			$('<div></div>').addClass('list').append(
        			$('<a></a>', {
    					'href' : urlUrbana,
    					'class' : 'zip',
    					'target' : '_blank'
    				}).html(data.municipiCadastre + " urbana.zip")).append(
    					$('<span></span>',{'class':'glyphicon glyphicon-compressed'})).appendTo($(that.containerId));
        			
        			$('<div></div>').addClass('list').append($('<a></a>', {
    					'href' : urlRural,
    					'class' : 'zip',
    					'target' : '_blank'
    				}).html(data.municipiCadastre + " rústega.zip")).append(
        					$('<span></span>',{'class':'glyphicon glyphicon-compressed'})).appendTo($(that.containerId));
        			
        			$('<p></p>').appendTo($(that.containerId));
        			$('<div></div>').addClass('alert alert-info').html(that.m_SGDC).appendTo($(that.containerId));
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
   		define([], function(){return WidgetCadastre.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.WidgetCadastre = WidgetCadastre.init();
	
})( jQuery, window, document );