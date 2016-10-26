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

function createTrafficLightLayer(key, value, baseLayer, layerOptions)
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
			trafficLightKey : key
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

function trafficLightVisualization(key, pivot, layer, newLayerNeeded)
{

	var estilCB = ["#ffffbf", "#fc8d59", "#91cf60"];
	var estilCarto = ["#008080", "#f6edbd", "#ca562c"];
	var estilActual = estilCarto;
	var equalStyle = createTrafficLightStyle(estilActual[1]);
	var lowerStyle = createTrafficLightStyle(estilActual[0]);
	var higherStyle = createTrafficLightStyle(estilActual[2]);
	var layerToUpdate = layer;
	var layerOptions = {};

	layerToUpdate = createTrafficLightLayer(key, pivot, layer.options, layerOptions);

	layerToUpdate.estil = [equalStyle, lowerStyle, higherStyle];
	$.each(layer.options.estil, function(i, estil) {
		$.each(estil.geometria.features, function(j, feature) {

			var aux = feature;
			var val = parseFloat(aux.properties[key]);
			if(val == pivot)
			{

				//Equal color
				layerToUpdate.estil[0].geometria.features.push(feature);

			}
			else if(val < pivot)
			{

				//Less than color
				layerToUpdate.estil[1].geometria.features.push(feature);

			}
			else 
			{

				//Greater than color
				layerToUpdate.estil[2].geometria.features.push(feature);

			}

		});
	});

	return readVisualitzacio($.Deferred(), layerToUpdate, layerOptions);

}