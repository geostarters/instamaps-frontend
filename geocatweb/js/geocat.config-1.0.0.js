var HOST_APP = "http://172.70.1.12/geocat/";
var paramUrl = {
	"proxy":"/maps/proxy.cgi",
	"wmsOpenData":"/dadesobertes/wms/service?",
	"tmsOpenData":"/geocatcache/?",
	getAllPublicsMaps: HOST_APP+"aplications/map/getAllPublicsMaps.action?",
	deleteMap: HOST_APP+"aplications/map/deleteMap.action?",
	loginUser: HOST_APP+"login.action?",
	signinUser: HOST_APP+"registreUser.action?",
	signinSocial: HOST_APP+"social/createUser.action?",
	validateUsername: HOST_APP+"validateUid?",
	createTematicLayerFeature: HOST_APP+"layers/tematic/createTematicLayerFeature.action?",
	dragFile: HOST_APP+"pepito?",
	validateEmail: HOST_APP+"validateEmail?"
}


$( document ).ajaxSend(function( event, jqxhr, settings ) {
//	if ( settings.url == "ajax/test.html" ) {
	$('.waiting_animation').show();
//	}
});

$( document ).ajaxComplete(function( event, jqxhr, settings ) {
//	if ( settings.url == "ajax/test.html" ) {
	$('.waiting_animation').hide();
//	}
});