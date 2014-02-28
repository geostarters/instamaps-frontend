var HOST_APP = "http://localhost:8080/dones/";
var urls = {
	login: HOST_APP+"login.action?",
	registreUser: HOST_APP+"registreUser.action?",
	validateUid: HOST_APP+"validateUid.action?",
	validateEmail: HOST_APP+"validateEmail.action?",
	getUser: HOST_APP+"admin/getUser.action?",
	updatePassword: HOST_APP+"user/updatePassword.action?",
	updateUser: HOST_APP+"user/updateUser.action?",
	getUserUser: HOST_APP+"user/getUser.action?",
	getAllUsers: HOST_APP+"admin/getAllUsers.action?",
	getAllUserNames: HOST_APP+"admin/getAllUserNames.action?",
	deleteUser: HOST_APP+"admin/deleteUser.action?",
	logout: HOST_APP+"logout.action?",
	createUserSocial: HOST_APP+"user/createUserSocial.action?",
	updateUserSocial: HOST_APP+"user/updateUserSocial.action?",
	getAllUserSocial: HOST_APP+"user/getAllUserSocial.action?",
	deleteUserSocial: HOST_APP+"user/deleteUserSocial.action?",
	createFeatureLayer: HOST_APP+"layers/feature/createFeatureLayer.action?",
	updateFeatureLayer: HOST_APP+"layers/feature/updateFeatureLayer.action?",
	deleteFeatureLayer: HOST_APP+"layers/feature/deleteFeatureLayer.action?",
	createFeature: HOST_APP+"layers/feature/createFeature.action?",
	updateFeature: HOST_APP+"layers/feature/updateFeature.action?",
	deleteFeature: HOST_APP+"layers/feature/deleteFeature.action?",
	getAllFeatureLayersByUser: HOST_APP+"layers/feature/getAllFeatureLayersByUser.action?",
};

//var JSV = require("./jsv").JSV;
var JSV = require("JSV").JSV;
var test_uid = "bcarmona";
var env = JSV.createEnvironment();

QUnit.config.reorder = false;
test( "hello test", function() {
	ok( 1 == "1", "Passed!" );
});

asyncTest( "login", 1, function() {
	$.ajax({
		url: urls.login,
		data: {user: 'admindones', password:'dones2014'},
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
asyncTest( "validateUid", 1, function() {
	$.ajax({
		url: urls.validateUid,
		data: {uid: 'admindones'},
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
		data: {uid: 'admindones@asfd'},
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
		data: {email: 'admin.dones@icc.cat'},
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
		data: {email: 'admin.dones@gmail.cat'},
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
asyncTest( "registreUser duplicate email", 1, function() {
	$.ajax({
		url: urls.registreUser,
		data: {cn: 'Bonifacio', 
			sn:'Carmona', 
			uid: test_uid, 
			email: 'admin.dones@icc.cat', 
			userPassword: 'user2013',
			ambitGeo: 1,
			tipusEntitatId: 1,
			bbox: '260383,4491989,527495,4748184'},
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

/*
asyncTest( "createFeatureLayer", 3, function() {
	$.ajax({
		url: urls.createFeatureLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'admindones',
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
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
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

asyncTest( "updateFeatureLayer", 3, function() {
	$.ajax({
		url: urls.updateFeatureLayer,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'admindones',
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
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
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

asyncTest( "createFeature", 3, function() {
	var features = JSON.stringify({type:'Feature',
		id: 'OpenLayers.Feature.Vector_3124',
		properties:{
			nom: 'feasture 1',
			businessId: '4c216bc1cdd8b3a69440b45b2713b085',
			text: "<a href='http://www.google.com'>link</a>",
			type: 'Point',
			icon: 'marker',
			fillcolor: '#ff0000',
			strokecolor: '#000000',
			strokewidth: 2,
			label: 'Carrer maria',
			wikipedia: 'http://es.wikipedia.org/wiki/LDAP',
			tipusDona: 'pintora',
			municipi: '080195',
			uid: 'pedrin',
		},
		geometry: {
			type: 'Point',
			coordinates: [407216.14799712435, 4631295.363198602]
	}});
	
	$.ajax({
		url: urls.createFeature,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'admindones',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b085',
			text: "<a href='http://www.google.com'>link</a>",
			type: 'Point',
			icon: 'marker',
			fillcolor: '#ff0000',
			strokecolor: '#000000',
			strokewidth: 2,
			label: 'Carrer Mariana',
			wikipedia: 'http://es.wikipedia.org/wiki/LDAP',
			url: 'http://www.icgc.cat',
			tipusDona: 'pintora',
			municipi: '080195',
			uid: 'jose',
		},
		geometry: {
			type: 'Polygon',
			coordinates: [[[331889.57676804,5130491.556301],[330991.44168581,5129555.2027046],[331450.0638554565,5128924.597221361],[331889.57676804,5130491.556301]]]
	}});
	
	$.ajax({
		url: urls.updateFeature,
		data: {
			businessId: '4c216bc1cdd8b3a69440b45b2713b082',
			uid: 'admindones',
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
			businessId: '4c216bc1cdd8b3a69440b45b2713b085',
			uid: 'admindones'
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
			uid: 'admindones',
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
				nom : { type: 'string', required : true},
				uid : { type: 'string', required : true},
				id : { type: 'number', required : true},
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
			uid: 'admindones'
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