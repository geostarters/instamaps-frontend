
function objecteUserAdded(f){
	
	var fId = this.toGeoJSON().features.length;
	
	var feature = f.layer.toGeoJSON();
<<<<<<< HEAD
	
	//Invertim lng,lat perque es recuperi be desde el servidor despres
    if(f.layer.options.tipus == t_marker){
          var lng = feature.geometry.coordinates[0]
          feature.geometry.coordinates[0] = feature.geometry.coordinates[1];
          feature.geometry.coordinates[1] = lng;         
    }else if(f.layer.options.tipus==t_polyline){
          for(var i=0;i<feature.geometry.coordinates.length;i++){
                var lng = feature.geometry.coordinates[i][0]
                feature.geometry.coordinates[i][0] = feature.geometry.coordinates[i][1];
                feature.geometry.coordinates[i][1] = lng;
          }
    }else if(f.layer.options.tipus==t_polygon){
          var lcoordinates = [];
          $.each( feature.geometry.coordinates[0], function(i,val) {
                lcoordinates.push([val[1], val[0]]);
          });               
          feature.geometry.coordinates[0] = lcoordinates;                  
    }       
	
=======
	//Invertim lng,lat perque es recuperi be desde el servidor despres
		if(f.layer.options.tipus == t_marker){
			var lng = feature.geometry.coordinates[0]
			feature.geometry.coordinates[0] = feature.geometry.coordinates[1];
			feature.geometry.coordinates[1] = lng;		
		}else if(f.layer.options.tipus==t_polyline){
			for(var i=0;i<feature.geometry.coordinates.length;i++){
				var lng = feature.geometry.coordinates[i][0]
				feature.geometry.coordinates[i][0] = feature.geometry.coordinates[i][1];
				feature.geometry.coordinates[i][1] = lng;
			}
		}/*else if(f.layer.options.tipus==t_polygon){
			var lcoordinates = [];
			$.each( feature.geometry.coordinates[0], function(i,val) {
				lcoordinates.push([val[1], val[0]]);
			});			
			feature.geometry.coordinates[0] = lcoordinates;			
		}	*/	
		
>>>>>>> refs/remotes/origin/instamapes_jess_3
	feature.properties = {
		nom : f.layer.properties.capaNom,
		text : f.layer.properties.description,
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

	var rangs = getFeatureStyle(f,fId);
	rangs = JSON.stringify(rangs);
	
	if (fId == 1) {
		// Add feature and Layer
		var data = {
			uid : jQuery.cookie('uid'),
			description : 'Description '+f.layer.properties.capaNom,
			nom : f.layer.properties.capaNom,
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
		var _this = this;
		
		createTematicLayerFeature(data).then(function(results) {
							if(results.status === 'OK'){
								_this.options.businessId = results.results.businessId;
//								_this.options.capesBusinessId = results.results.capesBusinessId;
//								_this.options.geometriesBusinessId = results.results.geometriesBusinessId;
								console.debug('createTematicLayerFeature OK');
								f.layer.properties.capaBusinessId = results.results.businessId;
								f.layer.properties.businessId = results.feature.properties.businessId;
								f.layer.properties.feature = results.feature;
								finishAddFeatureToTematic(f.layer);
							}else{
								//ERROR: control Error
								console.debug('addTematicLayerFeature ERROR');
							}
						},function(results){
							console.debug('addTematicLayerFeature ERROR');
						});

//	} else if (this.toGeoJSON().features.length > 1) {
	} else if (this.getLayers().length > 1) {

//		var dataFeature = {
//			businessId : this.options.geometriesBusinessId,
//			uid : jQuery.cookie('uid'),
//			features : features
//		};
//
//		var dataCapes = {
//			businessId : this.options.capesBusinessId,
//			uid : jQuery.cookie('uid'),
//			dades : dades
//		};
//
//		var dataRangs = {
//			businessId : this.options.businessId,
//			uid : jQuery.cookie('uid'),
//			rangs : rangs
//		};
				
		var data = {
			uid : jQuery.cookie('uid'),
			features : features,
			dades : dades,
			rangs : rangs,
			businessId: this.options.businessId
		};				
				
		addFeatureToTematic(data).then(function(results) {
				if(results.status === 'OK'){
						console.debug('addFeatureToTematic OK');
						f.layer.properties.businessId = results.feature.properties.businessId;
						f.layer.properties.capaBusinessId = results.results.businessId;
						f.layer.properties.feature = results.feature;
						finishAddFeatureToTematic(f.layer);					
					}else{
						//ERROR: control Error
						console.debug("addFeatureToTematic ERROR");
					}
				},function(results){
					console.debug("addFeatureToTematic ERROR");
				});
	}
}

function getFeatureStyle(f, fId){
	var rangs = {};
	console.debug(f.layer.options);
	//ESTIL MARKER
	if(f.layer.options.tipus == t_marker){
		if (f.layer.options.icon){
			rangs = {
				llegenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
				valorMax : "feature" + fId,
				color : '#ff0000',
				marker: f.layer.options.icon.options.markerColor,
				simbolColor: f.layer.options.icon.options.iconColor,
				simbolSize : f.layer._icon.height,
				simbol : f.layer.options.icon.options.icon,
				opacity : (f.layer.options.opacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
			};
		}else{
			rangs = {
				llegenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
				valorMax : "feature" + fId,
				color : f.layer.options.fillColor,
				simbolSize : f.layer.options.radius,
				opacity : (f.layer.options.fillOpacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
				borderWidth : f.layer.options.weight,
				borderColor : f.layer.options.color,
			};
		}
	//ESTIL LINE
	}else if(f.layer.options.tipus == t_polyline){
		rangs = {
			llegenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
			valorMax : "feature" + fId,
			color : f.layer.options.color,
			lineWidth : 2,
			lineStyle : 'solid',
			borderWidth : 2,
			borderColor : '#000000',
			opacity : (f.layer.options.opacity * 100),
			label : false,
			labelSize : 10,
			labelFont : 'arial',
			labelColor : '#000000',
		};	
	//ESTIL POLIGON		
	}else{
		rangs = {
			llegenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
			valorMax : "feature" + fId,
			color : '#ff0000',
			fillColor: '#ff0000',
			fillOpacity: f.layer.options.fillOpacity,
			lineWidth : 2,
			lineStyle : 'solid',
			borderWidth : 2,
			borderColor : '#000000',
			opacity : (f.layer.options.opacity * 100),
			label : false,
			labelSize : 10,
			labelFont : 'arial',
			labelColor : '#000000',
		};		
	}
	return rangs;
}
