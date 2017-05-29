//Requires leafletPip
;(function(global, $)
{

	var PopupManager = function(options){
		return new PopupManager.init(options);
	}

	PopupManager.prototype = {

		options: {
			addSublayers: false,
			hideExtraTabs: true,
			maxVisibleTabs: 1,
			id: 'mng',
			class: 'popup',
			html: ''
		},

		numTabs: 0,

		_getNameField: function(feature){
			var name_field = "";
			if (feature.properties.data!=undefined){
				if (feature.properties.data.nom && !isBusinessId(feature.properties.data.nom)){
					return feature.properties.data.nom;
				}else if (feature.properties.data.Nom && !isBusinessId(feature.properties.data.Nom)){
					return feature.properties.data.Nom;
				}else if (feature.properties.data.NOM && !isBusinessId(feature.properties.data.NOM)){
					return feature.properties.data.NOM;
				}else if(feature.properties.data.name && !isBusinessId(feature.properties.data.name)){
					return feature.properties.data.name;
				}else if(feature.properties.data.Name && !isBusinessId(feature.properties.data.Name)){
					return feature.properties.data.Name;
				}else if(feature.properties.data.NAME && !isBusinessId(feature.properties.data.NAME)){
					return feature.properties.data.NAME;
				}else if(feature.properties.data.nombre && !isBusinessId(feature.properties.data.nombre)){
					return feature.properties.data.nombre;
				}else if(feature.properties.data.Nombre && !isBusinessId(feature.properties.data.Nombre)){
					return feature.properties.data.Nombre;
				}else if(feature.properties.data.NOMBRE && !isBusinessId(feature.properties.data.NOMBRE)){
					return feature.properties.data.NOMBRE;
				}
			}
			else{
				if (feature.properties.nom && !isBusinessId(feature.properties.nom)){
					return feature.properties.nom;
				}else if (feature.properties.Nom && !isBusinessId(feature.properties.Nom)){
					return feature.properties.Nom;
				}else if (feature.properties.NOM && !isBusinessId(feature.properties.NOM)){
					return feature.properties.NOM;
				}else if(feature.properties.name && !isBusinessId(feature.properties.name)){
					return feature.properties.name;
				}else if(feature.properties.Name && !isBusinessId(feature.properties.Name)){
					return feature.properties.Name;
				}else if(feature.properties.NAME && !isBusinessId(feature.properties.NAME)){
					return feature.properties.NAME;
				}else if(feature.properties.nombre && !isBusinessId(feature.properties.nombre)){
					return feature.properties.nombre;
				}else if(feature.properties.Nombre && !isBusinessId(feature.properties.Nombre)){
					return feature.properties.Nombre;
				}else if(feature.properties.NOMBRE && !isBusinessId(feature.properties.NOMBRE)){
					return feature.properties.NOMBRE;
				}
			}
			return name_field;
		},
		
		_isADrawMarker: function(feature){
			if (key=='text' || key=='TEXT') isADrawMarker=true;
			else isADrawMarker=false;
			return isADrawMarker;
		},
		
		_getPropertiesHtml: function(feature,data,estil_do){
			var html="";
			var propFormat="";
			var capa=data.capa;
			if (capa.options!=undefined && capa.options.propFormat!=undefined) 	propFormat = capa.options.propFormat;
			var esVisor=data.esVisor;
			var origen=data.origen;
			var properties;
			if (feature.properties.data!=undefined) properties=feature.properties.data;
			else if (feature.properties!=undefined) properties=feature.properties;
			$.each( properties, function( key, value ) {
				if (key.toLowerCase()!="geomorigen" && key.toLowerCase()!="nomcapa" && key.toLowerCase()!="popupdata" &&
						key.toLowerCase()!="capanom" && key.toLowerCase()!="propname"){
					if(isValidValue(key) && isValidValue(value) && !validateWkt(value)){
						if (key != 'id' && key != 'businessId' && key != 'slotd50' && 
								key != 'NOM' && key != 'Nom' && key != 'nom' && 
								key != 'name' && key != 'Name' && key != 'NAME' &&
								key != 'nombre' && key != 'Nombre' && key != 'NOMBRE'){
							html+='<div class="popup_data_row">';
							var txt=value;
							if (!$.isNumeric(txt)) {
								txt = parseUrlTextPopUp(value, key);
								if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
									if (propFormat!=undefined && propFormat[key.toLowerCase()]!=undefined){
										txt= dataFormatter.formatValue(txt, propFormat[key.toLowerCase()]);
									}
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+
									(isBlank(txt)?window.lang.translate("Sense valor"):txt)+
									'</div>';
									html += '<div class="traffic-light-icon-empty"></div>';
								}else{
									html+='<div class="popup_data_img_iframe">'+txt+'</div>';
								}
							}
							else {
								if (propFormat!=undefined && propFormat[key.toLowerCase()]!=undefined){
									txt= dataFormatter.formatValue(txt, propFormat[key.toLowerCase()]);
								}
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
			
								if(undefined != capa.isPropertyNumeric && capa.isPropertyNumeric[key] && 
									(esVisor && visor.colorscalecontrol && ("" == origen)) || (!esVisor && ("" == origen)) || ("" != origen && (key == capa.options.trafficLightKey)))
								{
			
									var leafletid = (("undefined" !== typeof feature.properties.capaLeafletId) ? feature.properties.capaLeafletId : (capa.hasOwnProperty("layer") ? capa.layer._leaflet_id : ""));
									//Només ensenyem la icona del semafòric si és una capa no temàtica o bé si ho és però és semafòrica sense semàfor fixe (sempre que el camp sigui numèric)
									html+='<div class="traffic-light-icon" data-leafletid="' + leafletid + '" data-origen="' + origen + '" title="'+window.lang.translate('Temàtic per escala de color')+'"></div>';
									
								}
								else
								{
			
									html += '<div class="traffic-light-icon-empty"></div>';
			
								}
							}
							html+= '</div>';
							
						}
					}
				}
			});	
			return html;
		},
		_addGeometriesProps: function(feature, type){
			var html = "";
			if (type==t_marker && undefined!=feature.geometry && feature.geometry.type==t_point) {
				html+=this._addLatLongToMarker(feature);
			}
			else if(type == t_polyline && feature.properties.mida &&  undefined!=feature.geometry && feature.geometry.type==t_linestring){
				html+=this._addLengthToLine(feature);
			}else if(type == t_polygon && feature.properties.mida &&  undefined!=feature.geometry && feature.geometry.type==t_polygon){
				html+=this._addAreaToPolygon(feature);
			}
			return html;
		},
		_addLatLongToMarker:function(feature){
			    var html="";
				var auxLat = "";
				if (feature._latlng!=undefined) auxLat = feature._latlng.lat;
				else if (feature.geometry!=undefined){
					if(feature.geometry.coordinates!=undefined){
						auxLat = feature.geometry.coordinates[0];
					}
				}
				auxLat = auxLat.toFixed(5);
				var auxLon = "";
				if (feature._latlng!=undefined) auxLon = feature._latlng.lng;
				else if (feature.geometry!=undefined){
					if(feature.geometry.coordinates!=undefined){
						auxLon = feature.geometry.coordinates[1];
					}
				}				
				auxLon = auxLon.toFixed(5);			
				html+='<div id="mida_pres"><b>'+window.lang.translate('Longitud')+':</b> '+auxLon+',<b>'+window.lang.translate('Latitud')+':</b> '+auxLat+'</div>';
				return html;
		},
		_addLengthToLine: function(feature){
			var html="";
			html+='<div id="mida_pres"><b>'+window.lang.translate('Longitud')+':</b> '+feature.properties.mida+'</div>';
			return html;
		},
		_addAreaToPolygon: function(feature){
			var html="";
			if (feature.properties.mida.indexOf("NaN")==-1)	html+='<div id="mida_pres"><b>'+window.lang.translate('Àrea')+':</b> '+feature.properties.mida+'</div>';
			else html+='<div id="mida_pres"><b>'+window.lang.translate('Àrea')+':</b> '+L.GeometryUtil.readableArea(L.GeometryUtil.geodesicArea(feature.getLatLngs()),true)+'</div>';
			return html;
		},
		_addActionButtons: function(feature,data){
			var editable=data.editable;
			var type=data.type;
			var origen=data.origen;
			var html="";
			
			if(editable){
				html+= '<div id="footer_edit"  class="modal-footer">'
					+'<ul class="bs-popup">'
						+'<li class="edicio-popup"><a id="feature_edit##'+feature._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="geostart-palette gris-semifosc font18" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Estils')+'"></span></a>   </li>';
						if(type == t_polyline || type == t_polygon){
							html+='<li class="edicio-popup"><a id="feature_move##'+feature._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-pencil gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Editar')+'"></span></a>   </li>';
						}	
						else {
							html+='<li class="edicio-popup"><a id="feature_move##'+feature._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-move gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Moure')+'"></span></a>   </li>';
						}
						html+='<li class="edicio-popup"><a id="feature_remove##'+feature._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-trash gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Esborrar')+'"></span></a>   </li>'
						+'<li class="edicio-popup"><a id="feature_data_table##'+feature._leaflet_id+'##'+type+'##'+feature.properties.capaLeafletId+'" lang="ca" href="#"><span class="glyphicon glyphicon-list-alt gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Dades')+'"></span></a>   </li>'
						+'<li class="edicio-popup"><a class="faqs_link" href="http://betaportal.icgc.cat/wordpress/faq-dinstamaps/#mapestematics" target="_blank"><span class="fa fa-question-circle-o gris-semifosc font21"></span></a></span></li>'
					+'</ul>'														
					+'</div>';	
			}else{
				var capaLeafletId = feature.properties.capaLeafletId;
				if(isValidValue(origen)) {
					capaLeafletId = origen; 
				}
				html+= '<div id="footer_edit"  class="modal-footer">'
					+'<ul class="bs-popup">'						
						+'<li class="consulta-popup"><a id="feature_data_table##'+feature._leaflet_id+'##'+type+'##'+capaLeafletId+'" lang="ca" href="#"><span class="glyphicon glyphicon-list-alt blau-left" data-toggle="tooltip" data-placement="right" title="'+window.lang.translate('Obrir la taula de dades')+'"></span></a>   </li>'
					+'</ul>'														
				+'</div>';			
			}
			return html;
		},
	
		getPropName: function(feature){
			var propName = "";
			var properties;
			if (feature.properties.data!=undefined) properties=feature.properties.data;
			else if (feature.properties!=undefined) properties=feature.properties;
			$.each( properties, function( key, value ) {
				propName = propName+key+",";
			});
			propName = propName.substr(0, propName.length-1);
			return propName;
		},
		
		getDataFieldValue: function(feature,estil_do){
			var properties,dataFieldValue;
			if (feature.properties.data!=undefined) properties=feature.properties.data;
			else if (feature.properties!=undefined) properties=feature.properties;
			$.each( properties, function( key, value ) {
				if(estil_do!=undefined && key.toLowerCase()==estil_do.dataField) dataFieldValue = value;
			});
			return dataFieldValue;
		},
		
		createPopupHtml: function(feature, data, dadesObertes, estil_do,dinamic){
			var html='';
			if (this._getNameField(feature)!='') html+='<h4 class="my-text-center">'+this._getNameField(feature)+'</h4>';
			html+='<div class="div_popup_visor"><div class="popup_pres">';
			html+=this._getPropertiesHtml(feature,data,estil_do);			
			if(!dadesObertes && !dinamic) html+=this._addGeometriesProps(feature,data.type);
			if(!dadesObertes && !dinamic) html+=this._addActionButtons(feature,data);
			html+='</div>'; //.popup_pres
			html+='</div>';//.div_popup_visor
			return html;
		},
		
		addEventsPopup: function(){
			//Afegim els events de clicks per al semafòric
			jQuery(document).on('click', ".traffic-light-icon", function(e) {

				e.stopImmediatePropagation();
				var layerId = $(this).data("leafletid");
				var parentId = $(this).data("origen");
				var key = $(this).prev().prev().text();
				var value = parseFloat($(this).prev().text());
				var layer = null;
				var control = null;
				if("" == parentId)
				{

					//És una capa no temàtica, hem de crear la de previsualització
					layer = controlCapes._layers[layerId].layer;
					control = Semaforic(self.isEditing);

				}
				else
				{

					//És una capa temàtica, mirem si és una capa semafòrica de previsualització
					layer = controlCapes._layers[parentId].layer;
					if(layer.hasOwnProperty("semaforics") && "undefined" !== typeof layer.semaforics[layerId])
						control = layer.semaforics[layerId];
					else
					{

						//Si hem arribat aquí és que és una capa semafòrica, utilitzem la capa actual
						control = Semaforic();
						var businessId = controlCapes._layers[parentId]._layers[layerId].layer.options.businessId;
						var options = JSON.parse(controlCapes._visLayers[businessId].options);
						var paletaEstils = [controlCapes._visLayers[businessId].estil[0].color,
							controlCapes._visLayers[businessId].estil[1].color,
							controlCapes._visLayers[businessId].estil[2].color
							]
						control.setVisualization(controlCapes._layers[parentId]._layers[layerId]);
						control.setLayer(controlCapes._visLayers[businessId]);
						control.setLayerOptions(controlCapes._options[businessId]);
						control.setPalette(paletaEstils, options.reverse);

					}

				}

				control.render($.Deferred(), key, value, layer).then(function(data) {
					if(!layer.hasOwnProperty("semaforics"))
						layer.semaforics = {};
				
					layer.semaforics[data] = control;
					//Canviem el valor de referència de la capa al control de capes si el conté
					var name = Semaforic.getUpdatedLayerName($("#" + layerId + ".editable").text(), value);
					if(self.isEditing)
						$("#" + layerId + ".editable").editable("setValue", name, true);
					else
						$("#" + layerId + ".editable").text(name);

				});

			});
			
			//Afegim events/accions al popUp
			jQuery(document).on('click', ".bs-popup li a", function(e) {
				e.stopImmediatePropagation();
				var accio;
				if(undefined != jQuery(this).attr('id') && jQuery(this).attr('id').indexOf('##')!=-1){	
					accio=jQuery(this).attr('id').split("##");				
				}
				
				if (accio!=undefined && accio[1]!=undefined) objEdicio.featureID=accio[1];
				
				if(undefined != accio[0] && accio[0].indexOf("feature_edit")!=-1){

					//Update modal estils, amb estil de la feature seleccionada
					var obj = map._layers[accio[1]];
					//console.debug(obj);
					if(obj.options.icon /*|| obj.options.icon.options.markerColor.indexOf("punt_r")!=-1*/){
						var icon = obj.options.icon.options;	
					}else if(obj._options){
						var icon = obj._options;
					}else{
						var icon = obj.options;
					}
					updateDialogStyleSelected(icon);
					
					if(accio[2].indexOf("marker")!=-1){
						obrirMenuModal('#dialog_estils_punts','toggle',from_creaPopup);
					}else if(accio[2].indexOf("polygon")!=-1){
						obrirMenuModal('#dialog_estils_arees','toggle',from_creaPopup);
					}else{
						obrirMenuModal('#dialog_estils_linies','toggle',from_creaPopup);
					}
				}else if(undefined != accio[0] && accio[0].indexOf("feature_data_table")!=-1){
			
					$('#modal_data_table').modal('show');
					var featureId=objEdicio.featureID;
					if (featureId==undefined) featureId=accio[2];
					if (map._layers[featureId]==undefined) {
						try{
							if (accio[6]!=undefined) featureId=accio[6];
							var props=map._layers[featureId].properties;
							if (props==undefined) props=map._layers[featureId].options;
							if (accio[3]==undefined)  fillModalDataTable(controlCapes._layers[accio[2]],props.businessId);
							else fillModalDataTable(controlCapes._layers[accio[3]],props.businessId);
						}
						catch(err){
							console.debug(err);
						}
					}
					else fillModalDataTable(controlCapes._layers[accio[3]],map._layers[featureId].properties.businessId);
				
				}else if(undefined != accio[0] && accio[0].indexOf("feature_remove")!=-1){
					map.closePopup();
					var data = {
			            businessId: map._layers[objEdicio.featureID].properties.businessId,
			            uid: Cookies.get('uid')
			        };
				
					var features = {
						type:"Feature",
						id: 3124,
						businessId: map._layers[objEdicio.featureID].properties.businessId,
						properties: map._layers[objEdicio.featureID].properties.data,
						estil: map._layers[objEdicio.featureID].properties.estil,
						geometry: map._layers[objEdicio.featureID].properties.feature.geometry
					};				
					
					features = JSON.stringify(features);
					
					var data = {
						businessId: map._layers[objEdicio.featureID].properties.capaBusinessId,//bID de la visualitzacio-capa
						uid: Cookies.get('uid'),
						features: features
					};
					var businessIdCapaOrigen=map._layers[objEdicio.featureID].properties.capaBusinessId;
					removeGeometriaFromVisualitzacio(data).then(function(results){
						if(results.status == 'OK'){						
							var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;
							var capaBusinessId = map._layers[objEdicio.featureID].properties.capaBusinessId;
							if(map._layers[capaLeafletId]!= undefined) map._layers[capaLeafletId].removeLayer(map._layers[objEdicio.featureID]);					
							if(map._layers[objEdicio.featureID]!= null) map.removeLayer(map._layers[objEdicio.featureID]);	
							if(map._layers[capaLeafletId]!= undefined) {
								updateFeatureCount(map._layers[capaLeafletId].options.businessId, null);
							}
							else {						
								updateFeatureCount(capaBusinessId, null);		
							}		
							 var layer = controlCapes._layers[capaLeafletId];
							//recarrego les sublayers de la capa modificada	
							actualitzacioTematic(layer,businessIdCapaOrigen,null,null,null,"baixa");
							
						}else{
							console.debug("ERROR deleteFeature");
						}
					},function(results){
						console.debug("ERROR deleteFeature");
					});					
				}else if(undefined != accio[0] && accio[0].indexOf("feature_text")!=-1){
					modeEditText();
				}else if(undefined != accio[0] && accio[0].indexOf("feature_move")!=-1){
					objEdicio.esticEnEdicio=true;
					var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;	
					objEdicio.capaEdicioLeafletId = capaLeafletId;//Ho guarda per despres poder actualitzar vis filles
					//Actualitzem capa activa
					if (capaUsrActiva){
						capaUsrActiva.removeEventListener('layeradd');
					}
					capaUsrActiva = map._layers[capaLeafletId];
					
					var capaEdicio = new L.FeatureGroup();
					capaEdicio.addLayer(map._layers[objEdicio.featureID]);
					capaUsrActiva.removeLayer(map._layers[objEdicio.featureID]);
					map.addLayer(capaEdicio);
					
					var opcionsSel={
							color: '#FF1EE5',
							"weight": 7,
							opacity: 0.6,
							dashArray: '1, 1',
							fill: true,
							fillColor: '#fe57a1',
							fillOpacity: 0.1
						};
					
					/*crt_Editing=new L.EditToolbar.SnapEdit(map, {
						featureGroup: capaEdicio,
						selectedPathOptions: opcionsSel,
						snapOptions: {
							guideLayer: guideLayers
						}
					});*/
					crt_Editing=new L.EditToolbar.Edit(map, {
						featureGroup: capaEdicio,
						selectedPathOptions: opcionsSel
					});
					crt_Editing.enable();
					
					//crt_Editing.enable();
					
					/*if(map._layers[objEdicio.featureID].properties.tipusFeature=="marker" && map._layers[objEdicio.featureID].options.isCanvas){
						crt_Editing=new L.EditToolbar.Edit(map, {
							featureGroup: capaEdicio,
							selectedPathOptions: opcionsSel
						});
						crt_Editing.enable();
					}
					else {
						crt_Editing=new L.EditToolbar.SnapEdit(map, {
							featureGroup: capaEdicio,
							selectedPathOptions: opcionsSel,
							snapOptions: {
								guideLayer: guideLayers
							}
						});
						crt_Editing.enable();
						//activarSnapping(capaEdicio);
					}*/
					
					//activarSnapping(capaEdicio);			
					
					map.closePopup();
					
				}else if(undefined != accio[0] && accio[0].indexOf("feature_no")!=-1){
					jQuery('.popup_pres').show();
					jQuery('.popup_edit').hide();
					
				}else if(undefined != accio[0] && accio[0].indexOf("feature_ok")!=-1){
					if(objEdicio.edicioPopup=='textFeature'){
						var txtTitol=jQuery('#titol_edit').val();
						var txtDesc=jQuery('#des_edit').val();
						if (txtDesc.indexOf("'")>-1) txtDesc = txtDesc.replaceAll("'",'"');
						updateFeatureNameDescr(map._layers[objEdicio.featureID],txtTitol,txtDesc);

					}else if(objEdicio.edicioPopup=='textCapa'){
						if(jQuery('#capa_edit').val()!=""){
							jQuery('#cmbCapesUsr option:selected').text(jQuery('#capa_edit').val());	
							jQuery('.popup_pres').show();
							jQuery('.popup_edit').hide();
						}else{
							alert(window.lang.translate('Has de posar un nom de capa'));	
						}
					}else if(objEdicio.edicioPopup=='nouCapa'){
						if(jQuery('#capa_edit').val()!=""){
							generaNovaCapaUsuari(map._layers[objEdicio.featureID],jQuery('#capa_edit').val());
						}else{
							alert(window.lang.translate('Has de posar un nom de capa'));	
						}
					}
				}else{
				//accio tanca
					map.closePopup();
				}
			});	
		},
		
		createPopupContents: function(matches)
		{

			var self = this;
			var options = self.options;

			var lis = [];
			var contents = [];
			var numVisibleTabs = matches.length;
			self.numTabs = matches.length;
			var hasHiddenTabs = numVisibleTabs > options.maxVisibleTabs && options.hideExtraTabs;
			numVisibleTabs = hasHiddenTabs ? options.maxVisibleTabs : numVisibleTabs;
			var popupWidth = 200;
			var tabWidth = popupWidth/numVisibleTabs;

			matches.sort(function(a, b) {
				if(a.isWMS && b.isWMS)
					return 0;
				else if(!a.isWMS)
					return -1;
				else if(!b.isWMS)
					return 1;
				else 
					return 0;
			});

			for(var i=0, len=matches.length; i<len; ++i)
			{

				var match = matches[i];
				var title = '';
				var content = '';
				if(match.isWMS)
				{

					title = match.name;
					if(match.isQueryable)
						content = match.content;

				}
				else
				{

					title = match.properties.capaNom;
					content = match.properties.popupData;

				}

				if('' != content)
				{
					if (1 < self.numTabs){
						lis.push(self.createTabTitle(title, i, tabWidth, (i<options.maxVisibleTabs)));
					}
					contents.push(self.createTabContent(content, i));
					
					
				}

			}

			if (self.numTabs>1){
				var html = '<div id="popup-' + options.id + '" class="' + options.class + '">' + 
					'<ul class="nav nav-tabs pagination nomargin">';
	
				if(hasHiddenTabs)
				{
				
	
					html += '<li id="popup-' + options.id + '-prev" data-tabOffset=0 class="margin1">' +
						'<a href="#" aria-label="Previous">' + 
						'<span aria-hidden="true" class="tabArrow">&laquo;</span></a></li>';
				}
	
				html += lis.join('');
	
				if(hasHiddenTabs)
				{
	
					html += '<li id="popup-' + options.id + '-next" class="margin1">' +
						'<a href="#" aria-label="Next">' +
						'<span aria-hidden="true" class="tabArrow">&raquo;</span></a></li>';
	
				}
	
				html += '</ul><div class="tab-content">' + contents.join('') + '</div></div>';
			}
			else {
				var html = '<div id="popup-' + options.id + '" class="' + options.class + '">' ;
				html += '<div class="tab-content">' + contents.join('') + '</div></div>';
			}
			self.options.html = html;

		},

		createTabTitle: function(name, index, tabWidth, isVisible)
		{

			var self = this;
			var options = self.options;
			var isActive = (0 == index);
			
			
			return '<li id="popup-' + options.id + '-tab-' + index + '" class="' + 
				(isActive ? ' active margin1' : 'margin1') + ' " style="' + 
				(isVisible ? '' : 'display:none') + '"><a href="#popup-' + 
				options.id + '-content-' + index + '" data-toggle="tab" class="popupTitleTab" style="' + 
				'width: ' + tabWidth + 'px; text-overflow: ellipsis;" >' +
				name + '</a></li>'
				
			

		},

		createTabContent: function(data, index)
		{

			var self = this;
			var options = self.options;
			var isActive = (0 == index);

			return '<div class="tab-pane' + (isActive ? ' active' : '') + '" id="popup-' + 
				options.id + '-content-' + index + '">' + data + '</div>';

		},

		setPopupData: function(data, index)
		{

			var self = this;
			$('#wms-content-' + self.options.id + '-' + index).html(data);
			$('#wms-content-' + self.options.id + '-' + index).removeClass('noOverflow');

		},

		doWMSRequest: function(layer, event, index)
		{

			var self = this;
			var tileWMS = L.tileLayer.betterWms(layer._url, layer.wmsParams);
			tileWMS.options.queryable = layer.options.queryable;
			tileWMS._map = map;
		
			tileWMS.getPopupContent(event, index).then(function(data) {

				self.setPopupData(data.content, index);

			});

		},

		doUTFGridWMS: function(layer, event, index)
		{

			var self = this;
			var utfGrid = new L.UtfGrid(layer._url, 
				createOptionsUtfGrid(layer.wmsParams, layer.options));
			utfGrid._map = map;
			utfGrid._update().then(function() {
				var data = utfGrid.createPopup(utfGrid._objectForEvent(event).data);
				self.setPopupData(data, index);
			});

		},

		addWMSMatch: function(layer, index, matches) {

			var self = this;
			var loader = '<div id="preloader6" style="margin-left:calc(50% - 24px);">' +
				'<span></span><span></span><span></span><span></span>' +
				'</div>';

			matches.push({isWMS: true, 
				name: layer.options.nom, 
				content: '<div id="wms-content-' + self.options.id + '-' + index + '" class="noOverflow">' + loader + '</div>',
				isQueryable: layer.options.queryable
			});

		},

		createMergedDataPopup: function(feat, event, control) 
		{
		
			var self = this;
			var deferred = $.Deferred();
			var visibleLayers = control.getVisibleLayers(self.options.addSublayers);
			var latlng = event.latlng;

			if(event.originalEvent) {
				
				event.originalEvent.stopImmediatePropagation();
				event.originalEvent.preventDefault();
				latlng = map.mouseEventToLatLng(event.originalEvent);

			}

			$('#popup-' + self.options.id + ' .nav-tabs').empty();
			$('#popup-' + self.options.id + ' .tab-content').empty();

			var matches = [];
			for(var i=0, len=visibleLayers.length; i<len; ++i)
			{

				var currentLayer = visibleLayers[i];

				if(currentLayer.layer.options &&
					currentLayer.layer.options.tipus && 
					(t_wms == currentLayer.layer.options.tipus) ||
					(t_vis_wms == currentLayer.layer.options.tipus))
				{

					self.addWMSMatch(currentLayer.layer, i, matches);

					if(t_wms == currentLayer.layer.options.tipus)
					{

						self.doWMSRequest(currentLayer.layer, event, i);

					}
					else {

						self.doUTFGridWMS(currentLayer.layer, event, i)

					}

				}
				else
				{
					var match = leafletPip.pointInLayer(latlng, currentLayer.layer, false);
					for(var j=0, lenJ=match.length; j<lenJ; ++j)
					{

						matches.push(match[j]);

					}

				}

			}

			self.createPopupContents(matches);
			if(0 != matches.length)
			{
				L.popup({'offset':[0,-25],'autoPan':false}).setLatLng(latlng)
					.setContent(self.options.html).openOn(map);

				self.updateVisibleTabTitles();
				$('#popup-' + self.options.id + '-prev').on('click', function(e) {
					self.previousTab(e);
				});
				$('#popup-' + self.options.id + '-next').on('click', function(e) {
					self.nextTab(e);
				});

			}

			deferred.resolve();

			return deferred;
		
		},

		previousTab: function(e)
		{

			var self = this;
			var $btn = $('#popup-' + self.options.id + '-prev');
			var offset = Number.parseInt($btn.data('taboffset')) - 1;
			$btn.data('taboffset', offset);

			var displayPrev = (0 == offset || -1 == offset) ? 'none' : 'block';
			$('#popup-' + self.options.id + '-prev').css('display', displayPrev);

			self.updateVisibleTabTitles();

		},

		nextTab: function(e)
		{

			var self = this;
			var $btnPrev = $('#popup-' + self.options.id + '-prev');
			var $btn = $('#popup-' + self.options.id + '-next');
			var offset = Number.parseInt($btnPrev.data('taboffset')) + 1;
			$btnPrev.data('taboffset', offset);

			var displayNext = ((offset + self.numVisibleTabs) >= self.numTabs) ? 'none' : 'block';
			$('#popup-' + self.options.id + '-next').css('display', displayNext);
			
			self.updateVisibleTabTitles();

		},

		updateVisibleTabTitles: function()
		{

			var self = this;

			var $tabs = $('[id^=popup-' + self.options.id + '-tab-');
			var $btnPrev = $('#popup-' + self.options.id + '-prev');
			var offset = Number.parseInt($btnPrev.data('taboffset'));
			var maxVisible = offset + self.options.maxVisibleTabs;
			var currentTabId = 0;
			
			for(var i=0, len=self.numTabs; i<len; ++i)
			{

				var current = $($tabs[i]);
				var display = (i < offset || i >= maxVisible) ? 'none' : 'block';
				current.css('display', display);
				if ('block' == display) {
					$('a[href^="#popup-' + self.options.id + '-content-'+i).click();
					currentTabId=i;
				}
			}
			
			
			var displayNext = (currentTabId==self.numTabs-1) ? 'none' : 'block';
			$('#popup-' + self.options.id + '-next').css('display', displayNext);
			
			var displayPrev = (currentTabId==0) ? 'none' : 'block';
			$('#popup-' + self.options.id + '-prev').css('display', displayPrev);
			

		}

	};

	PopupManager.init = function(inOptions)
	{

		var self = this;
		self = $.extend(self, self.options, inOptions);

	}

	PopupManager.init.prototype = PopupManager.prototype;

	global.PopupManager = PopupManager;

}(window, jQuery));
