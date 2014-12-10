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

function getCacheTematicLayerByBusinessId(data){
	return $.ajax({
		url: paramUrl.getCacheTematicLayerByBusinessId,
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
function htmlentities(string, quote_style, charset, double_encode) {
	  //  discuss at: http://phpjs.org/functions/htmlentities/
	  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: nobbler
	  // improved by: Jack
	  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
	  // improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
	  // bugfixed by: Onno Marsman
	  // bugfixed by: Brett Zamir (http://brett-zamir.me)
	  //    input by: Ratheous
	  //  depends on: get_html_translation_table
	  //   example 1: htmlentities('Kevin & van Zonneveld');
	  //   returns 1: 'Kevin &amp; van Zonneveld'
	  //   example 2: htmlentities("foo'bar","ENT_QUOTES");
	  //   returns 2: 'foo&#039;bar'

	  var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
	    symbol = '';
	  string = string == null ? '' : string + '';

	  if (!hash_map) {
	    return false;
	  }

	  if (quote_style && quote_style === 'ENT_QUOTES') {
	    hash_map["'"] = '&#039;';
	  }

	  if ( !! double_encode || double_encode == null) {
	    for (symbol in hash_map) {
	      if (hash_map.hasOwnProperty(symbol)) {
	        string = string.split(symbol)
	          .join(hash_map[symbol]);
	      }
	    }
	  } else {
	    string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
	      for (symbol in hash_map) {
	        if (hash_map.hasOwnProperty(symbol)) {
	          text = text.split(symbol)
	            .join(hash_map[symbol]);
	        }
	      }

	      return text + entity;
	    });
	  }

	  return string;
	}

function get_html_translation_table(table, quote_style) {
// discuss at: http://phpjs.org/functions/get_html_translation_table/
// original by: Philip Peterson
// revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// bugfixed by: noname
// bugfixed by: Alex
// bugfixed by: Marco
// bugfixed by: madipta
// bugfixed by: Brett Zamir (http://brett-zamir.me)
// bugfixed by: T.Wild
// improved by: KELAN
// improved by: Brett Zamir (http://brett-zamir.me)
// input by: Frank Forte
// input by: Ratheous
// note: It has been decided that we're not going to add global
// note: dependencies to php.js, meaning the constants are not
// note: real constants, but strings instead. Integers are also supported if someone
// note: chooses to create the constants themselves.
// example 1: get_html_translation_table('HTML_SPECIALCHARS');
// returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
var entities = {},
hash_map = {},
decimal;
var constMappingTable = {},
constMappingQuoteStyle = {};
var useTable = {},
useQuoteStyle = {};
// Translate arguments
constMappingTable[0] = 'HTML_SPECIALCHARS';
constMappingTable[1] = 'HTML_ENTITIES';
constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
constMappingQuoteStyle[2] = 'ENT_COMPAT';
constMappingQuoteStyle[3] = 'ENT_QUOTES';
useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() :
'ENT_COMPAT';
if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
throw new Error('Table: ' + useTable + ' not supported');
// return false;
}
entities['38'] = '&amp;';
if (useTable === 'HTML_ENTITIES') {
entities['160'] = '&nbsp;';
entities['161'] = '&iexcl;';
entities['162'] = '&cent;';
entities['163'] = '&pound;';
entities['164'] = '&curren;';
entities['165'] = '&yen;';
entities['166'] = '&brvbar;';
entities['167'] = '&sect;';
entities['168'] = '&uml;';
entities['169'] = '&copy;';
entities['170'] = '&ordf;';
entities['171'] = '&laquo;';
entities['172'] = '&not;';
entities['173'] = '&shy;';
entities['174'] = '&reg;';
entities['175'] = '&macr;';
entities['176'] = '&deg;';
entities['177'] = '&plusmn;';
entities['178'] = '&sup2;';
entities['179'] = '&sup3;';
entities['180'] = '&acute;';
entities['181'] = '&micro;';
entities['182'] = '&para;';
entities['183'] = '&middot;';
entities['184'] = '&cedil;';
entities['185'] = '&sup1;';
entities['186'] = '&ordm;';
entities['187'] = '&raquo;';
entities['188'] = '&frac14;';
entities['189'] = '&frac12;';
entities['190'] = '&frac34;';
entities['191'] = '&iquest;';
entities['192'] = '&Agrave;';
entities['193'] = '&Aacute;';
entities['194'] = '&Acirc;';
entities['195'] = '&Atilde;';
entities['196'] = '&Auml;';
entities['197'] = '&Aring;';
entities['198'] = '&AElig;';
entities['199'] = '&Ccedil;';
entities['200'] = '&Egrave;';
entities['201'] = '&Eacute;';
entities['202'] = '&Ecirc;';
entities['203'] = '&Euml;';
entities['204'] = '&Igrave;';
entities['205'] = '&Iacute;';
entities['206'] = '&Icirc;';
entities['207'] = '&Iuml;';
entities['208'] = '&ETH;';
entities['209'] = '&Ntilde;';
entities['210'] = '&Ograve;';
entities['211'] = '&Oacute;';
entities['212'] = '&Ocirc;';
entities['213'] = '&Otilde;';
entities['214'] = '&Ouml;';
entities['215'] = '&times;';
entities['216'] = '&Oslash;';
entities['217'] = '&Ugrave;';
entities['218'] = '&Uacute;';
entities['219'] = '&Ucirc;';
entities['220'] = '&Uuml;';
entities['221'] = '&Yacute;';
entities['222'] = '&THORN;';
entities['223'] = '&szlig;';
entities['224'] = '&agrave;';
entities['225'] = '&aacute;';
entities['226'] = '&acirc;';
entities['227'] = '&atilde;';
entities['228'] = '&auml;';
entities['229'] = '&aring;';
entities['230'] = '&aelig;';
entities['231'] = '&ccedil;';
entities['232'] = '&egrave;';
entities['233'] = '&eacute;';
entities['234'] = '&ecirc;';
entities['235'] = '&euml;';
entities['236'] = '&igrave;';
entities['237'] = '&iacute;';
entities['238'] = '&icirc;';
entities['239'] = '&iuml;';
entities['240'] = '&eth;';
entities['241'] = '&ntilde;';
entities['242'] = '&ograve;';
entities['243'] = '&oacute;';
entities['244'] = '&ocirc;';
entities['245'] = '&otilde;';
entities['246'] = '&ouml;';
entities['247'] = '&divide;';
entities['248'] = '&oslash;';
entities['249'] = '&ugrave;';
entities['250'] = '&uacute;';
entities['251'] = '&ucirc;';
entities['252'] = '&uuml;';
entities['253'] = '&yacute;';
entities['254'] = '&thorn;';
entities['255'] = '&yuml;';
}
if (useQuoteStyle !== 'ENT_NOQUOTES') {
entities['34'] = '&quot;';
}
if (useQuoteStyle === 'ENT_QUOTES') {
entities['39'] = '&#39;';
}
entities['60'] = '&lt;';
entities['62'] = '&gt;';
// ascii decimals to real symbols
for (decimal in entities) {
if (entities.hasOwnProperty(decimal)) {
hash_map[String.fromCharCode(decimal)] = entities[decimal];
}
}
return hash_map;
}

