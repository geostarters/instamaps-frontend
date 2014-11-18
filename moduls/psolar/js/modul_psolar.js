console.debug("modul psolar");
var modul_psolar = true;
var infoPSolar;
var CONTS_Increment_preu_fv = 6;

var val_area3d_fv = 0;
var val_ghifv1_fv = 0;
var val_ghifv2_fv = 0;
var val_ghifv3_fv = 0;
var val_ghifv4_fv = 0;
var val_sfv1_fv = 0;
var val_sfv2_fv = 0;
var val_sfv3_fv = 0;
var val_sfv4_fv = 0;
var irradiacio_global_fv;
var area_instalada_fv;
var nombre_panells_fv;
var electricitat_generada_fv;
var eficiencia_panells_fv;
var cost_inversio_fv;
var CONTS_preu_panell_fv = 350;
var CONTS_area_panell_fv = 1.70;
var CONTS_preu_inversor_fv = 3300;
var CONST_degradacio_panells = [1.00, 0.991113974, 0.98230691, 0.973578105, 0.964926865, 0.9563525, 0.947854327, 0.939431669, 0.931083855, 0.922810219, 0.914610104, 0.906482855, 0.898427825, 0.890444372, 0.88253186, 0.874689659, 0.866917144, 0.859213696, 0.851578701, 0.844011551, 0.836511642, 0.829078378, 0.821711166, 0.814409419, 0.807172556, 0.8];
var matriu_preu_electricitat_fv = [0.17, 0.17822204, 0.188915362, 0.200250284, 0.212265301, 0.225001219, 0.238501292, 0.25281137, 0.267980052, 0.284058855, 0.301102387, 0.31916853, 0.338318642, 0.35861776, 0.380134826, 0.402942915, 0.42711949, 0.45274666, 0.479911459, 0.508706147, 0.539228515, 0.571582226, 0.60587716, 0.64222979, 0.680763577, 0.721609392];
var retorn_previst_fv;
var energia_produida_fv;
var preu_energia_fv;
var peatge_fv;
var estalviCO_fv;
var CONTS_interessos_prestec = 2.00;
var CONTS_interessos_beneficis = 2.00;
var CONTS_serie_geometrica1 = 1.03;
var CONTS_serie_geometrica2 = 0.97;
var totalIrradiacioAnyal_fv;
var colorParcela = "rgba(255, 255, 0,1)";
var heFetUnClick = true;
var capaGeoJSON;
var drawPSolar;
var HTML_edificis_fv = new Array();
HTML_edificis_fv.push('<h5>Potencial d\'aprofitament FV</h5> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="regular"><label>Regular</label></td> <td id="adequat"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr> </table>  	<table class="tbl_dades">	 		<tr> 		<td>Irradiació global:</td> 		<td><span id="fv_global"></span> kWh/any</td> 		</tr> 	</table>  <table class="tbl_dades"> 		<tr> 		<td>Àrea total:</td> 		<td><span id="fv_area_t"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Àrea instal.lada:</td> 		<td><span id="fv_area_i"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Nombre de panells:</td> 		<td><span id="fv_num_panells"></span></td> 		</tr> 		<tr> 		<td>Eficiència dels panells:</td> 		<td><select onClick="initEdificisFV()" id="efi_panells"> 				<option value="5">5%</option> 				<option value="6">6%</option> 				<option value="7">7%</option> 				<option value="8">8%</option> 				<option value="9">9%</option> 				<option value="10">10%</option> 				<option selected value="11">11%</option> 				<option value="12">12%</option> 				<option value="13">13%</option> 				<option value="14">14%</option> 				<option value="15">15%</option> 				<option value="16">16%</option> 				<option value="17">17%</option> 				<option value="18">18%</option> 				<option value="19">19%</option> 				<option value="20">20%</option> 				 				 			</select> 			</td> 		</tr> 		<tr> 		<td>Electricitat generada:</td> 		<td><span id="fv_elct_gen"></span>kWh/any</td> 		</tr> 	</table>  	<table class="tbl_dades">	 		<tr> 		<td>Cost de la inversió:</td> 		<td><span id="fv_cost_i"></span> &euro;</td> 		</tr> 		<tr> 		<td>Preu de l\'energia:</td> 		<td><span id="fv_preu_e"><input onChange="initEdificisFV()" id="txt_preu" size="2"  type="text" value="0,17"></span> &euro;/kWh</td> 		</tr> 		<tr> 		<td>Peatge d\'accés:</td> 		<td><span id="fv_peatge"><input onChange="initEdificisFV()"  id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td> 		</tr> 		<tr> 		<td>Retorn previst:</td> 		<td><span id="fv_retorn"></span> &euro;/any</td> 		</tr> 		<tr> 		<td>Temps d\'amortització:</td> 		<td><span id="fv_temps"> </span> anys</td> 		</tr> 		 	</table>  <table class="tbl_dades">	 		<tr> 		<td>Estalvi en CO<sub>2</sub>:</td> 		<td><span id="fv_CO"></span> kg/any</td> 		</tr> 	</table>  	<div id="chart_div" style="width: 100%; height: 280px;"></div> ');

var HTML_edificis_ts = new Array();
HTML_edificis_ts.push('<h5>Potencial d\'aprofitament termosolar</h5> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="adequat"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr> </table>  	<table class="tbl_dades">	 		<tr> 		<td>Irradiació global:</td> 		<td><span id="fv_global"></span> kWh/any</td> 		</tr> 	</table>  <table class="tbl_dades"> 		<tr> 		<td>Àrea total:</td> 		<td><span id="fv_area_t"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Àrea instal.lada:</td> 		<td><span id="fv_area_i"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Nombre de panells:</td> 		<td><span id="fv_num_panells"></span></td> 		</tr> 		<tr> 		<td>Eficiència dels panells:</td> 		<td><select onClick="calculaElectricitatGenerada_FV(this.value)" id="efi_panells"> 				<option value="30">30%</option> 				<option value="31">31%</option> 				<option value="32">32%</option> 				<option value="33">33%</option> 				<option value="34">34%</option> 				<option value="35">35%</option> 				<option value="36">36%</option> 				<option value="37">37%</option> 				<option value="38">38%</option> 				<option value="39">39%</option> 				<option selected value="40">40%</option> 				<option value="41">41%</option> 				<option value="42">42%</option> 				<option value="43">43%</option> 				<option value="44">44%</option> 				<option value="45">45%</option> 				<option value="46">46%</option> 				<option value="47">47%</option> 				<option value="48">48%</option> 				<option value="49">49%</option> 				<option value="50">50%</option> 				<option value="51">51%</option> 				<option value="52">52%</option> 				<option value="53">53%</option> 				<option value="54">54%</option> 				<option value="55">55%</option> 				<option value="56">56%</option> 				<option value="57">57%</option> 				<option value="58">58%</option> 				<option value="59">59%</option> 				<option value="60">60%</option> 			</select> 			</td> 		</tr> 		<tr> 		<td>Electricitat generada:</td> 		<td><span id="fv_elct_gen"></span>kWh/any</td> 		</tr> 	</table>  <table class="tbl_dades"> 		<tr> 		<td>Cost de la inversió:</td> 		<td><span id="fv_cost_i"></span> &euro;</td> 		</tr> 		<tr> 		<td>Preu de l\'energia:</td> 		<td><span id="fv_preu_e"><input onChange="calculaRetornPrevist_FV()" id="txt_preu" size="2"  type="text" value="0,17"></span> &euro;/kWh</td> 		</tr> 		<tr> 		<td>Peatge d\'accés:</td> 		<td><span id="fv_peatge"><input onChange="calculaRetornPrevist_FV()"  id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td> 		</tr> 		<tr> 		<td>Retorn previst:</td> 		<td><span id="fv_retorn"></span> &euro;/any</td> 		</tr> 		<!--<tr> 		<td>Temps d\'amortització:</td> 		<td><span id="fv_temps">XXXXX</span> anys</td> 		</tr>--> 		 	</table>  	<table class="tbl_dades">	 		<tr> 		<td>Estalvi en CO<sub>2</sub>:</td> 		<td><span id="fv_CO"></span> kg/any</td> 		</tr> 	</table>');

var HTML_teulades_fv = new Array();
HTML_teulades_fv.push('<h5>Potencial d\'aprofitament FV</h5> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="regular"><label>Regular</label></td> <td id="adequat"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr> </table>  	<table class="tbl_dades">	 		<tr> 		<td>Irradiació global:</td> 		<td><span id="fv_global"></span> kWh/any</td> 		</tr> 	</table>  <table class="tbl_dades">	 		<tr> 		<td>Àrea total:</td> 		<td><span id="fv_area_t"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Inclinació:</td> 		<td><span id="fv_inclina"></span> &deg;</td> 		</tr> 		<tr> 		<td>Azimut:</td> 		<td><span id="fv_azimut"></span> &deg;</td> 		</tr> 		<tr> 		<td>Àrea instal.lada:</td> 		<td><span id="fv_area_i"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Nombre de panells:</td> 		<td><span id="fv_num_panells"></span></td> 		</tr> 		<tr> 		<td>Eficiència dels panells:</td> 		<td><select onClick="initEdificisFV()"  id="efi_panells"> 				<option value="5">5%</option> 				<option value="6">6%</option> 				<option value="7">7%</option> 				<option value="8">8%</option> 				<option value="9">9%</option> 				<option value="10">10%</option> 				<option selected value="11">11%</option> 				<option value="12">12%</option> 				<option value="13">13%</option> 				<option value="14">14%</option> 				<option value="15">15%</option> 				<option value="16">16%</option> 				<option value="17">17%</option> 				<option value="18">18%</option> 				<option value="19">19%</option> 				<option value="20">20%</option> 				 				 			</select> 			</td> 		</tr> 		<tr> 		<td>Electricitat generada:</td> 		<td><span id="fv_elct_gen"></span>kWh/any</td> 		</tr> 	</table>  	<table class="tbl_dades">	 		<tr> 		<td>Cost de la inversió:</td> 		<td><span id="fv_cost_i"></span> &euro;</td> 		</tr> 		<tr> 		<td>Preu de l\'energia:</td> 		<td><span id="fv_preu_e"><input onChange="initEdificisFV()"  id="txt_preu" size="2"  type="text" value="0,17"></span> &euro;/kWh</td> 		</tr> 		<tr> 		<td>Peatge d\'accés:</td> 		<td><span id="fv_peatge"><input onChange="initEdificisFV()"   id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td> 		</tr> 		<tr> 		<td>Retorn previst:</td> 		<td><span id="fv_retorn"></span> &euro;/any</td> 		</tr> 		<tr> 		<td>Temps d\'amortització:</td> 		<td><span id="fv_temps"></span> anys</td> 		</tr> 		 	</table>  	<table class="tbl_dades"> 		<tr> 		<td>Estalvi en CO<sub>2</sub>:</td> 		<td><span id="fv_CO"></span> kg/any</td> 		</tr> 	</table>  <div id="chart_div" style="width: 100%; height: 280px;"></div>');

var HTML_teulades_ts = new Array();
HTML_teulades_ts.push('<h5>Potencial d\'aprofitament termosolar</h5> <table  class="tbl_chk"> <tr> <td id="pobre"><label>Pobre</label></td> <td id="adequat"><label>Adequat</label></td> <td id="optim"><label>Òptim</label></td> </tr> </table>  <table class="tbl_dades"> 		<tr> 		<td>Irradiació global:</td> 		<td><span id="fv_global"></span> kWh/any</td> 		</tr> 	</table>  <table class="tbl_dades">	 		<tr> 		<td>Àrea total:</td> 		<td><span id="fv_area_t"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Inclinació:</td> 		<td><span id="fv_inclina"></span> &deg;</td> 		</tr> 		<tr> 		<td>Azimut:</td> 		<td><span id="fv_azimut"></span> &deg;</td> 		</tr> 		<tr> 		<td>Àrea instal.lada:</td> 		<td><span id="fv_area_i"></span> m&sup2;</td> 		</tr> 		<tr> 		<td>Nombre de panells:</td> 		<td><span id="fv_num_panells"></span></td> 		</tr> 		<tr> 		<td>Eficiència dels panells:</td> 		<td><select onClick="calculaElectricitatGenerada_FV(this.value)" id="efi_panells"> 				<option value="30">30%</option> 				<option value="31">31%</option> 				<option value="32">32%</option> 				<option value="33">33%</option> 				<option value="34">34%</option> 				<option value="35">35%</option> 				<option value="36">36%</option> 				<option value="37">37%</option> 				<option value="38">38%</option> 				<option value="39">39%</option> 				<option selected value="40">40%</option> 				<option value="41">41%</option> 				<option value="42">42%</option> 				<option value="43">43%</option> 				<option value="44">44%</option> 				<option value="45">45%</option> 				<option value="46">46%</option> 				<option value="47">47%</option> 				<option value="48">48%</option> 				<option value="49">49%</option> 				<option value="50">50%</option> 				<option value="51">51%</option> 				<option value="52">52%</option> 				<option value="53">53%</option> 				<option value="54">54%</option> 				<option value="55">55%</option> 				<option value="56">56%</option> 				<option value="57">57%</option> 				<option value="58">58%</option> 				<option value="59">59%</option> 				<option value="60">60%</option>		 			</select> 			</td> 		</tr> 		<tr> 		<td>Electricitat generada:</td> 		<td><span id="fv_elct_gen"></span>kWh/any</td> 		</tr> 	</table>  	<table  class="tbl_dades">	 		<tr> 		<td>Cost de la inversió:</td> 		<td><span id="fv_cost_i"></span> &euro;</td> 		</tr> 		<tr> 		<td>Preu de l\'energia:</td> 		<td><span id="fv_preu_e"><input onChange="calculaRetornPrevist_FV()" id="txt_preu" size="2"  type="text" value="0,17"></span> &euro;/kWh</td> 		</tr> 		<tr> 		<td>Peatge d\'accés:</td> 		<td><span id="fv_peatge"><input onChange="calculaRetornPrevist_FV()"  id="txt_peatge"  size="2" type="text" value="0,5"></span> &euro;/MWh</td> 		</tr> 		<tr> 		<td>Retorn previst:</td> 		<td><span id="fv_retorn"></span> &euro;/any</td> 		</tr> 		 	</table>  <table class="tbl_dades"> 		<tr> 		<td>Estalvi en CO<sub>2</sub>:</td> 		<td><span id="fv_CO"></span> kg/any</td> 		</tr> 	</table>');

var E_FV = "edificis_fv";
var E_TS = "edificis_ts";
var T_FV = "teulades_fv";
var T_TS = "teulades_ts";

function addControLSolar() {

	var fet = false;

	if (map) {

		infoPSolar = L.control({
				position : 'topleft'
			});

		infoPSolar.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'psolar_info'); // create a div
			this._div.id = 'psolar_info_dv'; // with a class
			// "info"
			this.update();
			return this._div;
		};

		// method that we will use to update the control based on feature
		// properties passed
		infoPSolar.update = function (props) {
			this._div.innerHTML = '<button aria-hidden="true" id="bt_psolar_close" "data-dismiss="modal" class="close" type="button">×</button>' + props;
		};

		infoPSolar.addTo(map);
		infoPSolar.update("");
		jQuery('.psolar_info').height(jQuery('#map').height() - 100);

		jQuery('#psolar_info_dv').on('click', function (e) {
			if (e.target.id == 'bt_psolar_close') {
				tancaFinestra();
			}
			aturaClick(e);
		});

		jQuery('#bt_psolar_close').bind('click', function (e) {

			aturaClick(e);
			tancaFinestra();

		});

		fet = true;
		return fet;
	}

	return fet;
}

//function initModul_PSolar() {
jQuery(document).ready(function () {

	//setTimeout(addControLSolar(),1000);

	//setTimeout(addBarraPSolar(),10000);
});

function addBarraPSolar() {

	if (typeof drawPSolar == "undefined") {

		var editableLayers = new L.FeatureGroup();
		map.addLayer(editableLayers);

		var options = {
			position : 'topleft',
			draw : {
				polyline : false,
				polygon : {
					allowIntersection : false, // Restricts shapes to simple polygons
					drawError : {
						color : '#e1e100', // Color the shape will turn when intersects
						message : '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
					},
					shapeOptions : {
						color : '#bada55'
					}
				},
				circle : false, // Turns off this drawing tool
				rectangle : {
					shapeOptions : {
						clickable : false
					}
				},
				marker : false,
			},
			edit : false,
		};

		drawPSolar = new L.Control.Draw(options);

		drawPSolar.setDrawingOptions({
			rectangle : {
				shapeOptions : {
					color : '#0000FF'
				}
			},
			polygon : {
				shapeOptions : {
					color : '#0000FF'
				}
			}
		});

		addDrawToolPSolar();
		map.addControl(drawPSolar);
		//addDrawToolPSolar();
		map.on('draw:drawstart', function (e) {

			heFetUnClick = false;

		});

		// editableLayers.addLayer(layer);


		map.on('draw:created', function (e) {
			var type = e.layerType,
			layer = e.layer;

			var capaActiva;
			map.eachLayer(function (layer) {

				if (layer._url) {
					if (layer._url.indexOf("psolar_v2.map") != 1) {
						capaActiva = map._layers[layer._leaflet_id];
					}
				}

			});

			capaActiva.getFeature(e.layer.toGeoJSON().geometry.coordinates);

			aturaClick(e);
			// heFetUnClick=true;

			// editableLayers.addLayer(layer);
		});

	}

}

function addDrawToolPSolar() {
	//console.info(drawPSolar);
	L.drawLocal.draw.toolbar.buttons.polygon = 'Clica per començar a dibuixar una àrea';
	L.drawLocal.draw.toolbar.buttons.rectangle = 'Clica per començar a dibuixar rectangle';
	/*
	L.drawLocal = {
	draw : {
	handlers : {
	rectangle : {

	tooltip : {
	start : window.lang.convert('Fes clic al mapa per posar un punt')
	}
	},
	polygon : {
	tooltip : {
	start : window.lang.convert('Clica per començar a dibuixar una àrea'),
	cont : window.lang.convert('Clica per continuar dibuixant una àrea'),
	end : window.lang.convert('Clica el primer punt per tancar aquesta àrea')
	}
	}
	}
	}
	};
	return L.drawLocal;
	 */
}

function tancaFinestra(e) {
	jQuery('#psolar_info_dv').hide();

}

function updateFinesta(html_frame) {

	if (typeof infoPSolar == "undefined") {
		if (addControLSolar()) {
			infoPSolar.update(html_frame);
			jQuery('.psolar_info').show();
		} else {
			addControLSolar();
			infoPSolar.update(html_frame);
			jQuery('.psolar_info').show();
		}
	} else {

		infoPSolar.update(html_frame);
		jQuery('.psolar_info').show();
	}

}

function determinaValorMaxim(arr) {

	var max = arr[0];
	var maxIndex = 0;

	for (var i = 1; i < arr.length; i++) {
		if (arr[i] > max) {
			maxIndex = i;
			max = arr[i];
		}
	}

	return maxIndex;

}

function initEdificisFV() {

	sumValue_FV();

	jQuery('#fv_area_t').html(addCommas((val_area3d_fv).toFixed(0)));

	nombre_panells_fv = Math.floor((area_instalada_fv / CONTS_area_panell_fv).toFixed(0));

	jQuery('#fv_num_panells').html(addCommas(nombre_panells_fv));

	eficiencia_panells_fv = parseInt(jQuery('#efi_panells').val());

	calculaElectricitatGenerada_FV(eficiencia_panells_fv);

	calculaCostInversio_FV();

	calculaRetornPrevist_FV();

	tempsAmortitzacio_FV();

	posaComes();

}

function initEdificisTS() {

	sumValue_FV();
	jQuery('#fv_area_t').html(addCommas((val_area3d_fv).toFixed(0)));
	nombre_panells_fv = Math.floor((area_instalada_fv / CONTS_area_panell_fv).toFixed(0));
	jQuery('#fv_num_panells').html(addCommas(nombre_panells_fv));
	eficiencia_panells_fv = parseInt(jQuery('#efi_panells').val());
	calculaElectricitatGenerada_FV(eficiencia_panells_fv);

	calculaCostInversio_FV();
	calculaRetornPrevist_FV();
	posaComes();

}

function posaComes() {

	if (jQuery('#fv_inclina').html()) {

		jQuery('#fv_inclina').html(jQuery('#fv_inclina').html().replace(".", ","));
		jQuery('#fv_azimut').html(jQuery('#fv_azimut').html().replace(".", ","));

	}

}

function calculaEstalviCO_FV() {

	estalviCO_fv = (300 * electricitat_generada_fv).toFixed(0); ;

	jQuery('#fv_CO').html(addCommas(estalviCO_fv));

}

function sumValue_FV() {

	//valor = $('input[name=chk]:checked').val();

	valor = 2;

	if (valor == 4) {
		irradiacio_global_fv = (parseFloat(val_ghifv1_fv) + parseFloat(val_ghifv2_fv) + parseFloat(val_ghifv3_fv) + parseFloat(val_ghifv4_fv)).toFixed(0);
		area_instalada_fv = (parseFloat(val_sfv1_fv) + parseFloat(val_sfv2_fv) + parseFloat(val_sfv3_fv) + parseFloat(val_sfv4_fv)).toFixed(0);
		totalIrradiacioAnyal_fv = (parseFloat(val_ghifv1_fv));
	} else if (valor == 3) {
		irradiacio_global_fv = (parseFloat(val_ghifv2_fv) + parseFloat(val_ghifv3_fv) + parseFloat(val_ghifv4_fv)).toFixed(0);
		area_instalada_fv = (parseFloat(val_sfv2_fv) + parseFloat(val_sfv3_fv) + parseFloat(val_sfv4_fv)).toFixed(0);
		totalIrradiacioAnyal_fv = (parseFloat(val_ghifv2_fv));
	} else if (valor == 2) {
		irradiacio_global_fv = (parseFloat(val_ghifv3_fv) + parseFloat(val_ghifv4_fv)).toFixed(0);
		area_instalada_fv = (parseFloat(val_sfv3_fv) + parseFloat(val_sfv4_fv)).toFixed(0);
		totalIrradiacioAnyal_fv = (parseFloat(val_ghifv3_fv));
	} else if (valor == 1) {
		irradiacio_global_fv = (parseFloat(val_ghifv4_fv)).toFixed(0);
		area_instalada_fv = (parseFloat(val_sfv4_fv)).toFixed(0);
		totalIrradiacioAnyal_fv = (parseFloat(val_ghifv4_fv));
	}
	jQuery('#fv_global').html(addCommas(irradiacio_global_fv));
	jQuery('#fv_area_i').html(addCommas(area_instalada_fv));

}

function calculaRetornPrevist_FV() {

	preu_energia_fv = parseFloat(jQuery('#txt_preu').val().replace(",", "."));

	peatge_fv = parseFloat(jQuery('#txt_peatge').val().replace(",", "."));

	energia_produida_fv = (totalIrradiacioAnyal_fv * CONST_degradacio_panells[0] * eficiencia_panells_fv / 100);
	retorn_previst_fv = (energia_produida_fv * (preu_energia_fv - peatge_fv / 1000)).toFixed(0); ;
	jQuery('#fv_retorn').html(addCommas(retorn_previst_fv));

}

function calcualEnegeriaProduidaSegonsDegradacio(any) {

	return energia_produida_fv = (totalIrradiacioAnyal_fv * CONST_degradacio_panells[any] * eficiencia_panells_fv / 100);

}

function calculaElectricitatGenerada_FV(valor) {

	eficiencia_panells_fv = valor;

	electricitat_generada_fv = (irradiacio_global_fv * eficiencia_panells_fv / 100).toFixed(2);
	jQuery('#fv_elct_gen').html(addCommas(electricitat_generada_fv));

	calculaEstalviCO_FV();

}

function calculaCostInversio_FV() {

	//C14
	cost_inversio_fv = (nombre_panells_fv * CONTS_preu_panell_fv + CONTS_preu_inversor_fv * (Math.ceil(nombre_panells_fv / 10))).toFixed(0);
	jQuery('#fv_cost_i').html(addCommas(cost_inversio_fv));
}

function addCommas(nStr) {
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
}

function calcualcostInversioxAnys() {

	return cost_inversio_fv * (1 + parseFloat(CONTS_interessos_prestec) / 100);

}

function tempsAmortitzacio_FV() {

	var matriuAnys = 25;
	var linaVermella = [];
	var lineaVerda = [];
	var resultat = [];
	var resultatTOT = [];
	var amor = false;
	var any = 0;

	resultat.push(['Anys', 'Cost instal.lació (\u20AC)', 'Retorn inversió (\u20AC)']);

	for (var i = 1; i < matriuAnys; i++) {

		var matriuAnysAmortitzacio = i;
		CONTS_serie_geometrica1 = CONST_degradacio_panells[0] * (1 + parseFloat(CONTS_Increment_preu_fv) / 100) / (1 + parseFloat(CONTS_interessos_beneficis) / 100);

		CONTS_serie_geometrica2 = CONST_degradacio_panells[0] / (1 + parseFloat(CONTS_interessos_beneficis) / 100);

		var part1 = cost_inversio_fv * (Math.pow((1 + CONTS_interessos_prestec / 100), matriuAnysAmortitzacio));

		//var part21=16307.73 * parseInt(0.17) *                                                                          (1 - Math.pow( 1.03, parseInt(matriuAnysAmortitzacio) + 1) )/ (1 - 1.03) - 16307.73 * (0.5 / 1000) * Math.pow(1 +parseInt(2) / 100, parseInt(matriuAnysAmortitzacio))            *(1 -Math.pow( 0.97, parseInt(matriuAnysAmortitzacio) + 1)) / (1 - 0.97);
		//           ($C$20*      $C$10*      ((1+$C$9/100)^(C25))                                                      *(1-$C$31^(C25+1))                                            /(1-$C$31)   -$C$20      *($C$11/1000) * ((1+$C$9/100)^(C25))                                                      *(1-$C$32^(C25+1))                                             /(1-$C$32))
		var part2 = energia_produida_fv * preu_energia_fv * Math.pow(1 + CONTS_interessos_beneficis / 100, matriuAnysAmortitzacio) * (1 - Math.pow(CONTS_serie_geometrica1, matriuAnysAmortitzacio + 1)) / (1 - CONTS_serie_geometrica1) - energia_produida_fv * (peatge_fv / 1000) * Math.pow(1 + CONTS_interessos_beneficis / 100, matriuAnysAmortitzacio) * (1 - Math.pow(CONTS_serie_geometrica2, matriuAnysAmortitzacio + 1)) / (1 - CONTS_serie_geometrica2);

		//console.info("Resultat:"+matriuAnysAmortitzacio+":"+(part1-part2));

		resultatTOT.push(part1 - part2);

		resultat.push([matriuAnysAmortitzacio, part1, part2]);

	}

	jQuery.each(resultatTOT, function (index, value) {
		if (value < 0.0) {
			amor = true;
			any = index;
			return false;
			//break;
		}
	});

	jQuery('#fv_temps').html('');
	if (amor) {

		jQuery('#fv_temps').html(addCommas(calculaMesos(resultatTOT, any)));

		jQuery('#fv_retorn').html(addCommas(retorn_previst_fv));

	} else {
		jQuery('#fv_temps').html('+ 25');
	}

	dibuixGrafic(resultat);

}

function calculaMesos(resultatTOT, anyTall) {
	//console.info(resultatTOT[anyTall-1]);
	////console.info(resultatTOT[anyTall]);
	//console.info(Math.abs(resultatTOT[anyTall]));
	var cc = resultatTOT[anyTall - 1] + Math.abs(resultatTOT[anyTall])
		//console.info(cc);

		var cc1 = (resultatTOT[anyTall - 1] / cc);
	//console.info(cc1);
	return (parseFloat(anyTall) + parseFloat(cc1)).toFixed(1);

}

function dibuixGrafic(matriu) {
	google.load("visualization", "1", {
		packages : ["corechart"]
	});
	////console.info(matriu);
	var data = google.visualization.arrayToDataTable(matriu);

	var options = {
		title : '',
		curveType : 'function',
		colors : ['red', 'green'],
		vAxis : {
			title : '\u20AC / m2'
		},
		hAxis : {
			title : 'Anys'
		},
		legend : {
			position : 'bottom'
		}
	};

	var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
	chart.draw(data, options);

}

function sumaPropietats(geojson, clau) {

	var valor = 0;
	for (var i = 0; i < geojson.features.length; i++) {

		valor = valor + parseFloat(geojson.features[i].properties[clau]);
		//console.info(valor);

	}

	return valor;

}

function addColorParcelaFV(geojson, val1, val2, val3, val4) {

	for (var i = 0; i < geojson.features.length; i++) {

		var maxim = determinaValorMaxim([parseFloat(geojson.features[i].properties[val1]),
					parseFloat(geojson.features[i].properties[val2]),
					parseFloat(geojson.features[i].properties[val3]),
					parseFloat(geojson.features[i].properties[val4])]);
		/*
		console.info(parseFloat(geojson.features[i].properties[val1]));
		console.info(parseFloat(geojson.features[i].properties[val2]));
		console.info(parseFloat(geojson.features[i].properties[val3]));
		console.info(parseFloat(geojson.features[i].properties[val4]));
		console.info(maxim);
		 */

		var colorFF = "#ff0000";
		if (maxim == 3) {
			colorFF = "#3B1B00"; //pbre #3B1B00
		} else if (maxim == 2) {
			colorFF = "#BB6910"; //regular #BB6910
		} else if (maxim == 1) {
			colorFF = "#FFB002"; //adequat #FFB002
		} else if (maxim == 0) {
			colorFF = "#FFFF00"; //optim #FFFF00
		}

		geojson.features[i].properties.style = {
			weight : 2,
			color : "#F200FF",
			opacity : 1,
			fillColor : colorFF,
			fillOpacity : 1
		};

	}

	return geojson;

}

function addColorParcelaTS(geojson, val1, val2, val3) {

	for (i = 0; i < geojson.features.length; i++) {

		var maxim = determinaValorMaxim([parseFloat(geojson.features[i].properties[val1]),
					parseFloat(geojson.features[i].properties[val2]),
					parseFloat(geojson.features[i].properties[val3])]);

		var colorFF = "#ff0000";
		if (maxim == 2) {
			colorFF = "#3B1B00"; //pbre #3B1B00
		} else if (maxim == 1) {
			colorFF = "#FFB002"; //adequat #FFB002
		} else if (maxim == 0) {
			colorFF = "#FFFF00"; //optim #FFFF00
		}

		geojson.features[i].properties.style = {
			weight : 2,
			color : "#F200FF",
			opacity : 1,
			fillColor : colorFF,
			fillOpacity : 1
		};

	}

	return geojson;

}

function iniciaInfoPSolar(capa, geojson) {

	//Fotovoltaic_edificis
	if (capa == E_FV) {
		CONTS_preu_panell_fv = 350;
		CONTS_area_panell_fv = 1.70;
		CONTS_preu_inversor_fv = 3300;
		CONTS_interessos_prestec = 2.00;
		CONTS_interessos_beneficis = 2.00;
		CONTS_serie_geometrica1 = 1.03;
		CONTS_serie_geometrica2 = 0.97;

		val_area3d_fv = sumaPropietats(geojson, 'area3d');
		val_ghifv1_fv = sumaPropietats(geojson, 'ghifv1');
		val_ghifv2_fv = sumaPropietats(geojson, 'ghifv2'); //optim
		val_ghifv3_fv = sumaPropietats(geojson, 'ghifv3');
		val_ghifv4_fv = sumaPropietats(geojson, 'ghifv4');

		geojson = addColorParcelaFV(geojson, 'sfv1', 'sfv2', 'sfv3', 'sfv4');
		//console.info(geojson);
		val_sfv1_fv = sumaPropietats(geojson, 'sfv1');
		val_sfv2_fv = sumaPropietats(geojson, 'sfv2');
		val_sfv3_fv = sumaPropietats(geojson, 'sfv3');
		val_sfv4_fv = sumaPropietats(geojson, 'sfv4');
		//jQuery('#psolar_dv').html(HTML_edificis_fv.join(''));

		updateFinesta(HTML_edificis_fv.join(''));

		initEdificisFV();

	} else if (capa == E_TS) {

		//Termosolar_edifics
		CONTS_preu_panell_fv = 1200;
		CONTS_area_panell_fv = 1.95;
		CONTS_preu_inversor_fv = 3300;
		CONTS_interessos_prestec = 2;
		CONTS_interessos_beneficis = 2;
		CONTS_serie_geometrica1 = 1.04;
		CONTS_serie_geometrica2 = 0.98;
		val_area3d_fv = sumaPropietats(geojson, 'area3d');
		val_ghifv1_fv = sumaPropietats(geojson, 'ghits1');
		val_ghifv2_fv = 0;
		val_ghifv3_fv = sumaPropietats(geojson, 'ghits2');
		val_ghifv4_fv = sumaPropietats(geojson, 'ghits3');
		geojson = addColorParcelaFV(geojson, 'sfv1', 'sfv2', 'sfv3', 'sfv4');
		val_sfv1_fv = sumaPropietats(geojson, 'sts1');
		val_sfv2_fv = 0;
		val_sfv3_fv = sumaPropietats(geojson, 'sts2');
		val_sfv4_fv = sumaPropietats(geojson, 'sts3');
		updateFinesta(HTML_edificis_ts.join(''));
		initEdificisTS();

	} else if (capa == T_FV) {
		//Teulades_fv
		//console.info(geojson);
		val_area3d_fv = sumaPropietats(geojson, 'area3d');
		val_ghifv1_fv = sumaPropietats(geojson, 'fv1_sum');
		val_ghifv2_fv = sumaPropietats(geojson, 'fv2_sum');
		val_ghifv3_fv = sumaPropietats(geojson, 'fv3_sum');
		val_ghifv4_fv = sumaPropietats(geojson, 'fv4_sum');
		val_sfv1_fv = sumaPropietats(geojson, 'sfv1');
		val_sfv2_fv = sumaPropietats(geojson, 'sfv2');
		val_sfv3_fv = sumaPropietats(geojson, 'sfv3');
		val_sfv4_fv = sumaPropietats(geojson, 'sfv4');
		geojson = addColorParcelaFV(geojson, 'sfv1', 'sfv2', 'sfv3', 'sfv4');
		CONTS_preu_panell_fv = 350;
		CONTS_area_panell_fv = 1.70;
		CONTS_preu_inversor_fv = 3300;
		CONTS_interessos_prestec = 2;
		CONTS_interessos_beneficis = 2;
		CONTS_serie_geometrica1 = 1.03;
		CONTS_serie_geometrica2 = 0.97;
		updateFinesta(HTML_teulades_fv.join(''));

		initEdificisFV();
		if (geojson.features.length == 1) {
			jQuery('#fv_inclina').html(parseFloat(sumaPropietats(geojson, 'slope_mean').toFixed(1)));
			jQuery('#fv_azimut').html((sumaPropietats(geojson, 'aspect')).toFixed(1));
		}
		//Teulades_ts
	} else if (capa == T_TS) {
		val_area3d_fv = sumaPropietats(geojson, 'area3d');
		val_ghifv1_fv = sumaPropietats(geojson, 'ts1_sum');
		val_ghifv2_fv = 0;
		val_ghifv3_fv = sumaPropietats(geojson, 'ts2_sum');
		val_ghifv4_fv = sumaPropietats(geojson, 's3_sum');
		//geojson=addColorParcelaTS(geojson,'ts1_sum','ts2_sum','ts3_sum');

		geojson = addColorParcelaFV(geojson, 'sfv1', 'sfv2', 'sfv3', 'sfv4');

		val_sfv1_fv = sumaPropietats(geojson, 'sts1');
		val_sfv2_fv = 0;
		val_sfv3_fv = sumaPropietats(geojson, 'sts2'); ;
		val_sfv4_fv = sumaPropietats(geojson, 'sts3');

		CONTS_preu_panell_fv = 1200;
		CONTS_area_panell_fv = 1.95;
		CONTS_preu_inversor_fv = 3300;

		CONTS_interessos_prestec = 2;
		CONTS_interessos_beneficis = 2;
		CONTS_serie_geometrica1 = 1.04;
		CONTS_serie_geometrica2 = 0.98;

		updateFinesta(HTML_teulades_ts.join(''));
		initEdificisTS();
		if (geojson.features.length == 1) {
			jQuery('#fv_inclina').html(parseFloat(sumaPropietats(geojson, 'slope_mean').toFixed(1)));
			jQuery('#fv_azimut').html((sumaPropietats(geojson, 'aspect')).toFixed(1));
		}
	}

	capaGeoJSON = L.geoJson(geojson, {
			style : function (feature) {

				return feature.properties.style;
			}
		}).addTo(map);

}
