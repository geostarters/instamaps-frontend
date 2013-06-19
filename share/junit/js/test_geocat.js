var urls = {
	updatePassword: "http://localhost:8080/geocat/admin/updatePassword.action?",
	llistarUsuaris: "http://localhost:8080/geocat/admin/llistarUsuaris.action?",
	llistarUsuarisJson: "http://localhost:8080/geocat/admin/llistarUsuarisJson.action?",
};

var JSV = require("./jsv").JSV;
var env = JSV.createEnvironment();

test( "hello test", function() {
	ok( 1 == "1", "Passed!" );
});

module( "admin" );
asyncTest( "llistarUsuaris", 1, function() {
	$.ajax({
		url: urls.llistarUsuaris,
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		ok( true, "Passed and ready to resume!" );
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "llistarUsuarisJson", 2, function() {
	$.ajax({
		url: urls.llistarUsuarisJson,
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		ok(results.length > 0, "Retorna datos");
		var schema = {"type" : "object", "properties": {
			"clau" : {"type":"string"},
			"clauIdec" : {"type":"string"},
			"clauToopath" : {"type":"string", optional: true},
			"codiIdec" : {"type":"string"},
			"email" : {"type":"string"},
			"nif" : {"type":"string", optional: true},
			"nomEntitatComplert" : {"type":"string"},
			"paginaWeb" : {"type":"string", optional: true},
			"rol" : {"type":"string", "enum":["A","N"]},
			"status" : {"type":"string", "enum":["A"]},
			"usuari" : {"type":"string"}
		}};
		
		var report = env.validate(results[0], schema);
		equal(report.errors.length, 0, "Datos correctos");
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "updatePassword ok", 1, function() {
	$.ajax({
		url: urls.updatePassword,
		data: {codiIdec: 'admin', clau:'idec2001'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {OK: "Password updated."}, "Passed:"+ results);
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results);
		start();
	});	
});

asyncTest( "updatePassword no arguments", 1, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {codiIdec: 'admin'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {ERROR: "Arguments no vàlids."}, "Passed:" + results);
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
	
});


