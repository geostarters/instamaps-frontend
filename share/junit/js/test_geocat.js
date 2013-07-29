var urls = {
	login: "http://localhost:8080/geocat/login.action?",
	createUser: "http://localhost:8080/geocat/admin/createUser.action?",
	getUser: "http://localhost:8080/geocat/admin/getUser.action?",
	updatePassword: "http://localhost:8080/geocat/user/updatePassword.action?",
	updateUser: "http://localhost:8080/geocat/user/updateUser.action?",
	updateUserOptions: "http://localhost:8080/geocat/user/updateUserOptions.action?",
	getUser: "http://localhost:8080/geocat/admin/getUser.action?",
	getAllUsers: "http://localhost:8080/geocat/admin/getAllUsers.action?",
	getAllUserNames: "http://localhost:8080/geocat/admin/getAllUserNames.action?",
	deleteUser: "http://localhost:8080/geocat/admin/deleteUser.action?",
	logout: "http://localhost:8080/geocat/logout.action?",
	createTipusAplicacio: "http://localhost:8080/geocat/admin/createTipusAplicacio.action?",
	updateTipusAplicacio: "http://localhost:8080/geocat/admin/updateTipusAplicacio.action?",
	deleteTipusAplicacio: "http://localhost:8080/geocat/admin/deleteTipusAplicacio.action?",
	getAllTipusAplicacio: "http://localhost:8080/geocat/admin/getAllTipusAplicacio.action?",
	getTipusAplicacioById: "http://localhost:8080/geocat/admin/getTipusAplicacioById.action?",
};


var JSV = require("./jsv").JSV;
//var JSV = require("JSV").JSV;
var test_uid = "bcarmona";
var env = JSV.createEnvironment();

QUnit.config.reorder = false;
test( "hello test", function() {
	ok( 1 == "1", "Passed!" );
});

asyncTest( "login", 1, function() {
	$.ajax({
		url: urls.login,
		data: {user: 'wszczerban', password:'piji23'},
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

/**
 * admin_users
 */
module( "admin_users" );
asyncTest( "createUser", 2, function() {
	$.ajax({
		url: urls.createUser,
		data: {cn: 'Bonifacio', 
			sn:'Carmona', 
			uid: test_uid, 
			email: 'b.carmona@mail.com', 
			userPassword: 'user2013',
			tipusEntitatId: 1},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object',
					properties : {
						uid : { type: 'string', required : true},
						mail : { type: 'string', required : true},
						sn : { type: 'string', required : true},
						cn : { type: 'string', required : true},
						dn : { type: 'string', required : true},
						objectclass : {type: 'array', required : true, items:{type: 'string'}},
						options : { type: 'null', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
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
		data: {
			uid: test_uid, 
			userPassword: 'user2013', 
			newPassword: 'user2001'},
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

asyncTest( "updatePassword no new password", 2, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: test_uid, userPassword: 'user2013'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		equal(results.status,"ERROR",results.status);
		equal(results.results,"IllegalArgumentException",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updatePassword no password", 2, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: test_uid, newPassword: 'user2001'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		equal(results.status,"ERROR",results.status);
		equal(results.results,"IllegalArgumentException",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updatePassword old password wrong", 2, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: test_uid, userPassword: 'user2009', newPassword: 'user2001'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		equal(results.status,"ERROR",results.status);
		equal(results.results,"NamingException",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updatePassword Password present in password history", 2, function() {
	$.ajax({
		url:  urls.updatePassword,
		data: {uid: test_uid, userPassword: 'user2001', newPassword: 'user2013'},
		method: 'post',
		dataType: 'jsonp',
	}).done(function(results){
		console.debug(results);
		equal(results.status,"ERROR",results.status);
		equal(results.results,"InvalidAttributeValueException",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});
});

asyncTest( "updateUserOptions", 2, function() {
	$.ajax({
		url: urls.updateUserOptions,
		data: {uid: test_uid, options: '{bbox:"34,43,67,23",logo:"escudo.png",wisard:false}'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: { type : 'string', required : true}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "updateUser", 2, function() {
	$.ajax({
		url: urls.updateUser,
		data: {
			cn: 'Bonifacio', 
			sn:'Carmona Grunts', 
			uid: test_uid, 
			email: 'b.carmona@mail.com'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object',
					properties : {
						uid : { type: 'string', required : true},
						mail : { type: 'string', required : true},
						sn : { type: 'string', required : true},
						cn : { type: 'string', required : true},
						dn : { type: 'string', required : true},
						objectclass : {type: 'array', required : true, items:{type: 'string'}},
						options : { type: 'string', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getUser", 2, function() {
	$.ajax({
		url: urls.getUser,
		data: {uid: test_uid},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object',
					properties : {
						uid : { type: 'string', required : true},
						mail : { type: 'string', required : true},
						sn : { type: 'string', required : true},
						cn : { type: 'string', required : true},
						dn : { type: 'string', required : true},
						objectclass : {type: 'array', required : true, items:{type: 'string'}},
						options : { type: 'string', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllUsers", 3, function() {
	$.ajax({
		url: urls.getAllUsers,
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'array', required : true, items:{type: 'object'}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				uid : { type: 'string', required : true},
				mail : { type: 'string', required : true},
				sn : { type: 'string', required : true},
				cn : { type: 'string', required : true},
				dn : { type: 'string', required : true},
				objectclass : {type: 'array', required : true, items:{type: 'string'}}
			}
		};
		var report1 = env.validate(results.results[0], schema1);
		equal(report1.errors.length, 0, JSON.stringify(results.results[0]));
		
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
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'array', required : true, items:{type: 'string'}
				}
			}
		};
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
		data: {uid: test_uid},
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

/**
 * admin_tipus
 */
module( "admin_tipus" );

asyncTest( "createTipusAplicacio", 2, function() {
	$.ajax({
		url: urls.createTipusAplicacio,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081', 
			abbr:'vis', 
			action: 'visor', 
			descripcio: 'aplicacio visor', 
			icon: 'vis',
			nom: 'Visor',
			url: '/geoLocal/crearAplicacionOL.jsp?'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object',
					properties :{
						abbr : { type: 'string', required : true},
						action : { type: 'string', required : true},
						businessId : { type: 'string', required : true},
						descripcio : { type: 'string', required : true},
						icon : { type: 'string', required : true},
						id : { type: 'number', required : true},
						url : { type: 'string', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "updateTipusAplicacio", 2, function() {
	$.ajax({
		url: urls.updateTipusAplicacio,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081', 
			abbr:'vis', 
			action: 'visor', 
			descripcio: 'aplicacio visor mapas', 
			icon: 'vis',
			nom: 'Visor',
			url: '/geoLocal/crearAplicacionOL.jsp?'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object',
					properties :{
						abbr : { type: 'string', required : true},
						action : { type: 'string', required : true},
						businessId : { type: 'string', required : true},
						descripcio : { type: 'string', required : true},
						icon : { type: 'string', required : true},
						id : { type: 'number', required : true},
						url : { type: 'string', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getTipusAplicacioById", 2, function() {
	$.ajax({
		url: urls.getTipusAplicacioById,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object',
					properties :{
						abbr : { type: 'string', required : true},
						action : { type: 'string', required : true},
						businessId : { type: 'string', required : true},
						descripcio : { type: 'string', required : true},
						icon : { type: 'string', required : true},
						id : { type: 'number', required : true},
						url : { type: 'string', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllTipusAplicacio", 3, function() {
	$.ajax({
		url: urls.getAllTipusAplicacio,
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'array', required : true, items:{type: 'object'}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties :{
				abbr : { type: 'string', required : true},
				action : { type: 'string', required : true},
				businessId : { type: 'string', required : true},
				descripcio : { type: 'string', required : true},
				icon : { type: 'string', required : true},
				id : { type: 'number', required : true},
				url : { type: 'string', required : true}
			}
		};
		var report1 = env.validate(results.results[0], schema1);
		equal(report1.errors.length, 0, JSON.stringify(results.results[0]));
		
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteTipusAplicacio", 1, function() {
	$.ajax({
		url: urls.deleteTipusAplicacio,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081'},
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






/*
 * Logout 
 */

asyncTest( "logout", 1, function() {
	$.ajax({
		url: urls.logout,
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


/*
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

*/
