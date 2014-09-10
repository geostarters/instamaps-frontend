//var _htmlServeisJSON = [];
//
//_htmlServeisJSON.push('<div class="panel-success"><div panel-heading">');
//
//_htmlServeisJSON.push('<div class="input-group txt_ext"><input type="text" lang="ca" id="txt_URLJSON" style="height:33px" placeholder="Entrar URL servei JSON" value="" class="form-control">');
//_htmlServeisJSON.push('<span class="input-group-btn"><button class="btn btn-success" id="bt_connJSON"  type="button"><span class="glyphicon glyphicon-play"></span></button></span>');
//
////_htmlServeisJSON.push('<div class="small"
//
////http://www.president.cat/pres_gov/dades/president/actes-territori-ca.json?
//
//_htmlServeisJSON.push('</div>');
//_htmlServeisJSON.push('</div>');
//_htmlServeisJSON.push('<div style="height:230px;overflow:auto" id="div_layersJSON"  class="tbl"></div>');
//_htmlServeisJSON.push('<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>');

var respostaJSON;
var urlJSON;
function getServeiJSONP(purlJson) {
	urlJSON = purlJson;
	jQuery("#txt_URLJSON");
	var _htmlJSONFields = [];

//	if (ValidURL(purlJson)) {
		//jQuery('#div_layersJSON').addClass('waiting_animation');

		getJSONPServei(purlJson).then(function(results) {
							var op = [];
							if (jQuery.isArray(results)) {
								respostaJSON = results;
							} else {
								for (key in results) {
									if (jQuery.isArray(results[key])) {
										respostaJSON = results[key];
									}
								}
							}

							if (!jQuery.isArray(respostaJSON)) {
								alert(window.lang.convert("No s'ha interpretar l'estructura del JSON"));
								return;
							}
							op.push("<option value='null'>"
									+ window.lang.convert('Selecciona un camp')
									+ "</option>");
							for (key in respostaJSON[0]) {
								op.push("<option value=" + key + ">" + key
										+ "</option>");
							}

							//jQuery('#div_layersJSON').removeClass('waiting_animation');
							jQuery('#div_layersJSON').empty();
							jQuery('#div_emptyJSON').empty();

							_htmlJSONFields.push('<ul class="bs-dadesO_JSON">');

							_htmlJSONFields.push("<li><label>"
									+ window.lang.convert('Camps necessaris')
									+ "</label></li>");
							_htmlJSONFields
									.push("<li><label>"
											+ window.lang
													.convert('Selecciona el camp corresponent')
											+ "</label></li>");

							_htmlJSONFields
									.push("<li>"
											+ window.lang.convert('Coordenada X o Longitud')
											+ "</li>");
							_htmlJSONFields
									.push("<li><select  id='cmd_json_x'>"
											+ op.join(" ") + "</select></li>");

							_htmlJSONFields.push("<li>"
									+ window.lang.convert('Coordenada Y o Latitud') + "</li>");
							_htmlJSONFields.push("<li><select id='cmd_json_y'>"
									+ op.join(" ") + "</select></li>");

							_htmlJSONFields.push("<li><label>"
									+ window.lang.convert('Opcionals')
									+ "</label></li>");
							_htmlJSONFields.push("<li></li>");

							_htmlJSONFields.push("<li>"
									+ window.lang.convert('Títol') + "</li>");
							_htmlJSONFields
									.push("<li><select  id='cmd_json_titol'>"
											+ op.join(" ") + "</select></li>");

							_htmlJSONFields.push("<li>"
									+ window.lang.convert('Descripció')
									+ "</li>");
							_htmlJSONFields
									.push("<li><select  id='cmd_json_desc'>"
											+ op.join(" ") + "</select></li>");

							_htmlJSONFields.push("<li>"
									+ window.lang.convert('Imatge') + "</li>");
							_htmlJSONFields
									.push("<li><select  id='cmd_json_img'>"
											+ op.join(" ") + "</select></li>");

							_htmlJSONFields.push("<li>"
									+ window.lang.convert('Vincle') + "</li>");
							_htmlJSONFields
									.push("<li><select id='cmd_json_vin'>"
											+ op.join(" ") + "</select></li>");

							_htmlJSONFields.push('</ul>');

							jQuery('#div_layersJSON').html(
									_htmlJSONFields.join(" "));
							jQuery('#div_emptyJSON')
									.html(
											'<div style="float:right"><button lang="ca" id="bt_addJSON" class="btn btn-success" >'
													+ window.lang
															.convert("Mapificar")
													+ '</button></div>');

							$('#cmd_json_x option:contains("long")').prop(
									'selected', true);
							$('#cmd_json_x option:contains("lng")').prop(
									'selected', true);

							$('#cmd_json_y option:contains("latitu")').prop(
									'selected', true);
							$('#cmd_json_y option:contains("lat")').prop(
									'selected', true);

						});
		
		jQuery(document).on('click', "#bt_addJSON", function(e) {
			creaCapaFromJSON();
		});		
		

//	} else {
//
//		alert(window.lang.convert("La URL no sembla vàlida"));
//		return;
//	}
}



function creaCapaFromJSON() {

	_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades externes', urlJSON, 1]);
	_kmq.push(['record', 'dades externes', {'from':'mapa', 'tipus user':tipus_user_txt, 'tipus':'json', 'url':urlJSON}]);
	
	var cmd_json_x = jQuery('#cmd_json_x').val();
	var cmd_json_y = jQuery('#cmd_json_y').val();
	var cmd_json_titol = jQuery('#cmd_json_titol').val();
	var cmd_json_desc = jQuery('#cmd_json_desc').val();
	var cmd_json_img = jQuery('#cmd_json_img').val();
	var cmd_json_vin = jQuery('#cmd_json_vin').val();

	if ((cmd_json_x == "null") || (cmd_json_y == "null")) {

		alert(window.lang.convert("Els camps de coordenades no poden estar buits"));
		return;

	} else {

		//nom per defecte agafat de la url del json a mostrar
		var paraules = urlJSON.split("/");
		var paraula = paraules[paraules.length-1].split(".");
		var nomCapaJson = paraula[0];
		if(!nomCapaJson) nomCapaJson = 'Capa JSON';
		
		var capaJSON = new L.FeatureGroup();
		capaJSON.options = {
			businessId : -1,
			nom : nomCapaJson,//+' '+ (parseInt(controlCapes._lastZIndex) + 1),
			tipus:t_json,
			url: urlJSON
//			zIndex : controlCapes._lastZIndex// + 1
		};
		
		var param_estil = 'json';
		if(urlJSON.indexOf("president")!=-1) param_estil = 'json_president';
		var estil_do = retornaEstilaDO(param_estil);
		
		if(typeof url('?businessid') == "string"){
			var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: nomCapaJson,//+' '+ (parseInt(controlCapes._lastZIndex) + 1),
				serverType: t_json,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            order: controlCapes._lastZIndex+1,
	            epsg: '4326',
	            imgFormat: 'image/png',
	            infFormat: 'text/html',
	            tiles: true,	            
	            transparency: true,
	            opacity: 1,
	            visibilitat: 'O',
	            url: urlJSON,//Provar jQuery("#txt_URLJSON")
	            calentas: false,
	            activas: true,
	            visibilitats: true,
	            options: '{"x":"'+cmd_json_x+'", "y":"'+cmd_json_y+'","titol":"'+cmd_json_titol+'","descripcio":"'+cmd_json_desc+'", "imatge":"'+cmd_json_img+'","vincle":"'+cmd_json_vin+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
			};
			
			createServidorInMap(data).then(function(results){
				if (results.status == "OK"){
					
					for (key in respostaJSON) {
						var lat = respostaJSON[key][cmd_json_y];
						var lon = respostaJSON[key][cmd_json_x];
						pp = L.circleMarker([ lat, lon ], estil_do)

						pp.properties = {};
						var empty = true;
						
						if (cmd_json_titol == "null") {
							pp.properties.nom = ""
								
						} else {
							pp.properties.nom = respostaJSON[key][cmd_json_titol];
							empty = empty && false;
						}
						if (cmd_json_desc == "null") {
							pp.properties.text = ""
						} else {
							pp.properties.text = respostaJSON[key][cmd_json_desc];
							empty = empty && false;
						}
						if (cmd_json_img == "null") {
							pp.properties.img = ""
						} else {
							pp.properties.img = '<img width="250px" src="'
									+ respostaJSON[key][cmd_json_img] + '">';
							empty = empty && false;
						}
						if (cmd_json_vin == "null") {
							pp.properties.vincle = ""
						} else {
							pp.properties.vincle = '<a href="'
									+ respostaJSON[key][cmd_json_vin]
									+ '" target="_blank">'
									+ respostaJSON[key][cmd_json_vin] + '</a>';
							empty = empty && false;
						}

						if(!empty){
							pp.bindPopup("<div id='nom-popup-json'>" + pp.properties.nom + "</div><div>"
									+ pp.properties.text + "</div><div id='image-popup-json'>"
									+ pp.properties.img + "</div><div>" + pp.properties.vincle
									+ "</div>");
						}
						pp.addTo(capaJSON);
					}

//					jQuery('#dialog_dades_ex').modal('toggle');
					jQuery('#dialog_dades_ex').modal('hide');	
					capaJSON.options.businessId = results.results.businessId;
					capaJSON.options.options = jQuery.parseJSON('{"x":"'+cmd_json_x+'", "y":"'+cmd_json_y+'","titol":"'+cmd_json_titol+'","descripcio":"'+cmd_json_desc+'", "imatge":"'+cmd_json_img+'","vincle":"'+cmd_json_vin+'"}');
					capaJSON.options.options.estil_do = estil_do;
					capaJSON.addTo(map);
					capaJSON.options.zIndex = controlCapes._lastZIndex+1; 
					controlCapes.addOverlay(capaJSON, capaJSON.options.nom, true);
					controlCapes._lastZIndex++;
					activaPanelCapes(true);
//					$(".layers-list").mCustomScrollbar({
//						   advanced:{
//						     autoScrollOnFocus: false,
//						     updateOnContentResize: true
//						   }           
//					});	
				}
			});
			
		}else{
			capaJSON.addTo(map)
			capaJSON.options.zIndex = controlCapes._lastZIndex+1; 
			capaJSON.options.options = jQuery.parseJSON('{"x":"'+cmd_json_x+'", "y":"'+cmd_json_y+'","titol":"'+cmd_json_titol+'","descripcio":"'+cmd_json_desc+'", "imatge":"'+cmd_json_img+'","vincle":"'+cmd_json_vin+'"}');
			capaJSON.options.options.estil_do = estil_do;
			controlCapes.addOverlay(capaJSON, capaJSON.options.nom, true);
			controlCapes._lastZIndex++;
			activaPanelCapes(true);
//			$(".layers-list").mCustomScrollbar({
//				   advanced:{
//				     autoScrollOnFocus: false,
//				     updateOnContentResize: true
//				   }           
//			});	
		}		
	}
	
	//Buidem dialeg creacio capa JSON
//	jQuery('#div_layersJSON').empty();
//	jQuery('#txt_URLJSON').val('');	
	jQuery('#div_url_file').empty();
	jQuery('#txt_URLfile').val('');		
}

function loadCapaFromJSON(layer) {

	var defer = $.Deferred();
	
	var options = jQuery.parseJSON( layer.options );
	
	if(options.tem == tem_heatmap){
		loadJsonHeatmapLayer(layer);
		return defer.resolve();
	}else if(options.tem == tem_cluster){
		loadJsonClusterLayer(layer);
		return defer.resolve();
	}else{	
		var v_respotaJSON;
		getJSONPServei(layer.url).then(function(results) {
			var op = [];
			if (jQuery.isArray(results)) {
				v_respotaJSON = results;
			} else {
				for (key in results) {
					if (jQuery.isArray(results[key])) {
						v_respotaJSON = results[key];
					}
				}
			}
	
			if (!jQuery.isArray(v_respotaJSON)) {
				alert(window.lang.convert("No s'ha interpretar l'estructura del JSON"));
				return;
			}
			
			var capaJSON = new L.FeatureGroup();
			capaJSON.options = {
				businessId : layer.businessId,
				nom : layer.serverName,
				tipus:layer.serverType,
				zIndex : layer.capesOrdre,
				url: layer.url,
				options: options
			};		
			
//			var options = jQuery.parseJSON( layer.options );
	//		var estil_do = retornaEstilaDO('json');
			var estil_do = options.estil_do;
			
			for (key in v_respotaJSON) {
				var lat = v_respotaJSON[key][options.y];
				var lon = v_respotaJSON[key][options.x];
				var pp = L.circleMarker([ lat, lon ], estil_do)
	
				pp.properties = {};
				var empty = true;
				
				if (options.titol == "null") {
					pp.properties.nom = ""
				} else {
					pp.properties.nom = v_respotaJSON[key][options.titol];
					empty = empty && false;
				}
				if (options.descripcio == "null") {
					pp.properties.text = ""
				} else {
					pp.properties.text = v_respotaJSON[key][options.descripcio];
					empty = empty && false;
				}
				if (options.imatge == "null") {
					pp.properties.img = ""
				} else {
					pp.properties.img = '<img width="250px" src="'
							+ v_respotaJSON[key][options.imatge] + '">';
					empty = empty && false;
				}
				if (options.vincle == "null") {
					pp.properties.vincle = ""
				} else {
					pp.properties.vincle = '<a href="'
							+ v_respotaJSON[key][options.vincle]
							+ '" target="_blank">'
							+ v_respotaJSON[key][options.vincle] + '</a>';
					empty = empty && false;
				}
	
				if(!empty){
					pp.bindPopup("<div id='nom-popup-json'>" + pp.properties.nom + "</div><div id='text-popup-json'>"
							+ pp.properties.text + "</div><div id='image-popup-json'>"
							+ pp.properties.img + "</div><div>" + pp.properties.vincle
							+ "</div>");
				}
				pp.addTo(capaJSON);
			}
	
			capaJSON.options.businessId = layer.businessId;
			
			if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
				capaJSON.addTo(map)
			}		
			
			if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
				capaJSON.options.zIndex = controlCapes._lastZIndex + 1;
			}else{
				capaJSON.options.zIndex = parseInt(layer.capesOrdre);
			}			
				
//			controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);	
//			controlCapes._lastZIndex++;
			
			if(!options.origen){
				controlCapes.addOverlay(capaJSON, capaJSON.options.nom, true);
				controlCapes._lastZIndex++;
			}else{//Si te origen es una sublayer
				var origen = getLeafletIdFromBusinessId(options.origen);
				capaJSON.options.zIndex = capesOrdre_sublayer;
				controlCapes.addOverlay(capaJSON, capaJSON.options.nom, true, origen);
			}			
			
			activaPanelCapes(true);	
			return defer.resolve();
		},function(results){
			alert(window.lang.convert("No s'ha interpretar l'estructura del JSON"));
			return defer.reject();		
		});
	}
	return defer.promise();
}
