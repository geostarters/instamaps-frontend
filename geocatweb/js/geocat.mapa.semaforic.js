function showPaletteSelector()
{

	$("#mapa_modals").append(
	'	<div id="interactivePalette">'+
	'		' + $("#paletes_colors").html() + 
	'	</div>'
	);

}

function createTrafficLightStyle(color) {

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

}

function randomStringAux(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function randomString(length) {
	return randomStringAux(length, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

function createTempTrafficLightLayer(key, value, baseLayer, layerOptions)
{

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

	jQuery.extend(layerOptions, newOptions);

	return newLayer;

}

function setupTematicLayerDialog(layer, key, min, pivot, max)
{

	//Omplim els valors del diàleg del temàtic per categories
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

	$(".ramp").off('click');
	$(".ramp").on('click',function(evt){
		var _this = $(this);
		var brewerClass = _this.attr('class').replace("ramp ","");
		$("#dialog_tematic_rangs").data("paleta", brewerClass);
		if ($('#list_tematic_values').html() !== ""){
			updatePaletaRangs();
		}
	});

	$('.btn-reverse-palete').off('click');
	$('.btn-reverse-palete').on('click',function(evt){
		var glyp = $('.btn-reverse-palete.glyphicon');
		var reverse = false;
		if(glyp.hasClass('glyphicon-arrow-down')){
			reverse = true;
			glyp.removeClass('glyphicon-arrow-down').addClass('glyphicon-arrow-up');
		}else{
			reverse = false;
			glyp.removeClass('glyphicon-arrow-up').addClass('glyphicon-arrow-down');
		}
		$("#dialog_tematic_rangs").data("reverse",reverse);
		if ($('#list_tematic_values').html() !== ""){
			updatePaletaRangs();
		}
	});

	$('#dialog_tematic_rangs .btn-success').off('click');
	$('#dialog_tematic_rangs .btn-success').on('click',function(e){
		$('#dialog_tematic_rangs').hide();
		$('#info_uploadFile').show();
		busy=true;
		$("#div_uploading_txt").html("");
		$("#div_uploading_txt").html(
			'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant categories')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
			'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'
		);	
		createTematicLayerCategories(e);
		$("#dialog_tematic_rangs .labels_fields").show();
		$("#list_tematic_values").show();
	});

	$(".ramp.YlOrRd").click();
	//$('#dialog_tematic_rangs').modal("show");
	showPaletteSelector();

}

function trafficLightVisualization(key, pivot, layer, newLayerNeeded)
{

	//TODO: Agafar la paleta de la capa, no la última seleccionada
	var paleta = $("#dialog_tematic_rangs").data("paleta") || "YlOrRd"; 
	var rangColors = createScale(paleta, 3, false);
	var estilActual = rangColors.colors(3);
	var equalStyle = createTrafficLightStyle(estilActual[1]);
	var lowerStyle = createTrafficLightStyle(estilActual[0]);
	var higherStyle = createTrafficLightStyle(estilActual[2]);
	var layerToUpdate = layer;
	var layerOptions = {};
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

	layerToUpdate.estil = [equalStyle, lowerStyle, higherStyle];
	if(newLayerNeeded)
	{

		setupTematicLayerDialog(layerToUpdate, key, min, pivot, max);
		layerToUpdate = createTempTrafficLightLayer(key, pivot, layer.options, layerOptions);
		layerToUpdate.estil = [equalStyle, lowerStyle, higherStyle];

	}
	else
	{

	}

	readVisualitzacio($.Deferred(), layerToUpdate, layerOptions);

}