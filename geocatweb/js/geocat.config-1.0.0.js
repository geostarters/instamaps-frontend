var HOST_APP = "http://172.70.1.12/";
//var HOST_APP = "http://geocat02.icc.local:8080/geocat/";
//var HOST_APP = "http://localhost:8080/";
var paramUrl = {
	proxy:"/maps/proxy.cgi",
	loginPage:"/geocatweb/sessio.html",
	galeriaPage:"/geocatweb/galeria.html",
	wmsOpenData:"/dadesobertes/wms/service?",
	tmsOpenData:"/geocatcache/?",
	getAllMapsByUser: HOST_APP+"geocat/aplications/map/getAllMapsByUser.action?",
	getAllPublicsMaps: HOST_APP+"geocat/aplications/map/getAllPublicsMaps.action?",
	deleteMap: HOST_APP+"geocat/aplications/map/deleteMap.action?",
	loginUser: HOST_APP+"geocat/login.action?",
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
	dragFile: HOST_APP+"geocat/pepito?",
	createRang: HOST_APP+"geocat/layers/tematic/createRang.action?",
	createData: HOST_APP+"geocat/layers/data/createData.action?",
	createFeature: HOST_APP+"geocat/layers/feature/createFeature.action?",
	getTematicLayerByBusinessId:HOST_APP+"geocat/layers/tematic/getTematicLayerByBusinessId.action?",
	dadesObertes:HOST_APP+"share/jsp/dadesObertes.jsp?",
	getMapById: HOST_APP+"geocat/aplications/map/getMapById.action?",
	getMapByBusinessId: HOST_APP+"geocat/aplications/map/getMapByBusinessId.action?",
	updateMap: HOST_APP+"geocat/aplications/map/updateMap.action?",
	createMap: HOST_APP+"geocat/aplications/map/createMap.action?",
}


$( document ).ajaxSend(function( event, jqxhr, settings ) {
//	if ( settings.url == "ajax/test.html" ) {
	//alert("ajax send!");
	$('.waiting_animation').show();
//	}
});

$( document ).ajaxComplete(function( event, jqxhr, settings ) {
//	if ( settings.url == "ajax/test.html" ) {
	$('.waiting_animation').hide();
//	}
});
