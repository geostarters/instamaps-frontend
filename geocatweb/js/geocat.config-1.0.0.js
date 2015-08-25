var HOST_APP = "http://www.instamaps.cat/";
var GEOCAT02 = "http://www.instamaps.cat";
var proxydir = "maps";
var tmpdir = "/opt/geocat/maps/tmp/";

var urlApp=document.location.href;
if((urlApp.indexOf('localhost')!=-1)||(urlApp.indexOf('.local')!=-1)){
//	HOST_APP = "http://172.70.1.12/";
//	HOST_APP = "http://localhost:8080/";
	HOST_APP = "http://localhost/";//Local Jess
//	HOST_APP = "http://localhost/";//Local Jess
//	GEOCAT02 = "http://localhost:8181";
	GEOCAT02 = "http://localhost";
	proxydir="maps"; //he creat un director maps al meu Apache
	tmpdir="E://temp//";
}

var DOMINI = "www.instamaps.cat";
if(urlApp.indexOf('172.70.1.11')!=-1){
	HOST_APP = "http://172.70.1.11/";
//	HOST_APP = "http://localhost:8080/";
	GEOCAT02 = "http://172.70.1.11";
	proxydir="maps"; //he creat un director maps al meu Apache
}

var DOMINI = "www.instamaps.cat";

var paramUrl = {
	proxy:"/"+proxydir+"/proxy.cgi",
	uploadproxy:"/"+proxydir+"/upload.cgi",
	proxy_download:"/"+proxydir+"/download.cgi",
	proxy_betterWMS:"/"+proxydir+"/proxy_betterWMS.cgi",
	mainPage:"/index.html",
	loginPage:"/geocatweb/sessio.html",
	mapaPage:"/geocatweb/mapa.html",
	visorPage:"/geocatweb/visor.html",
	visorCloudifier:"/geocatweb/visor_cloudifier.html",
	registrePage:"/geocatweb/registre.html",
	galeriaPage:"/geocatweb/galeria.html",
	perfilPage:"/geocatweb/perfil.html",
	oblidatPage:"/geocatweb/oblidat.html",
	comentarisPage:"http://betaportal.icgc.cat",
	wmsOpenData:"/dadesobertes/wms/service?",
	tmsOpenData:"/geocatcache/?",
	getAllMapsByUser: HOST_APP+"geocat/aplications/map/getAllMapsByUser.action?",
	//getAllPublicsMaps: HOST_APP+"geocat/aplications/map/getAllPublicsMaps.action?",
	getAllPublicsMaps: HOST_APP+"geocat/aplications/map/getAllGaleriaMaps.action?",
	getNumGaleria: HOST_APP+"geocat/aplications/map/getNumGaleria.action?",
	deleteMap: HOST_APP+"geocat/aplications/map/deleteMap.action?",
	loginUser: HOST_APP+"geocat/login.action?",
	loginUserIcgc: HOST_APP+"geocat/loginIcgc.action?",
	logoutUser: HOST_APP+"geocat/logout.action?",
	signinUser: HOST_APP+"geocat/registreUser.action?",
	signinSocial: HOST_APP+"geocat/social/createUser.action?",
	socialAuth: HOST_APP+"geocat/social/auth.action?",
	validateUsername: HOST_APP+"geocat/validateUid?",
	validateEmail: HOST_APP+"geocat/validateEmail?",
	getUser: HOST_APP+"geocat/user/getUser.action?",
	updateUser: HOST_APP+"geocat/user/updateUser.action?",
	deleteUser: HOST_APP+"geocat/user/deleteUser.action?",
	updatePassword: HOST_APP+"geocat/user/updatePassword.action?",
	createTematicLayerFeature: HOST_APP+"geocat/layers/tematic/createTematicLayerFeature.action?",
	dragFile: HOST_APP+"share/jsp/upload.jsp?",
	createRang: HOST_APP+"geocat/layers/tematic/createRang.action?",
	createData: HOST_APP+"geocat/layers/data/createData.action?",
	createFeature: HOST_APP+"geocat/layers/feature/createFeature.action?",
	getTematicLayerByBusinessId:HOST_APP+"geocat/layers/tematic/getTematicLayerByBusinessId.action?",
	getCacheVisualitzacioLayerByBusinessId: HOST_APP+"geocat/layers/visualitzacio/getCacheVisualitzacioLayerByBusinessId.action?",
	dadesObertes:GEOCAT02+"/share/jsp/dadesObertes.jsp?",
	urlFile:GEOCAT02+"/share/jsp/urlFile.jsp?",
	urlFileProves:GEOCAT02+"/share/jsp/urlFileProves.jsp?",
	//getMapById: HOST_APP+"geocat/aplications/map/getMapById.action?",
	getMapByBusinessId: HOST_APP+"geocat/aplications/map/getMapByBusinessId.action?",
	updateMap: HOST_APP+"geocat/aplications/map/updateMap.action?",
	createMap: HOST_APP+"geocat/aplications/map/createMap.action?",
	getAllServidorsWMSByUser: HOST_APP+"geocat/layers/servidor/wms/getAllServidorsWMSByUser.action?",
	addServerToMap: HOST_APP+"geocat/aplications/map/addServerToMap.action?",
	getAllTematicLayerByUid: HOST_APP+"geocat/layers/tematic/getAllTematicLayerByUid.action?",
	deleteTematicLayerAll: HOST_APP+"geocat/layers/tematic/deleteTematicLayerAll.action?",
	updateMap: HOST_APP+"geocat/aplications/map/updateMap.action?",
	getTwitterLayer: HOST_APP+"geocat/layers/getTwitterLayer.action?",
	updateServersOrderToMap: HOST_APP+"geocat/aplications/map/updateServersOrderToMap.action?",
	updateMapName: HOST_APP+"geocat/aplications/map/updateMapName.action?",
	removeServerToMap: HOST_APP+"geocat/aplications/map/removeServerToMap.action?",
	deleteServerRemoved: HOST_APP+"geocat/aplications/map/deleteServerRemoved.action?",
	updateServidorWMSName: HOST_APP+"geocat/layers/servidor/wms/updateServidorWMSName.action?",
	addServerToMap: HOST_APP+"geocat/aplications/map/addServerToMap.action?",
	createServidorInMap: HOST_APP+"geocat/layers/servidor/wms/createServidorInMap.action?",
	readFile: HOST_APP+"geocat/upload/readFile.action?",
	uploadFile:  HOST_APP+"geocat/upload/uploadFile.action?",
	urlGeoCoder:"http://www.icc.cat/geocodificador/json?maxresultats=10&obtenirCoordGeografiques=si&metode=localitzaToponim&ordre=alfabetic&trobaTots=no&nom={s}&",
	ows2json:GEOCAT02+"/share/jsp/ows2json.jsp?",
	json2jsonp:HOST_APP+"share/jsp/json2jsonp.jsp?",
	getDownloadLayer:GEOCAT02+"/share/jsp/download_layer.jsp?",
	deleteServidorWMS: HOST_APP+"geocat/layers/servidor/wms/deleteServidorWMS.action?",
	addFeatureToTematic: HOST_APP+"geocat/layers/tematic/addFeatureToTematic.action?",
	createTematicLayerEmpty: HOST_APP+"geocat/layers/tematic/createTematicLayerEmpty.action?",
	moveFeatureToTematic: HOST_APP+"geocat/layers/tematic/moveFeatureToTematic.action?",
	deleteFeature: HOST_APP+"geocat/layers/feature/deleteFeature.action?",
	updateFeature: HOST_APP+"geocat/layers/feature/updateFeature.action?",
	shortUrl : "http://api.bit.ly/v3/shorten",
	getWikipediaLayer: "http://api.geonames.org/wikipediaBoundingBoxJSON?",
	updateTematicRangs: HOST_APP+"geocat/layers/tematic/updateTematicRangs.action",
	createRandomUser: HOST_APP+"geocat/createRandomUser.action?",
	updateServidorWMS: HOST_APP+"geocat/layers/servidor/wms/updateServidorWMS.action?",
	deleteRandomUser: HOST_APP+"geocat/deleteRandomUser.action?",
	duplicateTematicLayer: HOST_APP+"geocat/layers/tematic/duplicateTematicLayer.action?",
	reminderMail: HOST_APP+"geocat/user/reminderMail.action?",
	renewPassword: HOST_APP+"geocat/user/renewPassword.action?",
	getNumEntitatsActives: HOST_APP+"geocat/stats/getNumEntitatsActives.action?",
	getNumMapes: HOST_APP+"geocat/stats/getNumMapes.action?",
	getNumCapes: HOST_APP+"geocat/stats/getNumCapes.action?",
	download_layer: HOST_APP+"share/jsp/download_layer.jsp?",
	upload_gdal: HOST_APP+"share/jsp/upload_gdal.jsp?",
	upload_gdal_nou: HOST_APP+"share/jsp/upload_gdal_nou.jsp?",
	upload_gdal_2015: HOST_APP+"share/jsp/upload_gdal_2015.jsp?",
	polling: HOST_APP+"share/jsp/polling.jsp?",	
	publicarCapesMapa: HOST_APP+"geocat/aplications/map/publicarCapesMapa.action?",
	presidentJSON: "http://www.president.cat/pres_gov/dades/president/actes-territori-ca.json",
	deleteUser: HOST_APP+"geocat/user/deleteUser.action?",
	getUserSimple: HOST_APP+"geocat/user/getUserSimple.action?",
	publicarMapConfig: HOST_APP+"geocat/aplications/map/publicarMapConfig.action?",
	getCacheMapByBusinessId: HOST_APP+"geocat/aplications/map/getCacheMapByBusinessId.action?",
	urluploadBase64:"/share/jsp/uploadBase64.jsp?",
	urlgetMapImage:"/share/jsp/getMapImage.jsp?",
	urlgetImageProxy:"/share/jsp/getImageProxy.jsp?",
	updatePasswordIcgc: HOST_APP+"geocat/user/updatePasswordIcgc.action?",
	signinUserIcgc: HOST_APP+"geocat/registreUserIcgc.action?",
	signinInstamaper: HOST_APP+"geocat/registreInstamaper.action?",
	updateMapVisibility: HOST_APP+"geocat/aplications/map/updateVisibility.action?",
	sendMail: HOST_APP+"geocat/mail/sendMail.action?",
	getEntitatsAplicacioRolByUidColaborador:  HOST_APP+"geocat/entitatAplicacio/getEntitatsAplicacioRolByUidColaborador.action?",
	getEntitatsColaboradorsByAplicacio:  HOST_APP+"geocat/entitatAplicacio/getAllEntitatsColaboradorsByAplicacio.action?",
	getConvidatsByBusinessId: HOST_APP+"geocat/aplications/map/getConvidatsByBusinessId.action?",
	deleteConvidatByBusinessId: HOST_APP+"geocat/aplications/map/deleteConvidatByBusinessId.action?",
	updateGeometria: HOST_APP+"geocat/layers/geometriesColleccio/updateGeometria.action?",
	createVisualitzacioLayer: HOST_APP+"geocat/layers/visualitzacio/createVisualitzacioLayer.action?",
	updateVisualitzacioLayer: HOST_APP+"geocat/layers/visualitzacio/updateVisualitzacioLayer.action?",
	updateNameVisualitzacioLayer: HOST_APP+"geocat/layers/visualitzacio/updateNameVisualitzacioLayer.action?",
	getVisualitzacioByBusinessId: HOST_APP+"geocat/layers/visualitzacio/getVisualitzacioByBusinessId.action?",
	getAllVisualitzacioByBusinessId: HOST_APP+"geocat/layers/visualitzacio/getAllVisualitzacioByBusinessId?",
	getAllVisualitzacioLayerByUid: HOST_APP+"geocat/layers/visualitzacio/getAllVisualitzacioLayerByUid.action?",
	addGeometriaToVisualitzacio: HOST_APP+"geocat/layers/visualitzacio/addGeometriaToVisualitzacio.action?",
	moveGeometriaToVisualitzacio: HOST_APP+"geocat/layers/visualitzacio/moveGeometriaToVisualitzacio.action?",
	duplicateVisualitzacioLayer: HOST_APP+"geocat/layers/visualitzacio/duplicateVisualitzacioLayer.action?",
	deleteVisualitzacioLayer: HOST_APP+"geocat/layers/visualitzacio/deleteVisualitzacioLayer.action?",
	deleteVisualitzacioLayerAll: HOST_APP+"geocat/layers/visualitzacio/deleteVisualitzacioLayerAll.action?",
	createEstil: HOST_APP+"geocat/layers/visualitzacio/createEstil.action?",
	updateEstil: HOST_APP+"geocat/layers/visualitzacio/updateEstil.action?",
	deleteEstil: HOST_APP+"geocat/layers/visualitzacio/deleteEstil.action?",
	addGeometriaToEstil: HOST_APP+"geocat/layers/visualitzacio/addGeometriaToEstil.action?",
	removeGeometriaToEstil: HOST_APP+"geocat/layers/visualitzacio/removeGeometriaToEstil.action?",
	moveGeometriaToEstil: HOST_APP+"geocat/layers/visualitzacio/moveGeometriaToEstil.action?",
	modificarEstiloGeometria: HOST_APP+"geocat/layers/visualitzacio/modificarEstiloGeometria.action?",
	removeGeometriaFromVisualitzacio: HOST_APP+"geocat/layers/visualitzacio/removeGeometriaFromVisualitzacio.action?",
	createVisualitzacioSimple: HOST_APP+"geocat/layers/visualitzacio/createVisualitzacioSimple.action?",
	createVisualitzacioTematica: HOST_APP+"geocat/layers/visualitzacio/createVisualitzacioTematica.action?",
	createVisualitzacioHeatCluster: HOST_APP+"geocat/layers/visualitzacio/createVisualitzacioHeatCluster.action?",
	getGeometriesColleccioByBusinessId: HOST_APP+"geocat/layers/visualitzacio/getGeometriesColleccioByBusinessId.action?",
	getGeometriesPropertiesLayer: HOST_APP+"geocat/layers/visualitzacio/getGeometriesPropertiesLayer.action?",
	removeGeometriaFromProperties: HOST_APP+"geocat/layers/visualitzacio/removeGeometriaFromProperties.action?",
	updateGeometriaProperties: HOST_APP+"geocat/layers/geometriesColleccio/updateGeometriaProperties.action?",
	updateRankAplicacio: HOST_APP+"geocat/aplications/map/updateRankAplicacio.action?",
	createMapFile:  HOST_APP+"geocat/layers/visualitzacio/createMapFile.action?",
	searchAction: HOST_APP+"geocat/aplications/map/search.action?",
	buffer: HOST_APP+"geocat/aplications/map/buffer.action?",
	centroid: HOST_APP+"geocat/aplications/map/centroid.action?",
	intersection: HOST_APP+"geocat/aplications/map/intersection.action?",
	union: HOST_APP+"geocat/aplications/map/union.action?",
	tag: HOST_APP+"geocat/aplications/map/tag.action?",
	getVisualitzacioSimpleByBusinessId: HOST_APP+"geocat/layers/visualitzacio/getVisualitzacioSimpleByBusinessId.action?",
	filterVisualitzacio: HOST_APP+"geocat/layers/visualitzacio/filterVisualitzacio.action?",
	crearFitxerPolling: HOST_APP +"geocat/aplications/map/crearFitxerPolling.action?"
}

$( document ).ajaxSend(function( event, jqxhr, settings ) {
	//$('.waiting_animation').show();
	if (typeof map !== 'undefined'){
		try {map.spin(true);} catch (Err) {}
		
	}
});

$( document ).ajaxComplete(function( event, jqxhr, settings ) {
	if (typeof map !== 'undefined'){
		try {map.spin(false);} catch (Err) {console.error(Err);}
	}
	if (jqxhr.responseJSON){
		if (jqxhr.responseJSON.status == "ERROR" && jqxhr.responseJSON.results == "expired"){
			sessionExpired();
		}
	}
});

$( document ).ajaxStop(function() {
	//$('.waiting_animation').hide();
	if (typeof map !== 'undefined'){
		try {map.spin(false);} catch (Err) {console.error(Err);}
	}
	setTimeout(function(){
		try {map.spin(false);} catch (Err) {console.error(Err);}
	},10000);
});

