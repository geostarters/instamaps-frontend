var HOST_APP = "http://172.70.1.12/geocat/";
var paramUrl = {
	"proxy":"/maps/proxy.cgi",
	"wmsOpenData":"/dadesobertes/wms/service?",
	"tmsOpenData":"/geocatcache/?",
	getAllPublicsMaps: HOST_APP+"aplications/map/getAllPublicsMaps.action?",
	deleteMap: HOST_APP+"aplications/map/deleteMap.action?",
	loginUser: HOST_APP+"login.action?",
	logoutUser: HOST_APP+"logout.action?",
	signinUser: HOST_APP+"registreUser.action?",
	signinSocial: HOST_APP+"social/createUser.action?",
	validateUsername: HOST_APP+"validateUid?",
	validateEmail: HOST_APP+"validateEmail?",
	getUser: HOST_APP+"user/getUser.action?",
	updateUser: HOST_APP+"user/updateUser.action?",
	updatePassword: HOST_APP+"user/updatePassword.action?"
}


$( document ).ajaxSend(function( event, jqxhr, settings ) {
//	if ( settings.url == "ajax/test.html" ) {
	alert("ajax send!");
	$('.waiting_animation').show();
//	}
});

$( document ).ajaxComplete(function( event, jqxhr, settings ) {
//	if ( settings.url == "ajax/test.html" ) {
	alert("ajax complete!");
	$('.waiting_animation').hide();
//	}
});