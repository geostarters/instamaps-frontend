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
	createAmbitGeo: "http://localhost:8080/geocat/admin/createAmbitGeo.action?",
	updateAmbitGeo: "http://localhost:8080/geocat/admin/updateAmbitGeo.action?",
	deleteAmbitGeo: "http://localhost:8080/geocat/admin/deleteAmbitGeo.action?",
	getAllAmbitGeo: "http://localhost:8080/geocat/admin/getAllAmbitGeo.action?",
	getAmbitGeoById: "http://localhost:8080/geocat/admin/getAmbitGeoById.action?",
	createTipusAplicacio: "http://localhost:8080/geocat/admin/createTipusAplicacio.action?",
	updateTipusAplicacio: "http://localhost:8080/geocat/admin/updateTipusAplicacio.action?",
	deleteTipusAplicacio: "http://localhost:8080/geocat/admin/deleteTipusAplicacio.action?",
	getAllTipusAplicacio: "http://localhost:8080/geocat/admin/getAllTipusAplicacio.action?",
	getTipusAplicacioById: "http://localhost:8080/geocat/admin/getTipusAplicacioById.action?",
	createTipusEntitat: "http://localhost:8080/geocat/admin/createTipusEntitat.action?",
	updateTipusEntitat: "http://localhost:8080/geocat/admin/updateTipusEntitat.action?",
	deleteTipusEntitat: "http://localhost:8080/geocat/admin/deleteTipusEntitat.action?",
	getAllTipusEntitat: "http://localhost:8080/geocat/admin/getAllTipusEntitat.action?",
	getTipusEntitatById: "http://localhost:8080/geocat/admin/getTipusEntitatById.action?",
	createTipusOrigin: "http://localhost:8080/geocat/admin/createTipusOrigin.action?",
	updateTipusOrigin: "http://localhost:8080/geocat/admin/updateTipusOrigin.action?",
	deleteTipusOrigin: "http://localhost:8080/geocat/admin/deleteTipusOrigin.action?",
	getAllTipusOrigin: "http://localhost:8080/geocat/admin/getAllTipusOrigin.action?",
	getTipusOriginById: "http://localhost:8080/geocat/admin/getTipusOriginById.action?",
	createAplicacio: "http://localhost:8080/geocat/aplications/map/createAplicacio.action?",
	updateAplicacio: "http://localhost:8080/geocat/aplications/map/updateAplicacio.action?",
	deleteAplicacio: "http://localhost:8080/geocat/aplications/map/deleteAplicacio.action?",
	getMapById: "http://localhost:8080/geocat/aplications/map/getMapById.action?",
	getAllMapsByUser: "http://localhost:8080/geocat/aplications/map/getAllMapsByUser.action?",
	getAllMaps: "http://localhost:8080/geocat/aplications/map/getAllMaps.action?",
	createServidor: "http://localhost:8080/geocat/eines/servidor/createServidor.action?",
	getServidorById: "http://localhost:8080/geocat/eines/servidor/getServidorById.action?",
	updateServidor: "http://localhost:8080/geocat/eines/servidor/updateServidor.action?",
	getAllServidorsByUser: "http://localhost:8080/geocat/eines/servidor/getAllServidorsByUser.action?",
	getAllPublicsServices: "http://localhost:8080/geocat/eines/servidor/getAllPublicsServices.action?",
	getAllServices: "http://localhost:8080/geocat/eines/servidor/getAllServices.action?",
	deleteServidor: "http://localhost:8080/geocat/eines/servidor/deleteServidor.action?",
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

//admin_users
module( "admin_users" );
/*
asyncTest( "createUser", 2, function() {
	$.ajax({
		url: urls.createUser,
		data: {cn: 'Bonifacio', 
			sn:'Carmona', 
			uid: test_uid, 
			email: 'b.carmona@mail.com', 
			userPassword: 'user2013',
			ambitGeo: 1,
			tipusEntitatId: 1,
			bbox: '260383,4491989,527495,4748184'},
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
						options : { type: 'object', required : true}
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
		data: {uid: test_uid, 
			bbox: '34,43,67,23',
			ambitGeo: 1,
			tipusEntitatId: 1
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: { type : 'object', required : true}
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
						options : { type: 'object', required : true}
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
						options : { type: 'object', required : true}
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
*/

//admin_tipus
module( "admin_tipus" );
/*
asyncTest( "createAmbitGeo", 2, function() {
	$.ajax({
		url: urls.createAmbitGeo,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081', 
			nom: 'Cataluña'},
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
						businessId : { type: 'string', required : true},
						nom : { type: 'string', required : true}
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

asyncTest( "updateAmbitGeo", 2, function() {
	$.ajax({
		url: urls.updateAmbitGeo,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081', 
			nom: 'Catalunya'},
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
						businessId : { type: 'string', required : true},
						nom : { type: 'string', required : true}
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

asyncTest( "getAmbitGeoById", 2, function() {
	$.ajax({
		url: urls.getAmbitGeoById,
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
						businessId : { type: 'string', required : true},
						nom : { type: 'string', required : true}
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

asyncTest( "getAllAmbitGeo", 3, function() {
	$.ajax({
		url: urls.getAllAmbitGeo,
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
				businessId : { type: 'string', required : true},
				nom : { type: 'string', required : true}
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

asyncTest( "deleteAmbitGeo", 1, function() {
	$.ajax({
		url: urls.deleteAmbitGeo,
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

asyncTest( "createTipusEntitat", 2, function() {
	$.ajax({
		url: urls.createTipusEntitat,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081', 
			nom: 'Educacio'},
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
						businessId : { type: 'string', required : true},
						nom : { type: 'string', required : true}
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

asyncTest( "updateTipusEntitat", 2, function() {
	$.ajax({
		url: urls.updateTipusEntitat,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b081', 
			nom: 'Educacio ESO'},
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
						businessId : { type: 'string', required : true},
						nom : { type: 'string', required : true}
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

asyncTest( "getTipusEntitatById", 2, function() {
	$.ajax({
		url: urls.getTipusEntitatById,
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
						businessId : { type: 'string', required : true},
						nom : { type: 'string', required : true}
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

asyncTest( "getAllTipusEntitat", 3, function() {
	$.ajax({
		url: urls.getAllTipusEntitat,
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
				businessId : { type: 'string', required : true},
				nom : { type: 'string', required : true}
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

asyncTest( "deleteTipusEntitat", 1, function() {
	$.ajax({
		url: urls.deleteTipusEntitat,
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
						nom : { type: 'string', required : true},
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
						nom : { type: 'string', required : true},
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
						nom : { type: 'string', required : true},
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
				nom : { type: 'string', required : true},
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
*/

module( "aplications" );
asyncTest( "createAplicacio", 2, function() {
	$.ajax({
		url: urls.createAplicacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			entitatUid: 'wszczerban',
			visibilitat: 'O',
			tipusApp: '4c216bc1cdd8b3a69440b45b2713b080'
		},
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
						businessId : { type: 'string', required : true},
						entitatUid : { type: 'string', required : true},
						id : { type: 'number', required : true},
						options : { type: ['string','null'], required : true},
						clau : { type: ['string','null'], required : true},
						usuari : { type: ['string','null'], required : true},
						rank : { type: 'number', required : true},
						tipusAplicacio : { type: 'object', required : true},
						visibilitat : { type: 'string', required : true}
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

asyncTest( "getMapById", 2, function() {
	$.ajax({
		url: urls.getMapById,
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
						businessId : { type: 'string', required : true},
						entitatUid : { type: 'string', required : true},
						id : { type: 'number', required : true},
						options : { type: ['string','null'], required : true},
						clau : { type: ['string','null'], required : true},
						usuari : { type: ['string','null'], required : true},
						rank : { type: 'number', required : true},
						tipusAplicacio : { type: 'object', required : true},
						visibilitat : { type: 'string', required : true}
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

asyncTest( "updateAplicacio", 2, function() {
	$.ajax({
		url: urls.updateAplicacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			entitatUid: 'wszczerban',
			visibilitat: 'P',
			tipusApp: '4c216bc1cdd8b3a69440b45b2713b080',
			usuari: 'demo',
			clau: 'demo',
			options: '{bbox:"34,43,67,23",logo:"escudo.png",wisard:false}'
		},
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
						businessId : { type: 'string', required : true},
						entitatUid : { type: 'string', required : true},
						id : { type: 'number', required : true},
						options : { type: ['string','null'], required : true},
						clau : { type: ['string','null'], required : true},
						usuari : { type: ['string','null'], required : true},
						rank : { type: 'number', required : true},
						tipusAplicacio : { type: 'object', required : true},
						visibilitat : { type: 'string', required : true}
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
	
asyncTest( "getAllMapsByUser", 3, function() {
	$.ajax({
		url: urls.getAllMapsByUser,
		data: {entitatUid: 'wszczerban'},
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
				businessId : { type: 'string', required : true},
				entitatUid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				clau : { type: ['string','null'], required : true},
				usuari : { type: ['string','null'], required : true},
				rank : { type: 'number', required : true},
				tipusAplicacio : { type: 'object', required : true},
				visibilitat : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results[0], schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
		
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllMaps", 3, function() {
	$.ajax({
		url: urls.getAllMaps,
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
				businessId : { type: 'string', required : true},
				entitatUid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				clau : { type: ['string','null'], required : true},
				usuari : { type: ['string','null'], required : true},
				rank : { type: 'number', required : true},
				tipusAplicacio : { type: 'object', required : true},
				visibilitat : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results[0], schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteAplicacio", 1, function() {
	$.ajax({
		url: urls.deleteAplicacio,
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

module( "servidors" );
/*
asyncTest( "createServidor", 2, function() {
	$.ajax({
		url: urls.createServidor,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			entitatUid: 'wszczerban',
			visibilitat: 'O',
			tipusOriginId: '4c216bc1cdd8b3a69440b45b2713b080',
			name: 'Ortos ICC',
			url: 'http://mapcache.icc.cat/map/bases/service',
			options: '{epsg:"4326",version:"1.3.0"}'
		},
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
						businessId : { type: 'string', required : true},
						entitatId : { type: 'string', required : true},
						id : { type: 'number', required : true},
						name : { type: 'string', required : true},
						options : { type: ['string','null'], required : true},
						tipusOrigin : { type: 'object', required : true},
						url : { type: 'string', required : true},
						visibilitat : { type: 'string', required : true}
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

asyncTest( "getServidorById", 2, function() {
	$.ajax({
		url: urls.getServidorById,
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
						businessId : { type: 'string', required : true},
						entitatId : { type: 'string', required : true},
						id : { type: 'number', required : true},
						name : { type: 'string', required : true},
						options : { type: ['string','null'], required : true},
						tipusOrigin : { type: 'object', required : true},
						url : { type: 'string', required : true},
						visibilitat : { type: 'string', required : true}
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

asyncTest( "updateServidor", 2, function() {
	$.ajax({
		url: urls.updateServidor,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			entitatUid: 'wszczerban',
			visibilitat: 'O',
			tipusOriginId: '4c216bc1cdd8b3a69440b45b2713b080',
			name: 'Ortos ICC',
			url: 'http://mapcache.icc.cat/map/bases/service',
			options: '{epsg:"4326",version:"1.3.0",query:"true",layers:"topo"}'
		},
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
						businessId : { type: 'string', required : true},
						entitatId : { type: 'string', required : true},
						id : { type: 'number', required : true},
						name : { type: 'string', required : true},
						options : { type: ['string','null'], required : true},
						tipusOrigin : { type: 'object', required : true},
						url : { type: 'string', required : true},
						visibilitat : { type: 'string', required : true}
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
	
asyncTest( "getAllServidorsByUser", 3, function() {
	$.ajax({
		url: urls.getAllServidorsByUser,
		data: {entitatUid: 'wszczerban'},
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
				businessId : { type: 'string', required : true},
				entitatId : { type: 'string', required : true},
				id : { type: 'number', required : true},
				name : { type: 'string', required : true},
				options : { type: ['string','null'], required : true},
				tipusOrigin : { type: 'object', required : true},
				url : { type: 'string', required : true},
				visibilitat : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results[0], schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
		
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllPublicsServices", 3, function() {
	$.ajax({
		url: urls.getAllPublicsServices,
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
				businessId : { type: 'string', required : true},
				entitatId : { type: 'string', required : true},
				id : { type: 'number', required : true},
				name : { type: 'string', required : true},
				options : { type: ['string','null'], required : true},
				tipusOrigin : { type: 'object', required : true},
				url : { type: 'string', required : true},
				visibilitat : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results[0], schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getAllServices", 3, function() {
	$.ajax({
		url: urls.getAllServices,
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
				businessId : { type: 'string', required : true},
				entitatId : { type: 'string', required : true},
				id : { type: 'number', required : true},
				name : { type: 'string', required : true},
				options : { type: ['string','null'], required : true},
				tipusOrigin : { type: 'object', required : true},
				url : { type: 'string', required : true},
				visibilitat : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results[0], schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteServidor", 1, function() {
	$.ajax({
		url: urls.deleteServidor,
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
*/

/*
 * Logout 
 */
/*
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
*/


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
