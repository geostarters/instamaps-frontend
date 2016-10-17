var _htmlServeisWMS = [],
_NomServer2 = "",
WMS_BBOX,
ActiuWMS = {
	"servidor" : "servidor",
	"url" : "url",
	"layers" : "layers",
	"epsg" : 'L.CRS.EPSG4326',
	"tileSize":"512",
	"wmstime":false
};

function generaLlistaServeisWMS() {
	_htmlServeisWMS.push('<div class="panel-success"><ul class="bs-dadesO panel-heading">');
	var llista_servidorsWMS = {
		"WMS" : [
			{
				"TITOL" : "Base municipal",
				"ORGANITZAC" : "Institut Cartogràfic i Geològic de Catalunya",
				"IDARXIU" : "http://galileo.icc.cat/arcgis/services/icc_limadmin_v_r/MapServer/WMSServer?",
				"URN" : "urn:uuid:761da3ce-233c-11e2-a4dd-13da4f953834"
			},
			{
				"TITOL" : "Delimitació municipal",
				"ORGANITZAC" : "Institut Cartogràfic i Geològic de Catalunya",
				"IDARXIU" : "http://geoserveis.icc.cat/icc_atlm/wms/service?",
				"URN" : "urn:uuid:761da3ce-233c-11e2-a4dd-13da4f953834"
			},
			
			/*
			{
				"TITOL" : "Mapa Urbanístic",
				"ORGANITZAC" : "Departament de Territori i Sostenibilitat",
				"IDARXIU" : "http://dtes.gencat.cat/webmap/MUC/service.svc/get?",
				"URN" : "urn:uuid:e7a15a72-233b-11e2-a4dd-13da4f953834"
			},
			*/
			
			{
				"TITOL" : "Mapa Cadastral",
				"ORGANITZAC" : "Dirección General del Catastro",
				"IDARXIU" : "http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?",
				"URN" : "urn:uuid:260c0ccb-233c-11e2-a4dd-13da4f953834"
			},
			{ 
				"TITOL" : "Atermenament i usos de costes",
				"ORGANITZAC" : "Departament de Territori i Sostenibilitat",
				"IDARXIU" : "http://sig.gencat.cat/ows/COSTES/wms?", 
				"URN" :"urn:uuid:873ee728-cc2c-11e2-a37e-f96b77832722"
			},
			{
				"TITOL" : "Establiments industrials",
				"ORGANITZAC" : "Direccio General de Difusio",
				"IDARXIU" : "http://pcivil.icgc.cat/ogc/geoservei?map=/opt/idec/dades/pcivil/risc_quimic.map&amp",
				"URN" : "urn:uuid:0a71e360-7f73-11e4-b2ac-e7f91a2c3576"
			},
			{
				"TITOL" : "Mapes Medi Natural",
				"ORGANITZAC" : "Departament d'Agricultura, Ramaderia, Pesca, Alimentació i Medi Natural",
				"IDARXIU" : "http://magrana.gencat.cat/SIG_ws/services/PUBLIC_OGC/MapServer/WMSServer?",
				"URN" : "urn:uuid:6661c209-1462-11e3-8d85-e315c0a1d933"
			},
			{
				"TITOL" : "Ortofotos històriques",
				"ORGANITZAC" : "Institut Cartogràfic i Geològic de Catalunya",
				"IDARXIU" : "http://historics.icc.cat:80/lizardtech/iserv/ows?",
				"URN" : "urn:uuid:6434ad48-66df-11e2-8be5-bd1ed7ebebe1"
			},
			{
				"TITOL" : "Risc Sísmic",
				"ORGANITZAC" : "Direccio General de Difusio",
				"IDARXIU" : "http://pcivil.icgc.cat/ogc/geoservei?map=/opt/idec/dades/pcivil/risc_sismic.map&",
				"URN" : "urn:uuid:09e7f2c8-7f73-11e4-b2ac-e7f91a2c3576"
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
			},
			{
                "TITOL" : "Mapa Cadastral per anys",
                "ORGANITZAC" : "Dirección General de Cadastro",
                "IDARXIU" : HOST_APP2+"geotimeservices/catastro_dgc",
                "WMST" : true
			},
			{
                "TITOL" : "Ortofotos per anys",
                "ORGANITZAC" : "Institut Cartogràfic i Geològic de Catalunya",
                "IDARXIU" : HOST_APP2+"geotimeservices/orto_icgc",
                "WMST" : true
			},
			{
                "TITOL" : "Seccions Censals per anys",
                "ORGANITZAC" : "Institut Cartogràfic i Geològic de Catalunya",
                "IDARXIU" : HOST_APP2+"geotimeservices/seccionsc_icgc",
                "WMST" : true
			}
		]
	};	
	
	jQuery.each(llista_servidorsWMS.WMS, function(key, WMS) {
		if(WMS.WMST){
			_htmlServeisWMS.push('<li><a class="label-wms" href="#" id="' +
				WMS.IDARXIU +
				'">' +
				window.lang.translate(WMS.TITOL) +
				'</a>' +
				'<a target="_blank" lang="ca" title="Servei WMS-TIME" href="' +
				WMS.IDARXIU +'?&Request=GetCapabilities&service=WMS' +
				'"><span class="glyphicon glyphicon-time info-wms"></span></a>' +
				'</li>');
		}else{
			_htmlServeisWMS.push('<li><a class="label-wms" href="#" id="' +
				WMS.IDARXIU +
				'">' +
				window.lang.translate(WMS.TITOL) +
				'</a>' +
				'<a target="_blank" lang="ca" title="Informació dels serveis" href="http://www.geoportal.cat/wefex/client?idioma=ca&do=cercaAssociacions&resposta=detall&id=' +
				WMS.URN +
				'"><span class="glyphicon glyphicon-info-sign info-wms"></span></a>' +
				'</li>');
		}
	});
	//TODO cambiar y cargar algun template externo
	_htmlServeisWMS.push('<li></li>');
	_htmlServeisWMS.push('<li><div class="input-group txt_ext"><input type="text" lang="ca" id="txt_URLWMS_cataleg" style="height:33px" placeholder="Cercar catàleg IDEC" class="form-control">');
	_htmlServeisWMS.push('<span class="input-group-btn"><button class="btn btn-success" id="bt_cercaWMS"  type="button"><span class="glyphicon glyphicon-search"></span></button></span>');
	_htmlServeisWMS.push('</div></li>');
	_htmlServeisWMS.push('</ul></div>');
	_htmlServeisWMS.push('<div id="resultats_idec">');
	_htmlServeisWMS.push('</div>');
	_htmlServeisWMS.push('<div id="div_controlWMS"></div>');
	_htmlServeisWMS.push('<div id="div_emptyWMS"></div>');
}

jQuery(document).on('keyup', "#txt_URLWMS_cataleg", function(e) {
    var code = e.which; // recommended to use e.which, it's normalized across browsers
    if(code==13) {//enter
    	e.preventDefault();
    	e.stopImmediatePropagation();
    	var cerca = $.trim(jQuery('#txt_URLWMS_cataleg').val());
    	if (cerca === "") {
    		alert(window.lang.translate("Has d'introduïr un valor per fer la cerca"));
    	} else {
    		cercaCataleg(cerca);
    		
    	}
    }
});

jQuery(document).on('click', "#bt_cercaWMS", function(e) {
	var cerca = $.trim(jQuery('#txt_URLWMS_cataleg').val());
	if (cerca === "") {
		alert(window.lang.translate("Has d'introduïr un valor per fer la cerca"));
	} else {
		cercaCataleg(cerca);
	}
});

function cercaCataleg(cerca){
	cerca = encodeURI(cerca);
	var data ={
		searchInput : cerca	
	};
	//Cerca catàleg IDEC
	searchCatalegIdec(data).then(function(results){
		var resultats = JSON.parse(results.resultats);
		jQuery('#div_layersWMS').attr("style","display:none;");
		var lDadesIdec = '<ul class="panel-heading llista-dadesIdec">';
		jQuery.each(resultats.aaData, function( index, wmsidec ) {
			var titol=wmsidec.TITOL;
			var titolShort=shortString(titol,27);
			var desc=wmsidec.DESCRIPCIO;
			var org =wmsidec.ORGANITZAC;
			var idarxiu=wmsidec.IDARXIU;
			var classificaico=wmsidec.CLASSIFICA;
			var urn=wmsidec.URN;
			var xmin=wmsidec.XMIN;
			var xmax=wmsidec.XMAX;
			var ymin=wmsidec.YMIN;
			var ymax=wmsidec.YMAX;
			var escala=wmsidec.ESCALA;
			var conjunt=wmsidec.CONJUNT;
			var temes=wmsidec.TEMES;
			lDadesIdec += '<li><a class="label-dadesIdec" href="#" title="'+titol+'"  data-nom="'+titol+'" data-wms_url="'+idarxiu+'">'+titolShort;
			lDadesIdec += '<a lang="ca" href="http://www.geoportal.cat/wefex/client?idioma=ca&do=cercaAssociacions&resposta=detall&id='+urn+'&idioma=ca&" target="_blank">';
			lDadesIdec += '&nbsp;<span class="glyphicon glyphicon-info-sign"></span></a></li>';
		});
		lDadesIdec += '</ul>';
		if (resultats.aaData.length>0) {
			jQuery('#resultats_idec').html(lDadesIdec);
			//TODO llamar al control
			jQuery('#txt_URLWMS').attr("style","display:none");
			jQuery('#bt_connWMS').attr("style","display:none");
			jQuery(".label-dadesIdec").on('click', function(e) {
				jQuery('#resultats_idec').empty();
				var urlWMS= this.dataset.wms_url;
				_gaq.push(['_trackEvent', 'mapa', tipus_user+'afegir WMS catàleg IDEC', this.dataset.nom, 1]);
				jQuery('#txt_URLWMS').attr("style","display:block;height:33px;");
				jQuery('#bt_connWMS').attr("style","display:inline");
				jQuery('#txt_URLWMS').val(urlWMS);
				jQuery('#bt_connWMS').click();
			});
		}
	});
}

function getCapabilitiesWMS(url, servidor) {
	var _htmlLayersWMS = [];
	var instamapsWms = InstamapsWms({
		loadTemplateParam :false});
	var dataWMS = {url: url};
	instamapsWms.getWMSLayers(dataWMS).then(function(results) {
		var bbox,
		souce_capabilities_template = $("#capabilities-template").html(),
		capabilities_template = Handlebars.compile(souce_capabilities_template);
		
		Handlebars.registerPartial( "list-template", $( "#list-template" ).html() );
		Handlebars.registerHelper('layer', function(context, options) {
		  var ret = "";
		  if (!Handlebars.Utils.isArray(context)){
			  context = [context];
		  }
		  for(var i=0, j=context.length; i<j; i++) {
			  if (!Handlebars.Utils.isArray(context[i])){
				  ret = ret + options.fn(context[i]);
			  }else{
				  for(var k=0, l=context.length; k<l; k++) {
					  ret = ret + options.fn(context[i][k]);
				  }
			  }
		  }
		  return ret;
		});
		
		jQuery('#div_layersWMS').html('');
		jQuery("#div_layersWMS").show();
		jQuery('#div_emptyWMS').empty();

		if (servidor === null) {
			servidor = results.Service.Title;
		}
		try{
			if(results.Capability.Layer.Layer.LatLonBoundingBox){
				bbox = results.Capability.Layer.Layer.LatLonBoundingBox;
				WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
			}else if(results.Capability.Layer.LatLonBoundingBox){
				bbox = results.Capability.Layer.LatLonBoundingBox;
				WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
			}else{
				WMS_BBOX=null;
			}	
		} catch (err) {
			WMS_BBOX=null;
		}
		
		try {
			var matriuEPSG = results.Capability.Layer.CRS,
			epsg = [],
			html = capabilities_template({Layer: [results.Capability.Layer]});
			
			ActiuWMS.servidor = servidor;
			_NomServer2=ActiuWMS.servidor;
			ActiuWMS.url = jQuery.trim(url);
			
			
			if (!matriuEPSG) {
				matriuEPSG = results.Capability.Layer.SRS;
				if (!matriuEPSG) {
					matriuEPSG = results.Capability.Layer[0].CRS;
					
					if (!matriuEPSG) {
						matriuEPSG = results.Capability.Layer[0].SRS;
					}
				}
			}
			if (jQuery.isArray(matriuEPSG)){
				jQuery.each(matriuEPSG, function(index, value) {
					epsg.push(value);
				});
			}else{
				epsg.push(matriuEPSG);
			}
	
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
			} else if (jQuery.inArray('EPSG:4258', epsg) != -1) {
				ActiuWMS.epsg = L.CRS.EPSG4326;
				ActiuWMS.epsgtxt = '4326';	
			} else {
				alert(window.lang.translate("No s'ha pogut visualitzar aquest servei: Instamaps només carrega serveis WMS globals en EPSG:3857 i EPSG:4326"));
				return;
			}
			
			jQuery('#div_layersWMS').empty().append(html);
			addTreeEvents();
			jQuery('#div_emptyWMS').empty();
			jQuery('#div_emptyWMS').html(
				'<div style="float:right"><button lang="ca" id="bt_addWMS" class="btn btn-success" >' +
				window.lang.translate("Afegir capes") + '</button></div>');
		} catch (err) {
			jQuery('#div_layersWMS').html('<hr>Error interpretar capabilities: ' + err + '</hr>');
		}
	},function(){ console.info("time out")});
}

function addWmsToMap(wms){
	var wmsLayer,
	tipus_user = defineTipusUser();  //geocat.web-1.0.0
	//$.publish('trackEvent',{event:['_trackEvent', 'mapa', tipus_user+'wms', wms.url, 1]});
	//TODO eliminar esto pero primero hay que cargar el instamaps.google-analytics.js en lugar del geocat.google-analytics.js
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'wms', wms.url, 1]);
		

	

	
	if(wms.wmstime){
		wmsLayer = L.tileLayer.wms(wms.url, {
			layers : wms.layers,
			crs : wms.epsg,
			transparent : true,
			format : 'image/png',
			wmstime:wms.wmstime,
			tileSize:512
		});
	}else{
		wmsLayer = L.tileLayer.betterWms(wms.url, {
			layers : wms.layers,
			crs : wms.epsg,
			transparent : true,
			//exceptions:'application/vnd.ogc.se_blank',
			exceptions:checkExceptionsType(wms.url),
			format : 'image/png',
			wmstime:wms.wmstime,
			tileSize:512
		});
	}
	
	wmsLayer.options.businessId = '-1';
	wmsLayer.options.nom = wms.servidor;
	wmsLayer.options.tipus = t_wms;
	
	if(typeof url('?businessid') == "string"){
		var data = {
			uid:Cookies.get('uid'),
			mapBusinessId: url('?businessid'),
			serverName: wms.servidor,
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
            url: wms.url,
            layers: JSON.stringify([{name:wms.layers,title:wms.layers,group:0,check:true,query:true}]),
            calentas: false,
            activas: true,
            visibilitats: true,
			options: '{"url":"'+wms.url+'","layers":"'+wms.layers+'","opacity":"'+1+'","wmstime":'+wms.wmstime+'}'
		};
		createServidorInMap(data).then(function(results){
			map.spin(false);
			if (results.status == "OK"){
				wmsLayer.options.businessId = results.results.businessId;
				checkAndAddTimeDimensionLayer(wmsLayer,false,wms.servidor);
				//dfd.resolve(true);
			}else{
				console.debug('createServidorInMap ERROR');
				//dfd.resolve(false);
			}
		});
	}else{
		//dfd.reject();
		checkAndAddTimeDimensionLayer(wmsLayer,false,wms.servidor);
	}
	
}

/*
 * fromParam = true -> Si afegim WMS directamente dun parametre de la url
 * fromParam = false -> Si afegim WMS des de la interficie dInstaMaps
 * */
function addExternalWMS(fromParam) {
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'wms', ActiuWMS.url, 1]);
	
	var dfd = $.Deferred();
	var _dateFormat=false,
	nomCapaWMS,
	wmsLayer;
	
	if(!fromParam){
		var cc = $('#div_layersWMS input:checked').map(function(){
			if($('#geoservicetime_'+this.value).length > 0){
				_dateFormat=true;
			}
			return this.value;
		});
		cc = jQuery.makeArray(cc);
		ActiuWMS.layers = cc.join(',');
		
		var _nomCapesWMS=[];
		var cc1 = $('#div_layersWMS input:checked').map(function(){			
			return this.id;
		});
		
		cc1 = jQuery.makeArray(cc1);	
		
		if(cc1.length==1){
			ActiuWMS.servidor=cc1.join(" ");
		}else{
			ActiuWMS.servidor=_NomServer2;		
		}
		

		ActiuWMS.wmstime=_dateFormat;
		
		
		
	}
	if(ActiuWMS.wmstime){
		wmsLayer =L.tileLayer.wms(ActiuWMS.url, {
			layers : ActiuWMS.layers,
			crs : ActiuWMS.epsg,
			transparent : true,
			format : 'image/png',
			wmstime:ActiuWMS.wmstime,
			tileSize:512
		});
	}else{
		wmsLayer = L.tileLayer.betterWms(ActiuWMS.url, {
			layers : ActiuWMS.layers,
			crs : ActiuWMS.epsg,
			transparent : true,
			//exceptions:'application/vnd.ogc.se_blank',
			exceptions:checkExceptionsType(ActiuWMS.url),
			format : 'image/png',
			wmstime:ActiuWMS.wmstime,
			tileSize:512
		});
	}
	
	nomCapaWMS=ActiuWMS.servidor;	
	
	
	wmsLayer.options.businessId = '-1';
	wmsLayer.options.nom = nomCapaWMS;
	wmsLayer.options.tipus = t_wms;
	if(typeof url('?businessid') == "string"){
		var data = {
			uid:Cookies.get('uid'),
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
			options: '{"url":"'+ActiuWMS.url+'","layers":"'+ActiuWMS.layers+'","opacity":"'+1+'","wmstime":'+ActiuWMS.wmstime+'}'
		};
		createServidorInMap(data).then(function(results){
			map.spin(false);
			if (results.status == "OK"){
				wmsLayer.options.businessId = results.results.businessId;
				checkAndAddTimeDimensionLayer(wmsLayer,false,ActiuWMS.servidor);
				//Issue #581: zoom capa cloudifier
				if (results.results!=undefined && results.results.url!=undefined && results.results.url.indexOf("http://betaserver.icgc.cat/geoservice/")!=-1){
					var instamapsWms = InstamapsWms({
						loadTemplateParam :false});
					var dataWMS = {url: results.results.url};
					instamapsWms.getWMSLayers(dataWMS).then(function(results2) {
						try{
							if(results2.Capability.Layer.Layer.LatLonBoundingBox){
								var bbox = results2.Capability.Layer.Layer.LatLonBoundingBox;
								WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
							}else if(results2.Capability.Layer.LatLonBoundingBox){
								
								var bbox = results2.Capability.Layer.LatLonBoundingBox;
								WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
							}else{
								WMS_BBOX=null;
							}	
						} catch (err) {
							WMS_BBOX=null;
						}
						if (WMS_BBOX !=null) map.fitBounds(WMS_BBOX);
					});
				}
				dfd.resolve(true);
			}else{
				console.debug('createServidorInMap ERROR');
				dfd.resolve(false);
			}
		});
	}else{
		dfd.reject();
		checkAndAddTimeDimensionLayer(wmsLayer,false,ActiuWMS.servidor);
	}
	
	 return dfd.promise();
}

function showTimeControl(show){
	show ? $('.barra_temps').show() : $('.barra_temps').hide();
}

function checkAndAddTimeDimensionLayer(wmsLayer,ckeckCapaActiva,_nomServidor,capesActiva,_map){
	var DL= wmsLayer.options.wmstime;
	
	_map = _map || map;
	
	if(wmsLayer.options.wmstime) {
		var dimensionsTimeLayer  = L.timeDimension.layer.wms(wmsLayer, {
		    proxy: paramUrl.proxy_betterWMS,
		    updateTimeDimension: true,
		    updateTimeDimensionMode:'intersect',//replace, union,intersect
		    tileSize:512,
		    setDefaultTime:false,
		    tipus : t_wms
		});
		dimensionsTimeLayer.options=wmsLayer.options;
		dimensionsTimeLayer.addTo(_map);
		dimensionsTimeLayer.bringToFront();
		dimensionsTimeLayer.options.zIndex = controlCapes._lastZIndex+ 1;
		if(controlCapes){
			controlCapes.addOverlay(dimensionsTimeLayer, _nomServidor, true);
			controlCapes._lastZIndex++;
			activaPanelCapes(true);
		}
		jQuery('#dialog_dades_ex').modal('hide');	
		
		showTimeControl(true);
	}else{
		if(ckeckCapaActiva){
			if (capesActiva === true || capesActiva === 'true' ){
				wmsLayer.addTo(_map);
			}
			if(controlCapes){
				controlCapes.addOverlay(wmsLayer, _nomServidor, true);
				controlCapes._lastZIndex++;	
			}
		}else{
			_map.addLayer(wmsLayer);
			wmsLayer.bringToFront();
			wmsLayer.options.zIndex = controlCapes._lastZIndex+ 1;
			if(controlCapes){
				controlCapes.addOverlay(wmsLayer, _nomServidor, true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}
			jQuery('#dialog_dades_ex').modal('hide');	
		}
	}
}


function loadWmsLayer(layer, _map){
	var op = layer.opacity,
	jsonOptions,
	newWMS,
	nomServidor = layer.serverName;
	
	if(layer.serverName.indexOf('##') !=-1){
		var valors = layer.serverName.split("##");
		op = valors[1];
		nomServidor=valors[0];
	}  
	if(typeof (layer.options)=="string"){
		try {
			jsonOptions = JSON.parse(layer.options);
		}
		catch (err) {
			jsonOptions = layer.options;	
		}
	}else{
		jsonOptions = layer.options;	
	}
	if(!layer.options){
		jsonOptions=layer;
	}
	newWMS = L.tileLayer.betterWms(layer.url, {
	    layers: layer.layers,
	    format: layer.imgFormat,
	    transparent: layer.transparency,
	    version: layer.version,
	    opacity:op ,
	    crs: layer.epsg,
		nom :nomServidor ,
		tipus: layer.serverType,
		zIndex :  parseInt(layer.capesOrdre),
	    businessId: layer.businessId,
	    tileSize:512
	});
	newWMS.options.wmstime=jsonOptions.wmstime;
	newWMS.options.group=jsonOptions.group;
	
	checkAndAddTimeDimensionLayer(newWMS,true,nomServidor,layer.capesActiva, _map);
}


function checkExceptionsType(_server){
		
	var exceptions='application/vnd.ogc.se_blank';

		if(_server.indexOf('instamaps.cat')==-1 ||
		 _server.indexOf('betaserver.icgc')==-1 ||
		 _server.indexOf('localhost')==-1 ||
		 _server.indexOf('172.70.1.11')==-1){
			
			exceptions='application/vnd.ogc.se_inimage';

		}
		
		return exceptions;
}