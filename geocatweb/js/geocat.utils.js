/**
 * Funcions i utilitats vàries
 */

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};

function isValidURL(url) {
	var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return pattern.test(url);
}

function isImgURL(str) {
	  var pattern = new RegExp('(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*\.(?:jpe?g|gif|png))','i'); // extension
	  return pattern.test(str);
}

function isBusinessId(str){
	var pattern = new RegExp('^[0-9a-f]{32}$');
	return pattern.test(str);	
}

function isBlank(str) {
    return (!str || (/^\s*$/).test(str));
}

function isDefaultMapTitle(str){
//	var pattern = new RegExp('^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[_](?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$');
	var pattern = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[_](?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;
	return pattern.test(str);	
}

function toggleCollapseDiv(divName){
//	console.debug(divName);
	$(divName).toggle();
}

function getTimeStamp() {
    var now = new Date();
    return (now.getFullYear()+'/'+(((now.getMonth() + 1) < 10)
                    ? ("0" + (now.getMonth() + 1))
                    : ((now.getMonth() + 1))) + '/'+ 
            now.getDate() +'_'+
            ((now.getHours() < 10)
                    ? ("0" + now.getHours())
                    : (now.getHours())) +':'+
             ((now.getMinutes() < 10)
                 ? ("0" + now.getMinutes())
                 : (now.getMinutes())) +':'+
             ((now.getSeconds() < 10)
                 ? ("0" + now.getSeconds())
                 : (now.getSeconds())));
}

function calculateDistance(lLatLngs){
	var totalDistance = 0;
	var lastPoint;
	if(lLatLngs.length>0) lastPoint = lLatLngs[0];
	
	jQuery.each(lLatLngs, function( i, point){
		totalDistance += point.distanceTo(lastPoint);
		lastPointt = point;
	});
	return L.GeometryUtil.readableDistance(totalDistance, true);
}

function calculateArea(lLatLngs){
	var totalArea = L.GeometryUtil.geodesicArea(lLatLngs);
	return L.GeometryUtil.readableArea(totalArea, true);
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

function parseUrlTextPopUp(txt){
	if(txt.indexOf("href")!= -1 || txt.indexOf("<a")!= -1 
			|| txt.indexOf("<img")!= -1 || txt.indexOf("<iframe")!= -1 ){
		return txt;
	}
	var lwords = txt.split(" "); 
	var parseText = "";
	for(index in lwords){
		var text;
		var word = lwords[index];
		//console.debug(word);
		if(isValidURL(word)){
			if(isImgURL(word)){
				//console.debug("Image:"+word);
				text = "<img src=\""+word+"\" alt=\"img\" class=\"popup-data-img\"/>";
			}else if(word.indexOf("html?") != -1){
				//console.debug("Iframe:"+word);
				text = "<iframe width=\"300\" height=\"200\" frameborder=\"0\" marginheight=\"0\""+
						"marginwidth=\"0\" src=\""+word+"\"></iframe>";
			}else{
				//console.debug("URL:"+word);
				text = "<a href=\""+word+"\" target=\"_blank\">"+word.replace("http://", "")+"</a>";	
			}
			
		}else{
			text = word;
		}
		parseText+=" "+text;
	}
	return parseText;
}

function tradueixMenusToolbar() {
	L.drawLocal = {
		draw : {
			toolbar : {
				actions : {
					title : 'Cancel.lar dibuix',
					text : 'Cancel·lar'
				},
				buttons : {

					polyline : 'Dibuixa una línia',
					polygon : 'Dibuixa una àrea',
					rectangle : 'Dibuixa un rectangle',
					circle : 'Dibuixa un cercle',
					marker : 'Dibuixa un punt'
				}
			},
			handlers : {
				circle : {
					tooltip : {
						start : 'Clica i arrossega per dibuixar un cercle.'
					}
				},
				marker : {
					
					tooltip : {
						start : 'Fes clic al mapa per posar un punt.'
					}
				},
				polygon : {
					tooltip : {
						start : 'Clica per començar a dibuixar una àrea.',
						cont : 'Clica per continuar dibuixant una àrea.',
						end : 'Clica el primer punt per tancar aquesta àrea.'
					}
				},
				polyline : {
					error : '<strong>Error:</strong> àrees no es poden creuar!',
					
					tooltip : {
						start : 'Clica per començar a dibuixar una línia.',
						cont : 'Clica per continuar dibuixant una línia.',
						end : 'Clica el darrer punt per acabar la línia.'
					}
				},
				rectangle : {
					tooltip : {
						start : 'Clica i arrossega per dibuixar un rectangle.'
					}
				},
				simpleshape : {
					tooltip : {
						end : 'Amolla el mouse per acabar el dibuix.'
					}
				}
			}
		},
		edit : {
			toolbar : {
				actions : {
					save : {
						title : 'Desa els canvis.',
						text : 'Desa'
					},
					cancel : {
						title : 'Cancel·la l\'edició, descarta tots els canvis.',
						text : 'Cancel·la'
					}
				},
				buttons : {
					edit : 'Edita les capes.',
					editDisabled : 'Cap capa per editar.',
					remove : 'Esborra les capes.',
					removeDisabled : 'Cap capa per esborrar.'
				}
			},
			handlers : {
				edit : {
					
					tooltip : {
						text : 'Arrossega els vèrtex o el punt per editar l\'objecte.',
						subtext : 'Fes clic sobre el mapa per finalitzar.'
					}
				},
				remove : {
					tooltip : {
						text : 'Fes clic a una feature per eliminar-la'
					}
				}
			}
		}
	};
	return L.drawLocal;
}

function redimensioMapa() {
	jQuery(window).resize(function() {
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
			return val;
		}
	}
}

function activaPanelCapes(obre) {
	if (obre) {
		jQuery('.leaflet-control-layers').animate({
			width : 'show'
		});
	} else {
		jQuery('.leaflet-control-layers').animate({
			width : 'toggle'
		});
	}
	var cl = jQuery('.bt_llista span').attr('class');
	if (cl.indexOf('grisfort') != -1) {
		jQuery('.bt_llista span').removeClass('grisfort');
		jQuery('.bt_llista span').addClass('greenfort');
	} else {
		jQuery('.bt_llista span').removeClass('greenfort');
		jQuery('.bt_llista span').addClass('grisfort');
	}
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
	var _cookie = $.cookie('uid');
	switch(from){
		case 'createMap':
			if (isRandomUser(_cookie)){
				$.removeCookie('uid', { path: '/' });
				window.location.href = paramUrl.mainPage;
			}else{
				window.location.href = paramUrl.galeriaPage;
			}
			break;
		case 'createMapError':
			window.location.href = paramUrl.mainPage;
			break;
		case 'getMapByBusinessId':
			if (!_cookie){
				window.location.href = paramUrl.mainPage;
			}else{
				if (isRandomUser(_cookie)){
					$.removeCookie('uid', { path: '/' });
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
			if (mapConfig.entitatUid != _cookie){
				$.removeCookie('uid', { path: '/' });
				window.location.href = paramUrl.mainPage;
			}
			break;
		case 'loadMapConfig':
			if (isRandomUser(_cookie)){
				$.removeCookie('uid', { path: '/' });
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

function aturaClick(event){try{event.stopImmediatePropagation();}catch(err){}}

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