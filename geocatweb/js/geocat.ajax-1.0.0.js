function loadGaleria(params){
	return jQuery.ajax({
		url: paramUrl.getAllMapsByUser,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}

function loadPublicGaleria(){
	return jQuery.ajax({
		url: paramUrl.getAllPublicsMaps,
  		dataType: 'jsonp'
	}).promise();
}

function deleteMap(data){
	return jQuery.ajax({
		url: paramUrl.deleteMap,
		data: data,
		method: 'post',
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

/* perfil.html */

function getUserData(username){
	return jQuery.ajax({
		url: paramUrl.getUser,
		data: {uid : username},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateUserData(username, name, surname, correu_usuari){
	return jQuery.ajax({
		url: paramUrl.updateUser,
		data: {
            cn: name,
            sn: surname,
            uid: username,
            email: correu_usuari},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateUserPassword(username, new_pass, old_pass){
	return jQuery.ajax({
		url: paramUrl.updatePassword,
		data: {
            uid: username, 
            userPassword: old_pass, 
            newPassword: new_pass},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

/* comuns */

function doLogout(){
	return jQuery.ajax({
		url: paramUrl.logoutUser,
		async: false,
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

/* map */
function createTematicLayerFeature(data){
	return $.ajax({
		url: paramUrl.createTematicLayerFeature,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function addFeatureToTematic(data){
	return $.ajax({
		url: paramUrl.addFeatureToTematic,
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

function getMapByBusinessId(data){
	return jQuery.ajax({
		//url: paramUrl.getMapByBusinessId,
		url: paramUrl.getMapById,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function updateMap(data){
	return jQuery.ajax({
		url: paramUrl.updateMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function createMap(data){
	return jQuery.ajax({
		url: paramUrl.createMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getAllServidorsWMSByUser(data){
	return jQuery.ajax({
		url: paramUrl.getAllServidorsWMSByUser,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function addServerToMap(data){
	return jQuery.ajax({
		url: paramUrl.addServerToMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getAllTematicLayerByUid(data){
	return jQuery.ajax({
		url: paramUrl.getAllTematicLayerByUid,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function deleteTematicLayerAll(data){
	return jQuery.ajax({
		url: paramUrl.deleteTematicLayerAll,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function doUpdateMap(data){
	return jQuery.ajax({
		url: paramUrl.updateMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function updateServersOrderToMap(data){
	return jQuery.ajax({
		url: paramUrl.updateServersOrderToMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function updateMapName(data){
	return jQuery.ajax({
		url: paramUrl.updateMapName,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getTwitterLayer(data){
	return jQuery.ajax({
		url: paramUrl.getTwitterLayer,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function removeServerToMap(data){
	return jQuery.ajax({
		url: paramUrl.removeServerToMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function updateServidorWMSName(data){
	return jQuery.ajax({
		url: paramUrl.updateServidorWMSName,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function addServerToMap(data){
	return jQuery.ajax({
		url: paramUrl.addServerToMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function createServidorInMap(data){
	return jQuery.ajax({
		url: paramUrl.createServidorInMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getWikipediaLayer(data){
	return jQuery.ajax({
		url: paramUrl.getWikipediaLayer,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function shortUrl(url){
    return jQuery.ajax({
        url: paramUrl.shortUrl,
        //data: {longUrl: url, apiKey:'R_12df4059f0e8be1ec2a4564b2357974c', login:'csuportidec'},
        data: {longUrl: url, apiKey:'R_5767babf83836f942655936714500511', login:'geostarters'},
        dataType: 'jsonp'
    }).promise();
}

function doReadFile(data){
	return jQuery.ajax({
		url: paramUrl.readFile,
		data: data,
		//async: false,
		//method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function doUploadFile(data){
	return jQuery.ajax({
		url: paramUrl.uploadFile,
		data: data,
		//async: false,
		//method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function getDownloadLayer(data){
	return jQuery.ajax({
		url: paramUrl.proxy_download,
		data: data,
		type: "POST"
//		dataType: 'html'
	}).promise();
}

function getTematicLayer(data){
	return jQuery.ajax({
		url: paramUrl.getTematicLayer,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function deleteServidorWMS(data){
	return jQuery.ajax({
		url: paramUrl.deleteServidorWMS,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getWMSLayers(url){
	return jQuery.ajax({
		url: paramUrl.ows2json,
		data: {url:url},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function createTematicLayerEmpty(data){
	return jQuery.ajax({
		url: paramUrl.createTematicLayerEmpty,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function moveFeatureToTematic(data){
	return jQuery.ajax({
		url: paramUrl.moveFeatureToTematic,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function deleteFeature(data){
	return jQuery.ajax({
		url: paramUrl.deleteFeature,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function updateFeature(data){
	return jQuery.ajax({
		url: paramUrl.updateFeature,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function updateTematicRangs(data){
	return jQuery.ajax({
		url: paramUrl.updateTematicRangs,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function createRandomUser(){
	return jQuery.ajax({
		url: paramUrl.createRandomUser,
		dataType: 'jsonp'
	}).promise();
}

function deleteRandomUser(data){
	return jQuery.ajax({
		url: paramUrl.deleteRandomUser,
		data: data,
		dataType: 'jsonp'
	}).promise();
}



function getJSONPServei(url){
	return jQuery.ajax({
		url: paramUrl.json2jsonp,
		data: {url:url},
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise()
	.fail(function(msg,err) {
	console.info(err);
	})
}


function updateServidorWMS(data){
	
	return jQuery.ajax({
		url: paramUrl.updateServidorWMS,
		data: data,
		dataType: 'jsonp'
	}).promise();

}