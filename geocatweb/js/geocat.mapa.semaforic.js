;(function(global, $){
	
	var Semaforic = function(){
		return new Semaforic._init();
	}
	
	Semaforic.prototype = {
		_createPaletteSelector: function() 
		{

			var self = this;
			var html = '	<div id="interactivePalette">'+
			'		<div style="display: inline-block; padding: 10px;">';
			
			var palettes = $("#paletes_colors > .ramp");
			$.each(palettes, function(index, palette) {
				var palName = $(palette).attr("class").replace("ramp ", "");
				var scale = createScale(palName, 3, false);
				html += '			<div class="ramp ' + palName + '">' +
				'			<svg height="60" width="15">' + 
				'				<rect y="0" height="20" width="15" fill="' + scale(0) + '"/>' + 
				'				<rect y="20" height="20" width="15" fill="' + scale(1) + '"/>' +
				'				<rect y="40" height="20" width="15" fill="' + scale(2) + '"/>' +
				'			</svg>' +
				'		</div>';
			});

			html += '			<div style="text-align: right;">'+
			'				<div style="display: inline-block;">'+
			'					<button type="button" class="btn btn-info" lang="ca">Inverteix paleta</button>'+
			'				</div>'+
			'				<div style="display: inline-block;">'+
			'					<button type="button" class="btn btn-default" lang="ca">Cancel·lar</button>'+
			'					<button type="button" class="btn btn-success" lang="ca">Acceptar</button>'+
			'				</div>'+
			'			</div>'+
			'		</div>' +
			'	</div>';
			$("#mapa_modals").append(html);

			var aux = $("#interactivePalette .ramp");
			aux.off('click');
			aux.on('click',function(evt){
				var _this = $(this);
				$("#interactivePalette .ramp.active").removeClass("active");
				var brewerClass = _this.attr('class').replace("ramp ","").replace("active", "");
				self._palette = brewerClass;
				_this.addClass("active");
				if(null != self._fakeLayer)
				{

					//Actualitzem la capa de previsualització
					self._updateFakeLayer();

				}

				//Actualitzem també els valors del diàleg del temàtic de categories
				$("#dialog_tematic_rangs").data("paleta", brewerClass);
				updatePaletaRangs();
			});

			aux = $("#interactivePalette .btn-info");
			aux.off('click');
			aux.on('click',function(evt){
				self._isPaletteReversed = !self._isPaletteReversed;
				$("#dialog_tematic_rangs").data("reverse",self._isPaletteReversed);
				updatePaletaRangs();

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
				$('#info_uploadFile').show();
				busy=true;
				$("#div_uploading_txt").html("");
				$("#div_uploading_txt").html(
					'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant categories')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
					'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'
				);	
				createTematicLayerCategories(e);
			});

			$("#interactivePalette .ramp.YlOrRd").click();
			self._isPaletteDialogCreated = true;

		},

		_showPaletteSelector: function()
		{

			var self = this;
			if(!self._isPaletteDialogCreated)
				self._createPaletteSelector();

			$("#interactivePalette").show();

		},

		_createTrafficLightStyle: function(color)
		{

			return {
				borderColor: "#ffffff",
				borderWidth: 1,
				color: color,
				opacity: 50,
				label: false,
				labelHaloWidth: 0,
				labelSize: 0,
				lineWidth: 0,
				opacity: 75,
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
			var newOptions = {businessId: randomString(32),
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
					businessId: baseLayer.businessId,
					nom: key + " Semafòric",
					origen: baseLayer.businessId,
					geometryType: baseLayer.geometryType,
					tipus: baseLayer.tipusRang,
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
					isTrafficLightFixed : false,
					trafficLightKey : key, 
					propName: baseLayer.propName.join()
				}),
				query:null,
				serverName: key + " Semafòric (" + value + ")",
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
			newLayer.tipus = baseLayer.tipusRang;
			newLayer.uid = null;//<----

			$.extend(layerOptions, newOptions);

			return newLayer;

		},

		_setupTematicLayerDialog: function(layer, key, min, pivot, max)
		{

			var self = this;
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
			$("#dialog_tematic_rangs .labels_fields").hide();
			$("#palet_warning").hide();
			$("#list_tematic_values").hide();

			self._showPaletteSelector();

		},

		render: function(key, pivot, inLayer)
		{

			//TODO: Agafar la paleta de la capa, no la última seleccionada
			var self = this;
			var rangColors = createScale(self._palette, 3, false);
			var estilActual = [rangColors(0).hex(), rangColors(0.5).hex(), rangColors(1).hex()];
			var equalStyle = self._createTrafficLightStyle(estilActual[1]);
			var lowerStyle = self._createTrafficLightStyle(estilActual[0]);
			var higherStyle = self._createTrafficLightStyle(estilActual[2]);
			var layerOptions = {};
			var layer = (null != self._fakeLayer ? self._fakeLayer : inLayer);
			var min = Number.MAX_SAFE_INTEGER;
			var max = Number.MIN_SAFE_INTEGER;

			$.each(layer.options.estil, function(i, estil) {
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

			layer.estil = [equalStyle, lowerStyle, higherStyle];
			if(null == self._fakeLayer)
			{

				self._setupTematicLayerDialog(layer, key, min, pivot, max);
				layer = self._createTempTrafficLightLayer(key, pivot, layer.options, layerOptions);
				layer.estil = [equalStyle, lowerStyle, higherStyle];
				self._fakeLayerOptions = layerOptions;
				self._fakeLayer = layer;
				readVisualitzacio($.Deferred(), self._fakeLayer, self._fakeLayerOptions).then(function(data) {
					self._capaVisualitzacio = data;
				});

			}
			else
			{

			}

		},

		_updateFakeLayer: function() 
		{

			var self = this;
			var scale = createScale(self._palette, 3, self._isPaletteReversed);
			self._fakeLayer.estil[0].color = scale(0);
			self._fakeLayer.estil[1].color = scale(1);
			self._fakeLayer.estil[2].color = scale(2);

			//Removes the additional data from the map.
			reloadVisualitzacioLayer(self._capaVisualitzacio, self._fakeLayer, self._fakeLayerOptions, map);

		}

	};
	
	Semaforic._init = function(){
		var self = this;
		self._isPaletteDialogCreated = false;
		self._fakeLayer = null;
		self._fakeLayerOptions = null;
		self._isPaletteReversed = false;
		self._palette = "YlOrRd";
		self._isInitialized = true;

		return this;
	}
	
	Semaforic._init.prototype = Semaforic.prototype;	
	global.Semaforic = Semaforic;
	
}(window, jQuery));