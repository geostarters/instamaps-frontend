;(function(global, $){
	
	var Semaforic = function(isEditing){
		return new Semaforic._init(isEditing);
	}
	
	Semaforic.prototype = {
		_createPaletteSelector: function() 
		{

			var self = this;
			var html = 
			'	<div id="interactivePalette">' +
			'		<div id="paletteBackground"></div>' +
			'		<div id="innerPalette">' +
			'			<div><h5 lang="ca" class="paletteTitle">Tria la paleta de colors</h5></div>' + 
			'			<div>' +
			'				<div class="paletteLabels">' +
			'					<div style="height: 20px;">Valors menors</div>' +
			'					<div style="height: 20px;">Valors iguals</div>' +
			'					<div style="height: 20px;">Valors majors</div>' +
			'				</div>' +
			'				<div class="palettes" style="display: inline-block;">';
			
			var palettes = $("#paletes_colors > .ramp");
			palettes.push("carto");			
			if(1 == palettes.length)
				palettes = ["BuGn", "BuPu", "GnBu", "OrRd", "PuBu", "PuBuGn", "PuRd", "RdPu", "YlGn", "YlGnBu", "YlOrBr", "YlOrRd", 
					"BrBG", "PRGn", "PuOr", "RdGy", "RdYlBu", "RdYlGn", "Spectral", "Paired", "Set3", "Set1", "Dark2", "carto"];
			$.each(palettes, function(index, palette) {
				var palName;
				if($(palette).hasClass("ramp"))
					palName = $(palette).attr("class").replace("ramp ", "");
				else
					palName = palette;
				var scale = self._createScaleAux(palName, 3, false);
				html += '					<div class="ramp ' + palName + '">' +
				'					<svg height="60" width="15">' + 
				'						<rect y="0" height="20" width="15" fill="' + scale(self._paletteColorValues[0]).hex() + '"/>' + 
				'						<rect y="20" height="20" width="15" fill="' + scale(self._paletteColorValues[1]).hex() + '"/>' +
				'						<rect y="40" height="20" width="15" fill="' + scale(self._paletteColorValues[2]).hex() + '"/>' +
				'					</svg>' +
				'				</div>';
			});

			html += '				</div>' + 
			'				<div class="paletteButtons">'+
			'					<div style="display: inline-block; float:left;">'+
			'						<input id="cbSoftColors" type="checkbox"><span style="padding-left: 10px;" lang="ca">' + window.lang.translate('Colors suaus') + '</span>' +
			'					</div>'+
			'					<div class="innerPaletteButtons">'+
			'						<button type="button" class="btn btn-info" lang="ca">Inverteix paleta</button>'+
			'						<button type="button" class="btn btn-default" lang="ca">Cancel·lar</button>'+
			'						<button type="button" class="btn btn-success" lang="ca">Acceptar</button>'+
			'					</div>'+
			'				</div>'+
			'			</div>' +
			'		</div>' + 
			'	</div>' +
			'	<div id="dismissPaletteDialog" class="modal fade">' + 
			'		<div class="modal-dialog">'+
			'			<div class="modal-content panel-primary">'+
			'				<div id="id_sw" class="modal-body">'+
			'					<h4><span lang="ca">Vols sortir sense guardar els canvis en la capa?</span></h4>' +
			'				</div>'+
			'				<div class="modal-footer">'+
			'					<button type="button" class="btn btn-default" data-dismiss="modal" lang="ca">Cancel·lar</button>'+
			'			        <button type="button" class="btn btn-danger" data-dismiss="modal" lang="ca">Esborrar</button>'+
			'				</div>'+
			'			</div>'+
			'		</div>'+
			'	</div>';
			$("#mapa_modals").append(html);

			$('#cbSoftColors').iCheck({
				checkboxClass: 'icheckbox_flat-blue',
				radioClass: 'iradio_flat-blue'
			});

			self._isPaletteDialogCreated = true;

		},

		_bindPaletteButtons: function()
		{

			var self = this;
			var aux = $("#interactivePalette .ramp");
			aux.off('click');
			aux.on('click',function(evt){
				var _this = $(this);
				$("#interactivePalette .ramp.active").removeClass("active");
				var brewerClass = _this.attr('class').replace("ramp ","").replace(" active", "");
				self._palette = brewerClass;
				_this.addClass("active");

				//Actualitzem també els valors del diàleg del temàtic de categories
				if(self._isEditing)
				{

					if("carto" == brewerClass)
					{

						brewerClass = ["#008080","#f6edbd","#ca562c"];

					}

					$("#dialog_tematic_rangs").data("paleta", brewerClass);
					updatePaletaRangs();

				}

				if(null != self._fakeLayer)
				{

					//Actualitzem la capa de previsualització
					self._updateFakeLayer();

				}

			});

			aux = $("#interactivePalette .btn-info");
			aux.off('click');
			aux.on('click',function(evt){
				self._isPaletteReversed = !self._isPaletteReversed;

				if(self._isEditing)
				{

					$("#dialog_tematic_rangs").data("reverse",self._isPaletteReversed);
					updatePaletaRangs();

				}

				var palettes = $("#interactivePalette .ramp");
				$.each(palettes, function(index, palette) {
					var svg = $(palette).children();
					var rects = $(svg).children();
					var startColor = $(rects[0]).attr("fill");
					var endColor = $(rects[2]).attr("fill");
					$(rects[0]).attr("fill", endColor);
					$(rects[2]).attr("fill", startColor);
				});

				if(null != self._fakeLayer)
				{

					//Actualitzem la capa de previsualització
					self._updateFakeLayer();

				}

			});

			aux = $('#interactivePalette .btn-success');
			aux.off('click');
			aux.on('click',function(e){

				$('#interactivePalette').hide();

				if(self._isEditing)
				{

					$('#info_uploadFile').show();
					busy=true;
					$("#div_uploading_txt").html("");
					$("#div_uploading_txt").html(
						'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant categories')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
						'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'
					);

					var key = $("#dialog_tematic_rangs #dataField").val();
					var value = $("#dialog_tematic_rangs").data("rangs")[1].min;
					var data = {nom: key + " " + window.lang.translate("Semafòric") + " " + window.lang.translate("(Valor de ref: ") + value + ")", trafficLightKey: key, trafficLightValue: value};
					createTematicLayerCategories(e, {}, data, $.Deferred()).then(function() {
						//Eliminem la capa de previsualització del control de capes
						map.removeLayer(self._capaVisualitzacio);
						controlCapes.removeLayer(controlCapes._layers[self._fakeLayer.parentid]._layers[self._capaVisualitzacio._leaflet_id]);
						self._fakeLayer = null;

					});

				}

			});

			aux = $('#interactivePalette .btn-default');
			aux.off('click');
			aux.on('click',function(e){
				//Activem la capa mare
				$( "#input-" + self._fakeLayer.geometriesBusinessId).click();
				self._closePalette();
			});

			aux = $("#paletteBackground");
			aux.off("click");
			aux.on("click", function(e) {
				$("#dismissPaletteDialog").modal("show");
			});

			aux = $("#dismissPaletteDialog .btn-danger");
			aux.off("click");
			aux.on("click", function(e) {
				self._closePalette();
			});

			$("#cbSoftColors").on("ifToggled", function(e) {
				self._softColorsCheckboxChanged();

				if(self._isEditing)
				{

					updatePaletaRangs();

				}

				var palettes = $("#interactivePalette .ramp");
				$.each(palettes, function(index, palette) {
					var svg = $(palette).children();
					var rects = $(svg).children();
					var paletteName = $(palette).attr("class").replace("ramp ", "").replace(" active", "");
					var scale = self._createScaleAux(paletteName, 3, self._isPaletteReversed);
					$(rects[0]).attr("fill", scale(self._paletteColorValues[0]).hex());
					$(rects[1]).attr("fill", scale(self._paletteColorValues[1]).hex());
					$(rects[2]).attr("fill", scale(self._paletteColorValues[2]).hex());
				});

				if(null != self._fakeLayer)
				{

					//Actualitzem la capa de previsualització
					self._updateFakeLayer();

				}

			});

		},

		_softColorsCheckboxChanged: function()
		{

			var self = this;
			self._useSoftColors = !self._useSoftColors;

			if(self._useSoftColors)
				self._paletteColorValues = [0.75, 1.5, 2.25];
			else
				self._paletteColorValues = [0, 1.5, 3];

		},

		_closePalette: function() 
		{

			var self = this;
			$('#interactivePalette').hide();
			map.removeLayer(self._capaVisualitzacio);
			controlCapes.removeLayer(controlCapes._layers[self._fakeLayer.parentid]._layers[self._capaVisualitzacio._leaflet_id]);
			controlCapes.forceUpdate(false);
			self._fakeLayer = null;

		},

		_showPaletteSelector: function()
		{

			var self = this;
			if(!self._isPaletteDialogCreated)
				self._createPaletteSelector();

			self._bindPaletteButtons();
			$("#interactivePalette").show();

		},

		_createTrafficLightStyle: function(color)
		{

			return {
				businessId : randomString(32),
				borderColor: "#ffffff",
				borderWidth: 1,
				color: color,
				opacity: 75,
				label: false,
				labelHaloWidth: 0,
				labelSize: 0,
				lineWidth: 0,
				radius: 0,
				simbolSize: 0,
				geometria: {
					features: []
				}
			};

		},

		_randomStringAux: function(length, chars)
		{

			var result = '';
			for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
			return result;

		},

		_randomString: function(length)
		{

			var self = this;
			return self._randomStringAux(length, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

		},

		_createTempTrafficLightLayer: function(key, value, baseLayer, layerOptions)
		{

			var self = this;
			var newLayer = {};
			var id = randomString(32);
			var newOptions = {businessId: id,
				capesActiva: "true",
				capesCalenta: null,
				capesGroup: "",
				capesOrdre: "sublayer",
				capesVisibilitat: null,
				entitatUid: null, //<----
				epsg: {},
				id: null, //<----
				imgFormat: "",
				infFormat: "",
				layers: null,
				legend: "",
				opacity: 1,
				options: JSON.stringify({
					tem: "clasicTematic",
					id: null,  //<----
					businessId: id,
					nom: key + " Semafòric",
					origen: baseLayer.businessId,
					geometryType: baseLayer.geometryType,
					tipus: "clasicTematic",
					options: {
						source: baseLayer.source,
						propName: baseLayer.propName.join(),
					},
					geometriesColleccio: {
						id: baseLayer.id,
						businessId: baseLayer.businessId,
						nom: baseLayer.nom, 
						options: baseLayer.propName.join(),
						geometryType: baseLayer.geometryType
					},
					entitat: null,  //<----
					group: {
						name: baseLayer.group.name, 
						groupName: baseLayer.group.groupName,
						id: baseLayer.group.id,
						z_order: baseLayer.group.z_order,
						expanded: baseLayer.group.expanded
					},
					trafficLightKey : key,
					propName: baseLayer.propName.join()
				}),
				query:null,
				serverName: key + " " + window.lang.translate("Semafòric") + " " + window.lang.translate("(Valor de ref: ") + value + ")",
				serverType: baseLayer.tipus,
				tiles:"",
				titles:null,
				transparency:"",
				url:"",
				version:"",
				visibilitat:"O"
			};

			newLayer.options = newOptions.options;
			newLayer.businessId = null; //<----
			newLayer.geometriesBusinessId = baseLayer.businessId;
			newLayer.geometryType = baseLayer.geometryType;
			newLayer.id = null; //<----
			newLayer.nom = newOptions.options.serverName;
			newLayer.tipus = "clasicTematic";
			newLayer.uid = null;//<----

			if(baseLayer.hasOwnProperty("leafletid"))
				newLayer.parentid = baseLayer.leafletid;
			else
			{

				var keys = Object.keys(controlCapes._layers);
				var trobat = false;
				var key;
				for(var i=0; i<keys.length && !trobat; ++i)
				{

					key = keys[i];
					trobat = (controlCapes._layers[keys[i]].layer.options.businessId == baseLayer.businessId);

				}

				newLayer.parentid = key;

			}

			$.extend(layerOptions, newOptions);

			return newLayer;

		},

		_setupTematicLayerDialog: function(layer, key, min, pivot, max)
		{

			var self = this;
			if(self._isEditing)
			{

				//Omplim els valors del diàleg del temàtic per categories
				//i utilitzem el seu click pq es faci el mateix procés que es
				//faria en un categòric de 3
				$("#dialog_tematic_rangs").data("capamare", {
					businessid: layer.options.businessId,
					from: layer.options.from,
					geometrytype: layer.options.geometryType,
					leafletid: layer.options.leafletid,
					propname: layer.options.propName.join(),
					tipus: layer.options.tipus
				});

				var src;
				if (layer.options.geometryType == t_marker)
				{

					src = $("#tematic-values-rangs-punt-template").html();

				}
				else if (layer.options.geometryType == t_polyline)
				{

					src = $("#tematic-values-rangs-polyline-template").html();
					
				}
				else if (layer.options.geometryType == t_polygon)
				{

					src = $("#tematic-values-rangs-polygon-template").html();

				}

				var template = Handlebars.compile(src);
				$("#list_tematic_values").html(template({values: [{index:0, v: {min: min, max: pivot-1}}, {index:1, v: {min: pivot, max: pivot}}, {index:2, v:{min: pivot+1, max: max}}]}));

				$("#dialog_tematic_rangs").data("rangs", [{min: min, max: pivot-1}, {min: pivot, max: pivot}, {min: pivot+1, max: max}]);
				showTematicRangs(layer.options.geometryType);
				$("#dataField").html("<option value=\"" + key + "\">" + key + "</option>");
				$("#dataField").val(key);
				$("#cmb_num_rangs").val(3);

			}

			self._showPaletteSelector();

		},

		_createScaleAux: function(paleta, rang, reversed)
		{

			var auxPaleta = paleta;
			if("carto" == auxPaleta)
			{

				auxPaleta = ["#008080","#f6edbd","#ca562c"];

			}

			return createScale(auxPaleta, rang, reversed);

		},

		render: function(defer, key, pivot, inLayer)
		{

			//TODO: Agafar la paleta de la capa, no la última seleccionada
			var self = this;
			var rangColors = self._createScaleAux(self._palette, 3, self._isPaletteReversed);
			var estilActual = [
				rangColors(self._paletteColorValues[0]).hex(), 
				rangColors(self._paletteColorValues[1]).hex(), 
				rangColors(self._paletteColorValues[2]).hex()
			];
			var equalStyle = self._createTrafficLightStyle(estilActual[1]);
			var lowerStyle = self._createTrafficLightStyle(estilActual[0]);
			var higherStyle = self._createTrafficLightStyle(estilActual[2]);
			var layerOptions = {};
			var layer = (null != self._fakeLayer ? self._fakeLayer : inLayer);
			var min = Number.MAX_SAFE_INTEGER;
			var max = Number.MIN_SAFE_INTEGER;

			$.each(inLayer.options.estil, function(i, estil) {
				$.each(estil.geometria.features, function(j, feature) {

					var aux = feature;
					var val = parseFloat(aux.properties[key]);
					min = (min > val ? val : min);
					max = (max < val ? val : max);
					if(val == pivot)
					{

						//Equal color
						equalStyle.geometria.features.push(feature);

					}
					else if(val < pivot)
					{

						//Less than color
						lowerStyle.geometria.features.push(feature);

					}
					else 
					{

						//Greater than color
						higherStyle.geometria.features.push(feature);

					}

				});
			});

			if(null == self._fakeLayer)
			{

				self._setupTematicLayerDialog(layer, key, min, pivot, max);
				layer = self._createTempTrafficLightLayer(key, pivot, layer.options, layerOptions);

			}


			var aux = JSON.parse(layer.options);
			layer.estil = [lowerStyle, equalStyle, higherStyle];
			aux.rangsEstilsLegend = {};
			aux.rangsEstilsLegend[layer.estil[0].businessId] = key + window.lang.translate(" menors de ") + pivot;
			aux.rangsEstilsLegend[layer.estil[1].businessId] = key + window.lang.translate(" iguals a ") + pivot;
			aux.rangsEstilsLegend[layer.estil[2].businessId] = key + window.lang.translate(" majors de ") + pivot;
			layer.options = JSON.stringify(aux);
			
			if(null == self._fakeLayerOptions)
			{

				self._fakeLayerOptions = layerOptions;
				self._fakeLayer = layer;

				readVisualitzacio($.Deferred(), self._fakeLayer, self._fakeLayerOptions).then(function(data) {
					//Desactivem la capa mare
					if ($( "#input-" + self._fakeLayer.geometriesBusinessId).attr("checked")!=undefined) $( "#input-" + self._fakeLayer.geometriesBusinessId).click();
					self._capaVisualitzacio = data;
					defer.resolve(data._leaflet_id);
					$("#interactivePalette .ramp.carto").click();
				});
				controlCapes.forceUpdate(false);

			}
			else
			{

				self._capaVisualitzacio.layer.options.rangEstilsLegend = aux.rangsEstilsLegend;
				reloadVisualitzacioLayer(self._capaVisualitzacio, self._fakeLayer, self._fakeLayerOptions, map);
				defer.resolve(self._capaVisualitzacio._leaflet_id);
				controlCapes.forceUpdate(false);

			}

			return defer.promise();

		},

		_updateFakeLayer: function() 
		{

			var self = this;
			var scale = self._createScaleAux(self._palette, 3, self._isPaletteReversed);
			self._fakeLayer.estil[0].color = scale(self._paletteColorValues[0]).hex();
			self._fakeLayer.estil[1].color = scale(self._paletteColorValues[1]).hex();
			self._fakeLayer.estil[2].color = scale(self._paletteColorValues[2]).hex();

			//Removes the additional data from the map.
			reloadVisualitzacioLayer(self._capaVisualitzacio, self._fakeLayer, self._fakeLayerOptions, map);

		},

		setVisualization: function(vis)
		{

			this._capaVisualitzacio = vis;

		},

		setLayer: function(layer)
		{

			this._fakeLayer = layer;

		},

		setLayerOptions: function(options)
		{

			this._fakeLayerOptions = options;

		},

		setPalette: function(palette, isReversed)
		{

			this._palette = palette;
			this._isPaletteReversed = isReversed;

		},

	};
	
	Semaforic._init = function(isEditing){

		var self = this;

		self._isEditing = ("undefined" !== typeof isEditing && isEditing)
		self._fakeLayer = null;
		self._fakeLayerOptions = null;
		self._isInitialized = true;

		self._isPaletteDialogCreated = ( 0 != $("#interactivePalette").length);
		if(self._isPaletteDialogCreated && self._isEditing)
		{

			//Get the parameters from the palette dialog
			self._isPaletteReversed = $("#dialog_tematic_rangs").data("reverse");
			self._palette = $("#dialog_tematic_rangs").data("paleta");

		}
		else
		{

			self._isPaletteReversed = false;
			self._palette = "carto";

		}

		$("#cbSoftColors").iCheck('uncheck');
		self._useSoftColors = false;
		self._paletteColorValues = [0, 1.5, 3];

		return this;
	}
	
	Semaforic._init.prototype = Semaforic.prototype;	
	global.Semaforic = Semaforic;
	
}(window, jQuery));