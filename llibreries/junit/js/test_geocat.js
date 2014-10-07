
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: uid,
			nom: 'Test_viz'
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
		id:"Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b082",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			llegenda: 'bar',
			color: '#ff00ff',
			simbolSize: 18, 
			simbol: 'circle',
			lineWidth: 2,
			lineStyle: 'solid',
			borderWidth: 2,
			borderColor: '#000000',
			opacity: 90,
			label: false,
			labelSize: 10,
			labelFont: 'arial',
			labelColor: '#000000',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b082'
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

asyncTest( "getVisualitzacioByBusinessId", 1, function() {
	$.ajax({
		url: urls.getVisualitzacioByBusinessId,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
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


