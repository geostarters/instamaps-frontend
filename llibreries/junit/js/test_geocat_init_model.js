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
			businessId: '4c216bc1cdd8b3a69440b45b2713b001',//Bid de la visualitzacio
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
		businessId: "4c216bc1cdd8b3a69440b45b2713b014",//Bid de la geometria q estas afegint
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b023',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b001',//Bid de la visualitzacio
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b014'//Bid de la geometria q estas afegint
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

asyncTest( "createVisualitzacioLayer", 1, function() {
	$.ajax({
		url: urls.createVisualitzacioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b000',//Bid de la visualitzacio
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
		businessId: "4c216bc1cdd8b3a69440b45b2713b010",//Bid de la geometria q estas afegint
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b020',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b000',//Bid de la visualitzacio
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b010'//Bid de la geometria q estas afegint
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
		businessId: "4c216bc1cdd8b3a69440b45b2713b011",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			//businessId: '4c216bc1cdd8b3a69440b45b2713b020',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b000',//bid visualitzacio
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b011'//bid geom afegint
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b000',//bid visualitzacio
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b000',
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

//modifiquem estil geometria, a un nou estil que no existia
asyncTest( "modificarEstiloGeometria", 1, function() {
var features = {
	type:"Feature",
	id: 3124,
	businessId: "4c216bc1cdd8b3a69440b45b2713b011",
	properties: {
		nom: "feature 1",
		campo1: "data 1",
		campo2: "data 2",
		campo3: "data 3",
		description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
	},
	estil: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b020',//bId que tenia, modificat
		llegenda: 'pub',
		color: '#ff0000',
		simbolSize: 18, 
		simbol: 'circle',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		borderColor: '#ff0000',
		opacity: 90,
		label: false,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#ff0000',
	},
	geometry: {
		type: "Polygon",
		coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
	}
};
features = JSON.stringify(features);
	
$.ajax({
	url: urls.modificarEstiloGeometria,
	data: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b000',//bID de la visualitzacio-capa
		uid: uid,
		features: features
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


//modifiquem estil geometria, a un estil que ja existeix
asyncTest( "modificarEstiloGeometria", 1, function() {
var features = {
	type:"Feature",
	id: 3124,
	businessId: "4c216bc1cdd8b3a69440b45b2713b010",
	properties: {
		nom: "feature 1",
		campo1: "data 1",
		campo2: "data 2",
		campo3: "data 3",
		description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
	},
	estil: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b020',//bId que tenia, modificat
		llegenda: 'pub',
		color: '#ff0000',
		simbolSize: 18, 
		simbol: 'circle',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		borderColor: '#ff0000',
		opacity: 90,
		label: false,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#ff0000',
	},
	geometry: {
		type: "Polygon",
		coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
	}
};
features = JSON.stringify(features);
	
$.ajax({
	url: urls.modificarEstiloGeometria,
	data: {
		businessId: '4c216bc1cdd8b3a69440b45b2713b000',//bID de la visualitzacio-capa
		uid: uid,
		features: features
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
		businessId: "4c216bc1cdd8b3a69440b45b2713b012",//Bid de la geometria q estas afegint
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b020',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b000',//Bid de la visualitzacio
			uid: uid,
			features: features,
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b012'//Bid de la geometria q estas afegint
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

//eliminem una geometria
asyncTest( "removeGeometriaFromVisualitzacio", 1, function() {
	var features = {
		type:"Feature",
		id: 3124,
		businessId: "4c216bc1cdd8b3a69440b45b2713b012",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		estil: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b020',
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
		url: urls.removeGeometriaFromVisualitzacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b000',//bID de la visualitzacio-capa
			uid: uid,
			features: features
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

//asyncTest( "deleteVisualitzacioLayerAll", 1, function() {
//	$.ajax({
//		url: urls.deleteVisualitzacioLayerAll,
//		data: {
//			businessId: '4c216bc1cdd8b3a69440b45b2713b000',
//			uid: uid
//		},
//		dataType: 'jsonp'
//	}).done(function(results){
//		console.debug(results);
//		equal(results.status,"OK",JSON.stringify(results));
//		start();
//	}).fail(function(results){
//		console.debug(results);
//		ok( false, "Fail and ready to resume!" );
//		start();
//	});	
//});
//
//asyncTest( "deleteGeometriesColleccioLayer", 1, function() {
//    $.ajax({
//          url: urls.deleteGeometriesColleccioLayer,
//          data: {
//                businessId: '4c216bc1cdd8b3a69440b45b2713b000',//bid de geometries
//                uid: uid
//          },
//          dataType: 'jsonp'
//    }).done(function(results){
//          console.debug(results);
//          equal(results.status,"OK",JSON.stringify(results));
//          start();
//    }).fail(function(results){
//          console.debug(results);
//          ok( false, "Fail and ready to resume!" );
//          start();
//    });   
//});
