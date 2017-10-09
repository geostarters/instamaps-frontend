
/**
 * Funcions i utilitats vàries
 */

//Varible per esciure debug amb funcion
//  _escriuDebug(_debug,_arxiuJs,_liniacodi)

var _globalDebug=false;


function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

function isValidURL(url) {
	var pattern = /((http(s)?|ftp):\/\/.)?(((www\.)?[-a-zA-Z:%._\+~#=]{2,256}\.[a-z]{2,6}\b)|(\d+.\d+.\d+.\d+(:\d{4})?))([-a-zA-Z%_:?\+.~#&//=]*)/;
	return pattern.test(url);
}

function isImgURL(str) {
	return (/\.(gif|jpg|jpeg|png)$/i).test(str);
}

function isBusinessId(str){
	var pattern = new RegExp('^[0-9a-f]{32}$');
	return pattern.test(str);
}

function isBlank(str) {
    return (!str || (/^\s*$/).test(str));
}

function isHexColor(color){
	var pattern = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
	return pattern.test(color);
}

function isDefaultMapTitle(str){
//	var pattern = new RegExp('^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[_](?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$');
	var pattern = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[_](?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;
	return pattern.test(str);
}

function isValidValue(value){
	return (value!=="undefined" && value!==undefined && value!==null && value !== " " && value !== "" && value!=="null" && value!==-1 && value!=="-1");
}

function toggleCollapseDiv(divName){
	$(divName).toggle();
}


function getTimeStamp() {
    var now = new Date();
    return (now.getFullYear()+'/'+(
    	((now.getMonth() + 1) < 10) ? ("0" + (now.getMonth() + 1)) : ((now.getMonth() + 1)))
    	+ '/' +
        now.getDate() +'_'+
        ((now.getHours() < 10) ? ("0" + now.getHours()) : (now.getHours()))
        + ':' +
        ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes()))
        + ':' +
        ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) : (now.getSeconds()))
    );
}

function calculateDistance(lLatLngs){
	var totalDistance = 0;
	var lastPoint;
	if(lLatLngs.length>0) lastPoint = lLatLngs[0];

	jQuery.each(lLatLngs, function( i, point){
		totalDistance += point.distanceTo(lastPoint);
		lastPoint = point;
	});
	return L.GeometryUtil.readableDistance(totalDistance, true);
}

function calculateArea(layer){
	var totalArea = getAreaLayer(layer);
	return L.GeometryUtil.readableArea(totalArea, true);
}

function getAreaLayer(layer){
	var totalArea = 0,
		lLatLngs;

	if (layer._layers){
		layer.eachLayer(function (layer) {
			totalArea += getAreaLayer(layer);
		});

	}else if(layer.length > 0){
		for(var i=0; i<layer.length;i++){
			lLatLngs = new L.latLng(0,0);
			if(layer[i].lat && layer[i].lng){
				lLatLngs = new L.latLng(layer[i].lat,layer[i].lng);
			}
			totalArea += L.GeometryUtil.geodesicArea(lLatLngs);
		}

	}else{
		lLatLngs = layer.getLatLngs();
		totalArea = L.GeometryUtil.geodesicArea(lLatLngs);
	}	return totalArea;
}

function transformTipusGeometry(geometrytype){
	var ftype = geometrytype;
	if (ftype){
		ftype = ftype.toLowerCase();
		if (ftype === t_point){
			ftype = t_marker;
		}else if (ftype === t_linestring){
			ftype = t_polyline;
		}else if (ftype === t_multilinestring){
			ftype = t_polyline;
		}else if (ftype === t_multipolygon){
			ftype = t_polygon;
		}
	}
	return ftype;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r:0,g:0,b:0};
}

function hexToRgba(hex, opacity) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: opacity,
    } : {r:0,g:0,b:0,a:1};
}

function hex(x) {
	var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
	return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

/**Function to convert hex format to a rgb color (incloent si passes transparencia o no)*/
function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

/**Funcio per obtenir la transparencia d'un rgb*/
function getRgbAlpha(rgba){
	 var alpha=rgba.replace(/^.*,(.+)\)/,'$1');
	 return jQuery.trim(alpha);
}

function getMidaFromRadius(radius){
	if(radius == 8)return 21;
	else if(radius == 10)return 24;
	else if(radius == 12)return 30;
	else if(radius == 14)return 34;
	else return 16;
}

function getMidaFromFont(font){
	if(font == 'font15')return 30;
	else if(font == 'font12')return 24;
	else if(font == 'font11')return 21;
	else if(font == 'font9')return 16;
	else return 34;
}

function getRadiusFromMida(mida){
	if(mida == "21px")return 8;
	else if(mida == "24px")return 10;
	else if(mida == "30px")return 12;
	else if(mida == "34px")return 14;
	else return 6;
}

function getColorAwesomeMarker(markerColor, defaultColor){
	if(markerColor.indexOf("punt_r")!=-1) return defaultColor;
	else if(markerColor.indexOf("orange")!=-1) return "#ffc500";
	else if(markerColor.indexOf("darkorange")!=-1) return "#ff7f0b";
	else if(markerColor.indexOf("red")!=-1) return "#ff4b3a";
	else if(markerColor.indexOf("purple")!=-1) return "#ae59b9";
	else if(markerColor.indexOf("blue")!=-1) return "#00afb5";
	else if(markerColor.indexOf("green")!=-1) return "#7cbd00";
	else if(markerColor.indexOf("darkgray")!=-1) return "#90a6a9";
	else if(markerColor.indexOf("gray")!=-1) return "#ebf0f1";
}

function parseUrlTextPopUp(txt,key){
	//console.debug(txt);
	if (key.toLowerCase() != "geomorigen"){
	    var parseText = "";
	    var isWkt=validateWkt(txt);
	    if (!isWkt) {
		    if(!$.isNumeric(txt) && (key=='link' || key=='Web')){
		          if( isImgURL(txt)){
		        	  parseText = '<img width="100%" src="'+txt+'"/>';
		          }else if( txt.match("^http")){
		              parseText = '<a target="_blank" href="'+txt+'"/>'+txt+'</a>';
		          }else{
		              parseText = '<a target="_blank" href="http://'+txt+'"/>'+txt+'</a>';
		          }
		          return parseText;
		    }
		
		    if (!$.isNumeric(txt)) {
		    	if (typeof txt === "string") {
		          if(txt.indexOf("href")!= -1 || txt.indexOf("<a")!= -1 || 
		                 txt.indexOf("<img")!= -1 || txt.indexOf("<iframe")!= -1 ){
		                 return txt;
		          }
		    	}
		    	else return txt;
		    }
		
			var lines = txt.split(/\n/);
			for(lineNum in lines)
			{
	
				var line = lines[lineNum];
			    var lwords = line.split(" ");
			    for(index in lwords){
			          var text;
			          var word = lwords[index];
			          if(!$.isNumeric(txt) ){
			                 if (isValidURL(word) && typeof word === "string"){
			                 		var hasProtocol = ((-1 != word.indexOf('http://')) || (-1 != word.indexOf('https://')) || (-1 != word.indexOf('ftp://')));
			                        if(isImgURL(word)){
			                               text = "<img src=\"" + (!hasProtocol ? "http://" + word : word) + "\" alt=\"img\" class=\"popup-data-img\"/>";
			                        }
			                        else if (word.indexOf("html?") != -1){
			                               text = "<iframe width=\"100%\" height=\"200\" frameborder=\"0\" marginheight=\"0\""+
			                                            "marginwidth=\"0\" src=\""+(!hasProtocol ? "http://" + word : word)+"\"></iframe>";
			                        }else if (txt.indexOf("<video")==-1){
			                               text = "<a href=\""+(!hasProtocol ? "http://" + word : word)+"\" target=\"_blank\">"+word.replace("http://", "")+"</a>";
			                        }
			                        else text=word;
			                 }else{
			                        text = word;
			                 }
			
			          }else{
			                 text = word;
			          }
			          parseText+=" "+text;
			    }
	
			    if("" == line)
					parseText += "<br />";
				else
					parseText += "\n";
	
			}
		    return parseText;
	    }
	    else {
	    	return "isWkt";
	    }
	}
}

function redimensioMapa() {
	jQuery(window).resize(function() {
		var factorW = 0, 
		factorH = 0;
		
		if(typeof url('?embed') == "string"){//Pel cas visor, embeded
			factorH = 0;
		}else{
			factorH = jQuery('.navbar').css('height').replace(/[^-\d\.]/g, '');
		}
		jQuery('#map').css('top', factorH + 'px');
		jQuery('#map').height(jQuery(window).height() - factorH);
		jQuery('#map').width(jQuery(window).width() - factorW);
	});
	jQuery(window).trigger('resize');
}

function getLeafletIdFromBusinessId(businessId){
	for(val in controlCapes._layers){
		if(controlCapes._layers[val].layer.options.businessId == businessId){
			//console.debug("leaflet Id:");
			//console.debug(val);
			return val;
		}
	}
}

function activaPanelCapes(obre) {
	
	if (obre) {
		
		jQuery('.leaflet-control-layers').toggle();
		
		//jQuery('.leaflet-control-layers').fadeOut({duration: 'fast'});
	} else {
		//jQuery('.leaflet-control-layers').fadeOut({duration: 'fast'});
		jQuery('.leaflet-control-layers').toggle();
	}
	var cl,
	 btnDiv;
	if(jQuery('.bt_llista span')){
		btnDiv = jQuery('.bt_llista span');
	}else{
		btnDiv = jQuery('#dv_bt_layers');
	}
	cl = btnDiv.attr('class');
	if (cl && cl.indexOf('grisfort') != -1) {
		btnDiv.removeClass('grisfort');
		btnDiv.addClass('greenfort');
	} else {
		btnDiv.removeClass('greenfort');
		btnDiv.addClass('grisfort');
	}

	if(getModeMapa()){updateSortablesElements();}

}

function gestionaPopOver(pop) {
	//console.debug("gestionaPopOver");
	jQuery('.popover').popover('hide');
	jQuery('.pop').not(pop).popover('hide');
	jQuery(pop).popover('toggle');
	jQuery(".popover").css('left', pLeft());
	jQuery('.popover-title').append('<span id="popovercloseid#'+jQuery(pop).attr('id')+'" class="glyphicon glyphicon-remove bt_tanca"></span>');
}

function pLeft() {
	return jQuery(".leaflet-left").css('left');
}

function gestioCookie(from){
	var _cookie = Cookies.get('uid');

	switch(from){
		case 'createMap':
			if (isRandomUser(_cookie)){
				Cookies.remove('uid');
				window.location.href = paramUrl.mainPage;
			}else{
				window.location.href = paramUrl.galeriaPage;
			}
			break;
		case 'createMapError':
			window.location.href = paramUrl.mainPage;
			break;
		case 'getMapByBusinessId2':
			if (isRandomUser(_cookie)){
				Cookies.remove('uid');
				jQuery(window).off('beforeunload');
				//jQuery(window).off('unload');
				window.location.href = paramUrl.mainPage;
			}else{
				window.location.href = paramUrl.galeriaPage+"?private=1";
			}
			break;
		case 'getMapByBusinessId':
			if (!_cookie){
				window.location.href = paramUrl.mainPage;
			}else{
				if (isRandomUser(_cookie)){
					Cookies.remove('uid');
					jQuery(window).off('beforeunload');
					//jQuery(window).off('unload');
					window.location.href = paramUrl.mainPage;
				}else{
					window.location.href = paramUrl.galeriaPage;
				}
			}
			break;
		case 'loadApp':
			if (!_cookie){
				window.location.href = paramUrl.mainPage;
			}
			break;
		case 'diferentUser':
			var mapacolaboratiu = url('?mapacolaboratiu');
			if (mapacolaboratiu && mapacolaboratiu=='si'){
				Cookies.set('collaborateuid', url('?uid'));
			}
			else{
				Cookies.remove('collaborateuid', { path: '/' });
				if (mapConfig.entitatUid != _cookie){
					Cookies.remove('uid');
					window.location.href = paramUrl.mainPage;
				}
			}
			break;
		case 'loadMapConfig':
			if (isRandomUser(_cookie) ){
				Cookies.remove('uid');
				jQuery(window).off('beforeunload');
				window.location.href = paramUrl.mainPage;
			}else{
				window.location.href = paramUrl.galeriaPage;
			}
			break;
		case 'carregaDadesUsuari':
			window.location.href = paramUrl.loginPage;
			break;
		case 'refrescaPopOverMevasDades':
			window.location.href = paramUrl.loginPage;
			break;
		case 'getMapByBusinessIdError':
			window.location.href = paramUrl.loginPage;
			break;
		case 'mapaBloquejat':
			//Temps vida cookie bloqueig: 2 hores
			Cookies.set('lockCookie', _cookie, {
			    expires: 1/12
			});
			break;
	}
}

function popUp(f, l) {
	var out = [];
	if (f.properties) {
		for (key in f.properties) {
			if(key!='gml_id'){
				if(key=='Name' || key=='Description'){
					out.push(f.properties[key]);
				}else if(key=='link' || key=='Web'){
					ll=f.properties[key];
					//if(ll.indexOf('.gif')!=-1 || ll.indexOf('.jpg')!=-1){
					if(isImgURL(ll)){
						out.push('<img width="100" src="'+ll+'"/>');
					}else{
						out.push('<b>'+key +'</b>: <a target="_blank" href="http://'+ll+'"/>'+ll+'</a>');
					}
				}else{
					out.push("<b>"+key + "</b>: " + f.properties[key]);
				}
			}
		}
		l.bindPopup(out.join("<br />"));
	}
}

function aturaClick(event){
	try{
		event.stopImmediatePropagation();
	}catch(err){
		console.info(err);
	}
}

//Funcions d'estils
function retornaEstilaDO(dataset) {
	var estil = { radius : 6, fillColor : "#FC5D5F", color : "#ffffff", weight : 2, opacity : 1, fillOpacity : 0.8, isCanvas: true };
	if(dataset=="radars"){ estil.fillColor = "#A00698";}
	else if(dataset=="turisme_rural"){ estil.fillColor = "#06A010";}
	else if(dataset=="hotels"){ estil.fillColor = "#ED760E";}
	else if(dataset=="incidencies"){ estil.fillColor = "#991032";}
	else if(dataset=="cameres"){ estil.fillColor = "#495CBC";}
	else if(dataset=="campings"){ estil.fillColor = "#62A50B";}
	else if(dataset=="meteo_comarca"){ estil.fillColor = "#200BA5";}
	else if(dataset=="meteo_costa"){ estil.fillColor = "#E1EA3A";}
	else if(dataset=="json_president"){ estil.fillColor ="#0058A5"; estil.color ="#0058A5"; }
	else{ estil.fillColor = randomColor();}
	return estil;
}

function randomColor(){
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}



function getRamdomColorFromArray() {
	var colors = ['#ffc500', '#ff7f0b', '#ff4b3a', '#ae59b9', '#00afb5', '#7cbd00', '#90a6a9', '#ebf0f1'];
   return colors[Math.floor(Math.random() * colors.length)];
}

//Comptador mida dun objecte
$.extend({
    keyCount : function(o) {
        if(typeof o == "object") {
            var i, count = 0;
            for(i in o) {
                if(o.hasOwnProperty(i)) {
                    count++;
                }
            }
            return count;
        } else {
            return false;
        }
    }
});

//jQuery.fn.myScrollTo = function(elem) {
//    $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
//    return this;
//};

function getCodiUnic() {
//	console.debug("getCodiUnic");
    return  randomString(2) + Math.floor(Math.random() * (999 + 1)) + "_";
}

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
//    console.debug(randomString);
    return randomString;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Comprovar i forcar carrega dun script
function forceLoadScript(path){

	var len = $('script[src*="'+path+'"]').length;
	console.debug("len:");
	console.debug(len);
	if (len === 0) {
	        console.debug('script not loaded');
	        loadScript(path);

	        if ($('script[src*="'+path+'"]').length === 0) {
	        	console.debug('still not loaded');
	        }
	        else {
	        	console.debug('loaded now');
	        }
    }else{
    	console.debug('script loaded');
    }
}

function loadScript(scriptLocationAndName) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptLocationAndName;
    head.appendChild(script);
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
	  string = string === null ? '' : string + '';

	  if (!hash_map) {
	    return false;
	  }

	  if (quote_style && quote_style === 'ENT_QUOTES') {
	    hash_map["'"] = '&#039;';
	  }

	  if ( !! double_encode || double_encode === null) {
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
//discuss at: http://phpjs.org/functions/get_html_translation_table/
//original by: Philip Peterson
//revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
//bugfixed by: noname
//bugfixed by: Alex
//bugfixed by: Marco
//bugfixed by: madipta
//bugfixed by: Brett Zamir (http://brett-zamir.me)
//bugfixed by: T.Wild
//improved by: KELAN
//improved by: Brett Zamir (http://brett-zamir.me)
//input by: Frank Forte
//input by: Ratheous
//note: It has been decided that we're not going to add global
//note: dependencies to php.js, meaning the constants are not
//note: real constants, but strings instead. Integers are also supported if someone
//note: chooses to create the constants themselves.
//example 1: get_html_translation_table('HTML_SPECIALCHARS');
//returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
var entities = {},
hash_map = {},
decimal;
var constMappingTable = {},
constMappingQuoteStyle = {};
var useTable = {},
useQuoteStyle = {};
//Translate arguments
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
//return false;
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
//ascii decimals to real symbols
for (decimal in entities) {
if (entities.hasOwnProperty(decimal)) {
hash_map[String.fromCharCode(decimal)] = entities[decimal];
}
}
return hash_map;
}

function getModeMapa(){
	return  ($(location).attr('href').indexOf('/mapa.html')!=-1);
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sortByKeyPath(array, key, isNumeric) {
	
	return array.sort(function(a, b) {
		 var x = a.layer.options[key]; var y = b.layer.options[key];
		 if (isNumeric) {
			 x=parseFloat(x);
			 y=parseFloat(y);
		 }
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sortByValueMax(a, b){

	var floatRegex = new RegExp('(^-?0\.[0-9]*[1-9]+[0-9]*$)|(^-?[1-9]+[0-9]*((\.[0-9]*[1-9]+[0-9]*$)|(\.[0-9]+)))|(^-?[1-9]+[0-9]*$)|(^0$){1}');
	var floatRegex2 = new RegExp('(^-?0\,[0-9]*[1-9]+[0-9]*$)|(^-?[1-9]+[0-9]*((\.[0-9]*[1-9]+[0-9]*$)|(\.[0-9]+)))|(^-?[1-9]+[0-9]*$)|(^0$){1}');
	
	if (a!=null && b!=null) {
		var aValue;
		if (a.value!=undefined) aValue= a.value;
		else if (a.v!=undefined) aValue=a.v;
		else aValue = a;
	
		
		var bValue;
		if (b.value!=undefined) bValue= b.value;
		else if (b.v!=undefined) bValue=b.v;
		else bValue =b;
		var aValueStr = ""+aValue;
		var bValueStr = ""+bValue;
		
		if (aValueStr.indexOf(",")>-1){
			if (aValueStr.indexOf(".")>-1){
				aValue=aValue.replace(".","");
				aValue=aValue.replace(",",".");
			}
			else {
				aValue = aValue.replace(",",".");
			}
		}
		if (aValueStr.indexOf("-")>-1 && aValue.substring(0,aValue.indexOf("-"))!="") {
			aValue=aValue.substring(0,aValue.indexOf("-"));
			aValue=aValue.replace(" ","");
		}

		if (bValueStr.indexOf(",")>-1){
			if (bValueStr.indexOf(".")>-1){
				bValue=bValue.replace(".","");
				bValue=bValue.replace(",",".");
			}
			else {
				bValue = bValue.replace(",",".");
			}
		}
		if (bValueStr.indexOf("-")>-1 && bValue.substring(0,bValue.indexOf("-"))!="") {
			bValue=bValue.substring(0,bValue.indexOf("-"));
			bValue=bValue.replace(" ","");
		}
		
		if (floatRegex.test(aValue) && floatRegex.test(bValue)) {			
			return (aValue-bValue);
		}
		else if (floatRegex2.test(aValue) && floatRegex2.test(bValue)) {		
			return (aValue-bValue);
		}
		else {
			var aName = aValueStr.toLowerCase();
			var bName = bValueStr.toLowerCase();
			return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		}
	}
}

function isMobile() {
	 try {
	    if(/Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(navigator.userAgent)) {
	     return true;
	    };
	    return false;
	 } catch(e){ console.log("Error in isMobile"); return false; }
}


function isChrome(){

var isChromium = window.chrome,
vendorName = window.navigator.vendor;
	
var _hoSoc=false;
		
		if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
			_hoSoc=true;
		}

	return _hoSoc;	

	
}	

function refrescarPopUp(nom,props,_leaflet_id,type,capaLeafletId){
	var html='';
	html+='<h4 class="my-text-center">'+nom+'</h4>';
	
	
	var isADrawarker=false;
	html+='<div class="div_popup_visor"><div class="popup_pres">';
	$.each(props, function( key, value ) {
		if(isValidValue(key) && isValidValue(value) && !validateWkt(value)){
			if (key != 'id' && key != 'businessId' && key != 'slotd50' && 
					key != 'NOM' && key != 'Nom' && key != 'nom' && 
					key != 'name' && key != 'Name' && key != 'NAME' &&
					key != 'nombre' && key != 'Nombre' && key != 'NOMBRE'){
				html+='<div class="popup_data_row">';
				var txt=value;
				if (!$.isNumeric(txt)) {
					txt = parseUrlTextPopUp(value, key);
					if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
						html+='<div class="popup_data_key">'+key+'</div>';
						html+='<div class="popup_data_value">'+
						(isBlank(txt)?window.lang.translate("Sense valor"):txt)+
						'</div>';
						html += '<div class="traffic-light-icon-empty"></div>';
					}else{
						html+='<div class="popup_data_img_iframe">'+txt+'</div>';
					}
				}
				else {
					html+='<div class="popup_data_key">'+key+'</div>';
					html+='<div class="popup_data_value">'+txt+'</div>';
					if(undefined != capa.isPropertyNumeric && capa.isPropertyNumeric[key] && (("" == origen) || ("" != origen && (key == capa.options.trafficLightKey))))
					{

						var leafletid = (("undefined" !== typeof player.properties.capaLeafletId) ? player.properties.capaLeafletId : (capa.hasOwnProperty("layer") ? capa.layer._leaflet_id : ""));
						//Només ensenyem la icona del semafòric si és una capa no temàtica o bé si ho és però és semafòrica sense semàfor fixe (sempre que el camp sigui numèric)
						html+='<div class="traffic-light-icon" data-leafletid="' + leafletid + '" data-origen="' + origen + '" title="'+window.lang.translate('Temàtic per escala de color')+'"></div>';
						
					}
					else
					{

						html += '<div class="traffic-light-icon-empty"></div>';

					}
				}
				html+= '</div>';
				if (key=='text' || key=='TEXT') isADrawarker=true;
				else isADrawarker=false;
			}
		}
	});	
	console.debug(_leaflet_id);
	console.debug(type);
	console.debug(capaLeafletId);
	html +='<div id="footer_edit"  class="modal-footer">'
	+'<ul class="bs-popup">'						
	+'<li class="edicio-popup"><a id="feature_edit##'+_leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicons-palette gris-semifosc font18" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Estils')+'"></span></a>   </li>'
	+'<li class="edicio-popup"><a id="feature_move##'+_leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-move gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Editar')+'"></span></a>   </li>'
	+'<li class="edicio-popup"><a id="feature_remove##'+_leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-trash gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Esborrar')+'"></span></a>   </li>';
	html+='<li class="edicio-popup" id="feature_data_table_'+_leaflet_id+'"><a id="feature_data_table##'+_leaflet_id+'##'+type+'##'+capaLeafletId+'##" lang="ca" href="#"><span class="glyphicon glyphicon-list-alt gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Dades')+'"></span></a>   </li>';					

		
	html+='<li class="edicio-popup"><a class="faqs_link" href="http://betaportal.icgc.cat/wordpress/faq-dinstamaps/#finestrapunt" target="_blank"><span class="fa fa-question-circle-o gris-semifosc font21"></span></a></span></li>';
	
	html+='</ul>'														
	+'</div>'
	return html;
	
}

function changeWMSQueryable(queryable){	
	map.eachLayer(function (layer) { 
	  try{	 
	 
		layer.options && layer.options.tipus && layer.options.tipus=='wms'?layer.options.queryable=queryable: null	 
	  }catch(err){
		  console.debug(err);
	  }  
	});
}	



function decimalComa(nStr) {
	nStr += '';
	nStr = nStr.replace(".", ",");

	x = nStr.split(',');
	x1 = x[0];
	x2 = x.length > 1 ? ',' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {

		x1 = x1.replace(rgx, '$1' + '.' + '$2');
	}
	return x1 + x2;
}



(function($){
	var o = $({});
	$.each({
		trigger: 'publish',
		on: 'subscribe',
		off: 'unsubscribe'
	},function(key, val){
		$[val] = function(){
			o[key].apply(o, arguments);
		};
	});
	
	$('body').on('change', 'input[type="text"], input[type="password"], textarea', function(){
		$(this).val(cleanScriptCode($(this).val()));
	});
	
})(jQuery);

function createClass(name,rules){
    var style = document.createElement('style');
    style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(style);
    if(!(style.sheet||{}).insertRule) 
        (style.styleSheet || style.sheet).addRule(name, rules);
    else
        style.sheet.insertRule(name+"{"+rules+"}",0);
}

function cleanScriptCode(txt){
	var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
	while (SCRIPT_REGEX.test(txt)) {
		txt = txt.replace(SCRIPT_REGEX, "");
	}	
	return txt;
}

function shortString(str,_length){
	if(str){
		str.length > _length ?str=(str.substring(0,_length)+"..."):str;
	}
	return str;	
}	

function validateWkt(txt){
	var isWkt = false;
	if (typeof (txt) == "string") {
		isWkt = txt.indexOf("POLYGON")>-1 || txt.indexOf ("POINT")>-1 || txt.indexOf("LINE")>-1;
	}	
	return isWkt;
}

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

	var EuCountryCodes = new Array( 'be','bg', 'cz','dk','de','ee','ie','el','es','fr','it','cy','lv','lt','lu','hu','mt','nl','at','pl','pt','ro','si','sk','fi','se','uk','is','no','hr');
	var EuCountryNamesEN = {'be': 'Belgium','bg': 'Bulgaria','cz': 'Czech Republic','dk': 'Denmark','de': 'Germany','ee': 'Estonia','ie': 'Ireland','el': 'Greece','es': 'Spain','fr': 'France','it': 'Italy','cy': 'Cyprus','lv': 'Latvia','lt': 'Lithuania','lu': 'Luxembourg','hu': 'Hungary','mt': 'Malta','nl': 'Netherlands','at': 'Austria','pl': 'Poland','pt': 'Portugal','ro': 'Romania','si': 'Slovenia','sk': 'Slovakia','fi': 'Finland','se': 'Sweden','uk': 'United Kingdom','is': 'Iceland','no': 'Norway','hr': 'Croatia','li': 'Liechtenstein','tr': 'Turkey','ch': 'Switzerland','eu': 'European Union' };
	var EuCountryNames = { 	'be':'Bèlgica', 'bg':'Bulgària', 'cz':'República Txeca', 'dk':'Dinamarca', 'de':'Alemanya', 'ee':'Estònia', 'ie':'Irlanda', 'el':'Grècia', 'es':'Espanya', 'fr':'França', 'it':'Itàlia', 'cy':'Xipre', 'lv':'Letònia', 'lt':'Lituània', 'lu':'Luxemburg', 'hu':'Hongria', 'mt':'Malta', 'nl':'Països Baixos', 'at':'Àustria', 'pl':'Polònia', 'pt':'Portugal', 'ro':'Romania', 'si':'Eslovènia', 'sk':'Eslovàquia', 'fi':'Finlàndia', 'se':'Suècia', 'uk':'Regne Unit', 'is':'Islàndia', 'no':'Noruega', 'hr':'Croàcia', 'li':'Liechtenstein', 'tr':'Turquia', 'ch':'Suïssa', 'eu':'Unió Europea' };
	var EuCountryBBOX = {"al":"19.28168,39.64765,21.05782,42.66108","at":"9.52998,46.37245,17.16080,49.01529", "ba":"15.72873,42.55977,19.62363,45.27632", "be":"2.54601,49.49724,6.40503,51.50246", "bg":"22.35718,41.23593,28.60746,44.21566", "by":"23.17834,51.26285,32.76946,56.17222", "ch":"5.95607,45.82264,10.49204,47.80146", "cy":"32.27442,34.56750,34.58717,35.69489", "cz":"12.09221,48.55176,18.84376,51.05495", "de":"5.86632,47.27013,15.04180,54.91165", "dk":"8.07534,54.80484,10.95898,57.07808", "ee":"23.40401,57.50931,28.20842,59.66855", "el":"20.00881,37.65570,26.62996,41.74850", "el":"21.10524,36.38543,23.52390,38.33868", "es":"-9.29803,36.00705,3.32232,43.78991", "fi":"20.55038,59.81231,31.58627,70.09227", "hr":"13.48987,42.93842,19.44735,46.54657", "hu":"16.11385,45.73705,22.89627,48.58523", "ie":"-10.48000,51.45107,-6.01468,55.38264", "is":"-24.53084,63.39450,-13.49510,66.53758", "it":"6.63000,37.91603,18.52059,47.09173", "li":"9.47605,47.05180,9.63326,47.27094", "lt":"21.04881,53.89667,26.83181,56.44985", "lu":"5.73576,49.45110,6.52973,50.18278", "lv":"20.97068,55.67687,28.24145,58.08558", "md":"26.61875,45.46630,30.16649,48.49196", "me":"18.43355,41.85313,20.35293,43.55870", "mk":"20.45242,40.85490,23.03406,42.37160", "nl":"3.43372,50.75345,7.22750,53.46593", "no":"4.94090,57.98025,31.06381,71.13312", "pl":"14.12762,49.00248,24.14578,54.83409", "pt":"-9.50053,36.96317,-6.18935,42.15442", "ro":"20.26430,43.62074,29.68696,48.26064", "rs":"18.84816,41.85779,23.00583,46.18793", "se":"11.11105,55.33685,24.15514,69.06008", "si":"13.37549,45.42493,16.59681,46.87630", "sk":"16.83326,47.73140,22.56684,49.61377", "tr":"26.06056,35.80857,44.81861,42.09693", "tr":"26.03482,40.04417,29.11728,42.09850", "ua":"22.13799,44.38787,40.22820,52.37523", "uk":"-6.22738,49.95864,1.76303,58.67236", "mt":"14.1311,35.8161,15.5685,36.0557", "fr":"-4.79544,42.33339,8.23257,51.08938"}
	
	
function stringBBOXtoArray(strBBOX){
	var _BBOX=strBBOX.split(",");
	return _BBOX;
}	


function treuAccentsiEspais(nomIndexacio){

	nomIndexacio=nomIndexacio.replace(/[^0-9a-zA-Z ]/g, "");
	nomIndexacio=nomIndexacio.replace(/\s/g, "-");

return nomIndexacio;	
	
}	



function _escriuDebug(_debug, _scope,_linia){
	
	if(_globalDebug){	
		console.debug(_scope +" Linia:"+_linia);
		console.debug(_debug);
		console.debug("****************");
	}	
	
}
function controlarBloqueigMapa(){
	 lockController = SessionTimeout({
		 warnAfter: 28700000, //desenv: 10000,//prod: 28700000,
		 redirAfter: 28800000, //desenv: 15000,//prod: 8 hores = 28800000 ms
         ignoreUserActivity: true,
         keepAlive: false,
         logoutButton: window.lang.translate('Sortir'),
         title: window.lang.translate('Desbloquejar mapa'),
         message: window.lang.translate('Han transcorregut 8 hores des que heu iniciat la sessió de treball. Premeu "Continuar treballant" per mantenir-la  oberta, o "desbloquejar" per alliberar el mapa. '+
        		 						'Si no responeu, el mapa quedarà alliberat en 3 minuts.'),
         onWarn: function(){
         },
         onRedir: function () {
        	 timeoutBloqueig = window.setTimeout("treureBloqueigMapa()", 28980000);//desenv: 30000); //prod: 8 hores i 3 minuts = 28980000 ms
        	 $('#dialog_bloqueig_mapa').modal('show');   
        	
         }
   });
}

function treureBloqueigMapa(){
	var mapData = {
  			businessId: url('?businessid'),
  			uid: Cookies.get('uid')
  	 };
	 desbloquejarMapa(mapData).then(function(results){
			if (results.status=="OK"){
				$.when.apply(null, runningActions).done(function() {
					lockController.stop();
					$('#dialog_bloqueig_mapa').modal('hide');
					window.location.href = paramUrl.galeriaPage+"?private=1";
        		});
			}
	});
}

function generarScriptMarkupGoogle(url,nom,urlImage,autor,dataPublicacio,descripcio){
	var generatedScript = "{\"@context\":\"http://schema.org\","+
	    "\"@type\": \"Map\","+
	    "\"name\":\""+nom+"\","+
	    "\"url\":\""+url+"\","+
	    "\"image\":\""+urlImage+"\","+
	    "\"thumbnailUrl\":\""+urlImage+"\","+
	    "\"author\": {"+
	    	"\"@type\":  \"Person\","+
	    	"\"name\":\""+autor+"\""+
	  	"},"+
	   "\"datePublished\":\""+dataPublicacio+"\","+
	   "\"description\":\""+descripcio+"\""+
		"}";
	return generatedScript;
}

function latLngtoETRS89(lat, lng) {

	var auxLat = lat.toFixed(5);
	var auxLng = lng.toFixed(5);
	var crs = new L.Proj.CRS('EPSG:25831', '+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs');
	var _CRS = crs.project( {lat:auxLat, lng:auxLng} );

	return {x: _CRS.x.toFixed(2), y: _CRS.y.toFixed(2)};

}
