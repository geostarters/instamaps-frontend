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

//move una geometria
asyncTest( "moveGeometriaToVisualitzacio", 1, function() {
	var features = {
			type:"Feature",
			id:3124,
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
		url: urls.moveGeometriaToVisualitzacio,
		data: {
			toBusinessId: '4c216bc1cdd8b3a69440b45b2713b000',//bID de la visualitzacio-capa
			fromBusinessId: '4c216bc1cdd8b3a69440b45b2713b001',//bID de la visualitzacio-capa
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