var IM_DadesOficials = function (options) {
	this.options = options;
	this.generaOpcionsHTMLDadesOficials = function () {
		var _htmlDadesOficials = [];
		_htmlDadesOficials.push('<div class="panel-warning">');
		_htmlDadesOficials.push('<ul class="bs-dades_oficials panel-heading">');
		_htmlDadesOficials.push('<li style="text-align: center"><a class="label-dof" href="#" id="opt_id_pcc">' + window.lang.convert("Pla Cartogràfic de Catalunya-INSPIRE") + '</a></li>');
		_htmlDadesOficials.push('<li style="text-align: center"><a class="label-dof" href="#" id="opt_id_inspi">' + window.lang.convert("Geoportal INSPIRE") + '</a></li>');
		_htmlDadesOficials.push('</ul>');
		_htmlDadesOficials.push('</div>');
		_htmlDadesOficials.push('<div id="id_ofi_body" 	style="background-color: #fcf8e3;" class="panel-warning">');
		_htmlDadesOficials.push('</div>');
		_htmlDadesOficials.push('<div id="id_ofi_results" 	style="background-color: #fcf8e3;" class="panel-warning">');
		_htmlDadesOficials.push('</div>');
		_htmlDadesOficials.push('<div id="div_controlWMS_OFICIALS"></div>');
		_htmlDadesOficials.push('<div id="div_emptyWMS_OFICIALS"></div>');
		_htmlDadesOficials.push('<div id="id_ofi_footer" 	style="background-color: #fcf8e3;" class="footer panel-warning">');
		//_htmlDadesOficials.push('<span class="label label-font">' + window.lang.convert("Font") + ': <a target="_blank" href="http://inspire-geoportal.ec.europa.eu/discovery/">INSPIRE Catalog</a></span>');
		//_htmlDadesOficials.push('<span lang="ca" class="label" id="inspire_msg"></span>');
		_htmlDadesOficials.push('</div>');
		this.resetResultatsOficials();
		return _htmlDadesOficials.join("");
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
					_htmlGetInitInspire.push('<option value="null">' + window.lang.convert("Serveis WMS per Estat") + '</option>');
					_htmlGetInitInspire.push('<option value="null">' + window.lang.convert("Unió Europea") + '  (' + resultats + ')</option>');
					$.each(countries, function (key, value) {
						if (isNaN(value)) {
							_htmlGetInitInspire.push('<option value=' + value + '>' + window.lang.convert(EuCountryNames[value]));
						} else {
							_htmlGetInitInspire.push(' (' + value + ')</option>');
						}
					});
					_htmlGetInitInspire.push('</select>');
					_htmlGetInitInspire.push('</div></li>');
					_htmlGetInitInspire.push('<li><div class="input-group txt_ext_ofi"><input type="text" lang="ca" id="txt_URLWMS_INSPIRE_cataleg" style="height:33px" placeholder="' + window.lang.convert("Filtre catàleg INSPIRE") + '" class="form-control">');
					_htmlGetInitInspire.push('<span class="input-group-btn"><button class="btn btn-success" id="bt_cercaWMS_INSPIRE"  type="button"><span class="glyphicon glyphicon-search"></span></button></span>');
					_htmlGetInitInspire.push('</div></li>');
					_htmlGetInitInspire.push('</ul>');

					jQuery('#id_ofi_body').html(_htmlGetInitInspire.join(""));

					var _htmlGetFooterInspire = [];
					_htmlGetFooterInspire.push('<span class="label label-font">' + window.lang.convert("Font") + ': <a target="_blank" href="http://inspire-geoportal.ec.europa.eu/discovery/">INSPIRE Catalog</a></span>');
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
					jQuery('#id_ofi_results').html('<h2>'+window.lang.convert("Sense resposta del catàleg INSPIRE")+'</h2>');
				}
			} catch (err) {
				jQuery('#id_ofi_results').html('<h2>'+window.lang.convert("Sense resposta del catàleg INSPIRE")+'</h2>');
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
					items.push(val.nom_grup_instamaps);
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
				var _valID = treuAccentsiEspais(val.nom_grup_instamaps);
				var id = '_pccul_' + _valID;
				jQuery('#' + id).append('<option value="'+titol+'##'+idarxiu+'##'+capa+'">' + titolShort+'</option>');
			});
			$('select[data-selectsplitter-selector]').selectsplitter(				
				{template:   
					'<div class="row" data-selectsplitter-wrapper-selector>' +
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
					_gaq.push(['_trackEvent', 'mapa', tipus_user+'PCC', _atrPCC[0], 1]);
				};
			});//Fi PCC click
		});
	};

	this.addOpcionsHTMLTipusDadesOficials = function (objHTML) {
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
					jQuery('#inspire_msg').html(window.lang.convert("Trobats") + ":<b>" + resultats + "</b>." + window.lang.convert("Es mostraran només 100 resultats. Utilitza el filtre per afinar la cerca"));
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
						_gaq.push(['_trackEvent', 'mapa', tipus_user+'INSPIRE', $(e.target).attr('title'), 1]);
					};
				});
			} else {
				jQuery('#id_ofi_results').html('<h4>'+window.lang.convert("Sense resultats")+'</h4>');
				this.resetResultatsOficials();
				return;
			}
		});
	};
}; //fi clases
