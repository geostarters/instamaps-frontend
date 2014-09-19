/**
 * Funcionalitat edicio nom del mapa
 * */
function addFuncioRenameMap(){
	
	$('#nomAplicacio').editable({
		type: 'text',
		mode: 'inline',
	    validate: function(value) {
	        if($.trim(value) == '') {
	        	return {newValue: this.innerHTML};
	        }
        },		
		success: function(response, newValue) {
			var data = {
			 	businessId: url('?businessid'), 
			 	nom: newValue, 
			 	uid: $.cookie('uid')
			}
			updateMapName(data).then(function(results){
				_gaq.push(['_trackEvent', 'mapa', tipus_user+'editar nom aplicacio', 'label editar nom', 1]);
				if(results.status=='OK'){
					$('#dialgo_publicar #nomAplicacioPub').val(results.results);
					mapConfig.nomAplicacio = results.results;
				} 
			},function(results){
				$('#nomAplicacio').val(mapConfig.nomAplicacio);				
			});	
		}
	});	
}

/**
 * Funcionalitats edicio noms capes 
 * */

function updateEditableElements(){
	//console.debug('updateEditableElements');
	$('.leaflet-name .editable').editable({
		type: 'text',
		mode: 'inline',
	    validate: function(value) {
		        if($.trim(value) == '') {
		        	return {newValue: this.innerHTML};
		        }
	    },
		success: function(response, newValue) {
				map.closePopup();//Perque no queden desactualitzats
				var id = this.id;
				var idParent = this.idParent;
				//Controlem si es sublayer
				var editableLayer;
				if(idParent){
					editableLayer = controlCapes._layers[this.idParent]._layers[this.id];
				}else{
					editableLayer = controlCapes._layers[this.id];
				}
				
				if(typeof url('?businessid') == "string"){
					var data = {
					 	businessId: editableLayer.layer.options.businessId, //url('?businessid') 
					 	uid: $.cookie('uid'),
					 	serverName: newValue
					 }
					var oldName = this.innerHTML;
					
					updateServidorWMSName(data).then(function(results){
						if(results.status==='OK'){
						_gaq.push(['_trackEvent', 'mapa', tipus_user+'editar nom capa', 'label editar nom', 1]);
//						console.debug('udpate map name OK');
						editableLayer.name = newValue;
						editableLayer.layer.options.nom = newValue;
					}else{
						editableLayer.name = oldName;
						$('.leaflet-name label span#'+id).text(results.results.nom);
					}				
				},function(results){
					editableLayer.name = oldName;
					var obj = $('.leaflet-name label span#'+id).text();
					$('.leaflet-name label span#'+id).text(oldName);
				});	
			}else{
				editableLayer.name = newValue;
				editableLayer.layer.options.nom = newValue;
			}		
	 }
	});
	
    $('.leaflet-name .editable').on('shown', function(e, editable) {
        console.debug('shown editable:'+editable);
        jQuery('.opcio-conf').hide();
        jQuery('.subopcio-conf').hide();
    });
    $('.leaflet-name .editable').on('hidden', function(e, editable) {
    	console.debug('hidden editable:'+editable);
        jQuery('.opcio-conf').show();
    });    
}

//function updateEditableElementsVisor(){}

/**
 * Funcionalitat de descarrega de capes
 * */

function addFuncioDownloadLayer(from){
	
	//Si la capa conté polígons no es podrà descarregar en format GPX
	$('#modal_download_layer').on('show.bs.modal', function (e) {
		  if(download_layer.layer.options.geometryType 
				  && download_layer.layer.options.geometryType==t_polygon){
			  $("#select-download-format option[value='GPX#.gpx']").attr('disabled','disabled');	
		  }else{
			  $("#select-download-format option[value='GPX#.gpx']").removeAttr('disabled');
		  }
	});
	
	jQuery('#select-download-format').change(function() {	
		var ext = jQuery(this).val();
		if ((ext=="KML#.kml")||(ext=="GPX#.gpx")){
		jQuery("#select-download-epsg").val("EPSG:4326").attr('disabled',true);
		}else{
			jQuery("#select-download-epsg").attr('disabled',false);	
		}
	});		
	
		
	$('#bt_download_accept').on('click', function(evt){
		var formatOUT = $('#select-download-format').val();
		var epsgOUT = $('#select-download-epsg').val();
		var filename = $('#input-download-name').val();
		var layer_GeoJSON = download_layer.layer.toGeoJSONcustom();
		for(var i=0;i<layer_GeoJSON.features.length;i++){
			layer_GeoJSON.features[i].properties.tipus = "downloaded";
		}

		var data = {
			cmb_formatOUT: formatOUT,
			cmb_epsgOUT: epsgOUT,
			layer_name: filename,
			fileIN: JSON.stringify(layer_GeoJSON)
		};
		
		_gaq.push(['_trackEvent', from, tipus_user+'descarregar capa', formatOUT+"-"+epsgOUT, 1]);
		getDownloadLayer(data).then(function(results){
			results = results.trim();
			if (results == "ERROR"){
				//alert("Error 1");
				$('#modal-body-download-error').show();
				$('#modal-body-download').hide();
				$('#modal_download_layer .modal-footer').hide();
				$('#modal_download_layer').modal('show');
			}else{
				window.open(GEOCAT02+results,'_blank');
			}
		},function(results){
			$('#modal-body-download-error').show();
			$('#modal-body-download').hide();
			$('#modal_download_layer .modal-footer').hide();
			$('#modal_download_layer').modal('show');
		});
		
	});	
	
}

/**
 * Funcionalitat remove layers
 **/

function addFuncioRemoveLayer(){
	$('#dialog_delete_capa .btn-danger').on('click', function(event){
		var $this = $(this);
		var data = $this.data("data");
		var obj = $this.data("obj");
		
			removeServerToMap(data).then(function(results){
			if(results.status==='OK'){
			
//				this.myRemoveLayer(obj);
				map.closePopup();
				map.removeLayer(obj.layer);
				//Eliminem la capa de controlCapes
				controlCapes.removeLayer(obj);
				
				//actualitzem valors zindex de la resta si no es sublayer
				if(!obj.sublayer){
					var removeZIndex = obj.layer.options.zIndex;
					controlCapes._lastZIndex--;
					var aux = controlCapes._layers;
					for (var i in aux) {
						if (aux[i].layer.options.zIndex > removeZIndex) aux[i].layer.options.zIndex--;
					}
					//Eliminem les seves sublayers en cas que tingui
					for(indexSublayer in obj._layers){
						map.removeLayer(map._layers[indexSublayer]);
					}
				}

				//Actualitzem capaUsrActiva
				if(capaUsrActiva!=null && capaUsrActiva.options.businessId == obj.layer.options.businessId){
					capaUsrActiva.removeEventListener('layeradd');
					capaUsrActiva = null;
				}				
				
				deleteServerRemoved(data).then(function(results){
					//se borran del listado de servidores
				});
			}else{
				return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
			}				
		},function(results){
			return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
		});	
	});	
}

/**
 * Funcionalitat addToolTips Panell de capes
 **/

function addTooltipsConfOptions(businessId){
	
	$(".conf-"+businessId+".leaflet-up").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("puja")
	});	
	
	$(".conf-"+businessId+".leaflet-down").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("baixa")
	});		
	
	$(".conf-"+businessId+".leaflet-remove").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("elimina")
	});	
	
	$(".conf-"+businessId+".leaflet-download").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("descarrega")
	});		
}

