var group_sortable1=null;
var group_sortable2=null;

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
			 	uid: Cookies.get('uid')
			}
			updateMapName(data).then(function(results){
				$.publish('analyticsEvent',{event:['mapa', tipus_user+'editar nom aplicacio', 'label editar nom', 1]});

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



function reOrderGroupsAndLayers(action){
	var z_order=-1,
	_groupName, 
	_groupId, 
	_groupSubId, 
	_businessId, 
	_expanded;
	
	$("div.leaflet-control-accordion-layers").each(function( index, element ) {
		var $this = $(this);
		var gr=$this.children("label").children('span.span_ac');
		_groupId=index;
		_groupName=gr.text();
		var _exp=$this.children("label").children('i.label_gl');
		var _id=$(_exp).attr("id");
		_expanded=true;
		if($('#'+_id).hasClass('glyphicon-triangle-right')){
			_expanded=false;
		}
		$this.children("ol.ac-large").children("li.leaflet-row").each(function(){
			$this; // parent li
			_businessId=this.id.replace("LI-",""); // child li
			z_order=z_order+1;
			
			if(action){
				controlCapes.updateTreeGroupLayers(_groupId,_groupName,_businessId,z_order,_expanded).then(function(resp_Layer){
				if(resp_Layer){
					var data = {
						mapBusinessId: url('?businessid'),
						businessId: resp_Layer.options.businessId, //url('?businessid')
						uid: Cookies.get('uid'),
						options: JSON.stringify(resp_Layer.options.group)
					 };
					
					var data2 = {
						servidorWMSbusinessId:resp_Layer.options.businessId,
						businessId:url('?businessid'), //url('?businessid')
						uid: Cookies.get('uid'),
						order: z_order
					 };
		
					updateGroupsLayerGroup(data,data2);
				}
				});
			}
		});
	});
}

function updateGroupsLayerGroup(data,data2){
	updateServidorWMSGroup(data).then(function(results){
		if(results.status==='OK'){
			if(data2){
				//TODO validar si es necesario hacer esta llamada
				updateServerOrderToMap(data2).then(function(results) {
					if (results.status != 'OK')
						return;// SI no ha anat be el canvi a BD. que
								// no es faci tampoc a client, i es
								// mostri un error
				}, function(results) {
					return;// SI no ha anat be el canvi a BD. que no es
							// faci tampoc a client, i es mostri un
							// error
				});
			}
		}
	});
}

function refreshSortablesElements(){
	updateSortablesElements();
}

function updateSortablesElements(){
	if(getModeMapa()){
		group_sortable1 = $("ol.leaflet-control-layers-overlays").sortable({
			connectWith: "ol.leaflet-control-layers-overlays",
			handle: ".label_ac", //hadle para el drag issue 540
			change: function( event, ui ) {
				setTimeout(function(){ reOrderGroupsAndLayers(true); }, 1000);
			}
		});

		group_sortable2 = $("ol.ac-large").sortable({
			connectWith: "ol.ac-large",
			stop: function( event, ui ) {
				reOrderGroupsAndLayers(true);
			}
		});
	}
}


/**
 * Funcionalitats edicio noms capes
 * */
function updateEditableElements(){
	$('.label_ac .editable').editable({
		type: 'text',
		mode: 'inline',
		validate: function(value) {
			if($.trim(value) == '') {
				return {newValue: this.innerHTML};
			}
		},
		success: function(response, newName) {
			var oldName=this.groupName;
			var resp_Layer=	controlCapes.updateGroupName(oldName,newName,this.groupId);
			for(i=0;i < resp_Layer.length;i++){
				var data = {
					mapBusinessId: url('?businessid'),
				 	businessId: resp_Layer[i].options.businessId, //url('?businessid')
				 	uid: Cookies.get('uid'),
				 	options: JSON.stringify(resp_Layer[i].options.group)
				 };
				updateGroupsLayerGroup(data,null);
			}
		}
	});

	 $('.label_ac .editable').on('shown', function(e, editable) {
		 jQuery('.group-conf').hide();
	 });
		
	 $('.label_ac .editable').on('hidden', function(e, editable) {
		 jQuery('.group-conf').show();
	 });

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
			 var op="";
			 if(editableLayer.layer.options.tipus.indexOf(t_wms) != -1){
				 op="##"+ editableLayer.layer.options.opacity;
			 }
			 var data = {
				businessId: editableLayer.layer.options.businessId, //url('?businessid')
				uid: Cookies.get('uid'),
				serverName: newValue + op
			 };
			 var oldName = this.innerHTML;
			 
			 updateServidorWMSName(data).then(function(results){
				 if(results.status==='OK'){
					 $.publish('analyticsEvent',{event:['mapa', tipus_user+'editar nom capa', 'label editar nom', 1]});

					 var layerName=newValue;			
				    	(layerName.length > 71)?layerName=layerName.substring(0,71)+"...":layerName;		
				    	
					 //editableLayer.name = newValue;
				     editableLayer.name = layerName;	
					 editableLayer.layer.options.nom = newValue;
					 $('.leaflet-name label span#'+id).text(layerName);
					 if(editableLayer.layer.options.businessId == $("#mapLegendEdicio").data("businessid")){
						 $(".titol-legend").html(newValue);
					 }
				 }else{
					 editableLayer.name = oldName;
					 $('.leaflet-name label span#'+id).text(results.results.nom);
				 }
			 },function(results){
				 editableLayer.name = oldName;
				 var obj = $('.leaflet-name label span#'+id).text();
				 $('.leaflet-name label span#'+id).text(oldName);
			 });
		 }
	 });

	 $('.leaflet-name .editable').on('shown', function(e, editable) {
		 jQuery('.opcio-conf').hide();
		 jQuery('.subopcio-conf').hide();
		 jQuery('.leaflet-data-table').hide();
	 });
	 $('.leaflet-name .editable').on('hidden', function(e, editable) {
		 jQuery('.opcio-conf').show();
		 jQuery('.leaflet-data-table').show();
	 });
}

/**
 * Funcionalitat de descarrega de capes
 * */
function addFuncioDownloadLayer(from){
	addHtmlModalDownloadLayer(from);
}

/**
 * Funcionalitat remove layers
 **/
function removeAtomicLayer(data,matriuObj){
	removeServerToMap(data).then(function(results){
		if(results.status==='OK'){
			for(var j=0; j < matriuObj.length;j++){
			var obj=matriuObj[j];
			map.closePopup();
			map.removeLayer(obj.layer);
			//Eliminem la capa de controlCapes
			controlCapes.removeLayer(obj);
			//Esborrem la llegenda de la capa eliminada
			////emptyMapLegendEdicio(obj.layer);
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

			}
		}else{
			return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
		}
	},function(results){
		return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
	});
}

function addFuncioRemoveLayer(){
	addHtmlModalRemoveLayer();
	addHtmlModalRemoveGroup();
}

/**
 * Funcionalitat addToolTips Panell de capes
 **/
function addTooltipsConfOptions(businessId){

	$(".conf-"+businessId+".leaflet-up").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.translate("puja")
	});

	$(".conf-"+businessId+".leaflet-down").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.translate("baixa")
	});

	$(".conf-"+businessId+".leaflet-remove").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.translate("elimina")
	});

	$(".conf-"+businessId+".leaflet-download").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.translate("descarrega")
	});

	$(".data-table-"+businessId+".leaflet-data-table").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.translate("dades")
	});
}

function addFuncioEtiquetesCapa(){
	addHtmlModalEtiquetesLayer();
}

function addHtmlModalDownloadLayer(from){
	$.get("/geocatweb/templates/modalDownloadLayer.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data);
		
		//Si la capa conté polígons no es podrà descarregar en format GPX
		$('#modal_download_layer').on('show.bs.modal', function (e) {
			  if(download_layer.layer.options.geometryType
					  && download_layer.layer.options.geometryType==t_polygon){
				  $("#select-download-format option[value='GPX#.gpx']").attr('disabled','disabled');
			  }else{
				  $("#select-download-format option[value='GPX#.gpx']").removeAttr('disabled');
			  }

			  //Reset the modal values
			  $("#input-download-name").val("");
			  $("#select-download-format").val($("#select-download-format option:first").val());
			  $("#select-download-epsg").val($("#select-download-epsg option:first").val());
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

			var data = {
				cmb_formatOUT: formatOUT,
				cmb_epsgOUT: epsgOUT,
				layer_name: filename,
				fileIN: JSON.stringify(layer_GeoJSON)
			};

			$.publish('analyticsEvent',{event:[from, tipus_user+'descarregar capa', formatOUT+"-"+epsgOUT, 1]});

			getDownloadLayer(data).then(function(results){
				results = results.trim();
				if (results == "ERROR"){
					$('#modal-body-download-error').show();
					$('#modal-body-download').hide();
					$('#modal_download_layer .modal-footer').hide();
					$('#modal_download_layer').modal('show');
				}else{
					var iframe = $("#downloadFrame");
					if(0 == iframe.length)
					{

						iframe = $("<iframe/>").attr({
							id: "downloadFrame",
							style: "visibility:hidden;display:none"
						}).appendTo('#modal_download_layer');
					}
					
					iframe.attr("src", GEOCAT02 + results)

				}
			},function(results){
				$('#modal-body-download-error').show();
				$('#modal-body-download').hide();
				$('#modal_download_layer .modal-footer').hide();
				$('#modal_download_layer').modal('show');
			});

		});
		
	});
}

function addHtmlModalRemoveLayer(){
	$.get("templates/modalRemoveLayer.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data);  
		
		$('#dialog_delete_capa .btn-danger').on('click', function(event){
			var $this = $(this);
			var data = $this.data("data");
			var obj = $this.data("obj");
			var matriuObj=[];
			matriuObj.push(obj);
			removeAtomicLayer(data,matriuObj);
		});
	});
}

function addHtmlModalRemoveGroup(){
	$.get("templates/modalRemoveGroup.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data); 
		
		//Esborra grup capes
		$('#dialog_delete_group .btn-danger').on('click', function(event){
			var $this = $(this);
			var group = $this.data("group");
			var matriuCapesGroup=controlCapes.getLayersFromGroupId(group.groupId,group.groupName);
			var lbusinessId = [];
			var matriuObj=[];
				for(i=0; i < matriuCapesGroup.length;i++){
					var obj;
					var layerIdParent = matriuCapesGroup[i].layerIdParent;
					if(!layerIdParent){
						obj = matriuCapesGroup[i];
						lbusinessId.push(obj.layer.options.businessId);
						for(j in obj._layers){
							lbusinessId.push(obj._layers[j].layer.options.businessId);
						}
					}else{
						obj =matriuCapesGroup[i];
						lbusinessId.push(obj.layer.options.businessId);
					}
					matriuObj.push(obj);
					if(!obj.overlay) {
						return;
					}
				}

				if(typeof url('?businessid') == "string"){
					var data = {
						businessId: url('?businessid'),
						uid: Cookies.get('uid'),
						servidorWMSbusinessId:lbusinessId.toString()
					};
					removeAtomicLayer(data,matriuObj);
				}

				controlCapes.removeGroup(group.groupName,group.groupId);
		});
	});
}

function addHtmlModalEtiquetesLayer(){
	$.get("templates/modalEtiquetesLayer.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data); 
		
		$('#colorpalette_etiqueta').colorPalette().on('selectColor', function(e) {   	
			$('#dv_color_etiqueta').css('background-color',e.color);		
		});
		
		$('#colorpalette_caixa_etiqueta').colorPalette().on('selectColor', function(e) {   	
			$('#dv_color_caixa_etiqueta').css('background-color',e.color);		
		});
		
		/*$('#dialog_etiquetes_capa .btn-success').on('click', function (e) {
			
			if (jQuery('#dataFieldEtiqueta').val()!=undefined && jQuery('#dataFieldEtiqueta').val()=="---"){
				alert("Cal escollir un camp per etiquetar");
			}
			else {
				var capaLeafletId = $('#dialog_etiquetes_capa #leafletIdCapaEtiqueta').val();
				var capaLeafletIdControl = $('#dialog_etiquetes_capa #leafletIdCapaEtiquetaControl').val();
				var color = rgb2hex($('.color_etiqueta').css('background-color'));
				var zoomInicial = $( "#slider" ).slider( "values", 0 );
				var zoomFinal = $( "#slider" ).slider( "values", 1 );
				var options = {
						campEtiqueta:jQuery('#dataFieldEtiqueta').val(),
						fontFamily:jQuery('#font-family').val(),
						fontSize:jQuery('#font-size').val(),
						fontStyle:jQuery('#font-style').val(),
						fontColor:color,
						opcionsVis:$("input[name=etiqueta]:checked").val(),
						zoomInicial:zoomInicial,
						zoomFinal:zoomFinal
				};
				var layerMap=map._layers[capaLeafletId];
				var optionsMap;
				if (layerMap==undefined) {
					layerMap = controlCapes._layers[capaLeafletId];
					optionsMap=layerMap.layer.options;
				}
				else optionsMap=layerMap.options;
				
				var data={
						businessId: $('#dialog_etiquetes_capa #businessIdCapaEtiqueta').val(),
						uid: Cookies.get('uid'),
						options:  JSON.stringify(options),
						nom:optionsMap.nom,
						tipus:optionsMap.tipusRang,
						geometryType:optionsMap.geometryType
				};
				updateVisualitzacioLayer(data).then(function(results){
					reloadVisualitzacioLayer(layerMap, results.visualitzacio, results.layer, map);
				});
			}
		});*/
	});
}
