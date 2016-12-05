

function loadPublicGaleria(params){
	return jQuery.ajax({
		url: paramUrl.getAllPublicsMaps,
		data: params,
  		dataType: 'jsonp'
	}).promise();
}

function loadNumGaleria(){
	return jQuery.ajax({
		url: paramUrl.getNumGaleria,
		dataType: 'jsonp'
	}).promise();
}


function searchGaleriaMaps(params){
	return jQuery.ajax({
		url: paramUrl.searchGaleriaMaps,
		data: params,
  		dataType: 'jsonp'
	}).promise();
}

function searchGaleriaMapsByUser(params){
	return jQuery.ajax({
		url: paramUrl.searchGaleriaMapsByUser,
		data: params,
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

/* galeria.html */

//solo galeria privada de geolocal para obtener las aplicaciones
function getUserData(username){
	return jQuery.ajax({
		url: paramUrl.getUserSimple,
		data: {uid : username},
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

function doLogin(data){
	return jQuery.ajax({
		url: paramUrl.loginUser,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function doLoginIcgc(data){
	return jQuery.ajax({
		url: paramUrl.loginUserIcgc,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function loginToken(data){
	return jQuery.ajax({
		url: paramUrl.loginToken,
		data: data,
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

function getCacheVisualitzacioLayerByBusinessId(data){
	return $.ajax({
		url: paramUrl.getCacheVisualitzacioLayerByBusinessId,
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
		url: paramUrl.getMapByBusinessId,
		//url: paramUrl.getMapById,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getCacheMapByBusinessId(data){
	return jQuery.ajax({
		url: paramUrl.getCacheMapByBusinessId,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

/*//Local
function updateMap(data){
	return jQuery.ajax({
		url: paramUrl.updateMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}*/

function updateMap(data){
	return jQuery.ajax({
//		url: paramUrl.proxy + "?url=" + paramUrl.updateMap + "&uid="+data.uid,
		url: paramUrl.updateMap,
		data: data,
		method: 'POST'
//		dataType: 'jsonp'
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
		method: 'POST'
//		dataType: 'jsonp'
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


function updateServerOrderToMap(data){
	return jQuery.ajax({
		url: paramUrl.updateServerOrderToMap,
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

function deleteServerRemoved(data){
	return jQuery.ajax({
		url: paramUrl.deleteServerRemoved,
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


function updateServidorWMSOptions(data){
	return jQuery.ajax({
		url: paramUrl.updateServidorWMSOptions,
		data: data,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateServidorWMSGroup(data){
	return jQuery.ajax({
		url: paramUrl.updateServidorWMSGroup,
		data: data,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function updateServidorWMSOpacity(data){
	return jQuery.ajax({
		url: paramUrl.updateServidorWMSOpacity,
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
		method: 'post',
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
        contentType: "application/json; charset=utf-8",
        method: 'POST',
        data: JSON.stringify({longUrl: url}),
        dataType: 'json'
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
		//url: paramUrl.proxy_download,
		url: paramUrl.download_layer,
		data: data,
		type: "POST"
//		dataType: 'html'
	}).promise();
}

function deleteServidorWMS(data){
	return jQuery.ajax({
		url: paramUrl.deleteServidorWMS,
		data: data,
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
    	//url: paramUrl.proxy + "?url=" + paramUrl.updateTematicRangs + "&uid="+data.uid,
        url: paramUrl.updateTematicRangs,
        data: data,
        method: 'post'
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

function duplicateTematicLayer(data){
	return jQuery.ajax({
		//url: paramUrl.proxy + "?url=" + paramUrl.duplicateTematicLayer + "&uid="+data.uid,
		url: paramUrl.duplicateTematicLayer,
		data: data,
		method: 'post'
	}).promise();
}

function reminderMail(data){
	return jQuery.ajax({
		url: paramUrl.reminderMail,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function renewPassword(data){
	return jQuery.ajax({
		url: paramUrl.renewPassword,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getNumEntitatsActives(){
	return jQuery.ajax({
		url: paramUrl.getNumEntitatsActives,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getNumMapes(){
	return jQuery.ajax({
		url: paramUrl.getNumMapes,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getNumCapes(){
	return jQuery.ajax({
		url: paramUrl.getNumCapes,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function publicarCapesMapa(data){
	return jQuery.ajax({
		url: paramUrl.publicarCapesMapa,
		data: data,
		method: 'post'
		//dataType: 'jsonp'
	}).promise();
}

function publicarMapConfig(data){
	return jQuery.ajax({
		url: paramUrl.publicarMapConfig,
		data: data,
		method: 'post'
	}).promise();
}

function getUrlFile(data){
	return jQuery.ajax({
		url: paramUrl.urlFile,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function deleteUser(data){
	return jQuery.ajax({
		url: paramUrl.deleteUser,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getUrlFileProves(data){
	return jQuery.ajax({
		url: paramUrl.urlFileProves,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function getUrlFileNoDin(data){
	return jQuery.ajax({
		url: paramUrl.urlFileNoDin,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function getUrlFileDin(data){
	return jQuery.ajax({
		url: paramUrl.urlFileDin,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function getUserSimple(data){
	return jQuery.ajax({
		url: paramUrl.getUserSimple,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function uploadImageBase64(data){
	return jQuery.ajax({
		url: paramUrl.urluploadBase64,		
		data: data,		
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		method: 'POST',
		dataType: 'json'
	}).promise();
}	


function createGeoPdfMap(data){
	return jQuery.ajax({
		url: paramUrl.urlgetMapImage,
		data: data,	
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		method: 'POST',
		dataType: 'json'
	}).promise();
}	



function createMapToWMS(data){
	return jQuery.ajax({
		url: paramUrl.urlMapToWMS,
		data: data,	
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		method: 'POST',
		dataType: 'json'
	}).promise();
}	



//esborra imatge galeria

function deleteImageGaleria(data){
	return jQuery.ajax({
		url: paramUrl.urlgetMapImage,
		data:data,
		dataType: 'jsonp'
	}).promise();
}





function updatePasswordIcgc(data){
	return jQuery.ajax({
		url: paramUrl.updatePasswordIcgc,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}


/*FUNCIONS NOU MODEL*/
function createVisualitzacioLayer(data){
	return jQuery.ajax({
		url: paramUrl.createVisualitzacioLayer,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function addGeometriaToVisualitzacio(data){
	return jQuery.ajax({
		url: paramUrl.addGeometriaToVisualitzacio,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function moveGeometriaToVisualitzacio(data){
	return jQuery.ajax({
		url: paramUrl.moveGeometriaToVisualitzacio,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function updateGeometria(data){
	return jQuery.ajax({
		url: paramUrl.updateGeometria,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function modificarEstiloGeometria(data){
	return jQuery.ajax({
		url: paramUrl.modificarEstiloGeometria,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function removeGeometriaFromVisualitzacio(data){
	return jQuery.ajax({
		url: paramUrl.removeGeometriaFromVisualitzacio,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function updateNameVisualitzacioLayer(data){
	return jQuery.ajax({
		url: paramUrl.updateNameVisualitzacioLayer,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function deleteVisualitzacioLayer(data){
	return jQuery.ajax({
		url: paramUrl.deleteVisualitzacioLayer,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function getVisualitzacioByBusinessId(data){
	return jQuery.ajax({
		url: paramUrl.getVisualitzacioByBusinessId,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function createVisualitzacioSimple(data){
	return jQuery.ajax({
		url: paramUrl.createVisualitzacioSimple,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function createVisualitzacioTematica(data){
	return jQuery.ajax({
		url: paramUrl.createVisualitzacioTematica,
		data: data,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function createVisualitzacioHeatCluster(data){
	return jQuery.ajax({
		url: paramUrl.createVisualitzacioHeatCluster,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function getGeometriesColleccioByBusinessId(data){
	return jQuery.ajax({
		url: paramUrl.getGeometriesColleccioByBusinessId,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

/*Data Table*/

function getGeometriesPropertiesLayer(data){
	return jQuery.ajax({
		url: paramUrl.getGeometriesPropertiesLayer,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function removeGeometriaFromProperties(data){
	return jQuery.ajax({
		url: paramUrl.removeGeometriaFromProperties,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function updateGeometriaProperties(data){
	return jQuery.ajax({
		url: paramUrl.updateGeometriaProperties,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

/* galeria.html */
function updateMapVisibility(data){
	return jQuery.ajax({
		url: paramUrl.updateMapVisibility,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}

function sendMail(data){
	return jQuery.ajax({
		url: paramUrl.sendMail,
		data: data,
		method: 'post',
        dataType: 'jsonp'
	}).promise();
}
function loadMapsColaboracio(params){
	return jQuery.ajax({
		url: paramUrl.getEntitatsAplicacioRolByUidColaborador,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function getEntitatsColaboradorsByAplicacio(params){
	return jQuery.ajax({
		url: paramUrl.getEntitatsColaboradorsByAplicacio,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function getConvidatsByBusinessId(params){
	return jQuery.ajax({
		url: paramUrl.getConvidatsByBusinessId,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function deleteConvidatByBusinessId(params){
	return jQuery.ajax({
		url: paramUrl.deleteConvidatByBusinessId,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function deleteUser(params){
	return jQuery.ajax({
		url: paramUrl.deleteUser,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
/*
function updateRankAplicacio(params){
	return jQuery.ajax({
		url: paramUrl.updateRankAplicacio,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
*/
function buffer(params){
	return jQuery.ajax({
		url: paramUrl.buffer,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function centroid(params){
	return jQuery.ajax({
		url: paramUrl.centroid,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function intersection(params){
	return jQuery.ajax({
		url: paramUrl.intersection,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function union(params){
	return jQuery.ajax({
		url: paramUrl.union,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function tag(params){
	return jQuery.ajax({
		url: paramUrl.tag,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function getVisualitzacioSimpleByBusinessId(data){
	return jQuery.ajax({
		url: paramUrl.getVisualitzacioSimpleByBusinessId,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function filterVisualitzacio(data){
	return jQuery.ajax({
		url: paramUrl.filterVisualitzacio,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function registreInstamaper(data){
	return jQuery.ajax({
		url: paramUrl.signinInstamaper,
		data: data,
		dataType: 'jsonp'
	}).promise();
}
function crearFitxerPolling(params){
	return jQuery.ajax({
		url: paramUrl.crearFitxerPolling,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function resetClauMapa(data){
	return jQuery.ajax({
		url: paramUrl.resetClauMapa,
		data: data,
		dataType: 'jsonp'
	}).promise();
}

function loadPrivateMapByBusinessId(data){
	return jQuery.ajax({
		url: paramUrl.loadPrivateMapByBusinessId,
		method: 'post',
		data: data,
		dataType: 'jsonp'
	}).promise();
}
function filter(params){
	return jQuery.ajax({
		url: paramUrl.filter,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}

function callActions(data){
	return jQuery.ajax({
		url: paramUrl.callActions,
		data: data,
		async: false,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function loadAplicacionsUser(){
	/*
	return jQuery.ajax({
		url: paramUrl.loadAplicacionsUser,
		method: 'get',
		dataType: 'json'
	}).promise();
	*/
	var defer = jQuery.Deferred();
	defer.resolve(perfilConfig);
	return defer.promise();
}

function getUser(username){
	return jQuery.ajax({
		url: paramUrl.getUser,
		data: {uid : username},
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function getConfiguradesUser(data){
	return jQuery.ajax({
		url: paramUrl.getConfiguradesUser,
		data: data,
		crossDomain: true,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function deleteAplicacionsGeolocal(url){
	return jQuery.ajax({
		url: url,
		crossDomain: true,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function createToken(data){
	return jQuery.ajax({
		url: paramUrl.createToken,
		data: data,
		method: 'post',
		dataType: 'jsonp'
	}).promise();
}

function getValuesFromKeysProperty(params){
	return jQuery.ajax({
		url: paramUrl.getValuesFromKeysProperty,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}

function columnJoin(params){
	return jQuery.ajax({
		url: paramUrl.columnJoin,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}

function spatialJoin(params){
	return jQuery.ajax({
		url: paramUrl.spatialJoin,
  		data: params,
  		method: 'post',
  		dataType: 'jsonp'
	}).promise();
}
function searchCapesPubliques(params){
	return jQuery.ajax({
		url: paramUrl.searchCapesPubliques,
		data: params,
  		dataType: 'jsonp'
	}).promise();
}
function addServerDuplicateToMap(data){
	return jQuery.ajax({
		url: paramUrl.addServerDuplicateToMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}
function duplicateVisualitzacioLayer(data){
	return jQuery.ajax({
		url: paramUrl.duplicateVisualitzacioLayer,
		data: data,
		dataType: 'jsonp'
	}).promise();
}
function searchCatalegIdec(params){
	return jQuery.ajax({
		url: paramUrl.searchCatalegIdec,
		data: params,
  		dataType: 'jsonp'
	}).promise();
}
function addGeometriaToVisualitzacioTematic(params){
	return jQuery.ajax({
		url: paramUrl.addGeometriaToVisualitzacioTematic,
		data: params,
  		dataType: 'jsonp'
	}).promise();
}
function updateVisualitzacioLayer(params){
	return jQuery.ajax({
		url: paramUrl.updateVisualitzacioLayer,
		data: params,
  		dataType: 'jsonp'
	}).promise();
}
function searchCatalogInspire(params){
	return jQuery.ajax({
			url: paramUrl.urlgetInspireCatalog,
			data: params,
			traditional:true,
			dataType: 'jsonp',
			jsonp: 'json.wrf'
		}).promise();
}
function desbloquejarMapa(data){
	return jQuery.ajax({
		url: paramUrl.desbloquejarMapa,
		data: data,
		dataType: 'jsonp'
	}).promise();
}
