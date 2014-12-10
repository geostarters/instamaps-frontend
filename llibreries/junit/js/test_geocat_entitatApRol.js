var urls = {
	login: "http://localhost:8181/geocat/login.action?",
	createRol: "http://localhost:8181/geocat/admin/createRol.action?",
	updateRol: "http://localhost:8181/geocat/admin/updateRol.action?",
	deleteRol: "http://localhost:8181/geocat/admin/deleteRol.action?",
	getAllRols: "http://localhost:8181/geocat/admin/getAllRols.action?",
	getRolById: "http://localhost:8181/geocat/admin/getRolById.action?",
	createEntitatAplicacioRol: "http://localhost:8181/geocat/entitatAplicacio/createEntitatAplicacioRol.action?",
	updateEntitatAplicacioRol: "http://localhost:8181/geocat/entitatAplicacio/updateEntitatAplicacioRol.action?",
	deleteEntitatAplicacioRol: "http://localhost:8181/geocat/entitatAplicacio/deleteEntitatAplicacioRol.action?",
	getAllEntitatsAplicacioRol: "http://localhost:8181/geocat/entitatAplicacio/getAllEntitatsAplicacioRol.action?",
	getEntitatsAplicacioRolByUid: "http://localhost:8181/geocat/entitatAplicacio/getEntitatsAplicacioRolByUid.action?",
	getEntitatsAplicacioRolByAplicacioId: "http://localhost:8181/geocat/entitatAplicacio/getEntitatsAplicacioRolByAplicacioId.action?",
	sendMail: "http://localhost:8181/geocat/mail/sendMail.action?"
};
//asyncTest( "login", 1, function() {
//	$.ajax({
//		url: urls.login,
//		data: {user: 'bolo', password:'piji34'},
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

asyncTest( "createRol", 1, function() {
	$.ajax({
		url: urls.createRol,
		data: {rol: "colaborador2",uid: "bolo"},
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

asyncTest( "updateRol", 2, function() {
	$.ajax({
		url: urls.updateRol,
		data: {id:"3695377",rol: "creador",uid: "bolo"},
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

asyncTest( "deleteRol", 3, function() {
	$.ajax({
		url: urls.deleteRol,
		data: {id:"3695099",uid: "bolo"},
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
						id : { type: 'string', required : true},
						rol : { type: 'string', required : true}
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

asyncTest( "getAllRols", 4, function() {
	$.ajax({
		url: urls.getAllRols,
		data: {uid: "bolo"},
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

asyncTest( "getRolById", 5, function() {
	$.ajax({
		url: urls.getRolById,
		data: {uid: "bolo",id: "3695377"},
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

asyncTest( "createEntAplRol", 6, function() {
	$.ajax({
		url: urls.createEntitatAplicacioRol,
		data: {aplicacioId: "17d29b4a95d872e7ff4b6b96d2ed2a42",uid: "bolo",rol:"3695378"},
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

asyncTest( "updateEntAplRol", 7, function() {
	$.ajax({
		url: urls.updateEntitatAplicacioRol,
		data: {id:"3695421",aplicacioId: "17d29b4a95d872e7ff4b6b96d2ed2a42"},
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

asyncTest( "deleteEntAplRol", 8, function() {
	$.ajax({
		url: urls.deleteEntitatAplicacioRol,
		data: {id:"3695421"},
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

asyncTest( "getAllEntitatAplRol", 9, function() {
	$.ajax({
		url: urls.getAllEntitatsAplicacioRol,
		data: {},
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

asyncTest( "getEntitatsAplicacioRolByUid", 10, function() {
	$.ajax({
		url: urls.getEntitatsAplicacioRolByUid,
		data: {uid: "bolo"},
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

asyncTest( "getEntitatsAplicacioRolByAplicacioId", 11, function() {
	$.ajax({
		url: urls.getEntitatsAplicacioRolByAplicacioId,
		data: {aplicacioId: "68218"},
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


asyncTest( "sendMail", 12, function() {
	$.ajax({
		url: urls.sendMail,
		data: {to:"m.ortega@icc.cat",from:"webmaster@icc.cat",host:"smtp.gmail.com",subject:"prova mail",content:"soc un mail"},
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