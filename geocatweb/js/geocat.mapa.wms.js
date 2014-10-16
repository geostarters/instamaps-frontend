var _htmlServeisWMS = [];
var ActiuWMS = {
		"servidor" : "servidor",
		"url" : "url",
		"layers" : "layers",
		"epsg" : 'L.CRS.EPSG4326'
	};

function generaLlistaServeisWMS() {

	_htmlServeisWMS.push('<div class="panel-success"><ul class="bs-dadesO panel-heading">');
	var llista_servidorsWMS = {
			"WMS" : [
					{
						"TITOL" : "Base municipal",
						"ORGANITZAC" : "Institut Cartogràfic de Catalunya",
						"IDARXIU" : "http://galileo.icc.cat/arcgis/services/icc_limadmin_v_r/MapServer/WMSServer?",
						"URN" : " urn:uuid:761da3ce-233c-11e2-a4dd-13da4f953834"
					},
					{
						"TITOL" : "Mapa Urbanístic",
						"ORGANITZAC" : "Departament de Territori i Sostenibilitat",
						"IDARXIU" : "http://tes.gencat.cat/webmap/MUC/Request.aspx?",
						"URN" : "urn:uuid:e7a15a72-233b-11e2-a4dd-13da4f953834"
					},

					{
						"TITOL" : "Mapa Cadastral",
						"ORGANITZAC" : "Dirección General del Catastro ",
						"IDARXIU" : "http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?",
						"URN" : "urn:uuid:260c0ccb-233c-11e2-a4dd-13da4f953834"
					},

					/*
					 * { "TITOL" : "Avistaments cetàcis", "ORGANITZAC" : "Centre de
					 * Recerca Ecològica i Aplicacions Forestals (CREAF) - UAB",
					 * "IDARXIU" :
					 * "http://www.ogc.uab.es/cgi-bin/cetcat/MiraMon5_0.cgi?", "URN" :
					 * "urn:uuid:dc86e70e-79ca-11e3-aa3b-07b03c41b8e8" },
					 */
					{
						"TITOL" : "Parcs eòlics",
						"ORGANITZAC" : "Direcció General de Polítiques Ambientals",
						"IDARXIU" : "http://mapaidec.icc.cat/ogc/geoservei?map=/opt/idec/dades/peolics/parcseolics.map&amp",
						"URN" : "urn:uuid:3dd3d606-79c8-11e3-aa3b-07b03c41b8e8"
					},
					{
						"TITOL" : "Mapes Medi Natural",
						"ORGANITZAC" : "Departament d'Agricultura, Ramaderia, Pesca, Alimentació i Medi Natural",
						"IDARXIU" : "http://magrana.gencat.cat/SIG_ws/services/PUBLIC_OGC/MapServer/WMSServer?",
						"URN" : "urn:uuid:6661c209-1462-11e3-8d85-e315c0a1d933"
					},
					{
						"TITOL" : "Ortofotos històriques",
						"ORGANITZAC" : "Institut Cartogràfic de Catalunya",
						"IDARXIU" : "http://historics.icc.cat:80/lizardtech/iserv/ows?",
						"URN" : "urn:uuid:6434ad48-66df-11e2-8be5-bd1ed7ebebe1"
					},

					{
						"TITOL" : "Rutes turístiques",
						"ORGANITZAC" : "Direccio General de Difusio",
						"IDARXIU" : "http://delta.icc.cat/cgi-bin/mapserv?map=/opt/idec/dades/probert/idelocal_probert.map&",
						"URN" : "urn:uuid:6975bcce-2347-11e2-a4dd-13da4f953834"
					},

					{
						"TITOL" : "Cobertes del Sòl",
						"ORGANITZAC" : "Centre de Recerca Ecològica i Aplicacions Forestals (CREAF) - UAB",
						"IDARXIU" : "http://www.opengis.uab.es/cgi-bin/MCSC/MiraMon.cgi?",
						"URN" : "urn:uuid:54012596-233b-11e2-a4dd-13da4f953834"
					},

					{
						"TITOL" : "Mapes Ambientals",
						"ORGANITZAC" : "Departament de Territori i Sostenibilitat",
						"IDARXIU" : "http://sima.gencat.cat/DMAH_ws/SIMA_OGC/MapServer/WMSServer?",
						"URN" : "urn:uuid:e84cb5ba-233b-11e2-a4dd-13da4f953834"
					},

					{
						"TITOL" : "Nodes guifi.net",
						"ORGANITZAC" : "GUIFI.NET",
						"IDARXIU" : "http://guifi.net/cgi-bin/mapserv?map=/home/guifi/maps.guifi.net/guifimaps/GMap.map&",
						"URN" : "urn:uuid:63013742-233c-11e2-a4dd-13da4f953834"
					},
					{
		                "TITOL" : "Mapa trànsit en temps real",
		                "ORGANITZAC" : "Servei Català de Trànsit ",
		                "IDARXIU" : "http://sctwms.gencat.cat/WMS/mapserv.exe?map=//sctbrsscc05/AGATA/EstatdelTransit.map&amp",
		                "URN" : "urn:uuid:fe8365ca-233c-11e2-a4dd-13da4f953834"
					}
			]
		};	
	
	jQuery.each(llista_servidorsWMS.WMS, function(key, WMS) {
		_htmlServeisWMS.push('<li><a class="label-wms" href="#" id="'
			+ WMS.IDARXIU
			+ '">'
			+ window.lang.convert(WMS.TITOL)
			+ '</a>'
			+ '<a target="_blank" lang="ca" title="Informació dels serveis" href="http://catalegidec.icc.cat/wefex/client?do=cercaAssociacions&resposta=detall&idioma=ca&id='
			+ WMS.URN
			+ '"><span class="glyphicon glyphicon-info-sign info-wms"></span></a>'
			+ '</li>');
	});

	_htmlServeisWMS.push('</ul></div>');
	_htmlServeisWMS.push('<div class="input-group txt_ext"><input type="text" lang="ca" id="txt_URLWMS" style="height:33px" placeholder="Entrar URL servei WMS" class="form-control">');
	_htmlServeisWMS.push('<span class="input-group-btn"><button class="btn btn-success" id="bt_connWMS"  type="button"><span class="glyphicon glyphicon-play"></span></button></span>');
	_htmlServeisWMS.push('</div>');
	_htmlServeisWMS.push('<div style="height:100px;overflow:auto" id="div_layersWMS"  class="tbl"></div>');
	_htmlServeisWMS.push('<div id="div_emptyWMS" style="height: 35px;margin-top: 2px"></div>');
}

jQuery(document).on('click', "#bt_connWMS", function(e) {
	var url = jQuery('#txt_URLWMS').val();

	if (url == "") {
		alert(window.lang.convert("Has d%27introduïr una URL del servidor"));

	} else if (!isValidURL(url)) {
		alert(window.lang.convert("La URL introduïda no sembla correcte"));
	} else {

		getCapabilitiesWMS(url, null);
	}
});

function getCapabilitiesWMS(url, servidor) {

    var _htmlLayersWMS = [];
    getWMSLayers(url)
                .then(
                           function(results) {

                                 jQuery('#div_layersWMS').html('');
                                 jQuery('#div_emptyWMS').empty();

                                 if (servidor == null) {
                                       servidor = results.Service.Title;
                                 }

                                 try {
                                       ActiuWMS.servidor = servidor;
                                       ActiuWMS.url = jQuery.trim(url);
                                       var matriuEPSG = results.Capability.Layer.CRS;

                                       if (!matriuEPSG) {
                                             matriuEPSG = results.Capability.Layer.SRS;

                                             if (!matriuEPSG) {
                                                   matriuEPSG = results.Capability.Layer[0].CRS;

                                             }

                                       }

                                       var epsg = [];
                                       jQuery.each(matriuEPSG, function(index, value) {

                                             epsg.push(value);
                                       });

                                       if (jQuery.inArray('EPSG:3857', epsg) != -1) {
                                             ActiuWMS.epsg = L.CRS.EPSG3857;
                                             ActiuWMS.epsgtxt = 'EPSG:3857';
                                       } else if (jQuery.inArray('EPSG:900913', epsg) != -1) {
                                             ActiuWMS.epsg = L.CRS.EPSG3857;
                                             ActiuWMS.epsgtxt = 'EPSG:3857';
                                       } else if (jQuery.inArray('EPSG:4326', epsg) != -1) {
                                             ActiuWMS.epsg = L.CRS.EPSG4326;
                                             ActiuWMS.epsgtxt = '4326';
                                       } else if (jQuery.inArray('CRS:84', epsg) != -1) {
                                             ActiuWMS.epsg = L.CRS.EPSG4326;
                                             ActiuWMS.epsgtxt = '4326';

                                       } else {
                                             alert(window.lang
                                                         .convert("El sistema de coordenades no és compatible amb el mapa"));
                                             return;
                                       }

                                       _htmlLayersWMS.push('<ul class="bs-dadesO_WMS">');

                                       if (typeof results.Capability.Layer.Layer != 'undefined') {

                                             if (typeof results.Capability.Layer.Layer.length == 'undefined') {

                                                   _htmlLayersWMS
                                                               .push('<li><label><input name="chk_WMS" id="chk_WMS" type="checkbox" value="'
                                                                          + results.Capability.Layer.Layer.Name
                                                                          + '">'
                                                                          + results.Capability.Layer.Layer.Title
                                                                          + '</label></li>');

                                             } else if ((typeof results.Capability.Layer.Layer.length != 'undefined')) {
                                                   jQuery
                                                               .each(
                                                                           results.Capability.Layer.Layer,
                                                                          function(index, value) {

                                                                                _htmlLayersWMS
                                                                                            .push('<li><label><input name="chk_WMS" id="chk_WMS" type="checkbox" value="'
                                                                                                        + value.Name
                                                                                                        + '">'
                                                                                                        + value.Title
                                                                                                        + '</label></li>');
                                                                          });
                                             }
                                       } else {
                                             if (typeof results.Capability.Layer.length != 'undefined') {
                                                   jQuery
                                                               .each(
                                                                           results.Capability.Layer,
                                                                          function(index, value) {

                                                                                _htmlLayersWMS
                                                                                            .push('<li><label><input name="chk_WMS" id="chk_WMS" type="checkbox" value="'
                                                                                                        + value.Name
                                                                                                        + '">'
                                                                                                        + value.Title
                                                                                                        + '</label></li>');
                                                                          });

                                             }

                                       }
                                       _htmlLayersWMS.push('</ul>');

                                       jQuery('#div_layersWMS').html(
                                                   _htmlLayersWMS.join(''));
                                       jQuery('#div_emptyWMS').empty();

                                       jQuery('#div_emptyWMS')
                                                   .html(
                                                               '<div style="float:right"><button lang="ca" id="bt_addWMS" class="btn btn-success" >'
                                                                          + window.lang
                                                                                      .convert("Afegir capes")
                                                                          + '</button></div>');

                                 } catch (err) {
                                       jQuery('#div_layersWMS').html(
                                                   '<hr>Error interpretar capabilities: '
                                                               + err + '</hr>');
                                 }
                           });
}

jQuery(document).on('click', "#bt_addWMS", function(e) {
    addExternalWMS();

});


function addExternalWMS2() {
	var cc = [];

	jQuery('input[name="chk_WMS"]:checked').each(function() {
		cc.push(jQuery(this).val());
	});

	ActiuWMS.layers = cc.join(',');
	
	var wmsLayer = new L.tileLayer.betterWms(ActiuWMS.url, {
		layers : ActiuWMS.layers,
		crs : ActiuWMS.epsg,
		transparent : true,
		format : 'image/png'
	});

	wmsLayer.options.businessId = '-1';
	wmsLayer.options.nom = ActiuWMS.servidor;
	wmsLayer.options.tipus = 'WMS';
	
	map.addLayer(wmsLayer);
	wmsLayer.options.zIndex = controlCapes._lastZIndex+ 1;
	controlCapes.addOverlay(wmsLayer, ActiuWMS.servidor, true);
	controlCapes._lastZIndex++;
	activaPanelCapes(true);
	jQuery('#dialog_dades_ex').modal('toggle');

}

function addExternalWMS() {
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'wms', ActiuWMS.url, 1]);
	
	var cc = [];
	jQuery('input[name="chk_WMS"]:checked').each(function() {
		cc.push(jQuery(this).val());
	});
	ActiuWMS.layers = cc.join(',');
	
	var wmsLayer = L.tileLayer.betterWms(ActiuWMS.url, {
		layers : ActiuWMS.layers,
		crs : ActiuWMS.epsg,
		transparent : true,
		format : 'image/png'
	});

	wmsLayer.options.businessId = '-1';
	wmsLayer.options.nom = ActiuWMS.servidor;
	wmsLayer.options.tipus = t_wms;

	if(typeof url('?businessid') == "string"){
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: ActiuWMS.servidor,
				serverType: t_wms,
				version: wmsLayer.wmsParams.version,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            order: controlCapes._lastZIndex+1,
	            epsg: ActiuWMS.epsgtxt,
	            imgFormat: 'image/png',
	            infFormat: 'text/html',
	            tiles: true,	            
	            transparency: true,
	            opacity: 1,
	            visibilitat: 'O',
	            url: ActiuWMS.url,
	            layers: JSON.stringify([{name:ActiuWMS.layers,title:ActiuWMS.layers,group:0,check:true,query:true}]),
	            calentas: false,
	            activas: true,
	            visibilitats: true,
				options: '{"url":"'+ActiuWMS.url+'","layers":"'+ActiuWMS.layers+'"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				wmsLayer.options.businessId = results.results.businessId;
				map.addLayer(wmsLayer); //wmsLayer.addTo(map);
				wmsLayer.bringToFront();
				wmsLayer.options.zIndex = controlCapes._lastZIndex+ 1;
				controlCapes.addOverlay(wmsLayer, ActiuWMS.servidor, true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
				jQuery('#dialog_dades_ex').modal('toggle');				
				
			}else{
				console.debug('createServidorInMap ERROR');
			}
		});
		
	}else{
		wmsLayer.addTo(map);
		wmsLayer.options.zIndex = controlCapes._lastZIndex+ 1;
		controlCapes.addOverlay(wmsLayer, ActiuWMS.servidor, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
		jQuery('#dialog_dades_ex').modal('toggle');	
	}	
}

function loadWmsLayer(layer){
	
	var newWMS = L.tileLayer.betterWms(layer.url, {
	    layers: layer.layers,
	    format: layer.imgFormat,
	    transparent: layer.transparency,
	    version: layer.version,
	    opacity: layer.opacity,
	    crs: layer.epsg,
		nom : layer.serverName,
		tipus: layer.serverType,
		zIndex :  parseInt(layer.capesOrdre),	    
	    businessId: layer.businessId
	});
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		newWMS.addTo(map);
	}
	
	controlCapes.addOverlay(newWMS, layer.serverName, true);
	controlCapes._lastZIndex++;
}

