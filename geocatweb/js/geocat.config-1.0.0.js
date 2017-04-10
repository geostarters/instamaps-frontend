var HOST_APP = "http://www.instamaps.cat/";
var GEOCAT02 = "http://www.instamaps.cat";
var HOST_APP2 = "http://www.instamaps.cat/";
var HOST_GEOLOCAL = "http://www.geolocal.cat/";
var proxydir = "maps";
var tmpdir = "/opt/geocat/maps/tmp/";
var tmpdirPolling = "poll/";
var renovarPassword = "/geocatweb/renovar.html?token=";

var urlApp=document.location.href;
if((urlApp.indexOf('localhost')!=-1)||(urlApp.indexOf('.local')!=-1)){
//	HOST_APP = "http://172.70.1.12/";
//	HOST_APP = "http://localhost:8080/";
//	HOST_APP = "http://nicosia.icgc.local/";//Local Jess
//	HOST_APP2 = "http://nicosia.icgc.local/";
	HOST_APP = "http://localhost/";//Local Jess
	HOST_APP2 = "http://localhost/";

//	HOST_APP = "http://localhost/";//Local Jess
//	GEOCAT02 = "http://localhost:8181";
	GEOCAT02 = "http://localhost";
	//GEOCAT02 = "http://localhost";
	http://172.70.1.11
	//HOST_GEOLOCAL = "http://localhost/";
	HOST_GEOLOCAL = "http://geolocaldev.icgc.local/";
	proxydir="maps"; //he creat un director maps al meu Apache
	//tmpdir="E://temp//";
}

var DOMINI = "www.instamaps.cat";
if(urlApp.indexOf('172.70.1.11')!=-1){
	HOST_APP = "http://172.70.1.11/";
	HOST_APP2 = "http://172.70.1.11/";
//	HOST_APP = "http://localhost:8080/";
	GEOCAT02 = "http://172.70.1.11";
	HOST_GEOLOCAL = "http://geolocaldev.icgc.local/";
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
	loginGeolocalPage:"/geocatweb/sessio_geolocal.html",
	mapaPage:"/geocatweb/mapa.html",
	visorPage:"/geocatweb/visor.html",
	instaVisorFolder:"instavisor/",
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
	searchGaleriaMaps: HOST_APP+"geocat/aplications/map/searchGaleriaMaps.action?",
	getNumGaleria: HOST_APP+"geocat/aplications/map/getNumGaleria.action?",
	loadPrivateMapByBusinessId: HOST_APP+"geocat/aplications/map/loadPrivateMapByBusinessId.action?",
	deleteMap: HOST_APP+"geocat/aplications/map/deleteMap.action?",
	resetClauMapa: HOST_APP+"geocat/aplications/map/resetClauMapa.action?",
	loginUser: HOST_APP+"geocat/login.action?",
	loginToken: HOST_APP+"geocat/loginToken.action?",
	loginUserIcgc: HOST_APP+"geocat/loginIcgc.action?",
	logoutUser: HOST_APP+"geocat/logout.action?",
	signinUser: HOST_APP+"geocat/registreUser.action?",
	signinSocial: HOST_APP+"geocat/social/createUser.action?",
	socialAuth: HOST_APP+"geocat/social/auth.action?",
	validateUsername: HOST_APP+"geocat/validateUid?",
	validateEmail: HOST_APP+"geocat/validateEmail?",
	getUser: HOST_APP+"geocat/user/getUser.action?",
	getUserSimple: HOST_APP+"geocat/user/getUserSimple.action?",
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
	urlFileNoDin:GEOCAT02+"/share/jsp/urlFileNoDin.jsp?",
	urlFileDin:GEOCAT02+"/share/jsp/urlFileDin.jsp?",
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
	updateServerOrderToMap: HOST_APP+"geocat/aplications/map/updateServerOrderToMap.action?",
	updateMapName: HOST_APP+"geocat/aplications/map/updateMapName.action?",
	removeServerToMap: HOST_APP+"geocat/aplications/map/removeServerToMap.action?",
	deleteServerRemoved: HOST_APP+"geocat/aplications/map/deleteServerRemoved.action?",
	updateServidorWMSName: HOST_APP+"geocat/layers/servidor/wms/updateServidorWMSName.action?",


	//nous updates
	updateServidorWMSOptions: HOST_APP+"geocat/layers/servidor/wms/updateServidorWMSOptions.action?",
	updateServidorWMSGroup: HOST_APP+"geocat/aplications/map/updateServidorWMSGroup.action?",
	updateServidorWMSOpacity: HOST_APP+"geocat/layers/servidor/wms/updateServidorWMSOpacity.action?",


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
	shortUrl : "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDUUud-qayDcS4jmAUpr2PPjxHxu_qVbk0",
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

	urlMapToWMS:"/share/jsp/getMapToWMS.jsp?",

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
	unionLayers: HOST_APP+"geocat/aplications/map/unionLayers.action?",
	getVisualitzacioSimpleByBusinessId: HOST_APP+"geocat/layers/visualitzacio/getVisualitzacioSimpleByBusinessId.action?",
	filterVisualitzacio: HOST_APP+"geocat/layers/visualitzacio/filterVisualitzacio.action?",
	crearFitxerPolling: HOST_APP+"/geocat/aplications/map/crearFitxerPolling.action?",
	filter: HOST_APP+"geocat/aplications/map/filter.action?",
	callActions:"/share/jsp/callActions.jsp?",
	//loadAplicacionsUser: "/geocatweb/dades/aplicacions_geolocal.json",
	getConfiguradesUser: HOST_GEOLOCAL+"PRG/eines/getConfiguradesUser.action?",
	prgIncasol: HOST_GEOLOCAL,
	createToken: HOST_APP +"/geocat/createToken.action?",
	uploadLogo: HOST_APP +"share/jsp/uploadLogo.jsp?",
	getValuesFromKeysProperty: HOST_APP +"geocat/aplications/map/getValuesFromKeysProperty.action?",
	columnJoin: HOST_APP +"geocat/aplications/map/columnJoin.action?",
	spatialJoin: HOST_APP +"geocat/aplications/map/spatialJoin.action?",
	searchCapesPubliques: HOST_APP+"geocat/aplications/map/searchCapesPubliques.action?",
	addServerDuplicateToMap: HOST_APP+"geocat/aplications/map/addServerDuplicateToMap.action?",
	duplicateVisualitzacioLayer: HOST_APP+"geocat/layers/visualitzacio/duplicateVisualitzacioLayer.action?",
	searchCatalegIdec: HOST_APP+"geocat/aplications/map/searchCatalegIdec.action?",
	searchGaleriaMapsByUser: HOST_APP+"geocat/aplications/map/searchGaleriaMapsByUser.action?",
	eacat: "https://idp.eacat.net/Logon.aspx?providerID=IDEC",
	url_mapserver:HOST_APP+"/geoservicelocal/",
	addGeometriaToVisualitzacioTematic: HOST_APP+"geocat/layers/visualitzacio/addGeometriaToVisualitzacioTematic.action?",
	duplicateMap: HOST_APP+"geocat/aplications/map/duplicateMap.action?",
	//urlgetInspireCatalog:HOST_APP +"/share/jsp/getInspireCatalog.jsp?",
	urlgetInspireCatalog:"http://inspire-geoportal.ec.europa.eu/solr/select?",
	urlJsonPCC:"/geocatweb/dades/pcc.json",
	desbloquejarMapa: HOST_APP+"/geocat/aplications/map/desbloquejar.action?",
	crearFitxerSocrata:  HOST_APP+"geocat/upload/crearFitxerSocrata.action?",
	generateTokenRemember: HOST_APP+"geocat/user/generateTokenRemember.action?"

}

var paramAplications = {
	'pcivil':{
		"nom":"Protecció civil",
		"description":"Gestiona la informació relativa a Protecció civil per augmentar la seguretat dels ciutadans. Identifica els punts d'actuació prioritària en cas d'una emergència.",
		"img":"img/thumb_ed_pcivil.png",
		"url":HOST_GEOLOCAL+"geoLocal/crearAplicacionEditorPcivil.jsp?codiUsuari="
	},
    'infoparcela':{
    	"nom":"InfoParcela",
    	"description":"Permet realitzar un document amb informació referent a la parcel·la.",
    	"img":"img/thumb_ed_infoparcela.png",
    	"url":HOST_GEOLOCAL+"PRG/aplicacions/infoparcela.action?fallback=infoparcela&codiUsuari=",
    	"eliminar":HOST_GEOLOCAL+"PRG/aplicacions/infoparcela/eliminar_geolocal.action?businessId=",
    	"editor":HOST_GEOLOCAL+"PRG/aplicacions/infoparcela/modificar.action?businessId="
    },
    'peolics':{
    	"nom":"Editor de Parcs Eòlics",
    	"description":"Actualitza la informació dels parcs eòlics. Col·labora mantenint la informació.",
    	"img":"img/thumb_ed_peolics.png",
    	"url":HOST_GEOLOCAL+"geoLocal/crearAplicacionEditorParcsEolics.jsp?codiUsuari="
    },
    'carrerer':{
    	"nom":"Gestor de canvis carrerer",
    	"description":"Gestiona els canvis del carrerer. Ajuda a mantenir la base de carrers de l'ICGC.",
    	"img":"img/thumb_ed_carrerer.png",
    	"url":HOST_GEOLOCAL+"EdCarrerer/editorCarrerer.action?codiUsuari="
    },
    'incasol':{
    	"nom":"Visors INCASÒL",
    	"description":"Ja pots tenir un visor de mapes a la teva web!. Crea els teus propis visors personalitzats i afegeix-hi la teva cartografia.",
    	"img":"img/thumb_ed_incasol.png",
    	"url":HOST_GEOLOCAL+"PRG/aplicacions/incasol.action?",
    	"editor":HOST_GEOLOCAL+"PRG/aplicacions/incasol/modificar.action?businessId=",
    	"eliminar":HOST_GEOLOCAL+"PRG/aplicacions/incasol/eliminar_geolocal.action?businessId="
    },
    'atles':{
    	"eliminar":HOST_GEOLOCAL+"PRG/aplicacions/atles/eliminar_geolocal.action?businessId="
    }
};

var perfilConfig = {
	"0":[paramAplications.pcivil, paramAplications.infoparcela, paramAplications.peolics, paramAplications.carrerer, paramAplications.incasol],
	"1":[],
	"2":[paramAplications.pcivil, paramAplications.infoparcela, paramAplications.carrerer],
	"3":[paramAplications.pcivil],
	"4":[],
	"5":[],
	"6":[],
	"7":[paramAplications.peolics],
	"8":[paramAplications.incasol],
	"9":[paramAplications.pcivil]
};

$( document ).ajaxSend(function( event, jqxhr, settings ) {
	//$('.waiting_animation').show();
	if (typeof map !== 'undefined'){
		try {map.spin(true);} catch (Err) {}

	}
});

$( document ).ajaxComplete(function( event, jqxhr, settings ) {
	if (typeof map !== 'undefined'){
		try {map.spin(false);} catch (Err) {}
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
		try {map.spin(false);} catch (Err) {
			//console.error(Err);
		}
	}
	setTimeout(function(){
		try {map.spin(false);} catch (Err) {
			//console.error(Err);
		}
	},10000);
});
