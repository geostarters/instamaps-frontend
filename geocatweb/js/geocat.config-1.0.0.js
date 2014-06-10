//tipus capes
var t_dades_obertes = "dades obertes";
var t_wms = "wms";
var t_json = "json";
var t_xarxes_socials = "xarxes socials";
var t_tematic = "tematic";
var t_url_file = "url_file"
var t_polyline = "polyline";
var t_polygon = "polygon";
var t_marker = "marker";
var t_multiple = "multiple";
var t_point = "point";
var t_multipoint = "multipoint";
var t_linestring = "linestring";
var t_multilinestring = "multilinestring";
var t_multipolygon = "multipolygon";
var t_heatmap = "heatmap";
var t_cluster = "cluster";
var t_size = "size";
var tem_origen = "origenTematic";
var tem_simple = "simpleTematic";
var tem_clasic = "clasicTematic";
var tem_size = "sizeTematic";
var tem_heatmap = "heatmapTematic";
var tem_cluster = "clusterTematic";
var from_creaPopup = "creaPopup";
var from_creaCapa = "creaCapa";
var visibilitat_open = 'O';
var visibilitat_privat = 'P';

var t_file_csv = ".csv";
var t_file_gpx = ".gpx";
var t_file_kml = ".kml";
var t_file_wkt = ".wkt";
var t_file_json = ".json";
var t_file_geojson = ".geojson";
var t_file_topojson = ".topojson";
var t_file_shp = ".shp";
var t_file_dxf = ".dxf";

var t_user_loginat = 1;
var t_user_random = 0;

var num_max_pintxos = 250;
var capesOrdre_sublayer = "sublayer";//10000;

var msg_noguarda = "Per publicar o compartir el mapa has d'iniciar sessió";

var HOST_APP = "http://instamapes.icgc.cat/";
var GEOCAT02 = "http://instamapes.icgc.cat";
var proxydir = "maps";

var urlApp=document.location.href;
if((urlApp.indexOf('localhost')!=-1)||(urlApp.indexOf('.local')!=-1)){
	HOST_APP = "http://172.70.1.12/";
//	HOST_APP = "http://localhost:8080/";
	GEOCAT02 = "http://172.70.1.12";
	proxydir="maps"; //he creat un director maps al meu Apache
}

var DOMINI = "instamapes.icgc.cat";

var paramUrl = {
	proxy:"/"+proxydir+"/proxy.cgi",
	uploadproxy:"/"+proxydir+"/upload.cgi",
	proxy_download:"/"+proxydir+"/download.cgi",
	proxy_betterWMS:"/"+proxydir+"/proxy_betterWMS.cgi",
	mainPage:"/index.html",
	loginPage:"/geocatweb/sessio.html",
	mapaPage:"/geocatweb/mapa.html",
	visorPage:"/geocatweb/visor.html",
	registrePage:"/geocatweb/registre.html",
	galeriaPage:"/geocatweb/galeria.html",
	perfilPage:"/geocatweb/perfil.html",
	comentarisPage:"http://betaportal.icgc.cat",
	wmsOpenData:"/dadesobertes/wms/service?",
	tmsOpenData:"/geocatcache/?",
	getAllMapsByUser: HOST_APP+"geocat/aplications/map/getAllMapsByUser.action?",
	getAllPublicsMaps: HOST_APP+"geocat/aplications/map/getAllPublicsMaps.action?",
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
	updatePassword: HOST_APP+"geocat/user/updatePassword.action?",
	createTematicLayerFeature: HOST_APP+"geocat/layers/tematic/createTematicLayerFeature.action?",
	dragFile: HOST_APP+"share/jsp/upload.jsp?",
	createRang: HOST_APP+"geocat/layers/tematic/createRang.action?",
	createData: HOST_APP+"geocat/layers/data/createData.action?",
	createFeature: HOST_APP+"geocat/layers/feature/createFeature.action?",
	getTematicLayerByBusinessId:HOST_APP+"geocat/layers/tematic/getTematicLayerByBusinessId.action?",
	getCacheTematicLayerByBusinessId: HOST_APP+"geocat/layers/tematic/getCacheTematicLayerByBusinessId.action?",
	dadesObertes:GEOCAT02+"/share/jsp/dadesObertes.jsp?",
	urlFile:GEOCAT02+"/share/jsp/urlFile.jsp?",
	urlFileProves:GEOCAT02+"/share/jsp/urlFileProves.jsp?",
	getMapById: HOST_APP+"geocat/aplications/map/getMapById.action?",
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
	publicarCapesMapa: HOST_APP+"geocat/aplications/map/publicarCapesMapa.action?",
	presidentJSON: "http://www.president.cat/pres_gov/dades/president/actes-territori-ca.json"
}

//Llistat exemples de dades externes
var llista_dadesExternes = {
		"dadesExternes" : [
				{
					"titol" : "Base municipal",
					"ORGANITZAC" : "Institut Cartogràfic de Catalunya",
					"urlDadesExternes" : "http://galileo.icc.cat/arcgis/services/icc_limadmin_v_r/MapServer/WMSServer?"
				},
				{
					"titol" : "Mapa Urbanístic",
					"ORGANITZAC" : "Departament de Territori i Sostenibilitat",
					"urlDadesExternes" : "http://tes.gencat.cat/webmap/MUC/Request.aspx?"
				},
				{
	                "titol" : "Mapa trànsit en temps real",
	                "ORGANITZAC" : "Servei Català de Trànsit ",
	                "urlDadesExternes" : "http://sctwms.gencat.cat/WMS/mapserv.exe?map=//sctbrsscc05/AGATA/EstatdelTransit.map&amp"
				}
		]
};

$( document ).ajaxSend(function( event, jqxhr, settings ) {
//	if ( settings.url == "ajax/test.html" ) {
	//alert("ajax send!");
	$('.waiting_animation').show();
	if (typeof map !== 'undefined'){
		map.spin(true);
		setTimeout(function(){
			map.spin(false);
		},5000);
	}
//	}
});

$( document ).ajaxComplete(function( event, jqxhr, settings ) {
	$('.waiting_animation').hide();
	if (typeof map !== 'undefined'){
		map.spin(false);
	}
	if (jqxhr.responseJSON){
		if (jqxhr.responseJSON.status == "ERROR" && jqxhr.responseJSON.results == "expired"){
			sessionExpired();
		}
	}
});

