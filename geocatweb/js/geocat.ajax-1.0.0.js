runningActions = [];

function actionCompleted(jqXHR, status) {
	//Remove the completed action from the running actions
	var index = runningActions.indexOf(jqXHR);
	runningActions.splice(index, 1);
}

function loadPublicGaleria(params){
	var xhr = jQuery.ajax({
		url: paramUrl.getAllPublicsMaps,
		data: params,
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function loadNumGaleria(){
	var xhr = jQuery.ajax({
		url: paramUrl.getNumGaleria,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}


function searchGaleriaMaps(params){
	var xhr = jQuery.ajax({
		url: paramUrl.searchGaleriaMaps,
		data: params,
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function searchGaleriaMapsByUser(params){
	var xhr = jQuery.ajax({
		url: paramUrl.searchGaleriaMapsByUser,
		data: params,
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteMap,
		data: data,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/* registre.html */

function registerUser(url, dataUrl){
	var xhr = jQuery.ajax({
		url: url,
		data: dataUrl,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();		
}

function checkUsername(username){
	  var xhr = jQuery.ajax({
			url: paramUrl.validateUsername,
			data: {uid:username},
			method: 'post',
			dataType: 'jsonp',
			complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function checkEmail(user_email){
	  var xhr = jQuery.ajax({
			url: paramUrl.validateEmail,
			data: {email: user_email},
			method: 'post',
			dataType: 'jsonp',
			complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/* galeria.html */

//solo galeria privada de geolocal para obtener las aplicaciones
function getUserData(username){
	var xhr = jQuery.ajax({
		url: paramUrl.getUserSimple,
		data: {uid : username},
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/* comuns */
function doLogout(){
	var xhr = jQuery.ajax({
		url: paramUrl.logoutUser,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/* sessio.html */

function doLogin(data){
	var xhr = jQuery.ajax({
		url: paramUrl.loginUser,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function doLoginIcgc(data){
	var xhr = jQuery.ajax({
		url: paramUrl.loginUserIcgc,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function loginToken(data){
	var xhr = jQuery.ajax({
		url: paramUrl.loginToken,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/* map */
function createTematicLayerFeature(data){
	var xhr = $.ajax({
		url: paramUrl.createTematicLayerFeature,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function addFeatureToTematic(data){
	var xhr = $.ajax({
		url: paramUrl.addFeatureToTematic,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getTematicLayerByBusinessId(data){
	var xhr = $.ajax({
		url: paramUrl.getTematicLayerByBusinessId,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getCacheVisualitzacioLayerByBusinessId(data){
	var xhr = $.ajax({
		url: paramUrl.getCacheVisualitzacioLayerByBusinessId,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createFeature(data){
	var xhr = $.ajax({
		url: paramUrl.createFeature,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createData(data){
	var xhr = $.ajax({
		url: paramUrl.createData,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createRang(data){
	var xhr = $.ajax({
		url: paramUrl.createRang,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getLListaDadesObertes(){
	var xhr = jQuery.ajax({
		url: paramUrl.dadesObertes,
		data: {metode:'getDatasets'},
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getMapByBusinessId(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getMapByBusinessId,
		//url: paramUrl.getMapById,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getCacheMapByBusinessId(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getCacheMapByBusinessId,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/*//Local
function updateMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}*/

function updateMap(data){
	var xhr = jQuery.ajax({
//		url: paramUrl.proxy + "?url=" + paramUrl.updateMap + "&uid="+data.uid,
		url: paramUrl.updateMap,
		data: data,
		method: 'POST',
//		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getAllServidorsWMSByUser(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getAllServidorsWMSByUser,
		data: data,
		method: 'POST',
//		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function addServerToMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.addServerToMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getAllTematicLayerByUid(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getAllTematicLayerByUid,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteTematicLayerAll(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteTematicLayerAll,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function doUpdateMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateServersOrderToMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateServersOrderToMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}


function updateServerOrderToMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateServerOrderToMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateMapName(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateMapName,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getTwitterLayer(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getTwitterLayer,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function removeServerToMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.removeServerToMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteServerRemoved(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteServerRemoved,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateServidorWMSName(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateServidorWMSName,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}


function updateServidorWMSOptions(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateServidorWMSOptions,
		data: data,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateServidorWMSGroup(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateServidorWMSGroup,
		data: data,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateServidorWMSOpacity(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateServidorWMSOpacity,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}



function addServerToMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.addServerToMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createServidorInMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createServidorInMap,
		data: data,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getWikipediaLayer(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getWikipediaLayer,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function shortUrl(url){
    var xhr = jQuery.ajax({
    	url: paramUrl.shortUrl,
        contentType: "application/json; charset=utf-8",
        method: 'POST',
        data: JSON.stringify({longUrl: url}),
        dataType: 'json',
    	complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function doReadFile(data){
	var xhr = jQuery.ajax({
		url: paramUrl.readFile,
		data: data,
		//async: false,
		//method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function doUploadFile(data){
	var xhr = jQuery.ajax({
		url: paramUrl.uploadFile,
		data: data,
		//async: false,
		//method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getDownloadLayer(data){
	var xhr = jQuery.ajax({
		//url: paramUrl.proxy_download,
		url: paramUrl.download_layer,
		data: data,
		type: "POST",
//		dataType: 'html'
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteServidorWMS(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteServidorWMS,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createTematicLayerEmpty(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createTematicLayerEmpty,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function moveFeatureToTematic(data){
	var xhr = jQuery.ajax({
		url: paramUrl.moveFeatureToTematic,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteFeature(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteFeature,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateFeature(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateFeature,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateTematicRangs(data){
    var xhr = jQuery.ajax({
    	//url: paramUrl.proxy + "?url=" + paramUrl.updateTematicRangs + "&uid="+data.uid,
        url: paramUrl.updateTematicRangs,
        data: data,
        method: 'post',
    	complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createRandomUser(){
	var xhr = jQuery.ajax({
		url: paramUrl.createRandomUser,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteRandomUser(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteRandomUser,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getJSONPServei(url){
	var xhr = jQuery.ajax({
		url: paramUrl.json2jsonp,
		data: {url:url},
		async: false,
		method: 'post',
		dataType: 'jsonp',
	});
	runningActions.push(xhr);
	return xhr.promise()
	.fail(function(msg,err) {
		console.info(err);
	});
}

function updateServidorWMS(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateServidorWMS,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function duplicateTematicLayer(data){
	var xhr = jQuery.ajax({
		//url: paramUrl.proxy + "?url=" + paramUrl.duplicateTematicLayer + "&uid="+data.uid,
		url: paramUrl.duplicateTematicLayer,
		data: data,
		method: 'post',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function reminderMail(data){
	var xhr = jQuery.ajax({
		url: paramUrl.reminderMail,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function renewPassword(data){
	var xhr = jQuery.ajax({
		url: paramUrl.renewPassword,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getNumEntitatsActives(){
	var xhr = jQuery.ajax({
		url: paramUrl.getNumEntitatsActives,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getNumMapes(){
	var xhr = jQuery.ajax({
		url: paramUrl.getNumMapes,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getNumCapes(){
	var xhr = jQuery.ajax({
		url: paramUrl.getNumCapes,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function publicarCapesMapa(data){
	var xhr = jQuery.ajax({
		url: paramUrl.publicarCapesMapa,
		data: data,
		method: 'post',
		//dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function publicarMapConfig(data){
	var xhr = jQuery.ajax({
		url: paramUrl.publicarMapConfig,
		data: data,
		method: 'post',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getUrlFile(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urlFile,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteUser(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteUser,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getUrlFileProves(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urlFileProves,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getUrlFileNoDin(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urlFileNoDin,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getUrlFileDin(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urlFileDin,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getUserSimple(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getUserSimple,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function uploadImageBase64(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urluploadBase64,		
		data: data,		
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		method: 'POST',
		dataType: 'json',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}	


function createGeoPdfMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urlgetMapImage,
		data: data,	
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		method: 'POST',
		dataType: 'json',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}	



function createMapToWMS(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urlMapToWMS,
		data: data,	
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		method: 'POST',
		dataType: 'json',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}	



//esborra imatge galeria

function deleteImageGaleria(data){
	var xhr = jQuery.ajax({
		url: paramUrl.urlgetMapImage,
		data:data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}





function updatePasswordIcgc(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updatePasswordIcgc,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}


/*FUNCIONS NOU MODEL*/
function createVisualitzacioLayer(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createVisualitzacioLayer,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function addGeometriaToVisualitzacio(data){
	var xhr = jQuery.ajax({
		url: paramUrl.addGeometriaToVisualitzacio,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function moveGeometriaToVisualitzacio(data){
	var xhr = jQuery.ajax({
		url: paramUrl.moveGeometriaToVisualitzacio,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateGeometria(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateGeometria,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function modificarEstiloGeometria(data){
	var xhr = jQuery.ajax({
		url: paramUrl.modificarEstiloGeometria,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function removeGeometriaFromVisualitzacio(data){
	var xhr = jQuery.ajax({
		url: paramUrl.removeGeometriaFromVisualitzacio,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateNameVisualitzacioLayer(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateNameVisualitzacioLayer,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteVisualitzacioLayer(data){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteVisualitzacioLayer,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getVisualitzacioByBusinessId(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getVisualitzacioByBusinessId,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createVisualitzacioSimple(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createVisualitzacioSimple,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createVisualitzacioTematica(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createVisualitzacioTematica,
		data: data,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createVisualitzacioHeatCluster(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createVisualitzacioHeatCluster,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getGeometriesColleccioByBusinessId(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getGeometriesColleccioByBusinessId,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/*Data Table*/

function getGeometriesPropertiesLayer(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getGeometriesPropertiesLayer,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function removeGeometriaFromProperties(data){
	var xhr = jQuery.ajax({
		url: paramUrl.removeGeometriaFromProperties,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function updateGeometriaProperties(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateGeometriaProperties,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

/* galeria.html */
function updateMapVisibility(data){
	var xhr = jQuery.ajax({
		url: paramUrl.updateMapVisibility,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function sendMail(data){
	var xhr = jQuery.ajax({
		url: paramUrl.sendMail,
		data: data,
		method: 'post',
        dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function loadMapsColaboracio(params){
	var xhr = jQuery.ajax({
		url: paramUrl.getEntitatsAplicacioRolByUidColaborador,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function getEntitatsColaboradorsByAplicacio(params){
	var xhr = jQuery.ajax({
		url: paramUrl.getEntitatsColaboradorsByAplicacio,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function getConvidatsByBusinessId(params){
	var xhr = jQuery.ajax({
		url: paramUrl.getConvidatsByBusinessId,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function deleteConvidatByBusinessId(params){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteConvidatByBusinessId,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function deleteUser(params){
	var xhr = jQuery.ajax({
		url: paramUrl.deleteUser,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
/*
function updateRankAplicacio(params){
	var xhr = jQuery.ajax({
		url: paramUrl.updateRankAplicacio,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
});
runningActions.push(xhr);
return xhr.promise();
}
*/
function buffer(params){
	var xhr = jQuery.ajax({
		url: paramUrl.buffer,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function centroid(params){
	var xhr = jQuery.ajax({
		url: paramUrl.centroid,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function intersection(params){
	var xhr = jQuery.ajax({
		url: paramUrl.intersection,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function union(params){
	var xhr = jQuery.ajax({
		url: paramUrl.union,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function tag(params){
	var xhr = jQuery.ajax({
		url: paramUrl.tag,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function getVisualitzacioSimpleByBusinessId(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getVisualitzacioSimpleByBusinessId,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function filterVisualitzacio(data){
	var xhr = jQuery.ajax({
		url: paramUrl.filterVisualitzacio,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function registreInstamaper(data){
	var xhr = jQuery.ajax({
		url: paramUrl.signinInstamaper,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function crearFitxerPolling(params){
	var xhr = jQuery.ajax({
		url: paramUrl.crearFitxerPolling,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function resetClauMapa(data){
	var xhr = jQuery.ajax({
		url: paramUrl.resetClauMapa,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function loadPrivateMapByBusinessId(data){
	var xhr = jQuery.ajax({
		url: paramUrl.loadPrivateMapByBusinessId,
		method: 'post',
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function filter(params){
	var xhr = jQuery.ajax({
		url: paramUrl.filter,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function callActions(data){
	var xhr = jQuery.ajax({
		url: paramUrl.callActions,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function loadAplicacionsUser(){
	/*
	var xhr = jQuery.ajax({
		url: paramUrl.loadAplicacionsUser,
		method: 'get',
		dataType: 'json'
		complete: actionCompleted
});
runningActions.push(xhr);
return xhr.promise();
	*/
	var defer = jQuery.Deferred();
	defer.resolve(perfilConfig);
	return defer.promise();
}

function getUser(username){
	var xhr = jQuery.ajax({
		url: paramUrl.getUser,
		data: {uid : username},
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getConfiguradesUser(data){
	var xhr = jQuery.ajax({
		url: paramUrl.getConfiguradesUser,
		data: data,
		crossDomain: true,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function deleteAplicacionsGeolocal(url){
	var xhr = jQuery.ajax({
		url: url,
		crossDomain: true,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function createToken(data){
	var xhr = jQuery.ajax({
		url: paramUrl.createToken,
		data: data,
		method: 'post',
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function getValuesFromKeysProperty(params){
	var xhr = jQuery.ajax({
		url: paramUrl.getValuesFromKeysProperty,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function columnJoin(params){
	var xhr = jQuery.ajax({
		url: paramUrl.columnJoin,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

function spatialJoin(params){
	var xhr = jQuery.ajax({
		url: paramUrl.spatialJoin,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function searchCapesPubliques(params){
	var xhr = jQuery.ajax({
		url: paramUrl.searchCapesPubliques,
		data: params,
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function addServerDuplicateToMap(data){
	var xhr = jQuery.ajax({
		url: paramUrl.addServerDuplicateToMap,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function duplicateVisualitzacioLayer(data){
	var xhr = jQuery.ajax({
		url: paramUrl.duplicateVisualitzacioLayer,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function searchCatalegIdec(params){
	var xhr = jQuery.ajax({
		url: paramUrl.searchCatalegIdec,
		data: params,
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function addGeometriaToVisualitzacioTematic(params){
	var xhr = jQuery.ajax({
		url: paramUrl.addGeometriaToVisualitzacioTematic,
		data: params,
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function updateVisualitzacioLayer(params){
	var xhr = jQuery.ajax({
		url: paramUrl.updateVisualitzacioLayer,
		data: params,
  		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function searchCatalogInspire(params){
	var xhr = jQuery.ajax({
			url: paramUrl.urlgetInspireCatalog,
			data: params,
			traditional:true,
			dataType: 'jsonp',
			jsonp: 'json.wrf',
			complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function desbloquejarMapa(data){
	var xhr = jQuery.ajax({
		url: paramUrl.desbloquejarMapa,
		data: data,
		dataType: 'jsonp',
		complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}
function crearFitxerSocrata(data){
	var xhr = jQuery.ajax({
			url: paramUrl.crearFitxerSocrata,
			data: data,
			method: 'post',
			dataType: 'jsonp',			
			complete: actionCompleted
	});
	runningActions.push(xhr);
	return xhr.promise();
}

