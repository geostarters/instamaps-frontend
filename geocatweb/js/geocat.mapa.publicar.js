/**
 * Funcionalitat de publicació del mapa
 * require: jquery, geocat.web, geocat.ajax, geocat.utils, geocat.canvas, geocat.legend, geocat.config, dropzone, share, lang, bootstrap.switch, bootstrap.formhelpers, bootstrap.colorpallete, jquery.url 
 */
(function ( $, window, document, undefined ) {
   "use strict";
   	var Publicar = {
        init: function() {
        	this.containerId = '#funcio_publicar',
        	//By using the object PROJ you can reference it with "this" (i.e. this.whatever();), easy peazy "namespacing"
            //Example:
        	this.buttonClass = "bt_publicar",
        	this.disabledClass = "bt_publicar_disabled",
        	this.cache();
        	this.subscriptions();
        	this.button
        	this.bindEvents();
                                    
            return this;
        },
        
        cache: function(){
        	this.container = $(this.containerId);
        },
        
        addControl: function(){
        	var that = this;
        	if(arguments[0]){ //container id
        		this.containerId = arguments[0];
        		this.container = $(this.containerId);
        	}
        	        	
        	if(arguments[1]){ //uid
        		this.uid = arguments[1];
        	}
        	
        	if(arguments[2]){ //collaborateuid
        		this.collaborateuid = arguments[2];
        	}
        	
        	this._addHtmlInterficiePublicar();
        	
        	if(this.collaborateuid){
        		this._addHtmlInterficiePublicarDisable();
        	}
        	
        	this._addHtmlModalPublicar();
        	this._addHtmlModalIframePublicar();
        	
        	//require web
        	if (isRandomUser(this.uid)){
        		this.button.on('click',function(){
        			$('.modal').modal('hide');
        			_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', 'pre-publicar', 1]);
        			
        			$('#dialgo_publicar_random').modal('show');
        			
        			$('#dialgo_publicar_random .bt-sessio').on('click',function(){
        				$(window).off('beforeunload');
        				$(window).off('unload');
        				window.location = paramUrl.loginPage+"?from=mapa";
        			});
        			
        			$('#dialgo_publicar_random .bt_orange').on('click',function(){
        				$(window).off('beforeunload');
        				$(window).off('unload');
        				window.location = paramUrl.registrePage+"?from=mapa";
        			});
        		});		
        	}else{
        		//publicar el mapa solo para registrados
        		this.button.on('click',function(){
        			_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', 'pre-publicar', 1]);
        			
        			$.publish('reloadMapConfig','publicar/');
        			
        			$('#dialgo_publicar .btn-primary').on('click',function(){
        				that._loadPublicarData(false);
        			});
        		});
        	}
        },
        
        _updateModalPublicar: function(){
        	//actualizar los campos del dialogo publicar
			//console.debug(this.mapConfig);
        	
        	//require utils
			if (isDefaultMapTitle(this.mapConfig.nomAplicacio)) $('#nomAplicacioPub').val("");
			else $('#nomAplicacioPub').val(this.mapConfig.nomAplicacio);
			if (this.mapConfig.visibilitat == visibilitat_open){
				$('#visibilitat_chk').bootstrapSwitch('state', true, true);
				$('.protegit').hide();
			}else{
				$('#visibilitat_chk').bootstrapSwitch('state', false, false);
				if (this.mapConfig.clau){
					$('#is_map_protegit').iCheck('check');
					$('#map_clau').prop('disabled',true);
					$('#map_clau').val(randomString(10));
				}else{
					$('#is_map_protegit').iCheck('uncheck');
					$('#map_clau').prop('disabled',true);
					$('#map_clau').val('');
				}
			}
			if(this.mapConfig.options){
				$('#optDescripcio').val(this.mapConfig.options.description);
				$('#optTags').val(this.mapConfig.options.tags);	
				if (this.mapConfig.options.llegenda){
					$('#llegenda_chk').bootstrapSwitch('state', true, true);
				}else{
					$('#llegenda_chk').bootstrapSwitch('state', false, false);
				}				
			}
			
			this._createModalConfigDownload();

			$('#dialgo_publicar #nomAplicacioPub').removeClass("invalid");
			$( ".text_error" ).remove();
			$('.modal').modal('hide');
			$('#dialgo_publicar').modal('show');
			
			//aspecte
			if(this.mapConfig.options.barColor){
				$('#dv_fill_menu_bar').css('background-color',this.mapConfig.options.barColor);
			}
			
			if(this.mapConfig.options.textColor){
				$('#dv_color_text_bar').css('background-color',this.mapConfig.options.textColor);
			}
			
			if(this.mapConfig.options.fontType){
				$('.bfh-selectbox').bfhselectbox().bfhfonts({font: this.mapConfig.options.fontType});
			}
			
			//escut
			if(this.mapConfig.options.escut){
				$(".logo").prop('src',"/logos/"+this.mapConfig.options.escut);
			}
						
			
			//Dialeg publicar
			$('#publish-private').tooltip({
				placement : 'bottom',
				container : 'body'
			});
			$('#publish-public').tooltip({
				placement : 'bottom',
				container : 'body'
			});
						
			//Si mapconfig legend, activat, es mostra
			if(this.mapConfig.options != null && this.mapConfig.options.llegenda){
				//require geocat.legend
				createModalConfigLegend();
				$('#dialgo_publicar .modal-body .modal-legend').show();
			}else{
				$('#dialgo_publicar .modal-body .modal-legend').hide();
			}
			
			$('#llegenda-title-text').text(window.lang.convert('Llegenda'));
			$('#publish-public').text(window.lang.convert('Públic'));
			$('#publish-private').text(window.lang.convert('Privat'));
			$('#publish-legend-yes').text(window.lang.convert('Si'));
			$('#publish-legend-no').text(window.lang.convert('No'));
			$('#publish-warn-text').text(window.lang.convert('El mapa es publicarà amb la vista actual: àrea geogràfica, nivell de zoom i capes visibles'));
			
//			var urlMap = url('protocol')+'://'+url('hostname')+url('path')+'?businessId='+jQuery('#businessId').val()+"&id="+jQuery('#userId').val();
//			urlMap = urlMap.replace('mapa','visor');
			
			var v_url = window.location.href;
			if (!url('?id')){
				v_url += "&id="+$('#userId').val();
			}
			v_url = v_url.replace('localhost',DOMINI);			
			var urlMap = v_url.replace('mapa','visor');		
			urlMap = urlMap.replace('#no-back-button','');
			
			//$('#urlVisorMap').html('<a href="'+urlMap+'" target="_blank" lang="ca">Anar a la visualització del mapa&nbsp;&nbsp;<span class="glyphicon glyphicon-share-alt"></span></a>');
			$("#urlVisorMap a").attr("href", urlMap);
			$('#urlMap').val(urlMap);
			$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
			
			//require dropzone
			$('#file-logo').dropzone({ 
			    url: paramUrl.uploadLogo,
			    maxFilesize: 100,
			    maxFiles: 1,
			    paramName: "uploadfile",
			    maxThumbnailFilesize: 1,
			    acceptedFiles: 'image/*',
			    dictDefaultMessage: "<span lang='ca'>Arrossega aquí la teva imatge del teu escut o logo</span>",
			    init: function() {
			      var myDropZone = this;
			      this.on('success', function(file, json) {
			    	  //console.debug(file);
			    	  //console.debug(json);
			    	  myDropZone.removeAllFiles();
			    	  $(".logo").prop('src',"/logos/"+json.filePath);
			      });
			      /*
			      this.on('addedfile', function(file) {
			    	  console.debug(file);
			      });
			      
			      this.on('drop', function(file) {
			    	  console.debug(file);
			      });
			      */
			    }
			});
			
			//require colorPallete
		    $('#colorpalette_menu_bar').colorPalette()
		      .on('selectColor', function(e) {
		    	$("#dv_fill_menu_bar").css("background-color",e.color);
		    });
		    
		    $('#colorpalette_text_bar').colorPalette()
		      .on('selectColor', function(e) {
		    	$("#dv_color_text_bar").css("background-color",e.color);
		    });
			
		    //$('.bfh-selectbox').bfhselectbox().bfhfonts({font: 'Arial'});
		},
        
        _addHtmlInterficiePublicar: function(){
        	this.container.append(
    			'<div class="'+this.buttonClass+'" data-toggle="tooltip" data-lang-title="Desa\'l i decideix si fer-lo públic o privat" title="Desa\'l i decideix si fer-lo públic o privat">'+
    			'<span lang="ca">Publicar el mapa</span>'+
    			'</div>'
    		);
        	
        	this.button = $('.'+this.buttonClass);
        	
        	this.button.tooltip({
        		placement : 'right',
        		container : 'body'
        	});
        },
        
        _addHtmlInterficiePublicarDisable: function(){
        	this.container.children().removeClass(this.buttonClass).addClass(this.disabledClass);
        },
        
        _addHtmlModalPublicar: function(){
        	$.get("templates/modalPublicar.html",function(data){
        		//TODO ver como pasar el modal container
        		$('#mapa_modals').append(data);
        		
        		$('.make-switch').bootstrapSwitch();
            	//Configurar Llegenda
            	$('input[name="my-legend-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
            		if(state.value == true) {
            			//require geocat.legend
            			createModalConfigLegend();
            		}else{
            			$('#dialgo_publicar .modal-body .modal-legend').hide();
            		}
            	});	

            	$('#visibilitat_chk').on('switchChange.bootstrapSwitch', function(event, state) {
            		if(state.value == true) { //public
            			$('.protegit').hide();
            		}else{ //privat
            			$('.protegit').show();
            		}
            	});	
            	
            	$('#is_map_protegit').iCheck({
            	    checkboxClass: 'icheckbox_flat-blue',
            	    radioClass: 'iradio_flat-blue'
            	});	
            	
            	$('#is_map_protegit').on({
            		'ifChecked': function(event){
            			if (this.mapConfig.clau){
            				$('#map_clau').val(randomString(10));
            				$('#map_clau').prop('disabled',true);
            			}else{
            				$('#map_clau').prop('disabled',false);
            			}	
            		},
            		'ifUnchecked': function(event){
            			if (this.mapConfig.clau){
            				$('#map_clau').val('');
            			}else{
            				$('#map_clau').prop('disabled',true);
            			}
            		}
            	});
            	
            	$('#resetClau').on('click',function(){
            		var mapData = {
            			businessId: this.mapConfig.businessId,
            			uid: this.uid
            		};
            		//require ajax
            		resetClauMapa(mapData).then(function(results){
            			this.mapConfig.clau = null;
            			$('#map_clau').val('');
            		});
            	});
        		
        	});
        	
        	$.get("templates/modalPublicarRandom.html",function(data){
        		//TODO ver como pasar el modal container
        		$('#mapa_modals').append(data);
        	});
        	
        },
        
        _addHtmlModalIframePublicar: function(){
        	$.get("templates/modalIframePublicar.html",function(data){
        		//TODO ver como pasar el modal container
        		$('#mapa_modals').append(data);
        	});
        },
        
        _addShareButtons: function(){
        	$('#socialSharePublicar').html('');
        	var v_url = window.location.href;
        	if (!url('?id')){
        		v_url += "&id="+$('#userId').val();
        	}
        	v_url = v_url.replace('localhost',DOMINI);
        	v_url = v_url.replace('mapa','visor');
        	
        	//require ajax
        	shortUrl(v_url).then(function(results){
        		//require share
        		$('#socialSharePublicar').share({
        			networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
        			theme: 'square',
        			urlToShare: results.data.url
        		});
        		
        		$('#socialSharePublicar .pop-social').on('click', function(event){
        			_gaq.push(['_trackEvent', $(this).attr('data-from'), tipus_user+'compartir-publicar', $(this).attr('data-type'), 1]);
        			window.open($(this).attr('href'),'t','toolbar=0,resizable=1,status=0,width=640,height=528');
                    return false;
        		});				
        	});
        },
        
        _updateDownloadableData: function(){
        	var downloadableData = {};
        	$(".downloadable-subrow").each(function(index,element){
        		var businessId = $(element).attr('data-businessId');
        		var obj = {
    				chck : $(element).children( "div.icheckbox_flat-blue").hasClass('checked'),
    				businessId : businessId
        		};
        		if(!downloadableData[businessId]){
        			downloadableData[businessId] = [];			
        		}
        		downloadableData[businessId].push(obj);
        	});	
        	this.downloadableData = downloadableData;
        },
        
        _loadPublicarData: function(fromCompartir){
        	this.fromCompartir = fromCompartir;
        	//requiere utils
        	if(!fromCompartir){//Si no venim de compartir, fem validacions del dialeg de publicar
        		if(isBlank($('#dialgo_publicar #nomAplicacioPub').val())){
        			$('#dialgo_publicar #nomAplicacioPub').addClass("invalid");
        			$('#dialgo_publicar #nomAplicacioPub').nextAll('.text_error').remove();
        			$('#dialgo_publicar #nomAplicacioPub').after("<span class=\"text_error\" lang=\"ca\">"+window.lang.convert('El camp no pot estar buit')+"</span>");
        			return false;
        		}else if(isDefaultMapTitle($('#dialgo_publicar #nomAplicacioPub').val())){
        			$('#dialgo_publicar #nomAplicacioPub').addClass("invalid");
        			$('#dialgo_publicar #nomAplicacioPub').nextAll('.text_error').remove();
        			$('#dialgo_publicar #nomAplicacioPub').after("<span class=\"text_error\" lang=\"ca\">"+window.lang.convert("Introdueix un nom vàlid per a la publicació del mapa")+"</span>");
        			return false;
        		}
        	}
        	
        	$.publish('getMap','publicar/');
        },
        
        _publicarMapa: function(){
        	var that = this;
        	var options = {};
        	var _map = this.map;
        	options.tags = $('#dialgo_publicar #optTags').val();
        	options.description = $('#dialgo_publicar #optDescripcio').val();
        	options.center = _map.getCenter().lat+","+_map.getCenter().lng;
        	options.zoom = _map.getZoom();
        	options.bbox = _map.getBounds().toBBoxString();
        	
        	//aspecte
        	options.fontType = $('.bfh-selectbox input[type=hidden]').val();
        	options.textColor = rgb2hex($('#dv_color_text_bar').css('background-color'));
        	options.barColor = rgb2hex($('#dv_fill_menu_bar').css('background-color'));
        	if($(".logo").prop('src') != '/logos/blank.gif'){
        		var logo = $(".logo").prop('src').match(/([\w\d_-]*)\.?[^\\\/]*$/i)[0];
        		options.escut = logo;
        	}
        	
        	var visibilitat = visibilitat_open;
        	
        	if ($('#visibilitat_chk').bootstrapSwitch('state')){
        		visibilitat = visibilitat_open;
        	}else{
        		visibilitat = visibilitat_privat;
        	}
        		
        	//TODO de los botones ver nuevos botones
        	options.llegenda = $('#llegenda_chk').bootstrapSwitch('state');
        	
        	if(options.llegenda){
        		//TODO funcion en el modulo
        		//require geocat.legend
        		updateMapLegendData();
        	}
        	else{
        		mapLegend = {};
        	}
        	
        	//Revisio de capes amb permis de descarrega
        	this._updateDownloadableData();
        	
        	options.layers = true;
        	options.social = true;
        	options.fons = _map.getActiveMap();
        	options.fonsColor = _map.getMapColor();
        	options.idusr = $('#userId').val();
        	options.downloadable = downloadableData;
        	
        	options = JSON.stringify(options);
        		
        	var newMap = true;
        	
        	if ($('#businessId').val() != ""){
        		newMap = false;
        	}
        	
        	var layers = $(".leaflet-control-layers-selector").map(function(){
        		return {businessId: this.id.replace('input-',''), activa: $(this).is(':checked')};
        	}).get();
        	
        	var nomApp = $('#nomAplicacio').html();
        	
        	if(!that.fromCompartir) nomApp = $('#dialgo_publicar #nomAplicacioPub').val();
        	
        	var nomIndexacio=nomApp;			
        	(nomIndexacio.length > 100)?nomIndexacio=nomIndexacio.substring(0,100):nomIndexacio;			
        	nomIndexacio=nomIndexacio.replace(/[^0-9a-zA-Z ]/g, "");
        	nomIndexacio=nomIndexacio.replace(/\s/g, "-");
        	
        	var urlMap=urlMap+"&title="+nomIndexacio;
        	
        	$("#urlVisorMap a").attr("href", urlMap);
        	$('#urlMap').val(urlMap);
        	$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
        	
        	var data = {
        		nom: nomApp, //jQuery('#dialgo_publicar #nomAplicacio').val(),
        		uid: that.uid,
        		visibilitat: visibilitat,
        		tipusApp: 'vis',
        		options: options,
        		legend: JSON.stringify(mapLegend),
        		layers: JSON.stringify(layers)
        	};
        	
        	//Enregistrem tipus de fons i visibilitat
        	_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', visibilitat+"#"+_map.options.typeMap, 1]);

        	//crear los archivos en disco
        	var layersId = getBusinessIdOrigenLayers();
        	var laydata = {
        		uid: that.uid,
        		servidorWMSbusinessId: layersId
        	};
        	//require ajax
        	publicarCapesMapa(laydata);
        	
        	//Captura Map per la Galeria
        	//require geocat.canvas
        	capturaPantalla(CAPTURA_GALERIA);	
        	
        	if(!that.mapConfig.clau){
        		if($('#is_map_protegit').is(':checked')){
        			if($.trim($('#map_clau').val()) != ""){
        				data.clauVisor = $.trim($('#map_clau').val());
        			}
        		}
        		this._callPublicarMapa(data, newMap, that.fromCompartir);
        	}else{
        		if(!$('#is_map_protegit').is(':checked') || visibilitat == visibilitat_open){
        			var mapData = {
        				businessId: that.mapConfig.businessId,
        				uid: that.uid
        			};
        			//require ajax
        			resetClauMapa(mapData).then(function(results){
        				that.mapConfig.clau = null;
        				$('#map_clau').val('');
        				that._callPublicarMapa(data, newMap, that.fromCompartir);
        			});
        		}else{
        			that._callPublicarMapa(data, newMap, that.fromCompartir);
        		}
        	}
        },
        
        _callPublicarMapa: function(data, newMap, fromCompartir){
        	var that = this;
        	if (newMap){
        		//require ajax
        		createMap(data).then(function(results){
        			if (results.status == "ERROR"){
        				//TODO Mensaje de error
        			}else{
        				that.mapConfig = results.results;
        				that.mapConfig.options = $.parseJSON( that.mapConfig.options );
        				that.mapConfig.newMap = false;
        				var mapData = {
        					businessId: that.mapConfig.businessId,
        					uid: that.uid
        				};
        				//require ajax
        				publicarMapConfig(mapData);
        				
        				$('#businessId').val(that.mapConfig.businessId);
        			}
        		});
        	}else{
        		data.businessId = $('#businessId').val();
        		//require ajax
        		updateMap(data).then(function(results){
        			if (results.status == "ERROR"){
        				//TODO Mensaje de error
        			}else{
        				that.mapConfig = results.results;
        				that.mapConfig.options = $.parseJSON( that.mapConfig.options );
        				that.mapConfig.newMap = false;
        				var mapData = {
        					businessId: that.mapConfig.businessId,
        					uid: that.uid
        				};
        				
        				//require ajax
        				publicarMapConfig(mapData);
        				
        				if(!fromCompartir){
        					$('#dialgo_publicar').modal('hide');
        					//update map name en el control de capas
        					$('#nomAplicacio').text(that.mapConfig.nomAplicacio);
        					$('#nomAplicacio').editable('setValue', that.mapConfig.nomAplicacio);
        					$('#dialgo_url_iframe').modal('show');					
        					that._addShareButtons(); 
        				}
        			}
        		});
        	}
        },
        
        _createModalConfigDownload: function(){
        	var count = 0;
        	var html = '<label class="control-label" lang="ca">'+
        		window.lang.convert('Capes reutilitzables pels altres usuaris:')+
        		'</label>&nbsp;<span class="glyphicon glyphicon-download-alt"></span>';
        	
        	html += '<div id="div_downloadable">'+
        			'<div class="separate-downloadable-row-all"></div>'+
        			'<div class="downloadable-subrow-all">'+
        			'<div class="col-md-9 downloadable-name-all">'+
        				window.lang.convert('Totes')+
        			'</div>'+
        			'<input id="downloadable-chck-all" class="col-md-1 download-chck" type="checkbox">'+
        			'</div>';
        	html += '<div class="separate-downloadable-row-all"></div>';	
        	
        	$.each(controlCapes._layers, function(i, item){
        		var layer = item.layer;
        		var layerName = layer.options.nom;
        		var checked = "";
        		
        		var tipusLayer = "";
        		if(layer.options.tipus) tipusLayer = layer.options.tipus;
        		
        		//Si no es WMS
        		if(tipusLayer.indexOf(t_wms)== -1){
        			//Si té checkec definit
        			if(downloadableData[layer.options.businessId]){
        				if(downloadableData[layer.options.businessId][0].chck) checked = 'checked="checked"';
        			}else{//Sino per defecte check
        				checked = 'checked="checked"'
        			}		
        			
        			html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'">'+
        						'<div class="col-md-9 downloadable-name">'+
        							layerName+
        						'</div>'+
        						'<input id="downloadable-chck" class="col-md-1 downloadable-chck" type="checkbox" '+checked+' >'+
        					'</div>';		
        			html+='<div class="separate-downloadable-row"></div>';			
        		}
        	});	
        	
        	$('#dialgo_publicar .modal-body .modal-downloadable').html(html);	
        	
        	$('#div_downloadable input').iCheck({
        	    checkboxClass: 'icheckbox_flat-blue',
        	    radioClass: 'iradio_flat-blue'
        	});
        	
        	$('.downloadable-subrow-all input').on({
        		'ifChecked': function(event){
        			$('.downloadable-subrow input').iCheck('check');
        		},
        		'ifUnchecked': function(event){
        			$('.downloadable-subrow input').iCheck('uncheck');
        		} 
        	});
        },
        
        /**********Events**************/
        
        bindEvents: function(){
        	//$.publish('galeria/load',{mas:1,del:"asdasdasd"});
        },
        
        subscriptions: function() {
        	var that = this;
        	$.subscribe('publicar/loadMapConfig',function(e, data){
        		that.mapConfig = data;
        		that._updateModalPublicar();
        	});
        	
        	$.subscribe('publicar/setMap',function(e, data){
        		that.map = data;
        		that._publicarMapa();
        	});
        	
        	//Here is where the Observer Pattern kicks in nicely
            //I'm done with the listeners, and I'm letting everyone that is subscribed know that.
            //You can also namespace easily with "/" like so: ("enable/Select") or ("enable/Move") etc.
            $.publish( "listeners/are/set/up" );
        }
   	}
   
   	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return Publicar.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.Publicar = Publicar.init();
})( jQuery, window, document );