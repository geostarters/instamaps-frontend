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
				"IDARXIU" : "http://tes.gencat.cat/webmap/MUC/Request.aspx?",
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
				"ORGANITZAC" : "Institut Cartogràfic i Geològic de Catalunya",
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
				window.lang.convert(WMS.TITOL) +
				'</a>' +
				'<a target="_blank" lang="ca" title="Servei WMS-TIME" href="http://' +
				WMS.IDARXIU +'&Request=GetCapabilities&service=WMS' +
				'"><span class="glyphicon glyphicon-time info-wms"></span></a>' +
				'</li>');
		}else{
			_htmlServeisWMS.push('<li><a class="label-wms" href="#" id="' +
				WMS.IDARXIU +
				'">' +
				window.lang.convert(WMS.TITOL) +
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
	_htmlServeisWMS.push('<div class="input-group txt_ext"><input type="text" lang="ca" id="txt_URLWMS" style="height:33px" placeholder="Entrar URL servei WMS" class="form-control">');
	_htmlServeisWMS.push('<span class="input-group-btn"><button class="btn btn-default" id="bt_connWMS"  type="button"><span class="glyphicon glyphicon-play"></span></button></span>');
	_htmlServeisWMS.push('</div>');
	_htmlServeisWMS.push('<script id="list-template" type="x-handlebars-template">');
	_htmlServeisWMS.push('  {{#layer Layer}}');
	_htmlServeisWMS.push('	  <li>');
	_htmlServeisWMS.push('      {{#if Name}}');
	_htmlServeisWMS.push('			{{#if Layer}}');
	_htmlServeisWMS.push('				<span><i class="glyphicon glyphicon-folder-open"></i></span><button type="button" class="btn btn-link btn-all">Totes</button>/<button type="button" class="btn btn-link btn-none">Cap</button>');
	_htmlServeisWMS.push('			{{else}}');
	_htmlServeisWMS.push('				<span class="leaf"><input type="checkbox" class="ckbox_layer" id="{{Title}}" value="{{Name}}"> {{Title}}</span>');
	_htmlServeisWMS.push('				{{#if Dimension}}');
	_htmlServeisWMS.push('				<span id="geoservicetime_{{Name}}" class="glyphicon glyphicon-time info-wms"></span>');		
	_htmlServeisWMS.push('			    {{/if}}');		
	_htmlServeisWMS.push('			{{/if}}');
	_htmlServeisWMS.push('		{{else}}');
	_htmlServeisWMS.push('			<span><i class="glyphicon glyphicon-folder-open"></i> {{Title}}</span><button type="button" class="btn btn-link btn-all">Totes</button>/<button type="button" class="btn btn-link btn-none">Cap</button>');
	_htmlServeisWMS.push('		{{/if}}');
	_htmlServeisWMS.push('		{{#if Layer}}');
	_htmlServeisWMS.push('        <ul>');
	_htmlServeisWMS.push('        {{> list-template}}');
	_htmlServeisWMS.push('        </ul>');
	_htmlServeisWMS.push('        {{/if}}');
	_htmlServeisWMS.push('    </li>');
	_htmlServeisWMS.push('	{{/layer}}');
	_htmlServeisWMS.push('</script>');
	_htmlServeisWMS.push('<script id="capabilities-template" type="x-handlebars-template">');
	_htmlServeisWMS.push('    <ul>');
	_htmlServeisWMS.push('    {{> list-template}}');
	_htmlServeisWMS.push('    </ul>');
	_htmlServeisWMS.push('</script>');
	_htmlServeisWMS.push('<div id="div_layersWMS"  class="tbl tree"></div>');
	_htmlServeisWMS.push('<div id="div_emptyWMS"></div>');
}

jQuery(document).on('click', "#bt_connWMS", function(e) {
	var url = $.trim(jQuery('#txt_URLWMS').val());
	if (url === "") {
		alert(window.lang.convert("Has d'introduïr una URL del servidor"));
	} else if (!isValidURL(url)) {
		alert(window.lang.convert("La URL introduïda no sembla correcte"));
	} else {
		getCapabilitiesWMS(url, null);
	}
});

jQuery(document).on('keyup', "#txt_URLWMS_cataleg", function(e) {
    var code = e.which; // recommended to use e.which, it's normalized across browsers
    if(code==13) {//enter
    	e.preventDefault();
    	e.stopImmediatePropagation();
    	var cerca = $.trim(jQuery('#txt_URLWMS_cataleg').val());
    	if (cerca === "") {
    		alert(window.lang.convert("Has d'introduïr un valor per fer la cerca"));
    	} else {
    		cercaCataleg(cerca);
    		
    	}
    }
});

jQuery(document).on('click', "#bt_cercaWMS", function(e) {
	var cerca = $.trim(jQuery('#txt_URLWMS_cataleg').val());
	if (cerca === "") {
		alert(window.lang.convert("Has d'introduïr un valor per fer la cerca"));
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
			lDadesIdec += '<li><a class="label-dadesIdec" href="#"  data-nom="'+titol+'" data-wms_url="'+idarxiu+'">'+titol;
			lDadesIdec += '<a lang="ca" href="http://www.geoportal.cat/wefex/client?idioma=ca&do=cercaAssociacions&resposta=detall&id='+urn+'&idioma=ca&" target="_blank">';
			lDadesIdec += '&nbsp;<span class="glyphicon glyphicon-info-sign"></span></a></li>';
		});
		lDadesIdec += '</ul>';
		if (resultats.aaData.length>0) {
			jQuery('#resultats_idec').html(lDadesIdec);
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
	
	getWMSLayers(url).then(function(results) {
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
				alert(window.lang.convert("No s'ha pogut visualitzar aquest servei: Instamaps només carrega serveis WMS globals en EPSG:3857 i EPSG:4326"));
				return;
			}
			
			jQuery('#div_layersWMS').empty().append(html);
			addTreeEvents();
			jQuery('#div_emptyWMS').empty();
			jQuery('#div_emptyWMS').html(
				'<div style="float:right"><button lang="ca" id="bt_addWMS" class="btn btn-success" >' +
				window.lang.convert("Afegir capes") + '</button></div>');
		} catch (err) {
			jQuery('#div_layersWMS').html('<hr>Error interpretar capabilities: ' + err + '</hr>');
		}
	});
}

jQuery(document).on('click', "#bt_addWMS", function(e) {
    addExternalWMS(false);
});

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
			exceptions:'application/vnd.ogc.se_blank',
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
			options: '{"url":"'+ActiuWMS.url+'","layers":"'+ActiuWMS.layers+'","opacity":"'+1+'","wmstime":'+ActiuWMS.wmstime+'}'
		};
		createServidorInMap(data).then(function(results){
			map.spin(false);
			if (results.status == "OK"){
				wmsLayer.options.businessId = results.results.businessId;
				checkAndAddTimeDimensionLayer(wmsLayer,false,ActiuWMS.servidor);
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

function addTreeEvents(){
	$('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').addClass('glyphicon-folder-close').removeClass('glyphicon-folder-open');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('glyphicon-folder-open').removeClass('glyphicon-folder-close');
        }
        e.stopPropagation();
    });
    
    $('.tree li > span.leaf').on('click', function (e) {
    	$(this).children('.ckbox_layer').click();
    });
    
    $('.ckbox_layer').on('click', function (e) {
    	e.stopPropagation();
    });
    
    $('.btn-all').on('click',function(){
    	$(this).parent('li.parent_li').find('input:checkbox').prop('checked', true);
	});
	
	$('.btn-none').on('click',function(){
		$(this).parent('li.parent_li').find('input:checkbox').prop('checked', false);
	});
}