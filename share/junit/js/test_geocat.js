var urls = {
	login: "http://localhost:8080/geocat/login.action?",
	createUser: "http://localhost:8080/geocat/admin/createUser.action?",
	getUser: "http://localhost:8080/geocat/admin/getUser.action?",
	updatePassword: "http://localhost:8080/geocat/user/updatePassword.action?",
	updateUser: "http://localhost:8080/geocat/user/updateUser.action?",
	llistarUsuaris: "http://localhost:8080/geocat/admin/llistarUsuaris.action?",
	llistarUsuarisJson: "http://localhost:8080/geocat/admin/llistarUsuarisJson.action?",
	getAllUsers: "http://localhost:8080/geocat/admin/getAllUsers.action?",
	getAllUserNames: "http://localhost:8080/geocat/admin/getAllUserNames.action?",
	deleteUser: "http://localhost:8080/geocat/admin/deleteUser.action?",
	logout: "http://localhost:8080/geocat/logout.action?",
};

var JSV = require("./jsv").JSV;
var env = JSV.createEnvironment();

test( "hello test", function() {
	ok( 1 == "1", "Passed!" );
});

module( "admin" );
asyncTest( "login", 1, function() {
	$.ajax({
		url: urls.login,
		data: {user: 'wszczerban', password:'piji23'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {OK: "Usuari login"}, "Passed:"+ JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "createUser", 1, function() {
	$.ajax({
		url: urls.createUser,
		data: {cn: 'Victor', sn:'Pascual', uid: 'vpascual', email: 'victor.pascual@icc.cat', userPassword: 'idec2009'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {OK: "User create"}, "Passed:"+ JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "updatePassword", 1, function() {
	$.ajax({
		url: urls.updatePassword,
		data: {uid: 'vpascual', userPassword: 'idec2009', newPassword: 'idec2001'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {OK: "Password change"}, "Passed:"+ JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "updatePassword no new password", 1, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: 'vpascual', userPassword: 'idec2009'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {ERROR: "Arguments no vàlids"}, "Passed:" + JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updatePassword no password", 1, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: 'vpascual', newPassword: 'idec2001'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {ERROR: "Arguments no vàlids"}, "Passed:" + JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updatePassword old password wrong", 1, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: 'vpascual', userPassword: 'idec2009', newPassword: 'idec2001'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {ERROR: "Wrong old password"}, "Passed:" + JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updatePassword Password present in password history", 1, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: 'vpascual', userPassword: 'idec2001', newPassword: 'idec2009'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {ERROR: "Password present in password history"}, "Passed:" + JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updateUser", 1, function() {
	$.ajax({
		url: urls.updateUser,
		data: {cn: 'Victor', sn:'Pascual Ayats', uid: 'vpascual', email: 'victor.pascual@icc.cat'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		var schema = {
			"uid" : {"type":"string"},
			"mail" : {"type":"string"},
			"sn" : {"type":"string"},
			"cn" : {"type":"string"},
			"dn" : {"type":"string"},
			"objectclass" : {"type":"array", "items":{"type": "string"}}
		};
		var report = env.validate(results[0], schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllUsers", 2, function() {
	$.ajax({
		url: urls.getAllUsers,
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		ok(results.length > 0, "Retorna datos");
		var schema = {
			"uid" : {"type":"string"},
			"mail" : {"type":"string"},
			"sn" : {"type":"string"},
			"cn" : {"type":"string"},
			"dn" : {"type":"string"},
			"objectclass" : {"type":"array", "items":{"type": "string"}}
		};
		var report = env.validate(results[0], schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllUserNames", 2, function() {
	$.ajax({
		url: urls.getAllUserNames,
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		ok(results.length > 0, "Retorna datos");
		var schema = {"type":"array", "items":{"type": "string"}};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});


asyncTest( "deleteUser", 1, function() {
	$.ajax({
		url: urls.deleteUser,
		data: {uid: 'vpascual'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		deepEqual(results, {OK: "User delete"}, "Passed:"+ JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

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