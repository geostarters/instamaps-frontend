runningActions = [];

function actionCompleted(jqXHR, status) {
	//Remove the completed action from the running actions
	var index = runningActions.indexOf(jqXHR);
	runningActions.splice(index, 1);
}

function addXHR(jqXHR, settings) 
{

	runningActions.push(jqXHR);
  
}


function completedWithErrors(jqXHR, status, error)
{

	//console.log("!!!!!!!!!!!!!!!" + error.message + " stack: " + error.stack);

}

function createXHR(inOptions)
{

	var options = {
  		dataType: 'jsonp',
		complete: actionCompleted,
		beforeSend: addXHR,
		error: completedWithErrors
	};

	jQuery.extend(options, inOptions);

	var xhr = jQuery.ajax(options);
	return xhr.promise();

}

function loadPublicGaleria(params){
	return createXHR(
		{url: paramUrl.getAllPublicsMaps, 
		data: params
	});
}

function loadNumGaleria(){
	return createXHR({
		url: paramUrl.getNumGaleria
	});
}


function searchGaleriaMaps(params){
	return createXHR({
		url: paramUrl.searchGaleriaMaps, 
		data: params 
	});
}

function searchGaleriaMapsByUser(params){
	return createXHR({
		url: paramUrl.searchGaleriaMapsByUser, 
		data: params
	});
}

function deleteMap(data){
	return createXHR({
		url: paramUrl.deleteMap, 
		data: data,
		method: 'post'
	});
}

/* registre.html */

function registerUser(url, dataUrl){
	return createXHR({
		url: url, 
		data: dataUrl,
		method: 'post'
	});
}

function checkUsername(username){
	return createXHR({
		url: paramUrl.validateUsername, 
		data: {uid: username},
		method: 'post'
	});
}

function checkEmail(user_email){
	return createXHR({
		url: paramUrl.validateEmail, 
		data: {email: user_email},
		method: 'post'
	});
}

/* galeria.html */

//solo galeria privada de geolocal para obtener las aplicaciones
function getUserData(username){
	return createXHR({
		url: paramUrl.getUserSimple, 
		data: {uid : username},
		async: false,
		method: 'post'
	});
}

/* comuns */
function doLogout(){
	return createXHR({
		url: paramUrl.logoutUser, 
		async: false,
		method: 'post'
	});
}

/* sessio.html */

function doLogin(data){
	return createXHR({
		url: paramUrl.loginUser, 
		data: data,
		async: false,
		method: 'post'
	});
}

function doLoginIcgc(data){
	return createXHR({
		url: paramUrl.loginUserIcgc, 
		data: data,
		async: false,
		method: 'post'
	});
}

function loginToken(data){
	return createXHR({
		url: paramUrl.loginToken, 
		data: data,
		async: false,
		method: 'post'
	});
}

/* map */
function createTematicLayerFeature(data){
	return createXHR({
		url: paramUrl.createTematicLayerFeature, 
		data: data,
		async: false,
		method: 'post'
	});
}

function addFeatureToTematic(data){
	return createXHR({
		url: paramUrl.addFeatureToTematic, 
		data: data
	});
}

function getTematicLayerByBusinessId(data){
	return createXHR({
		url: paramUrl.getTematicLayerByBusinessId, 
		data: data
	});
}

function getCacheVisualitzacioLayerByBusinessId(data){
	return createXHR({
		url: paramUrl.getCacheVisualitzacioLayerByBusinessId, 
		data: data
	});
}

function createFeature(data){
	return createXHR({
		url: paramUrl.createFeature, 
		data: data
	});
}

function createData(data){
	return createXHR({
		url: paramUrl.createData, 
		data: data
	});
}

function createRang(data){
	return createXHR({
		url: paramUrl.createRang, 
		data: data
	});
}

function getLListaDadesObertes(){
	return createXHR({
		url: paramUrl.dadesObertes, 
		data: {metode: 'getDatasets'},
		async: false,
		method: 'post'
	});
}

function getMapByBusinessId(data){
	return createXHR({
		url: paramUrl.getMapByBusinessId, 
		data: data
	});
}

function getCacheMapByBusinessId(data){
	return createXHR({
		url: paramUrl.getCacheMapByBusinessId, 
		data: data
	});
}

function updateMap(data){
	return createXHR({
		url: paramUrl.updateMap, 
		data: data,
		method: 'post'
	});
}

function updateMapOptions(data){
	return createXHR({
		url: paramUrl.updateMapOptions, 
		data: data,
		method: 'post'
	});
}

function createMap(data){
	return createXHR({
		url: paramUrl.createMap, 
		data: data
	});
}

function getAllServidorsWMSByUser(data){
	return createXHR({
		url: paramUrl.getAllServidorsWMSByUser, 
		data: data,
		method: 'post'
	});
}

function addServerToMap(data){
	return createXHR({
		url: paramUrl.addServerToMap, 
		data: data
	});
}

function getAllTematicLayerByUid(data){
	return createXHR({
		url: paramUrl.getAllTematicLayerByUid, 
		data: data
	});
}

function deleteTematicLayerAll(data){
	return createXHR({
		url: paramUrl.deleteTematicLayerAll, 
		data: data
	});
}

function doUpdateMap(data){
	return createXHR({
		url: paramUrl.updateMap, 
		data: data
	});
}

function updateServersOrderToMap(data){
	return createXHR({
		url: paramUrl.updateServersOrderToMap, 
		data: data
	});
}


function updateServerOrderToMap(data){
	return createXHR({
		url: paramUrl.updateServerOrderToMap, 
		data: data
	});
}

function updateMapName(data){
	return createXHR({
		url: paramUrl.updateMapName, 
		data: data
	});
}

function getTwitterLayer(data){
	return createXHR({
		url: paramUrl.getTwitterLayer, 
		data: data
	});
}

function removeServerToMap(data){
	return createXHR({
		url: paramUrl.removeServerToMap, 
		data: data
	});
}

function deleteServerRemoved(data){
	return createXHR({
		url: paramUrl.deleteServerRemoved, 
		data: data
	});
}

function updateServidorWMSName(data){
	return createXHR({
		url: paramUrl.updateServidorWMSName, 
		data: data
	});
}


function updateServidorWMSOptions(data){
	return createXHR({
		url: paramUrl.updateServidorWMSOptions, 
		data: data,
		method: 'post'
	});
}

function updateServidorWMSGroup(data){
	return createXHR({
		url: paramUrl.updateServidorWMSGroup, 
		data: data,
		method: 'post'
	});
}

function updateServidorWMSOpacity(data){
	return createXHR({
		url: paramUrl.updateServidorWMSOpacity, 
		data: data
	});
}



function addServerToMap(data){
	return createXHR({
		url: paramUrl.addServerToMap, 
		data: data
	});
}

function createServidorInMap(data){
	return createXHR({
		url: paramUrl.createServidorInMap, 
		data: data,
		method: 'post'
	});
}

function getWikipediaLayer(data){
	return createXHR({
		url: paramUrl.getWikipediaLayer, 
		data: data
	});
}

function shortUrl(url){
	return createXHR({
		url: paramUrl.shortUrl, 
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		method: 'post',
		data: JSON.stringify({longUrl: url}),
	});
}

function doReadFile(data){
	return createXHR({
		url: paramUrl.readFile, 
		data: data
	});
}

function doUploadFile(data){
	return createXHR({
		url: paramUrl.uploadFile2, 
		data: data
	});
}

function getDownloadLayer(data){
	return createXHR({
		url: paramUrl.download_layer, 
		data: data,
		method: 'post',
		dataType: 'html'
	});
}

function deleteServidorWMS(data){
	return createXHR({
		url: paramUrl.deleteServidorWMS, 
		data: data
	});
}

function createTematicLayerEmpty(data){
	return createXHR({
		url: paramUrl.createTematicLayerEmpty, 
		data: data, 
		async: false,
		method: 'post'
	});
}

function moveFeatureToTematic(data){
	return createXHR({
		url: paramUrl.moveFeatureToTematic, 
		data: data,
		method: 'post'
	});
}

function deleteFeature(data){
	return createXHR({
		url: paramUrl.deleteFeature, 
		data: data,
		method: 'post'
	});
}

function updateFeature(data){
	return createXHR({
		url: paramUrl.updateFeature, 
		data: data,
		method: 'post'
	});
}

function updateTematicRangs(data){
	return createXHR({
		url: paramUrl.updateTematicRangs, 
		data: data,
		method: 'post',
		dataType: ''
	});
}

function createRandomUser(data){
	return createXHR({
		url: paramUrl.createRandomUser
	});
}

function deleteRandomUser(data){
	return createXHR({
		url: paramUrl.deleteRandomUser, 
		data: data
	});
}

function getJSONPServei(url){
	return createXHR({
		url: paramUrl.json2jsonp, 
		data: { url: url},
		async: false,
		method: 'post'
	});
}

function updateServidorWMS(data){
	return createXHR({
		url: paramUrl.updateServidorWMS, 
		data: data
	});
}

function duplicateTematicLayer(data){
	return createXHR({
		url: paramUrl.duplicateTematicLayer, 
		data: data,
		method: 'post',
		dataType: ''
	});
}

function reminderMail(data){
	return createXHR({
		url: paramUrl.reminderMail, 
		data: data
	});
}

function renewPassword(data){
	return createXHR({
		url: paramUrl.renewPassword, 
		data: data
	});
}

function getNumEntitatsActives(){
	return createXHR({
		url: paramUrl.getNumEntitatsActives
	});
}

function getNumMapes(){
	return createXHR({
		url: paramUrl.getNumMapes
	});
}

function getNumCapes(){
	return createXHR({
		url: paramUrl.getNumCapes
	});
}

function publicarCapesMapa(data){
	return createXHR({
		url: paramUrl.publicarCapesMapa, 
		data: data, 
		method: 'post',
		dataType: ''
	});
}

function publicarMapConfig(data){
	return createXHR({
		url: paramUrl.publicarMapConfig, 
		data: data, 
		method: 'post',
		dataType: ''
	});
}

function getUrlFile(data){
	return createXHR({
		url: paramUrl.urlFile, 
		data: data, 
		async: false,
		method: 'post'
	});
}

function deleteUser(data){
	return createXHR({
		url: paramUrl.deleteUser, 
		data: data
	});
}

function getUrlFileProves(data){
	return createXHR({
		url: paramUrl.urlFileProves, 
		data: data,
		async: false, 
		method: 'post'
	});
}

function getUrlFileNoDin(data){
	return createXHR({
		url: paramUrl.urlFileNoDin, 
		data: data,
		async: false, 
		method: 'post'
	});
}

function getUrlFileDin(data){
	return createXHR({
		url: paramUrl.urlFileDin, 
		data: data,
		async: false, 
		method: 'post'
	});
}

function getUserSimple(data){
	return createXHR({
		url: paramUrl.getUserSimple, 
		data: data
	});
}

function uploadImageBase64(data){
	return createXHR({
		url: paramUrl.urluploadBase64, 
		data: data,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		method: 'post'
	});
}

function createGeoPdfMap(data){
	return createXHR({
		url: paramUrl.urlgetMapImage, 
		data: data,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		method: 'post'
	});
}	

function createMapToWMS(data){
	return createXHR({
		url: paramUrl.urlMapToWMS, 
		data: data,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		method: 'post'
	});
}	

function deleteImageGaleria(data){
	return createXHR({
		url: paramUrl.urlgetMapImage, 
		data: data
	});
}

function updatePasswordIcgc(data){
	return createXHR({
		url: paramUrl.updatePasswordIcgc, 
		data: data, 
		async: false,
		method: 'post'
	});
}

function createVisualitzacioLayer(data){
	return createXHR({
		url: paramUrl.createVisualitzacioLayer, 
		data: data,
		method: 'post'
	});
}

function addGeometriaToVisualitzacio(data){
	return createXHR({
		url: paramUrl.addGeometriaToVisualitzacio, 
		data: data,
		method: 'post'
	});
}

function moveGeometriaToVisualitzacio(data){
	return createXHR({
		url: paramUrl.moveGeometriaToVisualitzacio, 
		data: data,
		method: 'post'
	});
}

function updateGeometria(data){
	return createXHR({
		url: paramUrl.updateGeometria, 
		data: data,
		method: 'post'
	});
}

function modificarEstiloGeometria(data){
	return createXHR({
		url: paramUrl.modificarEstiloGeometria, 
		data: data,
		method: 'post'
	});
}

function removeGeometriaFromVisualitzacio(data){
	return createXHR({
		url: paramUrl.removeGeometriaFromVisualitzacio, 
		data: data,
		method: 'post'
	});
}

function updateNameVisualitzacioLayer(data){
	return createXHR({
		url: paramUrl.updateNameVisualitzacioLayer, 
		data: data,
		method: 'post'
	});
}

function deleteVisualitzacioLayer(data){
	return createXHR({
		url: paramUrl.deleteVisualitzacioLayer, 
		data: data,
		method: 'post'
	});
}

function getVisualitzacioByBusinessId(data){
	return createXHR({
		url: paramUrl.getVisualitzacioByBusinessId, 
		data: data
	});
}

function createVisualitzacioSimple(data){
	return createXHR({
		url: paramUrl.createVisualitzacioSimple, 
		data: data
	});
}

function createVisualitzacioTematica(data){
	return createXHR({
		url: paramUrl.createVisualitzacioTematica, 
		data: data,
		method: 'post'
	});
}

function createVisualitzacioHeatCluster(data){
	return createXHR({
		url: paramUrl.createVisualitzacioHeatCluster, 
		data: data
	});
}

function getGeometriesColleccioByBusinessId(data){
	return createXHR({
		url: paramUrl.getGeometriesColleccioByBusinessId, 
		data: data
	});
}

function getGeometriesPropertiesLayer(data){
	return createXHR({
		url: paramUrl.getGeometriesPropertiesLayer, 
		data: data
	});
}

function removeGeometriaFromProperties(data){
	return createXHR({
		url: paramUrl.removeGeometriaFromProperties, 
		data: data
	});
}

function updateGeometriaProperties(data){
	return createXHR({
		url: paramUrl.updateGeometriaProperties, 
		data: data
	});
}

function addNewProperties(data){
	return createXHR({
		url: paramUrl.addNewProperties, 
		data: data
	});
}

function updateMapVisibility(data){
	return createXHR({
		url: paramUrl.updateMapVisibility, 
		data: data,
		method: 'post'
	});
}

function sendMail(data){
	return createXHR({
		url: paramUrl.sendMail, 
		data: data,
		method: 'post'
	});
}
function loadMapsColaboracio(params){
	return createXHR({
		url: paramUrl.getEntitatsAplicacioRolByUidColaborador, 
		data: params,
		method: 'post'
	});
}
function getEntitatsColaboradorsByAplicacio(params){
	return createXHR({
		url: paramUrl.getEntitatsColaboradorsByAplicacio, 
		data: params,
		method: 'post'
	});
}
function getConvidatsByBusinessId(params){
	return createXHR({
		url: paramUrl.getConvidatsByBusinessId, 
		data: params,
		method: 'post'
	});
}
function deleteConvidatByBusinessId(params){
	return createXHR({
		url: paramUrl.deleteConvidatByBusinessId, 
		data: params,
		method: 'post'
	});
}
function deleteUser(params){
	return createXHR({
		url: paramUrl.deleteUser, 
		data: params,
		method: 'post'
	});
}

function buffer(params){
	return createXHR({
		url: paramUrl.buffer, 
		data: params,
		method: 'post'
	});
}
function centroid(params){
	return createXHR({
		url: paramUrl.centroid, 
		data: params,
		method: 'post'
	});
}
function intersection(params){
	return createXHR({
		url: paramUrl.intersection, 
		data: params,
		method: 'post'
	});
}
function union(params){
	return createXHR({
		url: paramUrl.union, 
		data: params,
		method: 'post'
	});
}
function tag(params){
	return createXHR({
		url: paramUrl.tag, 
		data: params,
		method: 'post'
	});
}
function getVisualitzacioSimpleByBusinessId(data){
	return createXHR({
		url: paramUrl.getVisualitzacioSimpleByBusinessId, 
		data: data
	});
}

function filterVisualitzacio(data){
	return createXHR({
		url: paramUrl.filterVisualitzacio, 
		data: data
	});
}

function registreInstamaper(data){
	return createXHR({
		url: paramUrl.signinInstamaper, 
		data: data
	});
}
function crearFitxerPolling(params){
	return createXHR({
		url: paramUrl.crearFitxerPolling, 
		data: params,
		method: 'post'
	});
}
function resetClauMapa(data){
	return createXHR({
		url: paramUrl.resetClauMapa, 
		data: data
	});
}

function loadPrivateMapByBusinessId(data){
	return createXHR({
		url: paramUrl.loadPrivateMapByBusinessId, 
		data: data,
		method: 'post'
	});
}
function filter(params){
	return createXHR({
		url: paramUrl.filter, 
		data: params,
		method: 'post'
	});
}

function callActions(data){
	return createXHR({
		url: paramUrl.callActions, 
		data: data,
		async: false,
		method: 'post'
	});
}

function loadAplicacionsUser(){
	var defer = jQuery.Deferred();
	defer.resolve(perfilConfig);
	return defer.promise();
}

function getUser(username){
	return createXHR({
		url: paramUrl.getUser, 
		data: {uid : username},
		method: 'post'
	});
}

function getConfiguradesUser(data){
	var url_config = paramUrl.getConfiguradesUser + jQuery.param(data);
	var urlProxy=HOST_APP3+paramUrl.proxy_betterWMS + "?url="+ encodeURIComponent(url_config);
	urlProxy = httpOrhttps(urlProxy,false);
	return createXHR({
		url: urlProxy, 
		crossDomain: true,
		dataType: 'json',
		method: 'get'
	});
}

function deleteAplicacionsGeolocal(url){
	return createXHR({
		url: url, 
		crossDomain: true,
		method: 'post'
	});
}

function createToken(data){
	return createXHR({
		url: paramUrl.createToken, 
		data: data,
		method: 'post'
	});
}

function getValuesFromKeysProperty(params){
	return createXHR({
		url: paramUrl.getValuesFromKeysProperty, 
		data: params,
		method: 'post'
	});
}

function columnJoin(params){
	return createXHR({
		url: paramUrl.columnJoin, 
		data: params,
		method: 'post'
	});
}

function spatialJoin(params){
	return createXHR({
		url: paramUrl.spatialJoin, 
		data: params,
		method: 'post'
	});
}
function searchCapesPubliques(params){
	return createXHR({
		url: paramUrl.searchCapesPubliques, 
		data: params
	});
}
function addServerDuplicateToMap(data){
	return createXHR({
		url: paramUrl.addServerDuplicateToMap, 
		data: data
	});
}
function duplicateVisualitzacioLayer(data){
	return createXHR({
		url: paramUrl.duplicateVisualitzacioLayer, 
		data: data
	});
}
function searchCatalegIdec(params){
	return createXHR({
		url: paramUrl.searchCatalegIdec, 
		data: params
	});
}
function addGeometriaToVisualitzacioTematic(params){
	return createXHR({
		url: paramUrl.addGeometriaToVisualitzacioTematic, 
		data: params
	});
}
function updateVisualitzacioLayer(params){
	return createXHR({
		url: paramUrl.updateVisualitzacioLayer, 
		data: params
	});
}
function searchCatalogInspire(params){
	return createXHR({
		url: paramUrl.urlgetInspireCatalog, 
		data: params,
		traditional: true,
		jsonp: 'json.wrf'
	});
}
function desbloquejarMapa(data){
	return createXHR({
		url: paramUrl.desbloquejarMapa, 
		data: data
	});
}
function crearFitxerSocrata(data){
	return createXHR({
		url: paramUrl.crearFitxerSocrata, 
		data: data,
		method: 'post'
	});
}

function generateTokenRemember(data){
	return createXHR({
		url: paramUrl.generateTokenRemember, 
		data: data,
		method: 'post'
	});
}

function getCurrentVersion(){
	return createXHR({
		url: paramUrl.getCurrentVersion, 
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		method: 'get'
	});
}

function replaceVisorFileByBusinessid(data){
	return createXHR({
		url: paramUrl.replaceVisorFileByBusinessid, 
		data: data,
		method: 'post'
	});
}
