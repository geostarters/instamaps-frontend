

var IM_DadesOficials = function (options) {

	this.options = options;

	this.generaOpcionsHTMLDadesOficials = function () {

		var _htmlDadesOficials = [];
		_htmlDadesOficials.push('<div class="panel-warning">');
		_htmlDadesOficials.push('<ul class="bs-dadesO panel-heading">');
		_htmlDadesOficials.push('<li><a class="label-dof" href="#" id="opt_id_pcc">' + window.lang.convert("Dades Pla Cartogràfic de Catalunya") + '</a></li>');
		_htmlDadesOficials.push('<li><a class="label-dof" href="#" id="opt_id_inspi">' + window.lang.convert("Dades geoportal Inspire") + '</a></li>');
		_htmlDadesOficials.push('</ul>');
		_htmlDadesOficials.push('</div>');
		_htmlDadesOficials.push('<div id="id_ofi_body" 	style="background-color: #fcf8e3;" class="panel-warning">');
		_htmlDadesOficials.push('</div>');
		_htmlDadesOficials.push('<div id="id_ofi_results" 	style="background-color: #fcf8e3;" class="panel-warning">');
		_htmlDadesOficials.push('</div>');
		_htmlDadesOficials.push('<div id="id_ofi_footer" 	style="background-color: #fcf8e3;" class="footer panel-warning">');
		_htmlDadesOficials.push('<span class="label label-font">' + window.lang.convert("Font")+': <a target="_blank" href="http://inspire-geoportal.ec.europa.eu/discovery/">INSPIRE Catalog</a></span>');
		_htmlDadesOficials.push('<span lang="ca" class="label" id="inspire_msg"></span></div>');

		this.resetResultatsInspire();

		return _htmlDadesOficials.join("");

	}

	this.resetResultatsInspire = function () {

		jQuery('#id_ofi_results').html('');
		jQuery('#inspire_msg').html('');

	}

	this.addOpcionsHTMLTipusDadesOficials = function (objHTML) {

		var ref = objHTML.id;
		var _that = this;
		if (ref.indexOf('inspi') != -1) {

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
						_htmlGetInitInspire.push('<ul class="bs-dadesO panel-heading">');
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

						jQuery("#bt_cercaWMS_INSPIRE").on('keyup', function (e) {

							var code = e.which;
							if (code == 13) { //enter
								e.preventDefault();
								e.stopImmediatePropagation();
								_that.searchFilterInspireCatalog();

							}

						});

					} else {
						//error servidr inspire

						alert(window.lang.convert("Sense resposta del catàleg INSPIRE"));

					}

				} catch (err) {
					//error servidr inspire
					console.debug("Error");
					alert(window.lang.convert("Sense resposta del catàleg INSPIRE"));
				}

			});

		}

	}

	this.searchFilterInspireCatalog = function () {

		var query = "";
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

			if (results.response && results.response.docs.length > 0) {

				var resultats = results.response.numFound;
				lDadesInspire.push('<ul class="panel-heading bs-dades_oficials llista-dadesInspire">');
				jQuery.each(results.response.docs, function (index, wmsInspire) {

					if (wmsInspire.resourceLocator) {
						var idarxiu = wmsInspire.resourceLocator[0];
						var titol = wmsInspire.resourceTitle;
						var titolShort = shortString(titol, 27);
						var org = wmsInspire.memberStateCountryCode;
						var urn = wmsInspire.id;
						lDadesInspire.push('<li><a class="label-dadesInspire" href="#" title="' + titol + '" data-nom="' + titol + '" data-wms_url="' + idarxiu + '">' + titolShort + ' (' + org + ')');
						lDadesInspire.push('<a lang="ca" href="http://inspire-geoportal.ec.europa.eu/resources' + urn + '" target="_blank">');
						lDadesInspire.push('&nbsp;<span class="glyphicon glyphicon-info-sign orange"></span></a></li>');
					}
				});

				lDadesInspire.push('</ul>');
				jQuery('#id_ofi_results').html(lDadesInspire.join(""));
				if (resultats > 100) {
					jQuery('#inspire_msg').html(window.lang.convert("Trobats") + ":<b>" + resultats + "</b>." + window.lang.convert("Es mostraran només 100 resultats. Utilitza el filtre per afinar la cerca"));
				}
			} else {

				alert(window.lang.convert("Sense resultats"));
				this.resetResultatsInspire();
			}

		});

	}

} //fi clases


