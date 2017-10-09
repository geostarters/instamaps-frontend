var IM_Sostenibilitat = function (options) {
	this.options = options;
	
	this.initSostenibilitatUserMapa = function () {			
		$('#li_sostenibilitat').show();		
		
			
	};	
	
	this.desaConfigSostenibilitat = function (test){
		var that=this;
		/*
		if(test){
			
		jQuery('#sos_url_wms').val(jQuery('#sos_url_wms').attr("placeholder"));
		jQuery('#sos_url_fv_name_wms').val(jQuery('#sos_url_fv_name_wms').attr("placeholder"));
		jQuery('#sos_url_fv_tit_wms').val(jQuery('#sos_url_fv_tit_wms').attr("placeholder"));
		jQuery('#sos_url_ts_name_wms').val(jQuery('#sos_url_ts_name_wms').attr("placeholder"));
		jQuery('#sos_url_ts_tit_wms').val(jQuery('#sos_url_ts_tit_wms').attr("placeholder"));
		jQuery('#sos_url_wfs').val(jQuery('#sos_url_wfs').attr("placeholder"));
		jQuery('#sos_edificis_fv_wfs').val(jQuery('#sos_edificis_fv_wfs').attr("placeholder"));
		jQuery('#sos_teulades_fv_wfs').val(jQuery('#sos_teulades_fv_wfs').attr("placeholder"));
		jQuery('#sos_edificis_ts_wfs').val(jQuery('#sos_edificis_ts_wfs').attr("placeholder"));
		jQuery('#sos_teulades_ts_wfs').val(jQuery('#sos_teulades_ts_wfs').attr("placeholder"));
		jQuery('#sos_url_calculadora').val(jQuery('#sos_url_calculadora').attr("placeholder"));
		}	
		*/
		var sosJSON={
		'sos_url_wms' : jQuery('#sos_url_wms').val(),
		'sos_url_fv_name_wms' : jQuery('#sos_url_fv_name_wms').val(),
		'sos_url_fv_tit_wms' : jQuery('#sos_url_fv_tit_wms').val(),
		'sos_url_ts_name_wms' : jQuery('#sos_url_ts_name_wms').val(),
		'sos_url_ts_tit_wms' : jQuery('#sos_url_ts_tit_wms').val(),
		'sos_url_wfs' : jQuery('#sos_url_wfs').val(),
		'sos_edificis_fv_wfs' : jQuery('#sos_edificis_fv_wfs').val(),
		'sos_teulades_fv_wfs' : jQuery('#sos_teulades_fv_wfs').val(),
		'sos_edificis_ts_wfs' : jQuery('#sos_edificis_ts_wfs').val(),
		'sos_teulades_ts_wfs' : jQuery('#sos_teulades_ts_wfs').val(),
		'sos_url_calculadora' : jQuery('#sos_url_calculadora').val()
		};	
		
		
		var _options={};
		
		if(!mapConfig.options){
			mapConfig.options={};
		}
		_options=mapConfig.options;
		_options.sostenibilitat=sosJSON;
		
		
		var data = {
        		businessId:mapConfig.businessId,
        		uid: mapConfig.entitatUid,
				token:Cookies.get('token'),
				options:JSON.stringify(_options)
		};		
			
		
		updateMapOptions(data).then(function(results){		
			if(results.status=="OK"){			
				mapConfig.options=_options;		
				$.publish('updateMapConfig', mapConfig);			
				that.publicaWMSWFSServers(sosJSON,mapConfig);
				
			}	
			
		});
	
		
	};
	
	/*
	this.initModulWFSSostenibilitat=function(options){
		console.info(options);
	var ctlSos=new L.control.addModulSostenibilitat(new L.geoJson()).addTo(map);	
		ctlSos.setOptionsSostenibilitat(options);
		ctlSos.getActiveWMSSostenibilitatLayers();
	};
	*/
	
	this.updateStateMap=function(_mapConfig){
		
		
		
		var data = {
        		businessId:_mapConfig.businessId,
        		uid: _mapConfig.entitatUid,
				token:Cookies.get('token'),
				options:JSON.stringify(_mapConfig.options)
		};		
			
		
		updateMapOptions(data).then(function(results){		
			if(results.status=="OK"){						
				$.publish('updateMapConfig', mapConfig);											
			}	
			
		});
		
		
		
	},	
	this.publicaWMSWFSServers=function(sosJSON,mapConfig){
		var that=this;
						
						map.eachLayer(function (layer) {
														
							if(layer.options && 
							layer.options.businessId && 
							layer.options.sostenibilitat==true){
																
								try{	
								map.removeLayer(layer);
								controlCapes.removeLayer(layer);
								}catch(Err){						
									console.info(Err);						
								}
																
					var data = {
						businessId : url('?businessid'),
						uid : Cookies.get('uid'),
						servidorWMSbusinessId : layer.options.businessId.toString()
						};	

						var matriuObj=[];
						var obj=controlCapes._layers[layer.options.businessId];
						
						matriuObj.push(obj);
								try{
									removeAtomicLayer(data,[]);
									that.updateStateMap(mapConfig);		
								}catch(Err){						
									console.info(Err);						
								}	
						
						
						
							}	
						});
				
		
				
				ActiuWMS.epsg = 'L.CRS.EPSG4326';
				ActiuWMS.epsgtxt = 'EPSG:4326';
				
				var serverWMS_FV={					
					epsgtxt:"EPSG:4326",
					layers:sosJSON.sos_url_fv_name_wms,
					servidor:sosJSON.sos_url_fv_tit_wms,
					url:sosJSON.sos_url_wms,
					wmstime:false,
					sostenibilitat:true
				};				
			var lyrFV = addWmsToMap(serverWMS_FV);				
				var serverWMS_TS={					
					epsgtxt:"EPSG:4326",
					layers:sosJSON.sos_url_ts_name_wms,
					servidor:sosJSON.sos_url_ts_tit_wms,
					url:sosJSON.sos_url_wms,
					wmstime:false,
					sostenibilitat:true
				};	

					try{
						var lyrTS = addWmsToMap(serverWMS_TS);	
					}catch(Err){
						console.info(Err);					
					}	
			
			
			
		
		
	};
	
	this.generaOpcionsHTMLSostenibilitat = function () {
		var _htmlSostenibilitat = [];
		
		var sosTXT={'sos_url_wms':"",
		'sos_url_fv_name_wms':'',
		'sos_url_fv_tit_wms':'',
		'sos_url_ts_name_wms':'',
		'sos_url_ts_tit_wms':'',
		'sos_url_wfs':'',
		'sos_edificis_fv_wfs':'',
		'sos_teulades_fv_wfs':'',
		'sos_edificis_ts_wfs':'',
		'sos_teulades_ts_wfs':'',
		'sos_url_calculadora':''}
		
		if(mapConfig.options && mapConfig.options.sostenibilitat){sosTXT=mapConfig.options.sostenibilitat};
		
		_htmlSostenibilitat.push('<div style="padding: 4px;" class="panel-info ">');		
		_htmlSostenibilitat.push('<div class="container2">');	
		_htmlSostenibilitat.push('<div class="row row_sos_wms">');
		_htmlSostenibilitat.push('<div class="col-sm-12"><label>Paràmetres de configuració</label></div>');		
		_htmlSostenibilitat.push('</div>');		
		_htmlSostenibilitat.push('<div class="row row_sos color_sos_wms">');
		_htmlSostenibilitat.push('<div class="col-sm-4"><span  class="txt_sostenibilitat">URL WMS PSolar</span> </div>');
		_htmlSostenibilitat.push('<div class="col-sm-8"><input value="'+sosTXT.sos_url_wms+'" id="sos_url_wms" type="text" placeholder="https://www.instamaps.cat/maps/geocat.service?map=/opt/geocat/dades/psolar/psolar_v2.map&"  class="form-control" ></div>');				
		_htmlSostenibilitat.push('</div>');								
		_htmlSostenibilitat.push('<div class="row row_sos color_sos_wms">');
		_htmlSostenibilitat.push('<div class="col-sm-4"><span  class="txt_sostenibilitat">Name / Title WMS Fotovoltaica</span> </div>');
		_htmlSostenibilitat.push('<div class="col-sm-4"><input value="'+sosTXT.sos_url_fv_name_wms+'" id="sos_url_fv_name_wms"  type="text" placeholder="Potencial_fotovoltaic"  class="form-control" ></div>');		
		_htmlSostenibilitat.push('<div class="col-sm-4"><input value="'+sosTXT.sos_url_fv_tit_wms+'" id="sos_url_fv_tit_wms"  type="text" placeholder="Idoneïtat fotovoltaica"  class="form-control" ></div>');
		_htmlSostenibilitat.push('</div>');				
		_htmlSostenibilitat.push('<div  class="row row_sos color_sos_wms">');
		_htmlSostenibilitat.push('<div class="col-sm-4"><span  class="txt_sostenibilitat">Name / Title WMS Solar tèrmica </span></div>');
		_htmlSostenibilitat.push('<div class="col-sm-4"><input  value="'+sosTXT.sos_url_ts_name_wms+'" id="sos_url_ts_name_wms" type="text" placeholder="Potencial_termosolar"  class="form-control" ></div>');		
		_htmlSostenibilitat.push('<div class="col-sm-4"><input value="'+sosTXT.sos_url_ts_tit_wms+'" id="sos_url_ts_tit_wms" type="text" placeholder="Idoneïtat solar tèrmica"  class="form-control" ></div>');
		_htmlSostenibilitat.push('</div>');						
		_htmlSostenibilitat.push('<div  class="row row_sos color_sos_wfs">');
		_htmlSostenibilitat.push('<div class="col-sm-4"><span  class="txt_sostenibilitat">URL WFS PSolar</span> </div>');
		_htmlSostenibilitat.push('<div class="col-sm-8"><input value="'+sosTXT.sos_url_wfs+'" id="sos_url_wfs" type="text" placeholder="https://www.instamaps.cat/maps/geocat.service?map=/opt/geocat/dades/psolar/psolar_v2.map&"  class="form-control" ></div>');				
		_htmlSostenibilitat.push('</div>');								
		_htmlSostenibilitat.push('<div  class="row row_sos color_sos_wfs">');
		_htmlSostenibilitat.push('<div class="col-sm-4"><span class="txt_sostenibilitat">TypeNamesWFS Fotovoltaica</span> </div>');
		_htmlSostenibilitat.push('<div class="col-sm-4"><input value="'+sosTXT.sos_edificis_fv_wfs+'" id="sos_edificis_fv_wfs" type="text" placeholder="Edificis_fv"  class="form-control" ></div>');
		_htmlSostenibilitat.push('<div class="col-sm-4"><input  value="'+sosTXT.sos_teulades_fv_wfs+'" id="sos_teulades_fv_wfs" type="text" placeholder="Teulades_fv"  class="form-control" ></div>');				
		_htmlSostenibilitat.push('</div>');		
		_htmlSostenibilitat.push('<div class="row row_sos color_sos_wfs">');
		_htmlSostenibilitat.push('<div class="col-sm-4"><span  class="txt_sostenibilitat">TypeNames WFS Solar tèrmica</span> </div>');
		_htmlSostenibilitat.push('<div class="col-sm-4"><input value="'+sosTXT.sos_edificis_ts_wfs+'" id="sos_edificis_ts_wfs" type="text" placeholder="Edificis_ts"  class="form-control" ></div>');	
		_htmlSostenibilitat.push('<div class="col-sm-4"><input value="'+sosTXT.sos_teulades_ts_wfs+'" id="sos_teulades_ts_wfs" type="text" placeholder="Teulades_ts"  class="form-control" ></div>');						
		_htmlSostenibilitat.push('</div>');	
		_htmlSostenibilitat.push('<div class="row row_sos color_sos_calculadora">');
		_htmlSostenibilitat.push('<div class="col-sm-4"><span  class="txt_sostenibilitat">URL Calculadora</span> </div>');
		_htmlSostenibilitat.push('<div class="col-sm-8"><input id="sos_url_calculadora" value="'+sosTXT.sos_url_calculadora+'" type="text" placeholder="http://localhost"  class="form-control" ></div>');			
		_htmlSostenibilitat.push('</div>');					
		_htmlSostenibilitat.push('</div>');		
		_htmlSostenibilitat.push('</div>');			
		_htmlSostenibilitat.push('<div id="id_ofi_footer" 	style="float:right" class="" panel-warning">');		
		_htmlSostenibilitat.push('<button id="bt_sos_config" class="btn-success btn">Desar</button>');		
		_htmlSostenibilitat.push('</div>');
		//this.resetResultatsOficials();
								
		return _htmlSostenibilitat.join("");
	};

	this.resetResultatsOficials = function () {
		jQuery('#id_ofi_results').html('');
		jQuery('#inspire_msg').html('');
	};

	this.focusText = function (id) {
		id.indexOf('opt_id_inspi') != -1 ? jQuery("#opt_id_inspi").addClass('txtFocus') : jQuery("#opt_id_inspi").removeClass('txtFocus');
		id.indexOf('opt_id_pcc') != -1 ? jQuery("#opt_id_pcc").addClass('txtFocus') : jQuery("#opt_id_pcc").removeClass('txtFocus');
	};

	this.INSPIRE_Interface = function () {
		var _that = this;
		var data = {
			"wt" : "json",
			"q" : "*",
			"facet" : "true",
			"facet.field" : "memberStateCountryCode",
			"fq" : ["spatialDataServiceType:view", "{!tag=grt}geoportalResourceType:(service)"],
			"fl" : "id"
		};

		searchCatalogInspire(data).then(function (results) {
			try {
				var countries = results.facet_counts.facet_fields.memberStateCountryCode;
				var resultats = results.response.numFound;
				var _htmlGetInitInspire = [];
				if (countries) {
					_htmlGetInitInspire.push('<ul class="bs-dades_oficials panel-heading">');
					_htmlGetInitInspire.push('<li><div style="width:99%"  class="input-group txt_ext_ofi">');
					_htmlGetInitInspire.push('<select id="cmdInspireInit">');
					_htmlGetInitInspire.push('<option value="null">' + window.lang.translate("Serveis WMS per Estat") + '</option>');
					_htmlGetInitInspire.push('<option value="null">' + window.lang.translate("Unió Europea") + '  (' + resultats + ')</option>');
					$.each(countries, function (key, value) {
						if (isNaN(value)) {
							_htmlGetInitInspire.push('<option value=' + value + '>' + window.lang.translate(EuCountryNames[value]));
						} else {
							_htmlGetInitInspire.push(' (' + value + ')</option>');
						}
					});
					_htmlGetInitInspire.push('</select>');
					_htmlGetInitInspire.push('</div></li>');
					_htmlGetInitInspire.push('<li><div class="input-group txt_ext_ofi"><input type="text" lang="ca" id="txt_URLWMS_INSPIRE_cataleg" style="height:33px" placeholder="' + window.lang.translate("Filtre catàleg INSPIRE") + '" class="form-control">');
					_htmlGetInitInspire.push('<span class="input-group-btn"><button class="btn btn-success" id="bt_cercaWMS_INSPIRE"  type="button"><span class="glyphicon glyphicon-search"></span></button></span>');
					_htmlGetInitInspire.push('</div></li>');
					_htmlGetInitInspire.push('</ul>');

					jQuery('#id_ofi_body').html(_htmlGetInitInspire.join(""));

					var _htmlGetFooterInspire = [];
					_htmlGetFooterInspire.push('<span class="label label-font">' + window.lang.translate("Font") + ': <a target="_blank" href="http://inspire-geoportal.ec.europa.eu/discovery/">INSPIRE Catalog</a></span>');
					_htmlGetFooterInspire.push('<span lang="ca" class="label" id="inspire_msg"></span>');
					jQuery('#id_ofi_footer').html(_htmlGetFooterInspire.join(""));

					jQuery('#cmdInspireInit').on('change', function () {
						if (this.value != "null") {
							var _BBOX = stringBBOXtoArray(EuCountryBBOX[this.value]);
							map.fitBounds([[
							  parseFloat(_BBOX[1]),
			                  parseFloat(_BBOX[0])],
			                  [parseFloat(_BBOX[3]),
			                  parseFloat(_BBOX[2])]]);
							_that.searchFilterInspireCatalog();
						}
					});
					jQuery("#bt_cercaWMS_INSPIRE").on('click', function (e) {
						_that.searchFilterInspireCatalog();
					});
					jQuery("#txt_URLWMS_INSPIRE_cataleg").on('keyup', function (e) {
						var code = e.which;
						if (code == 13) { //enter
							e.preventDefault();
							e.stopImmediatePropagation();
							_that.searchFilterInspireCatalog();
						}
					});
				} else {
					jQuery('#id_ofi_results').html('<h2>'+window.lang.translate("Sense resposta del catàleg INSPIRE")+'</h2>');
				}
			} catch (err) {
				jQuery('#id_ofi_results').html('<h2>'+window.lang.translate("Sense resposta del catàleg INSPIRE")+'</h2>');
			}
		});
	};

	this.PCC_Interface = function () {
		var _that = this;
		var items = [];
		var _htmlGetInitPCC = [];

		$.getJSON(paramUrl.urlJsonPCC, function (data) {
			//TODO modificar con la nueva estructura del archivo
			$.each(data, function (key, val) {
				//console.debug(val);
				//if (val.id_cig) {
					//items.push(val.id_cig + " " + val.nom_grup);
				if (val.nom_grup_instamaps) {
					items.push($.trim(val.nom_grup_instamaps));
				}
			});
			
			_htmlGetInitPCC.push('<div class="row"><div class="col-xs-12"  style="padding-top:5px;"><select id="cmb_pcc" data-selectsplitter-selector>');
			$.each(jQuery.unique(items), function (key, val) {
				var _valID = treuAccentsiEspais(val);
				_htmlGetInitPCC.push('<optgroup id="_pccul_' + _valID + '" label="'+shortString(val, 85)+'">');
				_htmlGetInitPCC.push('</optgroup>'); 
			});
			_htmlGetInitPCC.push('</select></div></div>');
			
			jQuery('#id_ofi_body').html(_htmlGetInitPCC.join(""));

			$.each(data, function (key, val) {
				//var titol = val.nom_instamaps;
				var titol = val.nom_geoservei_instamaps;
				var titolShort = shortString(titol, 85);
				var idarxiu = jQuery.trim(val.url_geoserveis);
				//var capa= val.capa;
				var capa= val.nom_capes_geoservei_instamaps;
				//var _valID = treuAccentsiEspais(val.id_cig + " " + val.nom_grup); ;
				var _valID = treuAccentsiEspais($.trim(val.nom_grup_instamaps));
				var id = '_pccul_' + _valID;
				jQuery('#' + id).append('<option value="'+titol+'##'+idarxiu+'##'+capa+'">' + titolShort+'</option>');
			});
			$('select[data-selectsplitter-selector]').selectsplitter(				
				{template:   
					'<div row_sos" data-selectsplitter-wrapper-selector>' +
					'<div class="col-xs-12">' +
					'<select class=" cmb_pcc form-control" data-selectsplitter-firstselect-selector></select>' +
					'</div>' +
					'<div class="clearfix visible-xs-block"></div>' +
					'<div class="col-xs-12">' +
					'<select id="cmb_pcc_wms" class=" cmb_pcc  form-control" data-selectsplitter-secondselect-selector></select>' +
					'</div>' +                        
				'</div>'});

			//PCC clic
			var instamapsWms = InstamapsWms({
				container : $('#div_controlWMS_OFICIALS'),
				botons : $('#div_emptyWMS_OFICIALS'),
				proxyUrl : paramUrl.ows2json,
				callback : addWmsToMap
			});

			jQuery("#cmb_pcc_wms").on('click', function (e) {
				if (e.target.id != "id_ofi") {
					var _atrPCC=jQuery(e.target).attr('value').split("##");	
					instamapsWms.getLayers({
						url :_atrPCC[1],
						name : _atrPCC[0],
						capa : _atrPCC[2]
					});
					map.setView([41.431, 1.8580], 9);
					jQuery("#inspire_msg").html('');
					$.publish('analyticsEvent',{event:[ 'mapa', tipus_user+'PCC', _atrPCC[0], 1]});
				};
			});//Fi PCC click
		});
	};

	this.addOpcionsHTMLTipusSostenibilitat = function (objHTML) {
		var ref = objHTML.id;
		var _that = this;

		_that.resetResultatsOficials();
		jQuery("#id_ofi_results").hide();
		jQuery("#div_controlWMS_OFICIALS").hide();
		jQuery("#div_emptyWMS_OFICIALS").hide();
		jQuery("#inspire_msg").hide();
		jQuery("#id_ofi_footer").html('');

		if (ref.indexOf('inspi') != -1) {
			this.INSPIRE_Interface();
		}

		if (ref.indexOf('pcc') != -1) {
			this.PCC_Interface();
		}
		_that.focusText(ref);

	};

	this.defineReourceLocator = function (resourceLocator) {
		var resource = null;
		jQuery.each(resourceLocator, function (index, _resourceLocator) {
			if (_resourceLocator.indexOf('.xml') == -1 ||
			  _resourceLocator.indexOf('wmts') == -1 ||
			  _resourceLocator.indexOf('wfs') == -1 ||
			  _resourceLocator.indexOf('.html') == -1 ||
			  _resourceLocator.indexOf('wms') != -1) {
				_resourceLocator = _resourceLocator.replace("request=getcapabilities", "");
				_resourceLocator = _resourceLocator.replace("request=GetCapabilities", "");
				_resourceLocator = _resourceLocator.replace("REQUEST=GetaCapabilities", "");
				resource = _resourceLocator;
			}
		});
		return resource;
	};

	this.searchFilterInspireCatalog = function () {
		var query = "";
		var _that = this;
		var valorPais = jQuery('#cmdInspireInit').val();
		var valorText = $.trim(jQuery('#txt_URLWMS_INSPIRE_cataleg').val());

		valorPais == "null" ? valorPais = "[* TO *]" : valorPais = valorPais;
		valorText === "" ? valorText = "*" : valorText = "*" + valorText + "*";
		var data = {
			"wt" : "json",
			"q" : "*",
			"facet" : "true",
			"facet.field" : "memberStateCountryCode",
			"fq" : ["{!tag=grt}geoportalResourceType:(service)", "spatialDataServiceType:view", "memberStateCountryCode:" + valorPais, "text:" + valorText],
			"rows" : 100,
			"fl" : "id,resourceTitle,responsibleOrgName,geoboxS,geoboxW,geoboxN,geoboxE,resourceLocator,memberStateCountryCode"
		};

		searchCatalogInspire(data).then(function (results) {
			var lDadesInspire = [];

			jQuery("#id_ofi_results").show();
			jQuery("#div_controlWMS_OFICIALS").hide();
			jQuery("#div_emptyWMS_OFICIALS").hide();
			jQuery("#inspire_msg").hide();

			if (results.response && results.response.docs.length > 0) {
				var resultats = results.response.numFound;
				lDadesInspire.push('<ul class="panel-heading bs-dades_oficials llista-dadesInspire">');
				jQuery.each(results.response.docs, function (index, wmsInspire) {
					if (wmsInspire.resourceLocator) {
						var _rlo = _that.defineReourceLocator(wmsInspire.resourceLocator);
						if (_rlo) {
							var idarxiu = _rlo;
							var titol = wmsInspire.resourceTitle;
							var titolShort = shortString(titol, 29);
							var org = wmsInspire.memberStateCountryCode;
							var urn = wmsInspire.id;
							var _bbox = null;
							if (wmsInspire.geoboxE) {
								_bbox = wmsInspire.geoboxE + "," + wmsInspire.geoboxS + "," + wmsInspire.geoboxW + "," + wmsInspire.geoboxN;
							}
							lDadesInspire.push('<li><a class="label-dadesInspire" href="#" data-bbox="' + _bbox + '" title="' + titol + '" data-nom="' + titol + '" data-wms_url="' + idarxiu + '">' + titolShort + ' (' + org + ')');
							lDadesInspire.push('<a lang="ca" href="http://inspire-geoportal.ec.europa.eu/resources' + urn + '" target="_blank">');
							lDadesInspire.push('&nbsp;<span class="glyphicon glyphicon-info-sign orange"></span></a></li>');
						}
					}
				});

				lDadesInspire.push('</ul>');
				jQuery('#id_ofi_results').html(lDadesInspire.join(""));
				if (resultats > 100) {
					jQuery("#inspire_msg").show();
					jQuery('#inspire_msg').html(window.lang.translate("Trobats") + ":<b>" + resultats + "</b>." + window.lang.translate("Es mostraran només 100 resultats. Utilitza el filtre per afinar la cerca"));
				}

				//new features wz
				var instamapsWms = InstamapsWms({
					container : $('#div_controlWMS_OFICIALS'),
					botons : $('#div_emptyWMS_OFICIALS'),
					proxyUrl : paramUrl.ows2json,
					callback : addWmsToMap
				});

				jQuery("a.label-dadesInspire").on('click', function (e) {
					if (e.target.id != "id_ofi") {
						instamapsWms.getLayers({
							url : $(e.target).attr('data-wms_url'),
							name : $(e.target).attr('title')
						});
						jQuery("#id_ofi_results").hide();
						jQuery("#div_controlWMS_OFICIALS").show();
						jQuery("#div_emptyWMS_OFICIALS").show();
						jQuery("#inspire_msg").html('');
						if ($(e.target).attr('data-bbox') != null) {
							var _BBOX = stringBBOXtoArray($(e.target).attr('data-bbox'));
							map.fitBounds([[
							                parseFloat(_BBOX[1]),
							                parseFloat(_BBOX[0])],
							                [parseFloat(_BBOX[3]),
							                 parseFloat(_BBOX[2])]]);
						}
						$.publish('analyticsEvent',{event:[ 'mapa', tipus_user+'INSPIRE', $(e.target).attr('title'), 1]});
					};
				});
			} else {
				jQuery('#id_ofi_results').html('<h4>'+window.lang.translate("Sense resultats")+'</h4>');
				this.resetResultatsOficials();
				return;
			}
		});
	};
}; //fi clases
