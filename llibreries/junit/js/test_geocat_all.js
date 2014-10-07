//include(test_geocat_vars.js)

QUnit.config.reorder = false;
test( "hello test", function() {
	ok( 1 == "1", "Passed!" );
});

asyncTest( "login", 1, function() {
	$.ajax({
		url: urls.login,
		data: {user: uid, password:'piji34'},
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

asyncTest( "validateUid", 1, function() {
	$.ajax({
		url: urls.validateUid,
		data: {uid: 'bolo'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"ERROR",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "validateUid", 1, function() {
	$.ajax({
		url: urls.validateUid,
		data: {uid: 'wszczcsdsc@asfd'},
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

asyncTest( "validateEmail", 1, function() {
	$.ajax({
		url: urls.validateEmail,
		data: {email: 'wladimir.szczerban@icc.cat'},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"ERROR",JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "validateEmail", 1, function() {
	$.ajax({
		url: urls.validateEmail,
		data: {email: 'wladimir.szczerban@gmail.com'},
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

asyncTest( "registreUser duplicate email", 1, function() {
	$.ajax({
		url: urls.registreUser,
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
		equal(results.status,"ERROR",results.status);
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});
/*
asyncTest( "registreUser", 2, function() {
	$.ajax({
		url: urls.registreUser,
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

/*
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

asyncTest( "getUserUser", 2, function() {
	$.ajax({
		url: urls.getUserUser,
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
		data: {id: '1'},
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

asyncTest( "getAmbitGeoByBusinessId", 2, function() {
	$.ajax({
		url: urls.getAmbitGeoByBusinessId,
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

asyncTest( "getTipusEntitatByBusinessId", 2, function() {
	$.ajax({
		url: urls.getTipusEntitatByBusinessId,
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

asyncTest( "getTipusEntitatById", 2, function() {
	$.ajax({
		url: urls.getTipusEntitatById,
		data: {id: '1'},
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

asyncTest( "getTipusAplicacioByBusinessId", 2, function() {
	$.ajax({
		url: urls.getTipusAplicacioByBusinessId,
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

asyncTest( "getTipusAplicacioById", 2, function() {
	$.ajax({
		url: urls.getTipusAplicacioById,
		data: {id: '1'},
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

module( "socials" );
/*
asyncTest( "createUserSocial", 2, function() {
	$.ajax({
		url: urls.createUserSocial,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			provider: 'twitter',
			socialName: 'bolosig',
			validatedId: '235909290'
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
						provider : { type: 'string', required : true},
						socialName : { type: 'string', required : true},
						validatedId : { type: 'string', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});	
});

asyncTest( "createUserSocial", 2, function() {
	$.ajax({
		url: urls.updateUserSocial,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			provider: 'twitter',
			socialName: 'bolosig1',
			validatedId: '235909290'
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
						provider : { type: 'string', required : true},
						socialName : { type: 'string', required : true},
						validatedId : { type: 'string', required : true}
					}
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});	
});

asyncTest( "getAllUserSocial", 3, function() {
	$.ajax({
		url: urls.getAllUserSocial,
		data: {
			uid: 'bolo'
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
				entitatUid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				provider : { type: 'string', required : true},
				socialName : { type: 'string', required : true},
				validatedId : { type: 'string', required : true}
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

asyncTest( "deleteUserSocial", 1, function() {
	$.ajax({
		url: urls.deleteUserSocial,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
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
*/

module( "aplications" );
/*
asyncTest( "createMap forbidden", 2, function() {
	$.ajax({
		url: urls.createMap,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: 'bcarmona',
			visibilitat: 'O',
			tipusApp: 'vis',
			nom: 'test forbidden'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"ERROR",results.status);
		equal(results.results,"forbidden",results.results);
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail!:" + results );
		start();
	});	
});
*/
/*
asyncTest( "createMap", 2, function() {
	$.ajax({
		url: urls.createMap,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			visibilitat: 'O',
			tipusApp: 'vis',
			nom: 'test 1'
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
						tipusAplicacioId : { type: 'number', required : true},
						visibilitat : { type: 'string', required : true},
						contacte : { type: ['string','null'], required : true},
						dataConfiguracio : { type: ['string','null'], required : true},
						dataPublicacio : { type: ['string','null'], required : true},
						logo : { type: ['string','null'], required : true},
						thumbnail : { type: ['string','null'], required : true},
						nomAplicacio : { type: 'string', required : true},
						servidorsWMS : { type: ['array','null'], required : true}
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
*/
/*
asyncTest( "updateMap", 2, function() {
	$.ajax({
		url: urls.updateMap,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			nom: 'test',
			uid: 'bolo',
			visibilitat: 'P',
			tipusApp: 'vis',
			usrVisor: 'demo',
			clauVisor: 'demo',
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
						tipusAplicacioId : { type: 'number', required : true},
						visibilitat : { type: 'string', required : true},
						contacte : { type: ['string','null'], required : true},
						dataConfiguracio : { type: ['string','null'], required : true},
						dataPublicacio : { type: ['string','null'], required : true},
						logo : { type: ['string','null'], required : true},
						thumbnail : { type: ['string','null'], required : true},
						nomAplicacio : { type: 'string', required : true},
						servidorsWMS : { type: ['array','null'], required : true}
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

asyncTest( "updateMapName", 2, function() {
	$.ajax({
		url: urls.updateMapName,
		data: {
			businessId: 'dfc0ebd23833cfde0d9c8bb70dfdc67c',
			nom: 'jessi topin',
			uid: 'bolo'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: { type: 'string', required : true}
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

asyncTest( "getAllPublicsMaps", 3, function() {
	$.ajax({
		url: urls.getAllPublicsMaps,
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
				rank : { type: 'number', required : true},
				tipusAplicacioId : { type: 'number', required : true},
				visibilitat : { type: 'string', required : true},
				dataConfiguracio : { type: ['string','null'], required : true},
				dataPublicacio : { type: ['string','null'], required : true},
				logo : { type: ['string','null'], required : true},
				thumbnail : { type: ['string','null'], required : true},
				nomAplicacio : { type: 'string', required : true}
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
				rank : { type: 'number', required : true},
				tipusAplicacioId : { type: 'number', required : true},
				visibilitat : { type: 'string', required : true},
				dataConfiguracio : { type: ['string','null'], required : true},
				dataPublicacio : { type: ['string','null'], required : true},
				logo : { type: ['string','null'], required : true},
				thumbnail : { type: ['string','null'], required : true},
				nomAplicacio : { type: 'string', required : true}
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

asyncTest( "addServerToMap", 2, function() {
	$.ajax({
		url: urls.addServerToMap,
		data: {
			uid: 'bolo',
			businessId: 'dfc0ebd23833cfde0d9c8bb70dfdc67c',
			servidorWMSbusinessId: '4c216bc1cdd8b3a69440b45b2713b082',
			layers: 'mt25m',
			calentas: false,
			activas: true,
			visibilitats: true
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
						tipusAplicacioId : { type: 'number', required : true},
						visibilitat : { type: 'string', required : true},
						contacte : { type: ['string','null'], required : true},
						dataConfiguracio : { type: ['string','null'], required : true},
						dataPublicacio : { type: ['string','null'], required : true},
						logo : { type: ['string','null'], required : true},
						thumbnail : { type: ['string','null'], required : true},
						nomAplicacio : { type: 'string', required : true},
						servidorsWMS : { type: ['array','null'], required : true}
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
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b082'},
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
						tipusAplicacioId : { type: 'number', required : true},
						visibilitat : { type: 'string', required : true},
						contacte : { type: ['string','null'], required : true},
						dataConfiguracio : { type: ['string','null'], required : true},
						dataPublicacio : { type: ['string','null'], required : true},
						logo : { type: ['string','null'], required : true},
						thumbnail : { type: ['string','null'], required : true},
						nomAplicacio : { type: 'string', required : true},
						servidorsWMS : { type: ['array','null'], required : true}
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

asyncTest( "updateServerToMap", 2, function() {
	$.ajax({
		url: urls.updateServerToMap,
		data: {
			uid: 'bolo',
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			servidorWMSbusinessId: '4c216bc1cdd8b3a69440b45b2713b081',
			layers: 'mt5m',
			calentas: false,
			activas: false,
			visibilitats: true
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
						tipusAplicacioId : { type: 'number', required : true},
						visibilitat : { type: 'string', required : true},
						contacte : { type: ['string','null'], required : true},
						dataConfiguracio : { type: ['string','null'], required : true},
						dataPublicacio : { type: ['string','null'], required : true},
						logo : { type: ['string','null'], required : true},
						thumbnail : { type: ['string','null'], required : true},
						nomAplicacio : { type: 'string', required : true},
						servidorsWMS : { type: ['array','null'], required : true}
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

asyncTest( "updateServersOrderToMap", 1, function() {
	$.ajax({
		url: urls.updateServersOrderToMap,
		data: {
			uid: 'bolo',
			businessId: 'dfc0ebd23833cfde0d9c8bb70dfdc67c',
			servidorWMSbusinessId: '4c216bc1cdd8b3a69440b45b2713b081,4c216bc1cdd8b3a69440b45b2713b082',
			order: '1,2'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
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
		data: {uid: 'bolo'},
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
				rank : { type: 'number', required : true},
				tipusAplicacioId : { type: 'number', required : true},
				visibilitat : { type: 'string', required : true},
				dataConfiguracio : { type: ['string','null'], required : true},
				dataPublicacio : { type: ['string','null'], required : true},
				logo : { type: ['string','null'], required : true},
				thumbnail : { type: ['string','null'], required : true},
				nomAplicacio : { type: 'string', required : true}
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

asyncTest( "removeServerToMap", 2, function() {
	$.ajax({
		url: urls.removeServerToMap,
		data: {
			uid: 'bolo',
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			servidorWMSbusinessId: '4c216bc1cdd8b3a69440b45b2713b081'
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
						tipusAplicacioId : { type: 'number', required : true},
						visibilitat : { type: 'string', required : true},
						contacte : { type: ['string','null'], required : true},
						dataConfiguracio : { type: ['string','null'], required : true},
						dataPublicacio : { type: ['string','null'], required : true},
						logo : { type: ['string','null'], required : true},
						thumbnail : { type: ['string','null'], required : true},
						nomAplicacio : { type: 'string', required : true},
						servidorsWMS : { type: ['array','null'], required : true}
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

asyncTest( "getAllPublicsMapsByUser", 3, function() {
	$.ajax({
		url: urls.getAllPublicsMapsByUser,
		data: {uid: 'bolo'},
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
				rank : { type: 'number', required : true},
				tipusAplicacioId : { type: 'number', required : true},
				visibilitat : { type: 'string', required : true},
				dataConfiguracio : { type: ['string','null'], required : true},
				dataPublicacio : { type: ['string','null'], required : true},
				logo : { type: ['string','null'], required : true},
				thumbnail : { type: ['string','null'], required : true},
				nomAplicacio : { type: 'string', required : true}
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

asyncTest( "deleteMap", 1, function() {
	$.ajax({
		url: urls.deleteMap,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
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
*/

module( "servidors" );
/*
asyncTest( "createServidorWMS", 2, function() {
	$.ajax({
		url: urls.createServidorWMS,
		contentType: 'application/json',
		type: 'POST',
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			visibilitat: 'O',
			serverName: 'TOPO ICC',
			serverType: 'wms',
			url: 'http://mapcache.icc.cat/map/bases_noutm/service',
			epsg: '4326',
			version: '1.3.0',
			imgFormat: 'image/png',
			infFormat: 'text/html',
			tiles: true,
			transparency: true,
			opacity: 1,
			layers: JSON.stringify([{name:'topo',title:'topografic',group:0,check:true,query:false}])
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
						capesActiva : { type: ['string','null'], required : true},
						capesCalenta : { type: ['string','null'], required : true},
						capesOrdre : { type: ['string','null'], required : true},
						capesVisibilitat : { type: ['string','null'], required : true},
						entitatUid : { type: 'string', required : true},
						epsg: { type: ['string','null'], required : true},
						group: { type: ['string','null'], required : true},
						id : { type: 'number', required : true},
						imgFormat: { type: ['string','null'], required : true},
						infFormat: { type: ['string','null'], required : true},
						layers: { type: ['string','null'], required : true},
						legend: { type: ['string','null'], required : true},
						opacity: { type: 'number', required : true},
						options : { type: ['string','null'], required : true},
						query: { type: ['string','null'], required : true},
						serverName : { type: 'string', required : true},
						serverType : { type: 'string', required : true},
						tiles: { type: ['string','null'], required : true},
						titles: { type: ['string','null'], required : true},
						transparency: { type: ['string','null'], required : true},
						url : { type: ['string','null'], required : true},
						version: { type: ['string','null'], required : true},
						visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "createServidorInMap", 2, function() {
	$.ajax({
		url: urls.createServidorInMap,
		contentType: 'application/json',
		type: 'POST',
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			mapBusinessId: 'dfc0ebd23833cfde0d9c8bb70dfdc67c',
			uid: 'bolo',
			visibilitat: 'O',
			serverName: 'TOPO ICC',
			serverType: 'wms',
			url: 'http://mapcache.icc.cat/map/bases_noutm/service',
			epsg: '4326',
			version: '1.3.0',
			imgFormat: 'image/png',
			infFormat: 'text/html',
			tiles: true,
			transparency: true,
			opacity: 1,
			layers: JSON.stringify([{name:'topo',title:'topografic',group:0,check:true,query:false}]),
			calentas: false,
			activas: true,
			visibilitats: true
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
						capesActiva : { type: ['string','null'], required : true},
						capesCalenta : { type: ['string','null'], required : true},
						capesOrdre : { type: ['string','null'], required : true},
						capesVisibilitat : { type: ['string','null'], required : true},
						entitatUid : { type: 'string', required : true},
						epsg: { type: ['string','null'], required : true},
						group: { type: ['string','null'], required : true},
						id : { type: 'number', required : true},
						imgFormat: { type: ['string','null'], required : true},
						infFormat: { type: ['string','null'], required : true},
						layers: { type: ['string','null'], required : true},
						legend: { type: ['string','null'], required : true},
						opacity: { type: 'number', required : true},
						options : { type: ['string','null'], required : true},
						query: { type: ['string','null'], required : true},
						serverName : { type: 'string', required : true},
						serverType : { type: 'string', required : true},
						tiles: { type: ['string','null'], required : true},
						titles: { type: ['string','null'], required : true},
						transparency: { type: ['string','null'], required : true},
						url : { type: ['string','null'], required : true},
						version: { type: ['string','null'], required : true},
						visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "getServidorWMSByBusinessId", 2, function() {
	$.ajax({
		url: urls.getServidorWMSByBusinessId,
		data: {businessId: '4c216bc1cdd8b3a69440b45b2713b082'},
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
						capesActiva : { type: ['string','null'], required : true},
						capesCalenta : { type: ['string','null'], required : true},
						capesOrdre : { type: ['string','null'], required : true},
						capesVisibilitat : { type: ['string','null'], required : true},
						entitatUid : { type: 'string', required : true},
						epsg: { type: ['string','null'], required : true},
						group: { type: ['string','null'], required : true},
						id : { type: 'number', required : true},
						imgFormat: { type: ['string','null'], required : true},
						infFormat: { type: ['string','null'], required : true},
						layers: { type: ['string','null'], required : true},
						legend: { type: ['string','null'], required : true},
						opacity: { type: 'number', required : true},
						options : { type: ['string','null'], required : true},
						query: { type: ['string','null'], required : true},
						serverName : { type: 'string', required : true},
						serverType : { type: 'string', required : true},
						tiles: { type: ['string','null'], required : true},
						titles: { type: ['string','null'], required : true},
						transparency: { type: ['string','null'], required : true},
						url : { type: ['string','null'], required : true},
						version: { type: ['string','null'], required : true},
						visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "updateServidorWMS", 2, function() {
	$.ajax({
		url: urls.updateServidorWMS,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			visibilitat: 'P',
			serverName: 'Ortos ICC',
			serverType: 'wms',
			url: 'http://mapcache.icc.cat/map/bases_noutm/service',
			epsg: '4326',
			version: '1.3.0',
			imgFormat: 'image/png',
			infFormat: 'text/html',
			tiles: true,
			transparency: true,
			opacity: 1,
			layers: JSON.stringify([{name:'mt5m',title:'Orto 5m',group:0,check:true,query:false},
			         {name:'mt25m',title:'Orto 25m',group:0,check:true,query:false}])
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
						capesActiva : { type: ['string','null'], required : true},
						capesCalenta : { type: ['string','null'], required : true},
						capesOrdre : { type: ['string','null'], required : true},
						capesVisibilitat : { type: ['string','null'], required : true},
						entitatUid : { type: 'string', required : true},
						epsg: { type: ['string','null'], required : true},
						group: { type: ['string','null'], required : true},
						id : { type: 'number', required : true},
						imgFormat: { type: ['string','null'], required : true},
						infFormat: { type: ['string','null'], required : true},
						layers: { type: ['string','null'], required : true},
						legend: { type: ['string','null'], required : true},
						opacity: { type: 'number', required : true},
						options : { type: ['string','null'], required : true},
						query: { type: ['string','null'], required : true},
						serverName : { type: 'string', required : true},
						serverType : { type: 'string', required : true},
						tiles: { type: ['string','null'], required : true},
						titles: { type: ['string','null'], required : true},
						transparency: { type: ['string','null'], required : true},
						url : { type: ['string','null'], required : true},
						version: { type: ['string','null'], required : true},
						visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "updateServidorWMSName", 2, function() {
	$.ajax({
		url: urls.updateServidorWMSName,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			serverName: 'Ortofotos ICC'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",results.status);
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: { type: 'string', required : true}
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

asyncTest( "getAllServidorsWMSByUser", 3, function() {
	$.ajax({
		url: urls.getAllServidorsWMSByUser,
		data: {uid: 'bolo'},
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
				capesActiva : { type: ['string','null'], required : true},
				capesCalenta : { type: ['string','null'], required : true},
				capesOrdre : { type: ['string','null'], required : true},
				capesVisibilitat : { type: ['string','null'], required : true},
				entitatUid : { type: 'string', required : true},
				epsg: { type: ['string','null'], required : true},
				group: { type: ['string','null'], required : true},
				id : { type: 'number', required : true},
				imgFormat: { type: ['string','null'], required : true},
				infFormat: { type: ['string','null'], required : true},
				layers: { type: ['string','null'], required : true},
				legend: { type: ['string','null'], required : true},
				opacity: { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				query: { type: ['string','null'], required : true},
				serverName : { type: 'string', required : true},
				serverType : { type: 'string', required : true},
				tiles: { type: ['string','null'], required : true},
				titles: { type: ['string','null'], required : true},
				transparency: { type: ['string','null'], required : true},
				url : { type: ['string','null'], required : true},
				version: { type: ['string','null'], required : true},
				visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "getAllPubliscServidorsWMSByUser", 3, function() {
	$.ajax({
		url: urls.getAllPubliscServidorsWMSByUser,
		data: {uid: 'bolo'},
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
				capesActiva : { type: ['string','null'], required : true},
				capesCalenta : { type: ['string','null'], required : true},
				capesOrdre : { type: ['string','null'], required : true},
				capesVisibilitat : { type: ['string','null'], required : true},
				entitatUid : { type: 'string', required : true},
				epsg: { type: ['string','null'], required : true},
				group: { type: ['string','null'], required : true},
				id : { type: 'number', required : true},
				imgFormat: { type: ['string','null'], required : true},
				infFormat: { type: ['string','null'], required : true},
				layers: { type: ['string','null'], required : true},
				legend: { type: ['string','null'], required : true},
				opacity: { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				query: { type: ['string','null'], required : true},
				serverName : { type: 'string', required : true},
				serverType : { type: 'string', required : true},
				tiles: { type: ['string','null'], required : true},
				titles: { type: ['string','null'], required : true},
				transparency: { type: ['string','null'], required : true},
				url : { type: ['string','null'], required : true},
				version: { type: ['string','null'], required : true},
				visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "getAllPublicsServidorsWMS", 3, function() {
	$.ajax({
		url: urls.getAllPublicsServidorsWMS,
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
				capesActiva : { type: ['string','null'], required : true},
				capesCalenta : { type: ['string','null'], required : true},
				capesOrdre : { type: ['string','null'], required : true},
				capesVisibilitat : { type: ['string','null'], required : true},
				entitatUid : { type: 'string', required : true},
				epsg: { type: ['string','null'], required : true},
				group: { type: ['string','null'], required : true},
				id : { type: 'number', required : true},
				imgFormat: { type: ['string','null'], required : true},
				infFormat: { type: ['string','null'], required : true},
				layers: { type: ['string','null'], required : true},
				legend: { type: ['string','null'], required : true},
				opacity: { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				query: { type: ['string','null'], required : true},
				serverName : { type: 'string', required : true},
				serverType : { type: 'string', required : true},
				tiles: { type: ['string','null'], required : true},
				titles: { type: ['string','null'], required : true},
				transparency: { type: ['string','null'], required : true},
				url : { type: ['string','null'], required : true},
				version: { type: ['string','null'], required : true},
				visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "getAllServidorsWMS", 3, function() {
	$.ajax({
		url: urls.getAllServidorsWMS,
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
				capesActiva : { type: ['string','null'], required : true},
				capesCalenta : { type: ['string','null'], required : true},
				capesOrdre : { type: ['string','null'], required : true},
				capesVisibilitat : { type: ['string','null'], required : true},
				entitatUid : { type: 'string', required : true},
				epsg: { type: ['string','null'], required : true},
				group: { type: ['string','null'], required : true},
				id : { type: 'number', required : true},
				imgFormat: { type: ['string','null'], required : true},
				infFormat: { type: ['string','null'], required : true},
				layers: { type: ['string','null'], required : true},
				legend: { type: ['string','null'], required : true},
				opacity: { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				query: { type: ['string','null'], required : true},
				serverName : { type: 'string', required : true},
				serverType : { type: 'string', required : true},
				tiles: { type: ['string','null'], required : true},
				titles: { type: ['string','null'], required : true},
				transparency: { type: ['string','null'], required : true},
				url : { type: ['string','null'], required : true},
				version: { type: ['string','null'], required : true},
				visibilitat : { type: ['string','null'], required : true}
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

asyncTest( "deleteServidorWMS", 1, function() {
	$.ajax({
		url: urls.deleteServidorWMS,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
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
*/

module( "layers" );
/*
asyncTest( "createFeatureLayer", 3, function() {
	$.ajax({
		url: urls.createFeatureLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				fieldsName : { type: ['string','null'], required : true},
				fieldsTitle : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				publica: { type: 'boolean', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "updateFeatureLayer", 3, function() {
	$.ajax({
		url: urls.updateFeatureLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer',
			options: '{tematic:"muni",rangs:"u"}'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				fieldsName : { type: ['string','null'], required : true},
				fieldsTitle : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				publica: { type: 'boolean', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "createFeature", 3, function() {
	var features = JSON.stringify({type:'Feature',
		id: 'OpenLayers.Feature.Vector_3124',
		properties:{
			nom: 'feasture 1',
			businessId: '4c216bc1cdd8b3a69440b45b2713b085',
			text: "<a href='http://www.google.com'>link</a>",
			slotf1: 'data 1',
			slotf2: 'data 2',
			slotf3: 'data 3',
			slotf4: 'data 4',
			slotf5: 'data 5',
			slotf6: 'data 6',
			slotf7: 'data 7',
			slotf8: 'data 8',
			slotf9: 'data 9',
			slotf10: 'data 10',
		},
		geometry: {
			//type: 'Polygon',
			//coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
			//coordinates: [[[-10018754.171394622,-15028131.257091934],[-10018754.171394622,-10018754.17139462],[-5009377.085697311,-10018754.17139462],[-5009377.085697311,-15028131.257091934],[-10018754.171394622,-15028131.257091934]]]
			type: 'Point',
			coordinates: [407216.14799712435, 4631295.363198602]
	}});
	
	$.ajax({
		url: urls.createFeature,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			uid: 'bolo',
			features: features
		},
		method: 'post',
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				geometry : { type: 'object', required : true},
				properties : { type: 'object', required : true},
				type : { type: 'string', required : true},
				id : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results.features[0], schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
		
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "updateFeature", 3, function() {
	var features = JSON.stringify({type:'Feature',
		id: 'OpenLayers.Feature.Vector_3124',
		properties:{
			nom: 'feasture 1',
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			text: "<a href='http://www.google.com'>link</a>",
			slotf1: 'data 1',
			slotf2: 'data 2',
			slotf3: 'data 3',
			slotf4: 'data 4',
			slotf5: 'data 5',
			slotf6: 'data 6',
			slotf7: 'data 7777777',
			slotf8: 'data 8',
			slotf9: 'data 9',
			slotf10: 'data 10',
		},
		geometry: {
			type: 'Polygon',
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
	}});
	
	$.ajax({
		url: urls.updateFeature,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			features: features
		},
		method: 'post',
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				geometry : { type: 'object', required : true},
				properties : { type: 'object', required : true},
				type : { type: 'string', required : true},
				id : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results, schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
				
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteFeature", 1, function() {
	$.ajax({
		url: urls.deleteFeature,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
		},
		method: 'post',
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

asyncTest( "getAllFeatureLayersByUser", 3, function() {
	$.ajax({
		url: urls.getAllFeatureLayersByUser,
		data: {
			uid: 'bolo',
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
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
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				fieldsName : { type: ['string','null'], required : true},
				fieldsTitle : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
				publica : { type: 'boolean', required : true},
				options : { type: ['string','null'], required : true},
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

asyncTest( "deleteFeatureLayer", 1, function() {
	$.ajax({
		url: urls.deleteFeatureLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
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
*/
/*
asyncTest( "createDataLayer", 3, function() {
	$.ajax({
		url: urls.createDataLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				fieldsName : { type: ['string','null'], required : true},
				fieldsTitle : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				title : { type: ['string','null'], required : true},
				dades : { type: ['array','null'], required : true},
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

asyncTest( "updateDataLayer", 3, function() {
	$.ajax({
		url: urls.updateDataLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer',
			options: '{tematic:"muni",rangs:"u"}'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				fieldsName : { type: ['string','null'], required : true},
				fieldsTitle : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				options : { type: ['string','null'], required : true},
				title : { type: ['string','null'], required : true},
				dades : { type: ['array','null'], required : true},
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

asyncTest( "createData", 3, function() {
	var dades = JSON.stringify({type:'Dades',
		id: '1',
		businessId: '4c216bc1cdd8b3a69440b45b2713b082',
		fields:{
			slotd1: 'data 1',
			slotd2: 'data 2',
			slotd3: 'data 3',
			slotd4: 'data 4',
			slotd5: 'data 5',
			slotd6: 'data 6',
			slotd7: 'data 7',
			slotd8: 'data 8',
			slotd9: 'data 9',
			slotd10: 'data 10',
		}
	});
	
	$.ajax({
		url: urls.createData,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			uid: 'bolo',
			dades: dades
		},
		method: 'post',
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
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
				slotd1 : { type: ['string','null'], required : true},
				businessId : { type: 'string', required : true},
				id : { type: 'number', required : true}
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

asyncTest( "updateData", 3, function() {
	var dades = JSON.stringify({type:'Dades',
		id: '1',
		businessId: '4c216bc1cdd8b3a69440b45b2713b082',
		fields:{
			slotd1: 'data 1',
			slotd2: 'data 2',
			slotd3: 'data 3',
			slotd4: 'data 4',
			slotd5: 'data 5',
			slotd6: 'data 6',
			slotd7: 'data 7',
			slotd8: 'data 8',
			slotd9: 'data 9',
			slotd10: 'data 10',
			slotd11: 'data 11',
		}
	});
	
	$.ajax({
		url: urls.updateData,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			dades: dades
		},
		method: 'post',
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true,
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				fields : { type: 'object', required : true},
				businessId : { type: 'string', required : true},
				id : { type: 'string', required : true},
				type : { type: 'string', required : true}
			}
		};
		var report = env.validate(results.results, schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results[0]));
				
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteData", 1, function() {
	$.ajax({
		url: urls.deleteData,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
		},
		method: 'post',
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

asyncTest( "getAllDataLayersByUser", 3, function() {
	$.ajax({
		url: urls.getAllDataLayersByUser,
		data: {
			uid: 'bolo',
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
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
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				fieldsName : { type: ['string','null'], required : true},
				fieldsTitle : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
				options : { type: ['string','null'], required : true},
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

asyncTest( "deleteDataLayer", 1, function() {
	$.ajax({
		url: urls.deleteDataLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
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
*/
/*
asyncTest( "createTematicLayer", 3, function() {
	$.ajax({
		url: urls.createTematicLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "updateTematicLayer", 3, function() {
	$.ajax({
		url: urls.updateTematicLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer',
			keywords: 'poblacio,municipis'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "createRang", 3, function() {
	var rangs = JSON.stringify({
		businessId: '4c216bc1cdd8b3a69440b45b2713b082',
		llegenda: 'hotel',
		valorMax: 'hotel',
		//valorMax: ,
		color: '#ff0000',
		simbolSize: 16, 
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
	});
	
	$.ajax({
		url: urls.createRang,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			uid: 'bolo',
			rangs: rangs
		},
		method: 'post',
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
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
				id : { type: 'number', required : true},
				borderColor: { type: ['string','null'], required : true},
				borderWidth: { type: ['number','null'], required : true},
				color : { type: 'string', required : true},
				label : { type: 'boolean', required : true},
				labelColor : { type: 'string', required : true},
				labelFont : { type: 'string', required : true},
				labelHaloColor: { type: ['string','null'], required : true},
				labelHaloWidth: { type: 'number', required : true},
				labelSize: { type: 'number', required : true},
				lineStyle : { type: 'string', required : true},
				lineWidth: { type: 'number', required : true},
				llegenda : { type: 'string', required : true},
				opacity : { type: 'number', required : true},
				poligonStyle : { type: ['string','null'], required : true},
				simbol : { type: 'string', required : true},
				simbolSize : { type: 'number', required : true},
				valorMax : { type: 'string', required : true},
				valorMin : { type: ['string','null'], required : true},
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

asyncTest( "updateRang", 3, function() {
	var rangs = JSON.stringify({
		businessId: '4c216bc1cdd8b3a69440b45b2713b082',
		llegenda: 'hotel',
		valorMin: 'hotel',
		//valorMax: ,
		color: '#ff00ff',
		simbolSize: 16, 
		simbol: 'circle',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		opacity: 90,
		label: true,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#000000',
	});
	
	$.ajax({
		url: urls.updateRang,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			rangs: rangs
		},
		method: 'post',
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				id : { type: 'number', required : true},
				borderColor: { type: ['string','null'], required : true},
				borderWidth: { type: ['number','null'], required : true},
				color : { type: 'string', required : true},
				label : { type: 'boolean', required : true},
				labelColor : { type: 'string', required : true},
				labelFont : { type: 'string', required : true},
				labelHaloColor: { type: ['string','null'], required : true},
				labelHaloWidth: { type: 'number', required : true},
				labelSize: { type: 'number', required : true},
				lineStyle : { type: 'string', required : true},
				lineWidth: { type: 'number', required : true},
				llegenda : { type: 'string', required : true},
				opacity : { type: 'number', required : true},
				poligonStyle : { type: ['string','null'], required : true},
				simbol : { type: 'string', required : true},
				simbolSize : { type: 'number', required : true},
				valorMax : { type: 'string', required : true},
				valorMin : { type: ['string','null'], required : true},
			}
		};
		var report = env.validate(results.results, schema1);
		equal(report.errors.length, 0, JSON.stringify(results.results));
				
		start();
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "deleteRang", 1, function() {
	$.ajax({
		url: urls.deleteRang,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
		},
		method: 'post',
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

asyncTest( "updateGeometriesTematicLayer", 3, function() {
	$.ajax({
		url: urls.updateGeometriesTematicLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			geometriesId: '4c216bc1cdd8b3a69440b45b2713b081',
			geomField: 'the_geom',
			idGeomField: 'slotf1'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "updateCapesTematicLayer", 3, function() {
	$.ajax({
		url: urls.updateCapesTematicLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			capesId: '4c216bc1cdd8b3a69440b45b2713b081',
			dataField: 'slotd2',
			idDataField: 'slotd1'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "updateTematicRangs", 1, function() {
	var rangs = JSON.stringify({rangs:[{
		llegenda: 'si',
		valorMax: 'si',
		//valorMax: ,
		color: '#0000ff',
		simbolSize: 16, 
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
	},{
		llegenda: 'no',
		valorMax: 'no',
		//valorMax: ,
		color: '#ff0000',
		simbolSize: 16, 
		simbol: 'circle',
		lineWidth: 2,
		lineStyle: 'solid',
		borderWidth: 2,
		borderColor: '#000000',
		opacity: 80,
		label: false,
		labelSize: 10,
		labelFont: 'arial',
		labelColor: '#000000',
	}]});
		
	$.ajax({
		url: urls.updateTematicRangs,
		data: {
			businessId: 'a24b6827d46dadf5cca4fa09069583f0',
			uid: 'bolo',
			tipusRang: 'unic',
			rangs: rangs
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

asyncTest( "duplicateTematicLayer", 1, function() {
	var rangs = JSON.stringify({rangs:[]});
		
	$.ajax({
		url: urls.duplicateTematicLayer,
		data: {
			businessId: 'd414fc9125bc56de4de4e7fbe8b350d6',
			uid: 'bolo',
			nom: 'Test_layer',
            mapBusinessId: 'dfc0ebd23833cfde0d9c8bb70dfdc67c',
            calentas: false,           
            activas: true,
            visibilitats: true,
			tipusRang: 'heatmap',
			rangs: rangs
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


asyncTest( "createTematicLayerFeature", 3, function() {
	var features = JSON.stringify({type:'Feature',
		id: 'OpenLayers.Feature.Vector_3124',
		properties:{
			nom: 'feasture 1',
			text: "<a href='http://www.google.com'>link</a>",
			slotf1: 'data 1',
			slotf2: 'data 2',
			slotf3: 'data 3',
			slotf4: 'data 4',
			slotf5: 'data 5',
			slotf6: 'data 6',
			slotf7: 'data 7',
			slotf8: 'data 8',
			slotf9: 'data 9',
			slotf10: 'data 10',
		},
		geometry: {
			//type: 'Polygon',
			//coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
			//coordinates: [[[-10018754.171394622,-15028131.257091934],[-10018754.171394622,-10018754.17139462],[-5009377.085697311,-10018754.17139462],[-5009377.085697311,-15028131.257091934],[-10018754.171394622,-15028131.257091934]]]
			type: 'Point',
			coordinates: [407216.14799712435, 4631295.363198602]
	}});
	
	var dades = JSON.stringify({type:'Dades',
		id: '1',
		fields:{
			slotd1: 'data 1',
			slotd2: 'data 2',
			slotd3: 'data 3',
			slotd4: 'data 4',
			slotd5: 'data 5',
			slotd6: 'data 6',
			slotd7: 'data 7',
			slotd8: 'data 8',
			slotd9: 'data 9',
			slotd10: 'data 10',
		}
	});
	
	var rangs = JSON.stringify({
		businessId: '4c216bc1cdd8b3a69440b45b2713b082',
		llegenda: 'hotel',
		valorMax: 'hotel',
		//valorMax: ,
		color: '#ff0000',
		simbolSize: 16, 
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
	});
	
	$.ajax({
		url: urls.createTematicLayerFeature,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer',
			publica: true,
			geomField: 'the_geom',
			idGeomField: 'slotf1',
			dataField: 'slotd2',
			idDataField: 'slotd1',
			features: features,
			dades: dades,
			rangs: rangs
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "createTematicLayerEmpty", 3, function() {
	$.ajax({
		url: urls.createTematicLayerEmpty,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b090',
			uid: 'bolo',
			description: 'prova',
			nom: 'Test_layer',
			geometryType: 'marker',
			publica: true,
			geomField: 'the_geom',
			idGeomField: 'nom',
			dataField: 'slotd1',
			idDataField: 'slotd1',
			mapBusinessId: 'ffabe7f7d453d9a63cf7182a464ebe96'
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				keywords : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
				title : { type: ['string','null'], required : true},
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

asyncTest( "moveFeatureToTematic", 1, function() {
	$.ajax({
		url: urls.moveFeatureToTematic,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082', //businessId de la feature
            fromBusinessId: '4c216bc1cdd8b3a69440b45b2713b081', //businessId del tematico de origen
            toBusinessId: '4c216bc1cdd8b3a69440b45b2713b083', //businessId del tematico de destino
			uid: 'bolo',
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
	}).fail(function(results){
		console.debug(results);
		ok( false, "Fail and ready to resume!" );
		start();
	});	
});

asyncTest( "getTematicLayerByBusinessId", 3, function() {
	$.ajax({
		url: urls.getTematicLayerByBusinessId,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b081',
			uid: 'bolo',
		},
		dataType: 'jsonp'
	}).done(function(results){
		console.debug(results);
		equal(results.status,"OK",JSON.stringify(results));
		
		var schema = {
			type : 'object',
			properties : {
				status: { type: 'string', required : true},
				results: {
					type : 'object', required : true
				}
			}
		};
		var report = env.validate(results, schema);
		equal(report.errors.length, 0, JSON.stringify(results));
		
		var schema1 = {
			type : 'object',
			properties : {
				businessId : { type: 'string', required : true},
				capes: { type: 'object', required : true},
				dataField : { type: 'string', required : true},
				description : { type: ['string','null'], required : true},
				geomField : { type: 'string', required : true},
				geometries: { type: 'object', required : true},
				id : { type: 'number', required : true},
				idDataField : { type: 'string', required : true},
				idGeomField : { type: 'string', required : true},
				keywords : { type: ['string','null'], required : true},
				labelField : { type: ['string','null'], required : true},
				nom : { type: 'string', required : true},
				rangs: { type: 'array', required : true, items:{type: 'object'}},
				tipusRang : { type: 'string', required : true},
				title : { type: ['string','null'], required : true},
				uid : { type: 'string', required : true},				
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

asyncTest( "deleteTematicLayerAll", 1, function() {
	$.ajax({
		url: urls.deleteTematicLayerAll,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
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

asyncTest( "deleteTematicLayer", 1, function() {
	$.ajax({
		url: urls.deleteTematicLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
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
*/

module( "visualitzacio" );
/*
asyncTest( "createGeometriesColleccioLayer", 1, function() {
	$.ajax({
		url: urls.createGeometriesColleccioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: uid,
			nom: "Test_viz_layer"
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

asyncTest( "updateGeometriesColleccioLayer", 1, function() {
	var options = {
		tematic:"muni",
		rangs:"u"	
	};
	options = JSON.stringify(options);
	
	$.ajax({
		url: urls.updateGeometriesColleccioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: uid,
			nom: 'Test_layers',
			options: options
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

asyncTest( "getAllGeometriesColleccioByUser", 1, function() {
	$.ajax({
		url: urls.getAllGeometriesColleccioByUser,
		data: {
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

asyncTest( "getGeometriesColleccioLayersByBusinessId", 1, function() {
	$.ajax({
		url: urls.getGeometriesColleccioLayersByBusinessId,
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
	
asyncTest( "createGeometria", 1, function() {
	var features = {
		type:"Feature",
		id:"OpenLayers.Feature.Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b082",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3"
		},
		geometry: {
			type: "Polygon",
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
		}
	};
	features = JSON.stringify(features);
	
	$.ajax({
		url: urls.createGeometria,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
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

asyncTest( "updateGeometria", 1, function() {
	var features = {
		type:"Feature",
		id:"OpenLayers.Feature.Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b082",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
		},
		geometry: {
			type: "Polygon",
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
		}
	};
	features = JSON.stringify(features);
		
	$.ajax({
		url: urls.updateGeometria,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
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

asyncTest( "deleteGeometria", 1, function() {
	$.ajax({
		url: urls.deleteGeometria,
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

asyncTest( "deleteGeometriesColleccioLayer", 1, function() {
	$.ajax({
		url: urls.deleteGeometriesColleccioLayer,
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

asyncTest( "createVisualitzacioLayer", 1, function() {
	$.ajax({
		url: urls.createVisualitzacioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b085',
			uid: uid,
			nom: 'Test_viz_del'
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

asyncTest( "updateVisualitzacioLayer", 1, function() {
	$.ajax({
		url: urls.updateVisualitzacioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: uid,
			nom: 'Test_viz_to',
			options: {tematic:"muni",rangs:"u"}
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

asyncTest( "getAllVisualitzacioLayerByUid", 1, function() {
	$.ajax({
		url: urls.getAllVisualitzacioLayerByUid,
		data: {
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

asyncTest( "addGeometriaToVisualitzacio", 1, function() {
	var features = {
		type:"Feature",
		id:"OpenLayers.Feature.Vector_3124",
		businessId: "4c216bc1cdd8b3a69440b45b2713b082",
		properties: {
			nom: "feature 1",
			campo1: "data 1",
			campo2: "data 2",
			campo3: "data 3",
			description: "<a href='http://www.google.com'>link</a><br/>Modificación de capçalerà"
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

asyncTest( "createEstil", 1, function() {
	var estils = JSON.stringify({
		businessId: '4c216bc1cdd8b3a69440b45b2713b082',
		llegenda: 'hotel',
		valorMax: 'hotel',
		//valorMax: ,
		color: '#ff0000',
		simbolSize: 16, 
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
	});
	
	$.ajax({
		url: urls.createEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			estils: estils
		},
		method: 'post',
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

asyncTest( "createEstil", 1, function() {
	var estils = JSON.stringify({
		businessId: '4c216bc1cdd8b3a69440b45b2713b083',
		llegenda: 'bar',
		valorMax: 'bar',
		//valorMax: ,
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
	});
	
	$.ajax({
		url: urls.createEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			estils: estils
		},
		method: 'post',
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

asyncTest( "addGeometriaToEstil", 1, function() {
	$.ajax({
		url: urls.addGeometriaToEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b082'
		},
		method: 'post',
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

asyncTest( "moveGeometriaToEstil", 1, function() {
	$.ajax({
		url: urls.moveGeometriaToEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			estilBusinessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo',
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b082'
		},
		method: 'post',
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

asyncTest( "removeGeometriaToEstil", 1, function() {
	$.ajax({
		url: urls.removeGeometriaToEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: 'bolo',
			geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b082'
		},
		method: 'post',
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

asyncTest( "deleteEstil", 1, function() {
	$.ajax({
		url: urls.deleteEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
		},
		method: 'post',
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

asyncTest( "deleteEstil", 1, function() {
	$.ajax({
		url: urls.deleteEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: 'bolo'
		},
		method: 'post',
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


asyncTest( "moveGeometriaToVisualitzacio", 1, function() {
	$.ajax({
		url: urls.moveGeometriaToVisualitzacio,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: uid,
			fromBusinessId: '4c216bc1cdd8b3a69440b45b2713b082',
			toBusinessId: '4c216bc1cdd8b3a69440b45b2713b083'
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

asyncTest( "deleteEstil", 1, function() {
	$.ajax({
		url: urls.deleteEstil,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'bolo'
		},
		method: 'post',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b085',
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

asyncTest( "duplicateVisualitzacioLayer", 1, function() {
	$.ajax({
		url: urls.duplicateVisualitzacioLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b083',
			uid: uid,
			nom: 'Duplicate',
			toBusinessId: '4c216bc1cdd8b3a69440b45b2713b086'
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

asyncTest( "deleteVisualitzacioLayerAll", 1, function() {
	$.ajax({
		url: urls.deleteVisualitzacioLayerAll,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b086',
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
