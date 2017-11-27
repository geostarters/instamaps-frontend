
if ($(location).attr("href").indexOf("visor") != -1) {
	//$("head").append('<script src="https://www.gstatic.com/charts/loader.js"></script>');
	$("head").append('<link rel="stylesheet" href="/llibreries/css/leaflet/leaflet.draw.css">');
	$("head").append('<link rel="stylesheet" href="/moduls/sostenibilitat/css/sostenibilitat.css">');
	$("head").append('<script src="/llibreries/js/leaflet/plugin/leaflet.draw-custom.js" type="text/javascript"></script>');
	$("head").append('<script src="/moduls/sostenibilitat/llibreries/js/sostenibilitat.min.js" type="text/javascript"></script>');
	//$("head").append('<script async type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>');
	//$("head").append('<script type="text/javascript">google.load("visualization", "1", {packages:["corechart"]});</script>');
	//$("head").append('<script type="text/javascript">google.charts.load(\'current\', {\'packages\':[\'corechart\']});</script>');
	//


	(function (d, script) {
		script = d.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.onload = function () {
			$("head").append('<script type="text/javascript">google.charts.load(\'current\', {\'packages\':[\'corechart\']});</script>');
		};
		script.src = 'https://www.gstatic.com/charts/loader.js';
		d.getElementsByTagName('head')[0].appendChild(script);
	}
		(document));

}

var _protocol = "https";
if (location.protocol != 'https:') {
	_protocol = "http";
}

L.Control.addModulSostenibilitat = L.Control.extend({

		options: {
			urlWFS: _protocol + ':geoserveis.icgc.cat/rubi_arbres/wms/service',
			sostenibilitat: {},
			parametersWFS: {
				service: 'WFS',
				outputFormat: 'json',
				srsName: 'EPSG:4326',
				typeName: 'arbres:arbres_wfs',
				version: '1.1.0',
				maxfeatures: 2000,
				request: 'GetFeature'
			},
			position: 'topleft',
			layersWMS: 'arbres_alcada,arbres_ndvi_media',
			typeServer: 'GeoServer'

		},

		initialize: function (GeoJsonLayer) {

			this.geoJsonLayer = GeoJsonLayer;
			this.geoJsonLayerSelect = new L.geoJson();
			this.sos = new sostenibilitat.Sostenibilitat();
			this.GEOJSON = {};
			this.PETICIOSOS = {};
			this.OBJWFS = {};
			this.controlDraw;
			changeWMSQueryable(false);
			this.addEventsToHTML();
			//L.Util.setOptions(this, options);

		},
		onAdd: function (map) {

			this.geoJsonLayer.addTo(map);
			this.geoJsonLayerSelect.addTo(map);
			//this.getFeatureRequest(null, null, map);
			this.addControlDrawButtons(this.geoJsonLayer);
			this._container = L.DomUtil.create('div', 'psolar_info'); // create a div
			this._container.id = 'psolar_info'; // with a class

			this._info_title = L.DomUtil.create('div', 'arbres_info_title'); // create a div
			this._info_title.id = 'arbres_info_title'; // with a class


			this._span = L.DomUtil.create('span', 'tema_verd glyphicon glyphicon-remove group-conf');
			this._span.id = 'info_tanca';
			L.DomEvent.on(this._span, 'click', this.closeInfo, this);

			this._info_content = L.DomUtil.create('div', 'arbres_info_content'); // create a div
			this._info_content.id = 'arbres_info_content'; // with a class
			L.DomEvent.on(this._info_content, 'click', aturaClick, this);

			this._info_title.appendChild(this._span);
			this._container.appendChild(this._info_title);
			this._container.appendChild(this._info_content);

			this.update("", false);

			return this._container;
		},
		onRemove: function (map) {},

		setActiveLayerSostenibilitat: function (layerName) {

			this.options.parametersWFS.typeName = layerName;

		},

		setOptionsSostenibilitat: function (_options) {

			this.options.urlWFS = _options.sos_url_wfs;
			this.options.parametersWFS.typeName = _options.sos_edificis_fv_wfs;
			this.options.sostenibilitat = _options;
			var _urlWFS = this.options.urlWFS;

			if (_urlWFS.indexOf('map=') != -1 || _urlWFS.indexOf('instamaps.cat') != -1) {
				this.options.typeServer = 'MNU';
				this.options.parametersWFS.outputFormat = 'geojson';
				this.options.parametersWFS.version = '1.0.0';
			}

		},

		closeInfo: function (e) {
			this._container.style.display = 'none';
			this.geoJsonLayer.clearLayers();
			this.geoJsonLayerSelect.clearLayers();
			changeWMSQueryable(true);

			aturaClick(e);

		},

		getActiveWMSSostenibilitatLayers: function () {

			var _selectedLayer;
			var layers = $(".leaflet-control-layers-selector").map(function () {

					if ($(this).is(':checked')) {
						var _ID = this.id.replace('input-', '');

						map.eachLayer(function (layer) {
							if (layer.options &&
								layer.options.businessId == _ID &&
								layer.options.sostenibilitat == true) {
								_selectedLayer = layer;

							}

						});

					}

				}).get();

			return _selectedLayer;

		},

		update: function (props, show) {

			/*
			this._div.innerHTML = '<button aria-hidden="true" id="bt_arbres_close" "data-dismiss="modal" class="close" type="button">×</button>'
			+ props;
			 */
			show ? this._container.style.display = 'block' : this._container.style.display = 'none';
			this._info_content.innerHTML = props;

		},

		addControlDrawButtons: function (geoJsonLayer) {

			var optionsD = {
				position: 'topright',
				draw: {
					polyline: false,
					polygon: {
						allowIntersection: false, // Restricts shapes to simple
						drawError: {
							color: '#e1e100', // Color the shape will turn when
							message: '' // Message
						},
						shapeOptions: {
							color: '#bada55'
						}
					},
					circle: false, // Turns off this drawing tool
					rectangle: {
						shapeOptions: {
							clickable: false
						}
					},
					marker: true,
				},
				edit: false,
				remove: false
			};

			this.controlDraw = new L.Control.Draw(optionsD);

			this.controlDraw.setDrawingOptions({
				rectangle: {
					shapeOptions: {
						color: '#a94442'
					},
					repeatMode: true
				},
				polygon: {
					shapeOptions: {
						color: '#a94442'
					},
					repeatMode: true
				},
				//marker : false

				marker: {
					icon: L.icon({
						iconUrl: '/moduls/arbres/img/blank.png',
						iconSize: [1, 1],
						iconAnchor: [1, 1]
					}),
					repeatMode: true
				}

			});

			L.drawLocal.draw.toolbar.actions.title = "Aturar selecció";
			L.drawLocal.draw.toolbar.actions.text = "Aturar";

			L.drawLocal.draw.toolbar.undo.title = "";
			L.drawLocal.draw.toolbar.undo.text = "&nbsp";

			L.drawLocal.draw.toolbar.buttons.polygon = 'Selecció edificis dibuixant una àrea';
			L.drawLocal.draw.toolbar.buttons.rectangle = 'Selecciona edificis dibuixant un rectangle';
			L.drawLocal.draw.toolbar.buttons.marker = 'Selecciona un edifici amb un punt';
			L.drawLocal.draw.handlers.polygon.tooltip.start = 'Clica per començar a dibuixar una àrea';
			L.drawLocal.draw.handlers.marker.tooltip.start = 'Clica per seleccionar un edifici';
			L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Clica per continuar dibuixant una àrea';
			L.drawLocal.draw.handlers.polygon.tooltip.end = 'Clica el primer punt per tancar aquesta àrea';
			L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Clica i arrosega per dibuixar un rectangle';
			L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Deixa anar el ratolí per finalitzar el rectangle';

			map.addControl(this.controlDraw);

			var that = this;
			var esticEdicio=false;
			map.on('draw:drawstop', function (e) {
				changeWMSQueryable(true);
				map.closePopup();
				esticEdicio=false;

			});

			map.on('draw:editstop', function (e) {
				changeWMSQueryable(true);
				map.closePopup();
			});

			map.on('draw:drawstart', function (e) {
				changeWMSQueryable(false);
				map.closePopup();
				esticEdicio=true;
			});
			
			
			map.on('click', function (e) {
				
				
				if(esticEdicio){
				
				map.closePopup();
				}
			});

			map.on('draw:created', function (e) {

			map.closePopup();
			
				var spatialFilter = 'Within';

				if (e.layerType == "rectangle") {

					spatialFilter = 'Within';
					that.getFeatureRequest(e, spatialFilter, getAreaLayer(e.layer));

				} else if (e.layerType == "polygon") {

					spatialFilter = 'Within';
					that.getFeatureRequest(e, spatialFilter, getAreaLayer(e.layer));

				} else {
					spatialFilter = 'Intersects';
					that.getFeatureRequest(e, spatialFilter, null);

				}

				//aturaClick(e);
			});

		},

		
		isCaluladoraLocal:function(){
			
			var _url=this.options.sostenibilitat.sos_url_calculadora;
						
				if(_url.indexOf('localhost')!=-1){ //intern
				
				return true;
				}else{
				return false;	
					
				}	
		},	
		
		sendRequestToCalculadora:function(data){
		
			
			return createXHR({
		url: _url+"/"+data.method+"?", 
		data: {geometry:data.geometry,fare:data.fare},
		dataType: 'jsonp',
		//contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		method: 'post'
	});
			
	
			

		},	
		getActiveWFSFromWMSLayer: function () {

			var _layerWMS = this.getActiveWMSSostenibilitatLayers();
			var actvieWFSObj = {};
			if (_layerWMS.options.layers == this.options.sostenibilitat.sos_url_fv_name_wms) {
				//if (map.getZoom() < 18) {
					//actvieWFSObj.tipus = "FV_ED";
					//actvieWFSObj.layerWFS = this.options.sostenibilitat.sos_edificis_fv_wfs;
				//} else {
					actvieWFSObj.tipus = "FV_TE";
					actvieWFSObj.layerWFS = this.options.sostenibilitat.sos_teulades_fv_wfs;
				//}
			} else {
				//if (map.getZoom() < 18) {
					//actvieWFSObj.tipus = "TS_ED";
					//actvieWFSObj.layerWFS = this.options.sostenibilitat.sos_edificis_ts_wfs;
				//} else {
					actvieWFSObj.tipus = "TS_TE";
					actvieWFSObj.layerWFS = this.options.sostenibilitat.sos_teulades_ts_wfs;
				//}
			}
			
			//console.info(actvieWFSObj);
			return actvieWFSObj;

		},

		getFeatureRequest: function (geometry, spatialFilter, areaSeleccio) {

			var _objWFS = this.getActiveWFSFromWMSLayer();
			this.options.parametersWFS.typeName = _objWFS.layerWFS;
			var parameters = L.Util.extend(this.options.parametersWFS);
			
			// the_geom
			var FILTER = 'FILTER=(<Filter xmlns:gml="http://www.opengis.net/gml" ><' + spatialFilter + '><PropertyName>the_geom</PropertyName>' + geometry.layer.toGML() + '</' + spatialFilter + '></Filter>)';
			
			
			
			var BBOX = "bbox=" + map.getBounds().getSouth() + "," + map.getBounds().getWest() + "," + map.getBounds().getNorth() + "," + map.getBounds().getEast();

			var _parametres = L.Util.getParamString(parameters);
			if (this.options.urlWFS.indexOf('?') != -1) {
				_parametres = _parametres.replace('?', '');
			}

			var that = this;

			var _requestWFS = this.options.urlWFS + _parametres + '&' + encodeURI(FILTER) + '&'

				if (this.options.typeServer == 'MNU') {

					if ((this.options.urlWFS.indexOf('instamaps.cat') == -1) || (this.options.urlWFS.indexOf('instaweb') != -1) || (this.options.urlWFS.indexOf('172.20.70.11') != -1)) {
						
						jQuery.ajax({
							url: _requestWFS,

							always: function (data, status, xhr) {
								map.spin(false);

							},
							success: function (dataGeoJson, status, xhr) {
								map.spin(false);
								
								if (dataGeoJson.features) {
									that.handleJson(dataGeoJson, areaSeleccio, geometry, _objWFS);
								}
							},
							error: function (xhr, status, error) {
								
								map.spin(false);

							}

						});

					} else {

						jQuery.ajax({
							url: paramUrl.proxy_betterWMS,
							data: {
								url: _requestWFS
							},
							always: function (data, status, xhr) {
								map.spin(false);

							},
							success: function (dataGeoJson, status, xhr) {
								map.spin(false);

								if (dataGeoJson.features) {
									that.handleJson(dataGeoJson, areaSeleccio, geometry, _objWFS);
								}
							},
							error: function (xhr, status, error) {
							
								map.spin(false);
							}

						});

					}

				} else if (this.options.typeServer == 'GeoServer') {

				
				
				jQuery.ajax({
					url: paramUrl.proxy_betterWMS,
					data: {
						url: _requestWFS
					},
					always: function (data, status, xhr) {
						map.spin(false);

					},
					success: function (dataGeoJson, status, xhr) {
						map.spin(false);

						if (dataGeoJson.features) {
							that.handleJson(dataGeoJson, areaSeleccio, geometry, _objWFS);
						}
					},
					error: function (xhr, status, error) {
					
						map.spin(false);
					}

				});
				/*
					$.ajax({
						url: _requestWFS,
						dataType: "jsonp",
						//method: 'post',
						//jsonp: "false",
						jsonpCallback: "parseResponse",
						success: function (dataGeoJson) {
							
							if (dataGeoJson.features) {
							that.handleJson(dataGeoJson, areaSeleccio, geometry, _objWFS);
							}
							
						},
						error: function (a, b) {
							
							console.info(a);
							console.info(b);
							
						},
					});
*/
				}

		},

		handleJson: function (dataGeoJson, areaSeleccio, geometry, objWFS) {

		
	
			this.GEOJSON = dataGeoJson;
			this.OBJWFS = objWFS;
			this.geoJsonLayerSelect.clearLayers();
			this.geoJsonLayer.clearLayers();
			this.geoJsonLayer.addData(dataGeoJson);
			this.geoJsonLayer.setStyle({
				//fillColor: "#FC07FC",
				color: "#FC07FC",
				weight: 3,
				opacity: 1,
				fillOpacity: 0
			});

			if (geometry.layerType != "marker") {
				this.geoJsonLayerSelect.addData(geometry.layer.toGeoJSON());
				this.geoJsonLayerSelect.setStyle({
					//fillColor: "#FC07FC",
					color: "#FFCC00",
					weight: 3,
					opacity: 1,
					opacity: 1,
					fillOpacity: 0
				});
			}

			this.jsonTemplateInfo(dataGeoJson, areaSeleccio, objWFS, null);

		},

		resendEDITRequest: function () {
			
			
			var _resultset2 = {
				"RESULT": {
					"INPUT": {
						"Preu_del_panell_EDIT": this.treuCommas(jQuery('#txt_preu_panell').val()),
						"Preu_de_lenergia_EDIT": this.treuCommas(jQuery('#txt_preu').val()),
						"Preu_inversor_EDIT": this.treuCommas(jQuery('#txt_preu_inversor').val()),
						"Eficiencia_panells_EDIT": this.treuCommas(jQuery('#efi_panells').val()),
						"Perdues_estimades_del_sistema_EDIT": this.treuCommas(jQuery('#efi_perdus').val()),
						"Consum_anual_EDIT": this.treuCommas(jQuery('#fv_com_anu').val()),
						"Nombre_de_panells_EDIT": this.treuCommas(jQuery('#fv_num_panells').val()),
						"Nombre_de_panells_EDIT_inicial": this.treuCommas(jQuery('#fv_num_panells').val()),
					}
				}
			};

			
			this.jsonTemplateInfo(this.GEOJSON, null, this.OBJWFS, _resultset2);

		},

		addEventsToHTML: function () {

			var _self = this;

			jQuery(document).on('change', '#txt_preu_panell', function () {
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#txt_preu', function () {
				
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#txt_preu_inversor', function () {
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#efi_panells', function () {
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#efi_perdus', function () {
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#fv_com_anu', function () {
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#txt_preu_panell', function () {
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#fv_num_panells', function () {
				_self.resendEDITRequest();
			});

			jQuery(document).on('change', '#sel_cost', function () {

				_self.filtreCost($(this).val());
			});

		},
		filtreCost: function (value) {

			if (value == 0) { //euro
				jQuery('#fv_cost_i').html(this.PETICIOSOS.resultset.OUTPUT.Cost_de_la_inversio_euros);
			} else {
				jQuery('#fv_cost_i').html(this.PETICIOSOS.resultset.OUTPUT.Cost_de_la_inversio_euros_kwp);
			}

		},
		treuCommas:function(nStr){
		
			nStr += '';
			nStr = nStr.replace(",", ".");
			
			
			return parseFloat(nStr);
		},
		addCommas: function (nStr) {
			nStr += '';
			nStr = nStr.replace(".", ",");

			x = nStr.split(',');
			x1 = x[0];
			x2 = x.length > 1 ? ',' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {

				x1 = x1.replace(rgx, '$1' + '.' + '$2');
			}
			return x1 + x2;
		},

		jsonTemplateInfo: function (dataGeoJson, areaSeleccio, objWFS, resultset) {

			var htmlArrayText = [];
			var peticioSOS = {
				resultset: {}
			};
			peticioSOS.resultset.OUTPUT = {};
			if (dataGeoJson.features.length > 1) {
				peticioSOS.resultset.OUTPUT.fv_inclina = 0;
				peticioSOS.resultset.OUTPUT.fv_azimut = 0;
			}

			
			var _data={
				geometry:dataGeoJson,
				fare:resultset
				}	
			
			
			//FV_ED,FV_TE,TS_ED,TS_TE
			if (objWFS.tipus == "FV_ED") {
			
				if(this.isCaluladoraLocal){
					peticioSOS = this.sos.getPotencialFotovoltaicEdificis(dataGeoJson, resultset);
				}else{
					_data.method='getPotencialFotovoltaicEdificis';					
					this.sendRequestToCalculadora(_data).then(function(results){
					
					
					peticioSOS = results;
					});
				}
				//sendRequestToCalculadora
				htmlArrayText.push('<div class="tit_sos_div">Potencial d\'aprofitament FV</div> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="regular"><label>Regular</label></td> <td id="adequat"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr>'
					 + '</table>  	<table class="tbl_dades"><tr><td>Irradiació global:</td><td><span id="fv_global">' + this.addCommas(peticioSOS.resultset.OUTPUT.Irradiacio_global) + '</span> kWh/any</td></tr>'
					 + '</table>  <table class="tbl_dades"><tr><td>Àrea total:</td><td><span id="fv_area_t">' + this.addCommas(peticioSOS.resultset.OUTPUT.Area_total) + '</span> m&sup2;</td></tr>'
					 + '<tr><td>Àrea instalada:</td><td><span id="fv_area_i">' + this.addCommas( peticioSOS.resultset.OUTPUT.Area_instalada )+ '</span> m&sup2;</td></tr>'
					 + '<tr><td>Nombre de panells:</td><td><span id="fv_num_panells_span"><input  id="fv_num_panells" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Nombre_de_panells_EDIT) + '"></span></td></tr>'
					 + '<tr><td>Eficiència dels panells:</td><td><select id="efi_panells"><option value="5">5%</option><option value="6">6%</option><option value="7">7%</option><option value="8">8%</option><option value="9">9%</option><option value="10">10%</option><option  value="11">11%</option><option value="12">12%</option><option value="13">13%</option><option value="14">14%</option><option selected value="15">15%</option><option value="16">16%</option><option value="17">17%</option><option value="18">18%</option><option value="19">19%</option><option value="20">20%</option><option value="21">21%</option><option value="22">22%</option><option value="23">23%</option><option value="24">24%</option><option value="25">25%</option><option value="26">26%</option><option value="27">27%</option><option value="28">28%</option><option value="29">29%</option><option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option><option value="36">36%</option><option value="37">37%</option><option value="38">38%</option><option value="39">39%</option><option  value="40">40%</option></select></td></tr>'
					 + '<tr><td>Pèrdues estimades del sistema:</td><td><select id="efi_perdus"><option value="0">0%</option> <option value="1">1%</option> <option value="2">2%</option> <option value="3">3%</option> <option value="4">4%</option> <option value="5">5%</option> <option value="6">6%</option> <option value="7">7%</option> <option value="8">8%</option> <option value="9">9%</option> <option value="10">10%</option> <option  value="11">11%</option> <option value="12">12%</option> <option value="13">13%</option> <option selected value="14">14%</option> <option value="15">15%</option> <option value="16">16%</option> <option value="17">17%</option> <option value="18">18%</option> <option value="19">19%</option> <option value="20">20%</option> <option value="21">21%</option> <option value="22">22%</option> <option value="23">23%</option> <option value="24">24%</option> <option value="25">25%</option><option value="26">26%</option><option value="27">27%</option><option value="28">28%</option><option value="29">29%</option><option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option></select></td></tr>'
					 + '<tr><td>Potència de l\'instal·lació:</td><td><span id="fv_poten_ins">' + this.addCommas( peticioSOS.resultset.OUTPUT.Potencia_de_instalacio )+ '</span> kW pic</td></tr>'
					 + '<tr><td>Electricitat generada:</td><td><span id="fv_elct_gen">' + this.addCommas( peticioSOS.resultset.OUTPUT.Electricitat_generada )+ '</span> kWh/any</td></tr>'
					 + '<tr><td>Consum anual:</td><td><span id="fv_com_anu_span"><input  id="fv_com_anu" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Consum_anual_EDIT) + '"></span> kWh/any</td></tr>'
					 + '<tr><td>Generació pròpia:</td><td><span id="fv_gen_propia">' + this.addCommas( peticioSOS.resultset.OUTPUT.Generacio_propia )+ '</span></td></tr>'
					 + '</table>  <table class="tbl_dades">'
					 + '<tr><td>Cost de la inversió:</td><td><span id="fv_cost_i">' + this.addCommas( peticioSOS.resultset.OUTPUT.Cost_de_la_inversio_euros )+ '</span> <select  id="sel_cost"><option selected value="0">&euro;</option><option value="1">&euro;/kWp</option></select></td></tr>'
					 + '<tr><td>Preu de l\'energia:</td> <td><span id="fv_preu_e"><input  id="txt_preu"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_de_lenergia_EDIT) + '"></span> &euro;/kWh</td></tr>'
					 + '<tr style="display:none"><td>Peatge d\'accés:</td><td><span id="fv_peatge"><input   id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td> </tr>'
					 + '<tr><td>Preu del panell:</td><td><span id="fv_preu_panell"><input  id="txt_preu_panell" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_del_panell_EDIT) + '"></span> &euro;</td></tr>'
					 + '<tr><td>Preu inversor:</td><td><span id="fv_preu_inversor"><input  id="txt_preu_inversor" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_inversor_EDIT) + '"></span> &euro;/panell</td></tr>'
					 + '<tr><td>Retorn previst:</td><td><span id="fv_retorn">' + this.addCommas( peticioSOS.resultset.OUTPUT.Retorn_previst )+ '</span> &euro;/any</td></tr>'
					 + '<tr><td>Temps d\'amortització:</td> <td><span id="fv_temps">' + this.addCommas( peticioSOS.resultset.OUTPUT.Temps_damortitzacio) + ' </span> anys</td></tr></table>'
					 + '<table class="tbl_dades"><tr><td>Estalvi en CO<sub>2</sub>:</td><td><span id="fv_CO">' + this.addCommas( peticioSOS.resultset.OUTPUT.Estalvi_en_CO2 )+ '</span> kg/any</td></tr></table>'
					 + '<div id="chart_div" style="width: 100%; height: 280px;"></div> ');
			} else if (objWFS.tipus == "FV_TE") {
				
				
				//peticioSOS = this.sos.getPotencialFotovoltaicTeulades(dataGeoJson, resultset);
				
				if(this.isCaluladoraLocal){
					peticioSOS = this.sos.getPotencialFotovoltaicTeulades(dataGeoJson, resultset);
				}else{
					_data.method='getPotencialFotovoltaicTeulades';					
					this.sendRequestToCalculadora(_data).then(function(results){
					peticioSOS = results;
					});
				}
				
				
				htmlArrayText.push('<div class="tit_sos_div">Potencial d\'aprofitament FV</div> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="regular"><label>Regular</label></td> <td id="adequat"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr>'
					 + '</table>  	<table class="tbl_dades"><tr><td>Irradiació global:</td><td><span id="fv_global">' + this.addCommas( peticioSOS.resultset.OUTPUT.Irradiacio_global )+ '</span> kWh/any</td></tr>'
					 + '</table>  <table class="tbl_dades"><tr><td>Àrea total:</td><td><span id="fv_area_t">' + this.addCommas(peticioSOS.resultset.OUTPUT.Area_total) + '</span> m&sup2;</td></tr>'
					// + '<tr><td>Inclinació:</td><td><span id="fv_inclina">' + this.addCommas( peticioSOS.resultset.OUTPUT.fv_inclina )+ '</span> &deg;</td></tr>'
					// + '<tr><td>Orientació:</td><td><span id="fv_azimut">' + this.addCommas( peticioSOS.resultset.OUTPUT.fv_azimut )+ '</span> &deg;</td></tr>'
					 + '<tr><td>Àrea instalada:</td><td><span id="fv_area_i">' + this.addCommas( peticioSOS.resultset.OUTPUT.Area_instalada )+ '</span> m&sup2;</td></tr>'
					 + '<tr><td>Nombre de panells:</td><td><span id="fv_num_panells_span"><input  id="fv_num_panells" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Nombre_de_panells_EDIT) + '"></span></td></tr>'
					 + '<tr><td>Eficiència dels panells:</td><td><select   id="efi_panells"><option value="5">5%</option><option value="6">6%</option><option value="7">7%</option><option value="8">8%</option><option value="9">9%</option><option value="10">10%</option><option  value="11">11%</option><option value="12">12%</option><option value="13">13%</option><option value="14">14%</option><option selected value="15">15%</option><option value="16">16%</option><option value="17">17%</option><option value="18">18%</option><option value="19">19%</option><option value="20">20%</option><option value="21">21%</option><option value="22">22%</option><option value="23">23%</option><option value="24">24%</option><option value="25">25%</option><option value="26">26%</option><option value="27">27%</option><option value="28">28%</option><option value="29">29%</option><option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option><option value="36">36%</option><option value="37">37%</option><option value="38">38%</option><option value="39">39%</option><option  value="40">40%</option></select> 			</td></tr>'
					 + '<tr><td>Pèrdues estimades del sistema:</td><td><select  id="efi_perdus"><option value="0">0%</option> <option value="1">1%</option> <option value="2">2%</option> <option value="3">3%</option> <option value="4">4%</option> <option value="5">5%</option> <option value="6">6%</option> <option value="7">7%</option> <option value="8">8%</option> <option value="9">9%</option> <option value="10">10%</option> <option  value="11">11%</option> <option value="12">12%</option> <option value="13">13%</option> <option selected value="14">14%</option> <option value="15">15%</option> <option value="16">16%</option> <option value="17">17%</option> <option value="18">18%</option> <option value="19">19%</option> <option value="20">20%</option> <option value="21">21%</option> <option value="22">22%</option> <option value="23">23%</option> <option value="24">24%</option> <option value="25">25%</option><option value="26">26%</option><option value="27">27%</option><option value="28">28%</option><option value="29">29%</option><option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option></select></td></tr>'
					 + '<tr><td>Potència de l\'instal·lació:</td><td><span id="fv_poten_ins">' + this.addCommas( peticioSOS.resultset.OUTPUT.Potencia_de_instalacio )+ '</span> kW pic</td></tr>'
					 + '<tr> <td>Electricitat generada:</td><td><span id="fv_elct_gen">' + this.addCommas( peticioSOS.resultset.OUTPUT.Electricitat_generada )+ '</span> kWh/any</td></tr>'
					 + '<tr><td>Consum anual:</td><td><span id="fv_com_anu_span"><input  id="fv_com_anu" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Consum_anual_EDIT) + '"></span> kWh/any</td></tr>'
					 + '<tr><td>Generació pròpia:</td><td><span id="fv_gen_propia">' + this.addCommas( peticioSOS.resultset.OUTPUT.Generacio_propia )+ '</span></td></tr>'
					 + '</table><table class="tbl_dades">'
					 + '<tr><td>Cost de la inversió:</td><td><span id="fv_cost_i">' + this.addCommas( peticioSOS.resultset.OUTPUT.Cost_de_la_inversio_euros )+ '</span> <select  id="sel_cost"><option selected value="0">&euro;</option><option value="1">&euro;/kWp</option></select></td></tr>'
					 + '<tr><td>Preu de l\'energia:</td><td><span id="fv_preu_e"><input   id="txt_preu" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_de_lenergia_EDIT) + '"></span> &euro;/kWh</td></tr>'
					 + '<tr style="display:none"><td>Peatge d\'accés:</td><td><span id="fv_peatge"><input size="2"   id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td></tr>'
					 + '<tr><td>Preu del panell:</td><td><span id="fv_preu_panell"><input  id="txt_preu_panell" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_del_panell_EDIT) + '"></span> &euro;</td></tr>'
					 + '<tr><td>Preu inversor:</td><td><span id="fv_preu_inversor"><input  id="txt_preu_inversor" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_inversor_EDIT) + '"></span> &euro;/panell</td></tr>'
					 + '<tr><td>Retorn previst:</td><td><span id="fv_retorn">' + this.addCommas( peticioSOS.resultset.OUTPUT.Retorn_previst )+ '</span> &euro;/any</td></tr>'
					 + '<tr><td>Temps d\'amortització:</td><td><span id="fv_temps">' + this.addCommas( peticioSOS.resultset.OUTPUT.Temps_damortitzacio )+ '</span> anys</td></tr></table>'
					 + '<table class="tbl_dades"><tr><td>Estalvi en CO<sub>2</sub>:</td><td><span id="fv_CO">' + this.addCommas( peticioSOS.resultset.OUTPUT.Estalvi_en_CO2 )+ '</span> kg/any</td></tr></table>'
					 + '<div id="chart_div" style="width: 100%; height: 280px;"></div>');
			} else if (objWFS.tipus == "TS_ED") {
				
				
				//peticioSOS = this.sos.getTermoSolarEdificis(dataGeoJson, resultset);
				
				if(this.isCaluladoraLocal){
					peticioSOS = this.sos.getTermoSolarEdificis(dataGeoJson, resultset);
				}else{
					_data.method='getTermoSolarEdificis';					
					this.sendRequestToCalculadora(_data).then(function(results){
					peticioSOS = results;
					});
				}
				
				
				
				htmlArrayText.push('<div class="tit_sos_div">Potencial d\'aprofitament solar tèrmic</div> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="adequat_ts"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr>'
					 + '</table><table class="tbl_dades"><tr><td>Irradiació global:</td><td><span id="fv_global">' + this.addCommas( peticioSOS.resultset.OUTPUT.Irradiacio_global )+ '</span> kWh/any</td></tr></table>'
					 + '<table class="tbl_dades"><tr><td>Àrea total:</td><td><span id="fv_area_t">' + this.addCommas(peticioSOS.resultset.OUTPUT.Area_total )+ '</span> m&sup2;</td></tr><tr><td>Àrea instalada:</td><td><span id="fv_area_i">' + this.addCommas( peticioSOS.resultset.OUTPUT.Area_instalada )+ '</span> m&sup2;</td></tr>'
					 + '<tr><td>Nombre de panells:</td> <td><span id="fv_num_panells_span"><input  id="fv_num_panells" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Nombre_de_panells_EDIT) + '"></span></td></tr>'
					 + '<tr><td>Eficiència dels panells:</td><td><select id="efi_panells"> <option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option><option value="36">36%</option><option value="37">37%</option><option value="38">38%</option><option value="39">39%</option><option selected value="40">40%</option><option value="41">41%</option><option value="42">42%</option><option value="43">43%</option><option value="44">44%</option><option value="45">45%</option><option value="46">46%</option><option value="47">47%</option><option value="48">48%</option><option value="49">49%</option><option value="50">50%</option><option value="51">51%</option><option value="52">52%</option><option value="53">53%</option><option value="54">54%</option><option value="55">55%</option><option value="56">56%</option><option value="57">57%</option><option value="58">58%</option><option value="59">59%</option><option value="60">60%</option> 			</select> 			</td></tr>'
					 + '<tr><td>Pèrdues estimades del sistema:</td><td><select id="efi_perdus"><option value="0">0%</option> <option value="1">1%</option> <option value="2">2%</option> <option value="3">3%</option> <option value="4">4%</option> <option value="5">5%</option> <option value="6">6%</option> <option value="7">7%</option> <option value="8">8%</option> <option value="9">9%</option> <option value="10">10%</option> <option  value="11">11%</option> <option value="12">12%</option> <option value="13">13%</option> <option selected value="14">14%</option> <option value="15">15%</option> <option value="16">16%</option> <option value="17">17%</option> <option value="18">18%</option> <option value="19">19%</option> <option value="20">20%</option> <option value="21">21%</option> <option value="22">22%</option> <option value="23">23%</option> <option value="24">24%</option> <option value="25">25%</option><option value="26">26%</option><option value="27">27%</option><option value="28">28%</option><option value="29">29%</option><option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option></select></td></tr>'
					 + '<tr><td>Potència de l\'instal·lació:</td><td><span id="fv_poten_ins">' + this.addCommas( peticioSOS.resultset.OUTPUT.Potencia_de_instalacio )+ '</span> kW pic</td></tr>'
					 + '<tr><td>Energia generada:</td> <td><span id="fv_elct_gen">' + this.addCommas( peticioSOS.resultset.OUTPUT.Electricitat_generada )+ '</span> kWh/any</td></tr>'
					 + '<tr><td>Consum anual:</td><td><span id="fv_com_anu_span"><input  id="fv_com_anu" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Consum_anual_EDIT) + '"></span> kWh/any</td></tr>'
					 + '<tr><td>Generació pròpia:</td><td><span id="fv_gen_propia">' + this.addCommas( peticioSOS.resultset.OUTPUT.Generacio_propia )+ '</span></td></tr>'
					 + '</table>'
					 + '<table class="tbl_dades">'
					 + '<tr><td>Cost de la inversió:</td><td><span id="fv_cost_i">' + this.addCommas( peticioSOS.resultset.OUTPUT.Cost_de_la_inversio_euros )+ '</span>&euro;</td></tr>'
					 + '<tr><td>Preu de l\'energia:</td><td><span id="fv_preu_e"><input  id="txt_preu" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_de_lenergia_EDIT) + '"></span> &euro;/kWh</td></tr>'
					 + '<tr style="display:none"><td>Peatge d\'accés:</td><td><span id="fv_peatge"><input   id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td></tr>'
					 + '<tr><td>Preu del panell:</td><td><span id="fv_preu_panell"><input  id="txt_preu_panell" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_del_panell_EDIT) + '"></span> &euro;</td></tr>'
					 + '<tr><td>Retorn previst:</td><td><span id="fv_retorn">' + this.addCommas( peticioSOS.resultset.OUTPUT.Retorn_previst )+ '</span> &euro;/any</td></tr>'
					 + '<tr><td>Temps d\'amortització:</td><td><span id="fv_temps">' + this.addCommas( peticioSOS.resultset.OUTPUT.Temps_damortitzacio )+ '</span> anys</td></tr></table>'
					 + '<table class="tbl_dades"><tr><td>Estalvi en CO<sub>2</sub>:</td><td><span id="fv_CO">' + this.addCommas( peticioSOS.resultset.OUTPUT.Estalvi_en_CO2 )+ '</span> kg/any</td></tr></table>'
					 + '<div id="chart_div" style="width: 100%; height: 280px;"></div>');
			} else if (objWFS.tipus == "TS_TE") {
				
				
				//peticioSOS = this.sos.getTermoSolarTeulades(dataGeoJson, resultset);

				
				if(this.isCaluladoraLocal){
					peticioSOS = this.sos.getTermoSolarTeulades(dataGeoJson, resultset);
				}else{
					_data.method='getTermoSolarTeulades';					
					this.sendRequestToCalculadora(_data).then(function(results){
					peticioSOS = results;
					});
				}
				
				
				htmlArrayText.push('<div class="tit_sos_div">Potencial d\'aprofitament solar tèrmic</div> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="adequat_ts"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr>'
					 + '</table><table class="tbl_dades"><tr><td>Irradiació global:</td><td><span id="fv_global">' + this.addCommas( peticioSOS.resultset.OUTPUT.Irradiacio_global )+ '</span> kWh/any</td></tr></table><table class="tbl_dades"><tr><td>Àrea total:</td><td><span id="fv_area_t">' + this.addCommas( peticioSOS.resultset.OUTPUT.Area_total )+ '</span> m&sup2;</td></tr>'
					// + '<tr><td>Inclinació:</td><td><span id="fv_inclina">' + this.addCommas( peticioSOS.resultset.OUTPUT.fv_inclina )+ '</span> &deg;</td></tr>'
					// + '<tr><td>Orientació:</td><td><span id="fv_azimut">' + this.addCommas( peticioSOS.resultset.OUTPUT.fv_azimut )+ '</span> &deg;</td></tr>'
					 + '<tr><td>Àrea instalada:</td><td><span id="fv_area_i">' + this.addCommas(peticioSOS.resultset.OUTPUT.Area_instalada) + '</span> m&sup2;</td></tr>'
					 + '<tr><td>Nombre de panells:</td><td><span id="fv_num_panells_span"><input  id="fv_num_panells" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Nombre_de_panells_EDIT) + '"></span></td></tr>'
					 + '<tr><td>Eficiència dels panells:</td><td><select id="efi_panells"><option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option><option value="36">36%</option><option value="37">37%</option><option value="38">38%</option><option value="39">39%</option><option selected value="40">40%</option><option value="41">41%</option><option value="42">42%</option><option value="43">43%</option><option value="44">44%</option><option value="45">45%</option><option value="46">46%</option><option value="47">47%</option><option value="48">48%</option><option value="49">49%</option><option value="50">50%</option><option value="51">51%</option><option value="52">52%</option><option value="53">53%</option><option value="54">54%</option><option value="55">55%</option><option value="56">56%</option><option value="57">57%</option><option value="58">58%</option><option value="59">59%</option><option value="60">60%</option></select> 			</td></tr>'
					 + '<tr><td>Pèrdues estimades del sistema:</td><td><select id="efi_perdus"><option value="0">0%</option> <option value="1">1%</option> <option value="2">2%</option> <option value="3">3%</option> <option value="4">4%</option> <option value="5">5%</option> <option value="6">6%</option> <option value="7">7%</option> <option value="8">8%</option> <option value="9">9%</option> <option value="10">10%</option> <option  value="11">11%</option> <option value="12">12%</option> <option value="13">13%</option> <option selected value="14">14%</option> <option value="15">15%</option> <option value="16">16%</option> <option value="17">17%</option> <option value="18">18%</option> <option value="19">19%</option> <option value="20">20%</option> <option value="21">21%</option> <option value="22">22%</option> <option value="23">23%</option> <option value="24">24%</option> <option value="25">25%</option><option value="26">26%</option><option value="27">27%</option><option value="28">28%</option><option value="29">29%</option><option value="30">30%</option><option value="31">31%</option><option value="32">32%</option><option value="33">33%</option><option value="34">34%</option><option value="35">35%</option></select></td></tr>'
					 + '<tr><td>Potència de l\'instal·lació:</td><td><span id="fv_poten_ins">' + this.addCommas( peticioSOS.resultset.OUTPUT.Potencia_de_instalacio )+ '</span> kW pic</td></tr>'
					 + '<tr><td>Energia generada:</td><td><span id="fv_elct_gen">' + this.addCommas( peticioSOS.resultset.OUTPUT.Electricitat_generada )+ '</span> kWh/any</td></tr>'
					 + '<tr><td>Consum anual:</td><td><span id="fv_com_anu_span"><input  id="fv_com_anu" size="4"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Consum_anual_EDIT) + '"></span> kWh/any</td></tr>'
					 + '<tr><td>Generació pròpia:</td><td><span id="fv_gen_propia">' + this.addCommas( peticioSOS.resultset.OUTPUT.Generacio_propia )+ '</span></td></tr>'
					 + '</table> <table  class="tbl_dades">'
					 + '<tr><td>Cost de la inversió:</td><td><span id="fv_cost_i">' + this.addCommas( peticioSOS.resultset.OUTPUT.Cost_de_la_inversio_euros )+ '</span> &euro;</td></tr>'
					 + '<tr><td>Preu de l\'energia:</td><td><span id="fv_preu_e"><input  id="txt_preu" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_de_lenergia_EDIT) + '"></span> &euro;/kWh</td></tr>'
					 + '<tr style="display:none"><td>Peatge d\'accés:</td><td><span id="fv_peatge"><input   id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td></tr>'
					 + '<tr><td>Preu del panell:</td><td><span id="fv_preu_panell"><input  id="txt_preu_panell" size="2"  type="text" value="' + this.addCommas( peticioSOS.resultset.OUTPUT.Preu_del_panell_EDIT) + '"></span> &euro;</td></tr>'
					 + '<tr><td>Retorn previst:</td><td><span id="fv_retorn">' + this.addCommas( peticioSOS.resultset.OUTPUT.Retorn_previst )+ '</span> &euro;/any</td></tr>'
					 + '<tr><td>Temps d\'amortització:</td><td><span id="fv_temps">' + this.addCommas( peticioSOS.resultset.OUTPUT.Temps_damortitzacio )+ '</span> anys</td></tr></table>'
					 + '<table class="tbl_dades"><tr><td>Estalvi en CO<sub>2</sub>:</td><td><span id="fv_CO">' + this.addCommas( peticioSOS.resultset.OUTPUT.Estalvi_en_CO2 )+ '</span> kg/any</td></tr></table>'
					 + '<div id="chart_div" style="width: 100%; height: 280px;"></div>');
			}

			this.PETICIOSOS = peticioSOS;

			this.update(htmlArrayText.join(''), true);
			this.generatedChart(peticioSOS);

			jQuery('#efi_panells').val(peticioSOS.resultset.OUTPUT.Eficiencia_panells_EDIT);
			jQuery('#efi_perdus').val(peticioSOS.resultset.OUTPUT.Perdues_estimades_del_sistema_EDIT);

		},

		generatedChart: function (peticioSOS) {

			/*
			google.load("visualization", "1.0", {
			packages: ["corechart"],
			'language': 'ca'
			});

			google.setOnLoadCallback(drawChart);
			 */
			// //console.info(matriu);
			var data = google.visualization.arrayToDataTable(peticioSOS.resultset.OUTPUT.DibuixGraficMatriu);

			var europa = new google.visualization.NumberFormat({
					decimalSymbol: ',',
					groupingSymbol: '.'
				});
			// europa.format(data);

			var options = {
				title: '',
				curveType: 'function',
				colors: ['red', 'green'],
				fontSize: 10,
				vAxis: {
					title: '\u20AC ',
					textPosition: 'in'
				},
				chartArea: {
					width: '85%'
				},
				hAxis: {
					title: 'Anys'
				},

				legend: {
					position: 'bottom',
					textStyle: {
						fontSize: 10
					}
				}
			};

			var chart = new google.visualization.LineChart(document
					.getElementById('chart_div'));
			chart.draw(data, options);

		}

	});

L.Map.mergeOptions({
	positionControl: false
});

L.Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new L.Control.addModulSostenibilitat();
		this.addControl(this.positionControl);
	}
});

L.control.addModulSostenibilitat = function (options) {
	return new L.Control.addModulSostenibilitat(options);
};

L.Path.include({
	toGML: function () {
		var coords,
		xml = '';

		if (this instanceof L.MultiPolygon || this instanceof L.MultiPolyline) {
			console.log("GML TODO: L.MultiPolygon and L.MultiPolyline"); //MultiPolygon and MultiLineString
		} else if (this instanceof L.Polygon) {
			//Polygon
			xml += '<gml:Polygon srsName="EPSG:4326">';

			coords = this.gmlCoordPairs(this.getLatLngs());
			xml += '<gml:exterior><gml:LinearRing><gml:coordinates cs="," decimal="." ts=" ">';
			xml += coords.join(' ') + ' ' + coords[0];
			xml += '</gml:coordinates></gml:LinearRing></gml:exterior>';
			if (this._holes && this._holes.length) {
				// Deal with holes
				for (var h in this._holes) {
					coords = this.gmlCoordPairs(this._holes[h]);
					xml += '<gml:interior><gml:LinearRing><gml:coordinates>';
					xml += coords.join(' ') + ' ' + coords[0];
					xml += '</gml:coordinates></gml:LinearRing></gml:interior>';
				}
			}

			xml += "</gml:Polygon>";
			return xml;
		} else if (this instanceof L.Polyline) {
			xml += '<gml:LineString srsName="EPSG:4326">';
			coords = this.gmlCoordPairs(this.getLatLngs());
			xml += '<gml:coordinates cs="," decimal="." ts=" ">';
			xml += coords.join(' ');
			xml += '</gml:coordinates>';
			xml += "</gml:LineString>";
			return xml;
		} else if (this instanceof L.Circle) {
			console.log("GML TODO: L.Circle");

		}
	},

	gmlCoordPairs: function (arrLatlng) {
		coords = [];
		for (var i = 0; i < arrLatlng.length; i++) {
			coords.push(arrLatlng[i].lng + ',' + arrLatlng[i].lat);
		}
		return coords;
	}
});

L.Marker.include({
	toGML: function () {
		var xml;
		xml = '<gml:Point srsName="EPSG:4326"><gml:coordinates cs="," decimal="." ts=" ">';
		xml += this.getLatLng().lng + ',' + this.getLatLng().lat;
		xml += '</gml:coordinates></gml:Point>';
		return xml;
	}
});
