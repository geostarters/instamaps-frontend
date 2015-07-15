module( "crear geometria" );

QUnit.config.reorder = false;
test( "hello test", function() {
	ok( 1 == "1", "Passed!" );
});

asyncTest( "login", 1, function() {
	$.ajax({
		url: urls.login,
		data: {user: 'bolo', password:'piji34'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "createVisualitzacioLayer", 1, function() {
	$.ajax({
		url: urls.createVisualitzacioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid,
			nom: 'Test_viz_to'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});	

asyncTest( "addGeometriaToVisualitzacio", 1, function() {
	var features = {
		type:"Feature",
		id:"OpenLayers.Feature.Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b083",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: 8.7,
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			llegenda: 'bar',
			color: '#ffffff',
			simbolSize: 18, 
			simbol: 'circle',
			lineWidth: 2,
			lineStyle: 'solid',
			borderWidth: 2,
			borderColor: '#ffffff',
			opacity: 90,
			label: false,
			labelSize: 10,
			labelFont: 'arial',
			labelColor: '#ffffff',
		},
		geometry: {
			type: "Polygon",
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
		}
	};
	features = JSON.stringify(features);
		
	$.ajax({
		url: urls.addGeometriaToVisualitzacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b083'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "addGeometriaToVisualitzacio", 1, function() {
	var features = {
		type:"Feature",
		id:"OpenLayers.Feature.Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b084",
		properties: {
			nom: "feature 1",
			campo1: "data 2",
			campo2: 5.5,
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			llegenda: 'bar',
			color: '#ffffff',
			simbolSize: 18, 
			simbol: 'circle',
			lineWidth: 2,
			lineStyle: 'solid',
			borderWidth: 2,
			borderColor: '#ffffff',
			opacity: 90,
			label: false,
			labelSize: 10,
			labelFont: 'arial',
			labelColor: '#ffffff',
		},
		geometry: {
			type: "Polygon",
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
		}
	};
	features = JSON.stringify(features);
		
	$.ajax({
		url: urls.addGeometriaToVisualitzacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b084'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "addGeometriaToVisualitzacio", 1, function() {
	var features = {
		type:"Feature",
		id:"OpenLayers.Feature.Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b085",
		properties: {
			nom: "feature 1",
			campo1: "data 2",
			campo2: 5,
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			llegenda: 'bar',
			color: '#ffffff',
			simbolSize: 18, 
			simbol: 'circle',
			lineWidth: 2,
			lineStyle: 'solid',
			borderWidth: 2,
			borderColor: '#ffffff',
			opacity: 90,
			label: false,
			labelSize: 10,
			labelFont: 'arial',
			labelColor: '#ffffff',
		},
		geometry: {
			type: "Polygon",
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
		}
	};
	features = JSON.stringify(features);
		
	$.ajax({
		url: urls.addGeometriaToVisualitzacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b085'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "addGeometriaToVisualitzacio", 1, function() {
	var features = {
		type:"Feature",
		id:"OpenLayers.Feature.Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b086",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: 0,
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			llegenda: 'bar',
			color: '#ffffff',
			simbolSize: 18, 
			simbol: 'circle',
			lineWidth: 2,
			lineStyle: 'solid',
			borderWidth: 2,
			borderColor: '#ffffff',
			opacity: 90,
			label: false,
			labelSize: 10,
			labelFont: 'arial',
			labelColor: '#ffffff',
		},
		geometry: {
			type: "Polygon",
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
		}
	};
	features = JSON.stringify(features);
		
	$.ajax({
		url: urls.addGeometriaToVisualitzacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b086'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "createVisualitzacioTematica", 1, function() {
	var estil = {
	dataField: "campo1",
	estils:[{valueMin: "data 1",
		estil: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b025',
		llegenda: 'bar',
		color: '#ffffff',
		simbolSize: 18, 
		simbol: 'circle',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		borderColor: '#ffffff',
		opacity: 90,
		label: false,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#ffffff',
	}},{valueMin: "data 2",
		estil: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b026',
		llegenda: 'hotel',
		color: '#ff0000',
		simbolSize: 15, 
		simbol: 'square',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		borderColor: '#ffffff',
		opacity: 90,
		label: false,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#ffffff',
	}}]};
	
	estils = JSON.stringify(estil);
		
	$.ajax({
		url: urls.createVisualitzacioTematica,
		data: {
			toBusinessId: '4c216bc1cdd8b3a69440b45b2713b003',//bID de la visualitzacio-capa
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',//bID de la visualitzacio-capa
			uid: uid,
			estils: estils,
			nom: "capa tematic",
			tipus: 'clasicTematic'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "createVisualitzacioTematica", 1, function() {
	var estil = {
	dataField: "campo2",
	estils:[{valueMin: 0,
		valueMax: 5,
		estil: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b027',
		llegenda: 'bar',
		color: '#ffffff',
		simbolSize: 18, 
		simbol: 'circle',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		borderColor: '#ffffff',
		opacity: 90,
		label: false,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#ffffff',
	}},{valueMin: 5.1,
		valueMax: 10,
		estil: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b028',
		llegenda: 'hotel',
		color: '#ff0000',
		simbolSize: 15, 
		simbol: 'square',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		borderColor: '#ffffff',
		opacity: 90,
		label: false,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#ffffff',
	}}]};
	
	estils = JSON.stringify(estil);
		
	$.ajax({
		url: urls.createVisualitzacioTematica,
		data: {
			toBusinessId: '4c216bc1cdd8b3a69440b45b2713b004',//bID de la visualitzacio-capa
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',//bID de la visualitzacio-capa
			uid: uid,
			estils: estils,
			nom: "capa tematic rang",
			tipus: 'clasicTematic'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteGeometria", 1, function() {
	$.ajax({
		url: urls.deleteGeometria,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllVisualitzacioByBusinessId", 1, function() {
	$.ajax({
		url: urls.getAllVisualitzacioByBusinessId,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b003',
			uid: uid
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllVisualitzacioByBusinessId", 1, function() {
	$.ajax({
		url: urls.getAllVisualitzacioByBusinessId,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b004',
			uid: uid
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteVisualitzacioLayer", 1, function() {
	$.ajax({
		url: urls.deleteVisualitzacioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b003',
			uid: uid
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteVisualitzacioLayer", 1, function() {
	$.ajax({
		url: urls.deleteVisualitzacioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b004',
			uid: uid
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteVisualitzacioLayerAll", 1, function() {
	$.ajax({
		url: urls.deleteVisualitzacioLayerAll,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});