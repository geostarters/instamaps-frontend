/*
var context;
var newCanvas;
var objLLegenda=null;

var ldpercent_img = 0;

function comportamentCaptura(inicial,titol,text_progress) {

      if (inicial==0) {
            ldpercent_img = 0;
            jQuery('#bt_desc_img').hide();
            jQuery('#bt_desc_ll').hide();
            jQuery('#div_captura').hide();
            //jQuery('#img_canvas').attr('src', '/llibreries/img/loading.gif');
            jQuery('#progress_bar_carrega_img').show();
            jQuery('#dialog_captura').modal('show');
            
            jQuery('#dialog_captura_title').html(window.lang.convert(titol));
            jQuery('#dialog_captura_text').html(window.lang.convert(text_progress));
            
            
            
            uploadprogress_img();
      }else if(inicial==1){
            jQuery('#progress_bar_carrega_img').hide();
            jQuery('#bt_desc_img').show();
      //    jQuery('#div_captura').show();
      }else if(inicial==3){
            jQuery('#progress_bar_carrega_img').hide();
            //jQuery('#bt_desc_img').show();
            //jQuery('#div_captura').show();   
      } else if (inicial==2){
            jQuery('#progress_bar_carrega_img').hide();
            jQuery('#dialog_captura').modal('hide');

      }

}

function uploadprogress_img() {
      ldpercent_img += 10;
      if (ldpercent_img > 100) {
            ldpercent_img = 100;
      }
      jQuery('#prg_bar_img').css('width', ldpercent_img + "%");
      if (ldpercent_img < 100) {
            setTimeout("uploadprogress_img()", 1500);
      }

}


function errorCaptura(){

comportamentCaptura(2);
alert(window.lang.convert("Error: No es pot generar el document"));

}

function capturaPantalla(tipus) {

      if (tipus == CAPTURA_MAPA) {
            comportamentCaptura(0,'Captura mapa format JPEG','Generant imatge mapa...');
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_MAPA, null, null, 2);
            }, 500);

      } else if (tipus == CAPTURA_INFORME) {
            //generaCaptura(CAPTURA_INFORME, null, null, 2);
            comportamentCaptura(0,'Captura mapa mida A4','Generant imatge mapa...');
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_INFORME, null, null, 2);
            }, 500);

      } else if (tipus == CAPTURA_GALERIA) {
            
            
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_GALERIA, null, null, 2);
            }, 500);
            
            
            

      } else if (tipus == CAPTURA_GEOPDF) {
            comportamentCaptura(0,'Captura mapa format GeoPDF','Generant mapa GeoPDF...');
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_GEOPDF, null, null, 2);
            }, 500);

      }
}




function pucPassar(item){

            var passo=false;

            //console.info(item);
            if(document.getElementById('input-'+item.layer.options.businessId)!=null){
                  if(document.getElementById('input-'+item.layer.options.businessId).checked){
      
                             if(item.layer._map != null && item.layer.options.tipus !=t_wms && 
                                         item.layer.options.tipus !=t_wms && 
                                         item.layer.options.tipus !=t_heatmap &&
                                         item.layer.options.tipus !=t_cluster &&
                                         item.layer.options.tipus !=t_size){
      
                                         passo=true;
                                         
                                         
                                         try{
										
                                         item.layer.toGeoJSONcustom();
										
                                         passo=true;
                                         
                                         }catch(err){
                                         passo=false;
                                         
                                         return passo;
                                         
                                         }
                        }
                             
                  }else{
      
                  passo=false;
      
                  }     
            }

return passo;           

}

var matriuCapesLL={};
matriuCapesLL.layers = [];
matriuCapesLL.n_layers=[];
matriuCapesLL.id_layers=[];


function ompleCapesMatriu(item){



            //console.info(item.layer.options.tipus);
            if(pucPassar(item)){
                  
                  
            
                  
                  
                  var L_JSON=item.layer.toGeoJSONcustom();
                  
                 
                  jQuery.each(L_JSON.features, function(i, feature){
				  
				 // console.info(feature);
				  
                  var tipus=feature.geometry.type;
				  var color=(typeof  feature.styles.color =='undefined') ? '#FFCC00' : feature.styles.color ;
				  var fillColor=(typeof  feature.styles.fillColor =='undefined') ? '#FFCC0080' : feature.styles.fillColor ;
				  var weight=(typeof  feature.styles.weight =='undefined') ? 3 : feature.styles.weight ;
                  //console.info(tipus);
                             if(tipus.indexOf("Point")!=-1){
                             
                             if(!feature.styles.icon){
                             
                              //feature.properties.OGR="SYMBOL(c:"+fillColor+",id:ogr-sym-3,s:"+(parseInt(feature.styles.weight)+2)+");BRUSH(fc:"+color+")";
                                                                            
                              feature.properties.OGR="PEN(c:"+color+",w:6px);BRUSH(fc:"+fillColor+")";                             
                              //feature.properties.OGR="BRUSH(fc:"+fillColor+"80)";
                             
                             }else{
                             
                             var icona;
                             
                             if(feature.styles.icon.options.markerColor){
                             
                              icona="/opt/geocat/maps/galeria/"+feature.styles.icon.options.markerColor;
                             
                             }else{
                             
                             var ff=feature.styles.icon.options.iconUrl
                             
                              icona="/opt/geocat/maps/galeria/"+ff.substring(ff.lastIndexOf("/")+1,ff.lastIndexOf("."));
                             }
                             
                                   
                             
                             feature.properties.OGR="SYMBOL(c:#ff0000,id:"+icona+".png)";                                                                                                                     
                              //feature.properties.OGR="PEN(c:#FFC400,w:"+feature.styles.weight+"px)";
                             
                             }
                                                           
                             }else if(tipus.indexOf("Line")!=-1){
                             
							 
							 
							 
                              feature.properties.OGR="PEN(c:"+color+",w:"+(parseInt(weight)+3)+"px)";
                             
                             
                             }else if(tipus.indexOf("Polygon")!=-1){
                             
                              feature.properties.OGR="PEN(c:"+color+",w:"+(parseInt(weight)+3)+"px);BRUSH(fc:"+fillColor+")";                        
                             
                             }else{
                                   feature.properties.OGR="PEN(c:#0000ff,w:5px);BRUSH(fc:#0000ff90)";
                             }
                  
                  });
                  //console.info(matriuCapesLL);
                 // matriuCapesLL.layers.push(JSON.stringify(L_JSON));
				  
				  
				  var cache = [];
				  
			  
	try{
	
	matriuCapesLL.layers.push(JSON.stringify(L_JSON));
	
	}catch(Ex){		  

		 matriuCapesLL.layers.push(JSON.stringify(L_JSON, function(key, value) {
			if (typeof value === 'object' && value !== null) {
				if (cache.indexOf(value) !== -1) {
				  
					return;
				}
			   
				cache.push(value);
			}
			return value;
		}));

		cache = null;
		}	
				  
						  
                  matriuCapesLL.n_layers.push(item.name);
                  matriuCapesLL.id_layers.push(item.layer.options.businessId);
                  
            }
            
}



function getCapesVectorActives(){
      
      matriuCapesLL.layers = [];
      matriuCapesLL.n_layers=[];
      matriuCapesLL.id_layers=[];
      
      
      jQuery.each(controlCapes._layers, function(i, item){ 
	  
            ompleCapesMatriu(item);      
                  jQuery.each(item._layers, function(j, item2){
				
                        ompleCapesMatriu(item2);           
                  });         
      });
      
      
      
      
    
      return matriuCapesLL;
      
      
      
      
}




function calculaWF() {
      
      
      
      var d = map.getSize();
      w = d.x;
      h = d.y;

   
      var topMap = jQuery('#map').position().top;
    
     

      var puntIn = map.getBounds().getNorthWest();
      var NW = L.CRS.EPSG3857.project(puntIn);
      var SE = L.CRS.EPSG3857.project(map.getBounds().getSouthEast());

	 
	  
	  var ff_Pixels = new L.Point(0, 0);
	 var ff_MM = map.layerPointToLatLng(ff_Pixels);
	  var ff_3557 = L.CRS.EPSG3857.project(ff_MM );
	  
	  
      var pNW_Pixels = new L.Point(0, - topMap);
      var pNW = map.layerPointToLatLng(pNW_Pixels);
	 
	
	 var FACT=parseFloat(ff_MM.lat) - parseFloat(pNW.lat) ;
	 
	
	  
     var pNW_3557 = L.CRS.EPSG3857.project(pNW);
	   var FACT=parseFloat(ff_3557.y) - parseFloat(pNW_3557.y) ;
	  


      var pNE_Pixels = new L.Point(w, h - topMap);
      var pNE = map.layerPointToLatLng(pNE_Pixels);
 
      var pNE_3557 = L.CRS.EPSG3857.project(pNE);

      var mapW = (pNE_3557.x - pNW_3557.x) / w;
      var mapH = (pNW_3557.y - pNE_3557.y) / h;

	  var nouY=parseFloat(parseFloat(NW.y)-(parseFloat(FACT)));
	  
	
      var WF={};
      
      WF.imgW=w;
      WF.imgH=h;
      WF.resW=mapW;
      WF.resH=mapH;
     //WF.x=pNW_3557.x;
      //WF.y=pNW_3557.y;
	 WF.x=NW.x;
      WF.y=nouY
      WF.x1=NW.x;
      WF.y1=SE.y;
      
      return WF;


}

function tornaLLoc(tr){


 
 
 
	jQuery(".leaflet-map-pane").css({
		 left:0,
		top:0,
		"transform":tr
		});
						
	
						

}


function tornaLLocGeoPDF(tr){

 if (L.Browser.webkit) {
  
	jQuery(".leaflet-map-pane").css({
		
		"transform":tr
		});
						
		}
						

}






function hackCaptura(){

if(jQuery(".leaflet-map-pane").css("transform")){
					var transform=jQuery(".leaflet-map-pane").css("transform")

					var comp=transform.split(",") //split up the transform matrix
					var mapleft=parseFloat(comp[4]) //get left value
					var maptop=parseFloat(comp[5])  //get top value
					$(".leaflet-map-pane").css({ //get the map container. not sure if stable
					  "transform":"none",
					// "transform":"translate3d(0px,0px,0px)",
					  "left":mapleft,
					  "top":maptop,
					});
				}

return transform;


}

function hackGeoPDF(){
if (L.Browser.webkit) {
if(jQuery(".leaflet-map-pane").css("transform")){
					var transform=jQuery(".leaflet-map-pane").css("transform");

					var comp=transform.split(",") //split up the transform matrix
					var mapleft=parseFloat(comp[4]) //get left value
					var maptop=parseFloat(comp[5])  //get top value
					$(".leaflet-map-pane").css({ //get the map container. not sure if stable
					  //"transform":"none",
					 "transform":"translate3d(0px,0px,0px)",
					//"transform":"matrix(1, 0, 0, 1, 0, 0)", 
					//  "left":mapleft,
					 // "top":maptop,
					});

					
		}

}

}



function generaCaptura(_tipusCaptura, w, h, factor) {

map.setView([  map.getCenter().lat,map.getCenter().lng ], map.getZoom());


      if ((!w) || (w == null)) {
            var d = map.getSize();
            w = d.x;
            h = d.y;
      }
      

	 
	
	 var transform="";
	
			


	 
      
jQuery('#map .leaflet-marker-pane').find('div').has('.marker-cluster').attr('data-html2canvas-ignore','true');
//jQuery('#map .leaflet-marker-pane').removeAttr('data-html2canvas-ignore');
jQuery('#map .leaflet-overlay-pane').find('canvas').not('.leaflet-heatmap-layer').removeAttr('data-html2canvas-ignore'); 


      if (_tipusCaptura == CAPTURA_MAPA) {
            
            transform=hackCaptura();
            
            
            var snd = new Audio("/llibreries/sons/camera.wav"); // buffers
                                                                                        // automatically
                                                                                        // when created
            snd.play();
            
            html2canvas(jQuery('#map .leaflet-map-pane'), {
                  
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgData = canvas.toDataURL('image/jpeg', 0.92);
                       // var imgData = canvas.toDataURL('image/png')
						
						
						
						
						
						
                        imgData = JSON.stringify(imgData.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

                        uploadImageBase64(imgData).then(

                                   function(results) {

                                         
                                         if (results.status == "OK") {

                                               var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getCaptura&uuid="
                                                           + results.UUID
                                               
                                               //jQuery('#img_canvas').attr('src', urlIMG);
                                               
                                               capturaLlegenda(true);
                                               
                                               jQuery('#desc_img').attr('href', urlIMG);                                               
                                               jQuery('#desc_img').attr('download', 'mapa_captura.jpeg');
                                               jQuery('#desc_img').html(window.lang.convert("Desar mapa") +" <i class='fa fa-picture-o'></i>");                   
                                               jQuery('#bt_desc_img').show();
                                               comportamentCaptura(1);
											    tornaLLoc(transform);
                                         } else {
                                         
                                         errorCaptura();
                                               

                                         }
                                         imgData = "";

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : w,
                  height : h,
                  logging : false

            });

      } else if (_tipusCaptura == CAPTURA_GALERIA) {

	  transform=hackCaptura();
	  
            html2canvas(jQuery('#map .leaflet-map-pane'), {
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgCaptura = canvas.toDataURL('image/jpeg', 0.50);
                        imgCaptura = JSON.stringify(imgCaptura.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

								   
						 tornaLLoc(transform);		   
                        try {
                             map.spin(false);
                        } catch (Err) {
                        }

                        uploadImageBase64(imgCaptura).then(

                                   function(results) {

                                         if (results.status == "OK") {

                                               
                                               var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getGaleria&update=true&businessid="
                                                           + mapConfig.businessId + "&uuid=" + results.UUID;
                                               var img = document.createElement('img');
                                               img.src = urlIMG;
                                               
                                          tornaLLoc(transform);      
                                   //Ruta Galeria
                                               
                                   //          paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid={businessid}        

                                         } else {

                                               //alert("Error");
                                         }
imgCaptura="";
                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : parseInt(w),
                  height :parseInt(h),
                  logging : false

            });

      } else if (_tipusCaptura == CAPTURA_INFORME) {
            
            transform=hackCaptura();
            html2canvas(jQuery('#map .leaflet-map-pane'), {
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgData = canvas.toDataURL('image/jpeg', 0.72);
						
                        imgData = JSON.stringify(imgData.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

                        uploadImageBase64(imgData).then(

                                   function(results) {

                                         if (results.status == "OK") {

                                               var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getCaptura&uuid="
                                                           + results.UUID;                                           
                        jQuery('#img_canvas').attr('src', urlIMG);
                        capturaLlegenda(false);            
                        comportamentCaptura(2); 
 tornaLLoc(transform);						
                        window.open("/geocatweb/print.html", "Imprimir",
                                                           "resizable=yes,status=yes,toolbar=yes,menubar=yes,location=no,scrollbars=yes")

                                               
                                         } else {

                                               errorCaptura();

                                         }
                                         imgData = "";

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : parseInt(w/1.2),
                  height :parseInt(h/1.2),
                  logging : false

            });
            
            

      } else if (_tipusCaptura == CAPTURA_GEOPDF) {
      
    
	 if (L.Browser.webkit) {
	transform=hackCaptura();
	 }else{
	 transform=hackCaptura();
	 }
	  
      jQuery('#map .leaflet-overlay-pane').find('canvas').not('.leaflet-heatmap-layer').attr('data-html2canvas-ignore', 'true');
      
//
      
      //jQuery('#map .leaflet-marker-pane').attr('data-html2canvas-ignore','true');
      
      //jQuery('#map .leaflet-marker-pane').find('img').has("img[src~='meteo.cat']").attr('data-html2canvas-ignore','true');
      
       
  
	   
      var WF=calculaWF();     
      var data=getCapesVectorActives();
      capturaLlegenda(false);
      
	 
	  
	  
      html2canvas(jQuery('#map .leaflet-map-pane'), {
      
            
      
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgData = canvas.toDataURL('image/jpeg', 0.95);

                        imgData = JSON.stringify(imgData.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));
						
                        uploadImageBase64(imgData).then(

                                   function(results) {

                                         if (results.status == "OK") {                                                                                         
                                               data.imgW=WF.imgW;
                                               data.imgH=WF.imgH;
                                               data.resW=WF.resW;
                                               data.resH=WF.resH;
                                               data.x=WF.x;
                                               data.y=WF.y;
                                               data.x1=WF.x1;
                                               data.y1=WF.y1;
                                               data.request="createGeoPDF";
                                               data.uuid=results.UUID;
                                               data.entitatUid=mapConfig.entitatUid;
                                               data.businessId=mapConfig.businessId;
                                               data.nomAplicacio=mapConfig.nomAplicacio;
                                               data.llegenda=objLLegenda;
                                               
                                               
                                               
                                               
                                               //data.titol=mapConfig.title;
                                               
                                         
                                               
                                               createGeoPdfMap(data).then(
                                                           
                                               function(geopdfresults) {
											   
											 
                                                     if (geopdfresults.status == "OK") {
                                                           
                                                           var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getGeoPDF&uuid="
                                                           + results.UUID;   
                                                           
                                                           jQuery('#desc_img').attr('href', urlIMG);
                                                           
                                                           jQuery('#desc_img').attr('download', 'mapa_geoPDF.pdf');
                                                           jQuery('#desc_img').html(window.lang.convert("Desar mapa") +" <i class='fa fa-file-pdf-o'></i>");
                                                           
                                                           jQuery('#bt_desc_img').show();
                                                           comportamentCaptura(3);
                                                          // tornaLLocGeoPDF(transform);
                                                           
															
															 if (L.Browser.webkit) {
																//tornaLLocGeoPDF(transform);
																 tornaLLoc(transform);
																 }else{
																 tornaLLoc(transform);
																 }
															
															
															
															
                                                           
                                                     }else{
                                                           comportamentCaptura(2);
                                                           errorCaptura();
                                                           
                                                           
                                                     }
                                               
                                                           })
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                         } else {

                                               alert("Error");

                                         }
                                         imgData = "";

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : w,
                  height : h,
                  logging : false

            });
            
            
            
            
            //jQuery('#map .leaflet-marker-pane').removeAttr('data-html2canvas-ignore');
            //jQuery('#map .leaflet-overlay-pane').find('canvas').not('.leaflet-heatmap-layer').removeAttr('data-html2canvas-ignore'); 

            

      }

}

function capturaLlegenda(ensenyaBoto){

objLLegenda=null;

//if(jQuery('#mapLegend').is(':visible')){

if(jQuery('.bt_legend span').hasClass('greenfort')){


var w = jQuery('#mapLegend').width();
var h = jQuery('#mapLegend').height();


html2canvas(jQuery('#mapLegend'), {
                  onrendered : function(canvas) {

                        
                        var imgCapturaLL = canvas.toDataURL('image/jpeg', 0.75);
                  imgCapturaLL = JSON.stringify(imgCapturaLL.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

                        
                        uploadImageBase64(imgCapturaLL).then(

                                   function(results) {

                                   if (results.status == "OK") {
                                   
                                   objLLegenda=results.UUID;
                                   
                                   var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getCaptura&uuid="
                                                           + results.UUID
                                               

                                         
                                                           if(ensenyaBoto){  
                                                                 jQuery('#desc_ll').attr('href', urlIMG);                                          
                                                                 jQuery('#desc_ll').attr('download', 'llegenda_captura.jpeg');
                                                                 jQuery('#desc_ll').html(window.lang.convert("Desar llegenda") + " <i class='fa fa-bars'></i>");                                                                     
                                                                 jQuery('#bt_desc_ll').show();
                                               
                                                           }else{
                                                                 jQuery('#ll_canvas').attr('src', urlIMG);
                                                                 jQuery('#bt_desc_ll').hide();
                                                           }
                                   
                                   }else{
                             objLLegenda=null;
                                   }
                                   

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  //width : w,
                  //height : h,
                  logging : false

            });









      

}

}



function imatgeCarregada() {

      ActDesPrintMode(false);

}

function ActDesPrintMode(printMode) {
      try {
            
            //map.invalidateSize(true);
            if (map.options.typeMap == FONS_TOPOMAP) {
                  map.topoMap(printMode);

            } else if (map.options.typeMap == FONS_ORTOMAP) {
                  map.ortoMap(printMode);
            } else if (map.options.typeMap == FONS_TOPOGISMAP) {
                  map.topoGrisMap(printMode);
            }
            return true;
      } catch (err) {
            return true;
      }

}



function calculaDistanciaMetres(PuntIn, PuntFi) {

      var lat1 = PuntIn.lat;
      var lon1 = PuntIn.lng;
      var lat2 = PuntFi.lat;
      var lon2 = PuntFi.lng;

      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2 - lat1); // deg2rad below
      var dLon = deg2rad(lon2 - lon1);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1))
                  * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
}

function deg2rad(deg) {
      return deg * (Math.PI / 180)
}

function rag2deg(deg) {
      return deg * (180 / Math.PI)
}


*/
var context;
var newCanvas;
var objLLegenda=null;

var ldpercent_img = 0;

function comportamentCaptura(inicial,titol,text_progress) {

      if (inicial==0) {
            ldpercent_img = 0;
            jQuery('#bt_desc_img').hide();
            jQuery('#bt_desc_ll').hide();
            jQuery('#div_captura').hide();
            //jQuery('#img_canvas').attr('src', '/llibreries/img/loading.gif');
            jQuery('#progress_bar_carrega_img').show();
            jQuery('#dialog_captura').modal('show');
            
            jQuery('#dialog_captura_title').html(window.lang.convert(titol));
            jQuery('#dialog_captura_text').html(window.lang.convert(text_progress));
            
            
            
            uploadprogress_img();
      }else if(inicial==1){
            jQuery('#progress_bar_carrega_img').hide();
            jQuery('#bt_desc_img').show();
      //    jQuery('#div_captura').show();
      }else if(inicial==3){
            jQuery('#progress_bar_carrega_img').hide();
            //jQuery('#bt_desc_img').show();
            //jQuery('#div_captura').show();   
      } else if (inicial==2){
            jQuery('#progress_bar_carrega_img').hide();
            jQuery('#dialog_captura').modal('hide');

      }

}

function uploadprogress_img() {
      ldpercent_img += 10;
      if (ldpercent_img > 100) {
            ldpercent_img = 100;
      }
      jQuery('#prg_bar_img').css('width', ldpercent_img + "%");
      if (ldpercent_img < 100) {
            setTimeout("uploadprogress_img()", 1500);
      }

}


function errorCaptura(){

comportamentCaptura(2);
alert(window.lang.convert("Error: No es pot generar el document"));

}

function capturaPantalla(tipus) {

      if (tipus == CAPTURA_MAPA) {
            comportamentCaptura(0,'Captura mapa format JPEG','Generant imatge mapa...');
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_MAPA, null, null, 2);
            }, 500);

      } else if (tipus == CAPTURA_INFORME) {
            //generaCaptura(CAPTURA_INFORME, null, null, 2);
            comportamentCaptura(0,'Captura mapa mida A4','Generant imatge mapa...');
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_INFORME, null, null, 2);
            }, 500);

      } else if (tipus == CAPTURA_GALERIA) {
            
            
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_GALERIA, null, null, 2);
            }, 500);
            
            
            

      } else if (tipus == CAPTURA_GEOPDF) {
            comportamentCaptura(0,'Captura mapa format GeoPDF','Generant mapa GeoPDF...');
            ActDesPrintMode(true);
            setTimeout(function() {
                  generaCaptura(CAPTURA_GEOPDF, null, null, 2);
            }, 500);

      }
}




function pucPassar(item){

            var passo=false;

            //console.info(item);
            if(document.getElementById('input-'+item.layer.options.businessId)!=null){
                  if(document.getElementById('input-'+item.layer.options.businessId).checked){
      
                             if(item.layer._map != null && item.layer.options.tipus !=t_wms && 
                                         item.layer.options.tipus !=t_wms && 
                                         item.layer.options.tipus !=t_heatmap &&
                                         item.layer.options.tipus !=t_cluster &&
                                         item.layer.options.tipus !=t_size){
      
                                         passo=true;
                                         
                                         
                                         try{
                                         item.layer.toGeoJSONcustom();
                                         passo=true;
                                         
                                         }catch(err){
                                         passo=false;
                                         
                                         return passo;
                                         
                                         }
                        }
                             
                  }else{
      
                  passo=false;
      
                  }     
            }

return passo;           

}

var matriuCapesLL={};
matriuCapesLL.layers = [];
matriuCapesLL.n_layers=[];
matriuCapesLL.id_layers=[];


function ompleCapesMatriu(item){

            //console.info(item.layer.options.tipus);
            if(pucPassar(item)){
                  
                  var L_JSON=item.layer.toGeoJSONcustom();
                  
                  jQuery.each(L_JSON.features, function(i, feature){
                	 
                	  var tipus=feature.geometry.type;
                	  
                     if(tipus.indexOf("Point")!=-1){
                     
                    	 if(!feature.styles.icon){
                    		 feature.properties.OGR="PEN(c:"+feature.styles.color+",w:6px);BRUSH(fc:"+feature.styles.fillColor+")";                             
                    	 }else{
                    		 var icona;
                    		 if(feature.styles.icon.options.markerColor){
                    			 icona="/opt/geocat/maps/galeria/"+feature.styles.icon.options.markerColor;
                    		 }else{
                    			 var ff=feature.styles.icon.options.iconUrl
                    			 icona="/opt/geocat/maps/galeria/"+ff.substring(ff.lastIndexOf("/")+1,ff.lastIndexOf("."));
                    		 }
                    		 feature.properties.OGR="SYMBOL(c:#ff0000,id:"+icona+".png)";                                                                                                                     
                    	 }
                     
                    //Polyline
                     }else if(tipus.indexOf("Line")!=-1){
                    	 console.debug(feature);
                    	 feature.properties.OGR="PEN(c:"+feature.styles.color+",w:"+(parseInt(feature.styles.weight)+3)+"px)";
                     
                     }else if(tipus.indexOf("Polygon")!=-1){
                     
                      feature.properties.OGR="PEN(c:"+feature.styles.color+",w:"+(parseInt(feature.styles.weight)+3)+"px);BRUSH(fc:"+feature.styles.fillColor+")";                        
                     
                     }else{
                           feature.properties.OGR="PEN(c:#0000ff,w:5px);BRUSH(fc:#0000ff90)";
                     }
                  });
                  
                 // matriuCapesLL.layers.push(JSON.stringify(L_JSON));
				  
				//JA NO CAL, EN CAS DE JSON CIRCULAR...
//				  var cache = [];
//				  matriuCapesLL.layers.push(JSON.stringify(L_JSON, function(key, value) {
//				    if (typeof value === 'object' && value !== null) {
//				        if (cache.indexOf(value) !== -1) {
//				            // Circular reference found, discard key
//				            return;
//				        }
//				        // Store value in our collection
//				        cache.push(value);
//				    }
//				    return value;
//					}));
//					cache = null;
				  
				matriuCapesLL.layers.push(JSON.stringify(L_JSON));
						  
                  matriuCapesLL.n_layers.push(item.name);
                  matriuCapesLL.id_layers.push(item.layer.options.businessId);
                  
            }
            
}



function getCapesVectorActives(){
      
      matriuCapesLL.layers = [];
      matriuCapesLL.n_layers=[];
      matriuCapesLL.id_layers=[];
      
      
      jQuery.each(controlCapes._layers, function(i, item){ 
            ompleCapesMatriu(item);      
                  jQuery.each(item._layers, function(j, item2){
                        ompleCapesMatriu(item2);           
                  });         
      });
      
      
      
      
      
      return matriuCapesLL;
      
      
      
      
}




function calculaWF() {
      
      
      
      var d = map.getSize();
      w = d.x;
      h = d.y;

   
      var topMap = jQuery('#map').position().top;
    
     

      var puntIn = map.getBounds().getNorthWest();
      var NW = L.CRS.EPSG3857.project(puntIn);
      var SE = L.CRS.EPSG3857.project(map.getBounds().getSouthEast());

	 
	  
	  var ff_Pixels = new L.Point(0, 0);
	 var ff_MM = map.layerPointToLatLng(ff_Pixels);
	  var ff_3557 = L.CRS.EPSG3857.project(ff_MM );
	  
	  
      var pNW_Pixels = new L.Point(0, - topMap);
      var pNW = map.layerPointToLatLng(pNW_Pixels);
	 
	
	 var FACT=parseFloat(ff_MM.lat) - parseFloat(pNW.lat) ;
	 
	
	  
     var pNW_3557 = L.CRS.EPSG3857.project(pNW);
	   var FACT=parseFloat(ff_3557.y) - parseFloat(pNW_3557.y) ;
	  


      var pNE_Pixels = new L.Point(w, h - topMap);
      var pNE = map.layerPointToLatLng(pNE_Pixels);
 
      var pNE_3557 = L.CRS.EPSG3857.project(pNE);

      var mapW = (pNE_3557.x - pNW_3557.x) / w;
      var mapH = (pNW_3557.y - pNE_3557.y) / h;

	  var nouY=parseFloat(parseFloat(NW.y)-(parseFloat(FACT)));
	  
	
      var WF={};
      
      WF.imgW=w;
      WF.imgH=h;
      WF.resW=mapW;
      WF.resH=mapH;
     //WF.x=pNW_3557.x;
      //WF.y=pNW_3557.y;
	 WF.x=NW.x;
      WF.y=nouY
      WF.x1=NW.x;
      WF.y1=SE.y;
      
      return WF;


}

function tornaLLoc(tr){


 
 
 
	jQuery(".leaflet-map-pane").css({
		 left:0,
		top:0,
		"transform":tr
		});
						
	
						

}


function tornaLLocGeoPDF(tr){

 if (L.Browser.webkit) {
  
	jQuery(".leaflet-map-pane").css({
		
		"transform":tr
		});
						
		}
						

}






function hackCaptura(){

if(jQuery(".leaflet-map-pane").css("transform")){
					var transform=jQuery(".leaflet-map-pane").css("transform")

					var comp=transform.split(",") //split up the transform matrix
					var mapleft=parseFloat(comp[4]) //get left value
					var maptop=parseFloat(comp[5])  //get top value
					$(".leaflet-map-pane").css({ //get the map container. not sure if stable
					  "transform":"none",
					// "transform":"translate3d(0px,0px,0px)",
					  "left":mapleft,
					  "top":maptop,
					});
				}

return transform;


}

function hackGeoPDF(){
if (L.Browser.webkit) {
if(jQuery(".leaflet-map-pane").css("transform")){
					var transform=jQuery(".leaflet-map-pane").css("transform");

					var comp=transform.split(",") //split up the transform matrix
					var mapleft=parseFloat(comp[4]) //get left value
					var maptop=parseFloat(comp[5])  //get top value
					$(".leaflet-map-pane").css({ //get the map container. not sure if stable
					  //"transform":"none",
					 "transform":"translate3d(0px,0px,0px)",
					//"transform":"matrix(1, 0, 0, 1, 0, 0)", 
					//  "left":mapleft,
					 // "top":maptop,
					});

					
		}

}

}



function generaCaptura(_tipusCaptura, w, h, factor) {

map.setView([  map.getCenter().lat,map.getCenter().lng ], map.getZoom());


      if ((!w) || (w == null)) {
            var d = map.getSize();
            w = d.x;
            h = d.y;
      }
      

	 
	
	 var transform="";
	
			


	 
      
jQuery('#map .leaflet-marker-pane').find('div').has('.marker-cluster').attr('data-html2canvas-ignore','true');
//jQuery('#map .leaflet-marker-pane').removeAttr('data-html2canvas-ignore');
jQuery('#map .leaflet-overlay-pane').find('canvas').not('.leaflet-heatmap-layer').removeAttr('data-html2canvas-ignore'); 


      if (_tipusCaptura == CAPTURA_MAPA) {
            
            transform=hackCaptura();
            
            
            var snd = new Audio("/llibreries/sons/camera.wav"); // buffers
                                                                                        // automatically
                                                                                        // when created
            snd.play();
            
            html2canvas(jQuery('#map .leaflet-map-pane'), {
                  
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgData = canvas.toDataURL('image/jpeg', 0.92);
                       // var imgData = canvas.toDataURL('image/png')
						
						
						
						
						
						
                        imgData = JSON.stringify(imgData.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

                        uploadImageBase64(imgData).then(

                                   function(results) {

                                         
                                         if (results.status == "OK") {

                                               var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getCaptura&uuid="
                                                           + results.UUID
                                               
                                               //jQuery('#img_canvas').attr('src', urlIMG);
                                               
                                               capturaLlegenda(true);
                                               
                                               jQuery('#desc_img').attr('href', urlIMG);                                               
                                               jQuery('#desc_img').attr('download', 'mapa_captura.jpeg');
                                               jQuery('#desc_img').html(window.lang.convert("Desar mapa") +" <i class='fa fa-picture-o'></i>");                   
                                               jQuery('#bt_desc_img').show();
                                               comportamentCaptura(1);
											    tornaLLoc(transform);
                                         } else {
                                         
                                         errorCaptura();
                                               

                                         }
                                         imgData = "";

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : w,
                  height : h,
                  logging : false

            });

      } else if (_tipusCaptura == CAPTURA_GALERIA) {

	  transform=hackCaptura();
	  
            html2canvas(jQuery('#map .leaflet-map-pane'), {
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgCaptura = canvas.toDataURL('image/jpeg', 0.50);
                        imgCaptura = JSON.stringify(imgCaptura.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

								   
						 tornaLLoc(transform);		   
                        try {
                             map.spin(false);
                        } catch (Err) {
                        }

                        uploadImageBase64(imgCaptura).then(

                                   function(results) {

                                         if (results.status == "OK") {

                                               
                                               var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getGaleria&update=true&businessid="
                                                           + mapConfig.businessId + "&uuid=" + results.UUID;
                                               var img = document.createElement('img');
                                               img.src = urlIMG;
                                               
                                          tornaLLoc(transform);      
                                   //Ruta Galeria
                                               
                                   //          paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid={businessid}        

                                         } else {

                                               //alert("Error");
                                         }
imgCaptura="";
                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : parseInt(w),
                  height :parseInt(h),
                  logging : false

            });

      } else if (_tipusCaptura == CAPTURA_INFORME) {
            
            transform=hackCaptura();
            html2canvas(jQuery('#map .leaflet-map-pane'), {
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgData = canvas.toDataURL('image/jpeg', 0.72);
						
                        imgData = JSON.stringify(imgData.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

                        uploadImageBase64(imgData).then(

                                   function(results) {

                                         if (results.status == "OK") {

                                               var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getCaptura&uuid="
                                                           + results.UUID;                                           
                        jQuery('#img_canvas').attr('src', urlIMG);
                        capturaLlegenda(false);            
                        comportamentCaptura(2); 
 tornaLLoc(transform);						
                        window.open("/geocatweb/print.html", "Imprimir",
                                                           "resizable=yes,status=yes,toolbar=yes,menubar=yes,location=no,scrollbars=yes")

                                               
                                         } else {

                                               errorCaptura();

                                         }
                                         imgData = "";

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : parseInt(w/1.2),
                  height :parseInt(h/1.2),
                  logging : false

            });
            
            

      } else if (_tipusCaptura == CAPTURA_GEOPDF) {
      
    
	 if (L.Browser.webkit) {
	transform=hackCaptura();
	 }else{
	 transform=hackCaptura();
	 }
	  
      jQuery('#map .leaflet-overlay-pane').find('canvas').not('.leaflet-heatmap-layer').attr('data-html2canvas-ignore', 'true');
      
//
      
      //jQuery('#map .leaflet-marker-pane').attr('data-html2canvas-ignore','true');
      
      //jQuery('#map .leaflet-marker-pane').find('img').has("img[src~='meteo.cat']").attr('data-html2canvas-ignore','true');
      
       
  
	   
      var WF=calculaWF();     
      var data=getCapesVectorActives();
      capturaLlegenda(false);
      
	 
	  
	  
      html2canvas(jQuery('#map .leaflet-map-pane'), {
      
            
      
                  onrendered : function(canvas) {

                        ActDesPrintMode(false);
                        var imgData = canvas.toDataURL('image/jpeg', 0.95);

                        imgData = JSON.stringify(imgData.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));
						
                        uploadImageBase64(imgData).then(

                                   function(results) {

                                         if (results.status == "OK") {                                                                                         
                                               data.imgW=WF.imgW;
                                               data.imgH=WF.imgH;
                                               data.resW=WF.resW;
                                               data.resH=WF.resH;
                                               data.x=WF.x;
                                               data.y=WF.y;
                                               data.x1=WF.x1;
                                               data.y1=WF.y1;
                                               data.request="createGeoPDF";
                                               data.uuid=results.UUID;
                                               data.entitatUid=mapConfig.entitatUid;
                                               data.businessId=mapConfig.businessId;
                                               data.nomAplicacio=mapConfig.nomAplicacio;
                                               data.llegenda=objLLegenda;
                                               
                                               
                                               
                                               
                                               //data.titol=mapConfig.title;
                                               
                                         
                                               
                                               createGeoPdfMap(data).then(
                                                           
                                               function(geopdfresults) {
											   
											 
                                                     if (geopdfresults.status == "OK") {
                                                           
                                                           var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getGeoPDF&uuid="
                                                           + results.UUID;   
                                                           
                                                           jQuery('#desc_img').attr('href', urlIMG);
                                                           
                                                           jQuery('#desc_img').attr('download', 'mapa_geoPDF.pdf');
                                                           jQuery('#desc_img').html(window.lang.convert("Desar mapa") +" <i class='fa fa-file-pdf-o'></i>");
                                                           
                                                           jQuery('#bt_desc_img').show();
                                                           comportamentCaptura(3);
                                                          // tornaLLocGeoPDF(transform);
                                                           
															
															 if (L.Browser.webkit) {
																//tornaLLocGeoPDF(transform);
																 tornaLLoc(transform);
																 }else{
																 tornaLLoc(transform);
																 }
															
															
															
															
                                                           
                                                     }else{
                                                           comportamentCaptura(2);
                                                           errorCaptura();
                                                           
                                                           
                                                     }
                                               
                                                           })
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                               
                                         } else {

                                               alert("Error");

                                         }
                                         imgData = "";

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  width : w,
                  height : h,
                  logging : false

            });
            
            
            
            
            //jQuery('#map .leaflet-marker-pane').removeAttr('data-html2canvas-ignore');
            //jQuery('#map .leaflet-overlay-pane').find('canvas').not('.leaflet-heatmap-layer').removeAttr('data-html2canvas-ignore'); 

            

      }

}

function capturaLlegenda(ensenyaBoto){

objLLegenda=null;

//if(jQuery('#mapLegend').is(':visible')){

if(jQuery('.bt_legend span').hasClass('greenfort')){


var w = jQuery('#mapLegend').width();
var h = jQuery('#mapLegend').height();


html2canvas(jQuery('#mapLegend'), {
                  onrendered : function(canvas) {

                        
                        var imgCapturaLL = canvas.toDataURL('image/jpeg', 0.75);
                  imgCapturaLL = JSON.stringify(imgCapturaLL.replace(
                                   /^data:image\/(png|jpeg);base64,/, ""));

                        
                        uploadImageBase64(imgCapturaLL).then(

                                   function(results) {

                                   if (results.status == "OK") {
                                   
                                   objLLegenda=results.UUID;
                                   
                                   var urlIMG = paramUrl.urlgetMapImage
                                                           + "&request=getCaptura&uuid="
                                                           + results.UUID
                                               

                                         
                                                           if(ensenyaBoto){  
                                                                 jQuery('#desc_ll').attr('href', urlIMG);                                          
                                                                 jQuery('#desc_ll').attr('download', 'llegenda_captura.jpeg');
                                                                 jQuery('#desc_ll').html(window.lang.convert("Desar llegenda") + " <i class='fa fa-bars'></i>");                                                                     
                                                                 jQuery('#bt_desc_ll').show();
                                               
                                                           }else{
                                                                 jQuery('#ll_canvas').attr('src', urlIMG);
                                                                 jQuery('#bt_desc_ll').hide();
                                                           }
                                   
                                   }else{
                             objLLegenda=null;
                                   }
                                   

                                   });

                  },
                  useCORS : true,
                  allowTaint : false,
                  proxy : paramUrl.urlgetImageProxy,
                  background : undefined,
                  //width : w,
                  //height : h,
                  logging : false

            });









      

}

}



function imatgeCarregada() {

      ActDesPrintMode(false);

}

function ActDesPrintMode(printMode) {
      try {
            
            //map.invalidateSize(true);
            if (map.options.typeMap == FONS_TOPOMAP) {
                  map.topoMap(printMode);

            } else if (map.options.typeMap == FONS_ORTOMAP) {
                  map.ortoMap(printMode);
            } else if (map.options.typeMap == FONS_TOPOGISMAP) {
                  map.topoGrisMap(printMode);
            }
            return true;
      } catch (err) {
            return true;
      }

}



function calculaDistanciaMetres(PuntIn, PuntFi) {

      var lat1 = PuntIn.lat;
      var lon1 = PuntIn.lng;
      var lat2 = PuntFi.lat;
      var lon2 = PuntFi.lng;

      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2 - lat1); // deg2rad below
      var dLon = deg2rad(lon2 - lon1);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1))
                  * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
}

function deg2rad(deg) {
      return deg * (Math.PI / 180)
}

function rag2deg(deg) {
      return deg * (180 / Math.PI)
}
