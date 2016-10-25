function createTrafficLightStyle(color) {

	return {
		borderColor: color,
		borderWidth: 3,
		color: color,
		opacity: 50,
		geometria: {
			features: []
		}
	};

}

function createTrafficLightLayer(key, baseLayer, layerOptions)
{

	var newLayer = {};
	var newOptions = {businessId: baseLayer.businessId,
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
			}
		}),
		query:null,
		serverName: key + " Semafòric",
		serverType: baseLayer.tipus,
		tiles:"",
		titles:null,
		transparency:"",
		url:"",
		version:"",
		visibilitat:"O",
		isTrafficLightFixed: false
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
	var estilCarto = ["#FFEDA0", "#FEB24C", "#F03B20"];
	var estilActual = estilCarto;
	var equalStyle = createTrafficLightStyle(estilActual[1]);
	var lowerStyle = createTrafficLightStyle(estilActual[0]);
	var higherStyle = createTrafficLightStyle(estilActual[2]);
	var layerToUpdate = layer;
	var layerOptions = {};

	if(newLayerNeeded)
	{

		layerToUpdate = createTrafficLightLayer(key, layer, layerOptions);

	}
	else
	{

	}

	layerToUpdate.estil = [equalStyle, lowerStyle, higherStyle];
	$.each(layer.estil, function(i, estil) {
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

	if(newLayerNeeded)
		return readVisualitzacio($.Deferred(), layerToUpdate, layerOptions);
	else
	{

	}

}