
function objecteUserAdded(f){
	
	var fId = this.toGeoJSON().features.length;
	
	var feature = f.layer.toGeoJSON();
	feature.properties = {
		nom : "feature" + fId,
		text : "<a href='http://www.google.com'>link</a>",
		slotf1 : 'data 1',
		slotf2 : 'data 2',
		slotf3 : 'data 3',
		slotf4 : 'data 4',
		slotf5 : 'data 5',
		slotf6 : 'data 6',
		slotf7 : 'data 7',
		slotf8 : 'data 8',
		slotf9 : 'data 9',
		slotf10 : 'data 10'
	};

	var features = JSON.stringify(feature);

	var dades = JSON.stringify({
		type : 'Dades',
		id : fId,
		fields : {
			slotd1 : "feature" + fId,
			slotd2 : 'data 2',
			slotd3 : 'data 3',
			slotd4 : 'data 4',
			slotd5 : 'data 5',
			slotd6 : 'data 6',
			slotd7 : 'data 7',
			slotd8 : 'data 8',
			slotd9 : 'data 9',
			slotd10 : 'data 10',
		}
	});

	var rangs = JSON
			.stringify({
				llegenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
				valorMax : "feature" + fId,
				color : '#ff0000',
				marker: f.layer.options.icon.options.markerColor,
				simbolColor: f.layer.options.icon.options.iconColor,
				simbolSize : f.layer._icon.height,
				simbol : f.layer.options.icon.options.icon,
				lineWidth : 2,
				lineStyle : 'solid',
				borderWidth : 2,
				borderColor : '#000000',
				opacity : (f.layer.options.opacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
			});

	if (fId == 1) {
		// Add feature and Layer
		var data = {
			uid : jQuery.cookie('uid'),
			description : 'TODO description',
			nom : 'Capa1 TODO',
			publica : true,
			geomField : 'the_geom',
			idGeomField : 'nom',
			dataField : 'slotd1',
			idDataField : 'slotd1',
			features : features,
			dades : dades,
			rangs : rangs,
			mapBusinessId: url('?businessid'),
			geometryType: f.layer.options.tipus
		};
//		console.info(this);
		var _this = this;
		
		addTematicLayerFeature(data).then(function(results) {
							_this.options = results;
							console.debug('addTematicLayerFeature OK');
							// editableLayers=results;
						},function(results){
							console.debug('addTematicLayerFeature ERROR');
						});

	} else if (this.toGeoJSON().features.length > 1) {

		var dataFeature = {
			businessId : this.options.results.geometriesBusinessId,
			uid : jQuery.cookie('uid'),
			features : features
		};

		var dataCapes = {
			businessId : this.options.results.capesBusinessId,
			uid : jQuery.cookie('uid'),
			dades : dades
		};

		var dataRangs = {
			businessId : this.options.results.businessId,
			uid : jQuery.cookie('uid'),
			rangs : rangs
		};

		jQuery.when(
					createFeature(dataFeature),
					createData(dataCapes),
					createRang(dataRangs))
				.then(function(results1,results2,results3) {
							console.debug(results1[0].status);
							console.debug(results2[0].status);
							console.debug(results3[0].status);
						},function(results1,results2,results3){
							console.debug("ERROR");
						});


	}
	
}