function loadGaleria(){
	//console.debug("cargaEntitat");
	jQuery('#wait').show();
	return jQuery.ajax({
		type: "get",
  		url: paramUrl.getAllPublicsMaps,
  		dataType: 'jsonp'
	}).promise();
}

function deleteMap(data){
	return $.ajax({
		url: paramUrl.deleteMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

/* registre.html */

function registerUser(url, dataUrl){
	 return jQuery.ajax({
			url: url,
			data: dataUrl,
			method: 'post',
			dataType: 'jsonp'
			}).promise();		
}

function checkUsername(username){
	  return jQuery.ajax({
			url: paramUrl.validateUsername,
			data: {uid:username},
			method: 'post',
			dataType: 'jsonp'
		}).promise();
		
}

function checkEmail(user_email){
	  return jQuery.ajax({
			url: paramUrl.validateEmail,
			data: {email: user_email},
			method: 'post',
			dataType: 'jsonp'
		}).promise();
		
}

/* sessio.html */

function doLogin(user_login,pass_login){
	return jQuery.ajax({
		url: paramUrl.loginUser,
		data: {user:user_login, password:pass_login},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}



function addTematicLayerFeature(data){
	return $.ajax({
		url: paramUrl.createTematicLayerFeature,
		data: data,
		dataType: 'jsonp'
	}).promise();
}


function getTematicLayerByBusinessId(data){
	return $.ajax({
		url: paramUrl.getTematicLayerByBusinessId,
		data: data,
		dataType: 'jsonp'
	}).promise();
}


function createFeature(data){
	return $.ajax({
		url: paramUrl.createFeature,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function createData(data){
	return $.ajax({
		url: paramUrl.createData,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function createRang(data){
	return $.ajax({
		url: paramUrl.createRang,
		data: data,
		dataType: 'jsonp'
	}).promise();
}



function getLListaDadesObertes(){
	return jQuery.ajax({
		url: paramUrl.dadesObertes,
		data: {metode:'getDatasets'},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}