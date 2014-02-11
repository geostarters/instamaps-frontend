var _htmlServeisJSON = [];

_htmlServeisJSON.push('<div class="panel-success"><div panel-heading">');

_htmlServeisJSON
		.push('<div class="input-group txt_ext"><input type="text" lang="ca" id="txt_URLJSON" style="height:33px" placeholder="Entrar URL servei JSON" value="" class="form-control">');
_htmlServeisJSON
		.push('<span class="input-group-btn"><button class="btn btn-success" id="bt_connJSON"  type="button"><span class="glyphicon glyphicon-play"></span></button></span>');

//_htmlServeisJSON.push('<div class="small"

//http://www.president.cat/pres_gov/dades/president/actes-territori-ca.json?

_htmlServeisJSON.push('</div>');
_htmlServeisJSON.push('</div>');
_htmlServeisJSON
		.push('<div style="height:230px;overflow:auto" id="div_layersJSON"  class="tbl"></div>');
_htmlServeisJSON
		.push('<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>');

var respostaJSON;
function getServeiJSONP(urlJson) {
	respostaJSON = "";
	var _htmlJSONFields = [];

	if (ValidURL(urlJson)) {
		jQuery('#div_layersJSON').addClass('waiting_animation');

		getJSONPServei(urlJson)
				.then(
						function(results) {

							var op = [];
							if (jQuery.isArray(results)) {
								respostaJSON = results;
								// console.info("hola");
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

							jQuery('#div_layersJSON').removeClass(
									'waiting_animation');
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
											+ window.lang.convert('Longitud')
											+ "</li>");
							_htmlJSONFields
									.push("<li><select  id='cmd_json_x'>"
											+ op.join(" ") + "</select></li>");

							_htmlJSONFields.push("<li>"
									+ window.lang.convert('Latitud') + "</li>");
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

	} else {

		alert(window.lang.convert("La URL no sembla vàlida"));
		return;

	}

}

jQuery(document).on('click', "#bt_addJSON", function(e) {

	creaCapaFromJSON();

});

function creaCapaFromJSON() {

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

		var capaJSON = new L.FeatureGroup();
		capaJSON.options = {
			businessId : -1,
			nom : 'CapaJSON1',
			tipus:'JSON',
			zIndex : controlCapes._lastZIndex + 1
		};

		var estil_do = retornaEstilaDO('json');

		for (key in respostaJSON) {
			var lat = respostaJSON[key][cmd_json_y];
			var lon = respostaJSON[key][cmd_json_x];
			pp = L.circleMarker([ lat, lon ], estil_do)

			pp.properties = {};

			if (cmd_json_titol == "null") {
				pp.properties.name = ""
			} else {
				pp.properties.name = respostaJSON[key][cmd_json_titol];
			}
			if (cmd_json_desc == "null") {
				pp.properties.description = ""
			} else {
				pp.properties.description = respostaJSON[key][cmd_json_desc];
			}
			if (cmd_json_img == "null") {
				pp.properties.img = ""
			} else {
				pp.properties.img = '<img width="100px" src="'
						+ respostaJSON[key][cmd_json_img] + '">';
			}
			if (cmd_json_vin == "null") {
				pp.properties.vincle = ""
			} else {
				pp.properties.vincle = '<a href="'
						+ respostaJSON[key][cmd_json_vin]
						+ '" target="_blank">'
						+ respostaJSON[key][cmd_json_vin] + '</a>';
			}

			pp.bindPopup("<div>" + pp.properties.name + "</div><div>"
					+ pp.properties.description + "</div><div>"
					+ pp.properties.img + "</div><div>" + pp.properties.vincle
					+ "</div>");
			pp.addTo(capaJSON);

		}

		capaJSON.addTo(map);
		controlCapes.addOverlay(capaJSON, capaJSON.options.nom, true);

		jQuery('#dialog_dades_ex').modal('toggle');

	}

}
