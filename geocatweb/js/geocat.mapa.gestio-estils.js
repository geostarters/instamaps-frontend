/**
 * Funcionalitats de gestio de canvis i dialegs destils de les features, ja
 * vinguin de draw, daplicar tematic, de crear nova capa, etc.
 */

function addDialegEstilsTematics(){
	
	addHtmlModalPunts();
	addHtmlModalLinies();
	addHtmlModalArees();
	
	jQuery('#dialog_estils_punts .btn-success').on('click',function(e){
		e.stopImmediatePropagation();
		if(objEdicio.obroModalFrom==from_creaCapa){
			jQuery('#div_punt').removeClass();
			jQuery('#div_punt').addClass(jQuery('#div_punt0').attr('class'));
			jQuery('#div_punt').css('font-size',jQuery('#div_punt0').css('font-size'));
			jQuery('#div_punt').css('width',jQuery('#div_punt0').css('width'));
			jQuery('#div_punt').css('height',jQuery('#div_punt0').css('height'));
			jQuery('#div_punt').css('color',estilP.colorGlif);			
			jQuery('#div_punt').css('background-color',estilP.divColor);	
			changeDefaultPointStyle(estilP);
			
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var cvStyle=changeDefaultPointStyle(estilP);
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			canviaStyleSinglePoint(cvStyle,feature,capaMare,true);
			getRangsFromLayer(capaMare);
			
		}else if (objEdicio.obroModalFrom.from==tem_simple){
			var cvStyle=changeDefaultPointStyle(estilP);
			createTematicLayerBasic(objEdicio.obroModalFrom, cvStyle);
			
		}else if (objEdicio.obroModalFrom.from==tem_clasic){
			//TODO
		}else{
			console.debug(objEdicio.obroModalFrom);
		}	
		jQuery('#dialog_estils_punts').modal('toggle');				
	});
	
	jQuery('#dialog_estils_linies .btn-success').on('click',function(){		
		if(objEdicio.obroModalFrom==from_creaCapa){
			addGeometryInitL(document.getElementById("cv_linia")); 		
			//changeDefaultVectorStyle(canvas_linia);
			changeDefaultLineStyle(canvas_linia);
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			map._layers[objEdicio.featureID].setStyle(changeDefaultLineStyle(canvas_linia));
			getRangsFromLayer(capaMare);
		}else if (objEdicio.obroModalFrom.from==tem_simple){
			createTematicLayerBasic(objEdicio.obroModalFrom, changeDefaultLineStyle(canvas_linia));
		}else if (objEdicio.obroModalFrom.from==tem_clasic){
			//TODO
		}else{
			console.debug(objEdicio.obroModalFrom);
		}
		jQuery('#dialog_estils_linies').modal('toggle');			
	});
	
	jQuery('#dialog_estils_arees .btn-success').on('click',function(){		
		if(objEdicio.obroModalFrom==from_creaCapa){
			addGeometryInitP(document.getElementById("cv_pol"));  
			//changeDefaultVectorStyle(canvas_pol);
			changeDefaultAreaStyle(canvas_pol);
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			map._layers[objEdicio.featureID].setStyle(changeDefaultAreaStyle(canvas_pol));
			getRangsFromLayer(capaMare);
		}else if (objEdicio.obroModalFrom.from==tem_simple){
			createTematicLayerBasic(objEdicio.obroModalFrom, changeDefaultAreaStyle(canvas_pol));
		}else if (objEdicio.obroModalFrom.from==tem_clasic){
			//TODO
			/*
			console.debug(objEdicio.obroModalFrom);
			jQuery('#dialog_tematic_rangs').modal('show');
			console.debug(canvas_pol);
			addGeometryInitPRang(objEdicio.obroModalFrom.element, changeDefaultAreaStyle(canvas_pol));
			*/
		}else{
			console.debug(objEdicio.obroModalFrom);
		}
		jQuery('#dialog_estils_arees').modal('toggle');				
	});
	
	jQuery('#dialog_estils_punts .btn-default').on('click',function(){			
		jQuery('#dialog_estils_punts').modal('toggle');
	})
	
	var hihaGlif=false;	
	
	jQuery(document).on('click', "#div_puntZ", function(e) {
		activaPuntZ();	
	});
	
	jQuery(document).on('click', "#div_puntM", function(e) {
		activaPuntM(rgb2hex($('#dv_fill_color_marker').css( "background-color")));	
	});	
		
	jQuery(document).on('change','#cmb_mida_Punt', function(e) { 
		if(!jQuery('#div_puntZ').hasClass("estil_selected")){
			activaPuntZ();
		}
		else{
			jQuery('#div_punt0').css('width',this.value+"px");
			jQuery('#div_punt0').css('height',this.value+"px");
			jQuery('#div_punt0').css('font-size',(this.value/2)+"px");
			estilP.fontsize=(this.value/2)+"px";
			estilP.size=this.value;
		}
	    jQuery('#div_punt9').css('width',this.value+"px");
		jQuery('#div_punt9').css('height',this.value+"px");
		jQuery('#div_punt9').css('font-size',(this.value/2)+"px");
	});
	
	jQuery(document).on('click', ".bs-glyphicons li", function(e) {
		jQuery(".bs-glyphicons li").removeClass("estil_selected");
		jQuery('#div_punt0').removeClass();
		estilP.iconGlif=jQuery('span', this).attr('class');
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
		jQuery(this).addClass("estil_selected");
	});
}

function activaPuntZ(){
//	jQuery(".bs-punts li").removeClass("estil_selected");
	jQuery('#div_puntM').removeClass("estil_selected");
	jQuery('#div_puntZ').addClass("estil_selected");
	estilP.iconFons=jQuery('#div_punt9').attr('class');
	jQuery('#div_punt0').removeClass();
	jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
	
	var vv=jQuery('#cmb_mida_Punt').val();
	jQuery('#div_punt0').css('width',vv+'px');
	jQuery('#div_punt0').css('height',vv+'px');
	jQuery('#div_punt0').css('font-size',(vv/2)+"px");
//	jQuery('#div_punt0').css('background-color',jQuery('fill_color_punt').css('background-color'));
	estilP.divColor=rgb2hex(jQuery('.fill_color_punt').css('background-color'));
	jQuery('#div_punt0').css('background-color',estilP.divColor);
	estilP.fontsize=(vv/2)+"px";
	estilP.size=vv;	
}

function activaPuntM(color){
	jQuery("#div_puntZ").removeClass("estil_selected");
	jQuery('#div_punt0').removeClass();
	jQuery('#div_puntM').addClass("estil_selected");
	
	jQuery('#div_punt_1').removeClass().addClass('awesome-marker-web awesome-marker-icon-'+getClassFromColor(color));
	
	estilP.iconFons='awesome-marker-web awesome-marker-icon-'+getClassFromColor(color);
	jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
	jQuery(this).addClass("estil_selected");	
	jQuery('#dv_cmb_punt').hide();
	jQuery('#div_punt0').css('width','28px');
	jQuery('#div_punt0').css('height','42px');	
	jQuery('#div_punt0').css('font-size',"14px");
	estilP.divColor='transparent';
	jQuery('#div_punt0').css('background-color',estilP.divColor);
	estilP.fontsize="14px";	
}


//Retorna la classe associada al marker, segons el color sel.leccionat a la paleta
function getClassFromColor(color){
	switch (color)
	{
		case '#ffc500':
		  return 'orange';
		case '#ff7f0b':
		  return 'darkorange';
		case '#ff4b3a':
		  return 'red';
		case '#ae59b9':
		  return 'purple';	
		case '#00afb5':
		  return 'blue';
		case '#7cbd00':
		  return 'green';
		case '#90a6a9':
		  return 'darkgray';
		case '#ebf0f1':
		  return 'gray';		  
		 default:
			 return 'orange';
	} 		
}

function addHtmlModalPunts(){
	jQuery('#mapa_modals').append(
			'<!-- Modal Punts -->'+
			'<div class="modal fade" id="dialog_estils_punts">'+
			'	<div class="modal-dialog">'+
			'		<div class="modal-content">'+
			'			<div class="modal-header">'+
			'				<button type="button" class="close" data-dismiss="modal"'+
			'					aria-hidden="true">&times;</button>'+
			'				<h4 class="modal-title" lang="ca" id="myModalLabel">Estils de'+
			'					punts</h4>'+
			'			</div>'+
			'			<div class="modal-body">'+
			'				<table width="100%" class="tbl_taula" border="0" cellspacing="1" cellpadding="1">'+
			'					<tr>'+
			'					<td class="tbl" height="50" colspan="8">'+
			'						<div id="div_punt0" class="awesome-marker-web awesome-marker-icon-orange"></div>'+
			'					</td>'+
			'					</tr>'+
			'					<tr>'+
			'						<td colspan="8"><span lang="ca">Punts disponibles</span></td>'+
			'					</tr>'+
			'					<tr>'+
			'						<td>'+
			'							<div id="div_puntZ" class="li2 liX">'+
			'								<div id="div_punt9" style="background-color: #FFC500;" class="awesome-marker-web awesome-marker-icon-punt_r"></div>'+
			'							</div>'+
			'							<div class="liX">'+
			'								<span class="small" lang="ca">Color punt:</span>'+
			'								<div class="btn-group">'+
			'									<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown">'+
			'										<div id="dv_fill_color_punt" class="fill_color_punt"></div>'+
			'									</a>'+
			'									<ul class="dropdown-menu">'+
			'										<li><div id="colorpalette_punt"></div></li>'+
			'									</ul>'+
			'								</div>'+
			'							</div>'+
			'							<div class="liX" style="border-right: 1px solid #DDDDDD">'+
			'								<span class="small" lang="ca">Mida punt:</span>'+
			'								<select id="cmb_mida_Punt" class="form-control">'+
			'									<!-- <option lang="ca" class="small" value="24">Mida punt</option> -->'+
			'									<option lang="ca" class="small" selected value="16">Petit +</option>'+
			'									<option lang="ca" class="small" value="21">Petit</option>'+
			'									<option lang="ca" class="small" value="24">Mitjà</option>'+
			'									<option lang="ca" class="small" value="30">Mitjà +</option>'+
			'									<option class="small" value="34">Gran</option>'+
			'								</select>'+
			'							</div>'+
			'						</td>'+
			'					</tr>'+
			'					<tr id="filaM">'+
			'						<td>'+
			'							<div id="div_puntM" class="li2 liX">'+
			'								<div id="div_punt_1" class="awesome-marker-web awesome-marker-icon-orange"></div>'+
			'								<!-- <div id="div_punt_#ffc500" class="awesome-marker-web awesome-marker-icon-orange"></div>'+
			'								<div id="div_punt_#ff070b"	class="awesome-marker-web awesome-marker-icon-darkorange hide"></div>'+
			'								<div id="div_punt_#ff4b3a"	class="awesome-marker-web awesome-marker-icon-red hide"></div>'+
			'								<div id="div_punt_#ae59b9"	class="awesome-marker-web awesome-marker-icon-purple hide"></div>'+
			'								<div id="div_punt_#00afb5" class="awesome-marker-web awesome-marker-icon-blue hide"></div>'+
			'								<div id="div_punt_#7cbd00" class="awesome-marker-web awesome-marker-icon-green hide"></div>'+
			'								<div id="div_punt_#90a6a9" class="awesome-marker-web awesome-marker-icon-darkgray hide"></div>'+
			'								<div id="div_punt_#ebf0f1" class="awesome-marker-web awesome-marker-icon-gray hide"></div> -->	'+								
			'							</div>'+
			'							<div class="liX">'+
			'								<span class="small" lang="ca">Color punt:</span>'+
			'								<div class="btn-group">'+
			'									<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown">'+
			'										<div id="dv_fill_color_marker" class="fill_color_marker"></div>'+
			'									</a>'+
			'									<ul class="dropdown-menu">'+
			'										<li><div id="colorpalette_marker"></div></li>'+
			'									</ul>'+
			'								</div>'+
			'							</div>'+
			'						</td>'+
			'					</tr>		'+				
			'					<!--  <tr class="fila-awesome-markers">'+
			'					<td>'+
			'						<ul class="bs-punts">'+
			'							<li class="estil_selected" >'+
			'							<div id="div_punt1" class="awesome-marker-web awesome-marker-icon-orange"></div></li>'+
			'							<li><div id="div_punt2"	class="awesome-marker-web awesome-marker-icon-darkorange"></div></li>'+
			'							<li><div id="div_punt3"	class="awesome-marker-web awesome-marker-icon-red"></div></li>'+
			'							<li><div id="div_punt4"	class="awesome-marker-web awesome-marker-icon-purple"></div></li>'+
			'							<li><div id="div_punt5" class="awesome-marker-web awesome-marker-icon-blue"></div></li>'+
			'							<li><div id="div_punt6" class="awesome-marker-web awesome-marker-icon-green"></div></li>'+
			'							<li><div id="div_punt7" class="awesome-marker-web awesome-marker-icon-darkgray"></div></li>'+
			'							<li><div id="div_punt8" class="awesome-marker-web awesome-marker-icon-gray"></div></li>'+
			'						</ul>'+
			'					</td>'+
			'					</tr> -->'+
			'					<tr class="fila-awesome-markers">'+
			'						<td colspan="8"><span lang="ca">Iconografia</span></td>'+
			'					</tr>'+
			'					<tr class="fila-awesome-markers">'+
			'					<td height="25" colspan="8"><span class="small" lang="ca">Colors icones:</span>'+
			'						<div class="btn-group">'+
			'							<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown">'+
			'								<div id="dv_fill_color_icon" class="fill_color_icon"></div>'+
			'							</a>'+
			'							<ul class="dropdown-menu">'+
			'								<li><div id="colorpalette_icon"></div></li>'+
			'							</ul>'+
			'						</div>'+
			'					</td>'+
			'					</tr>'+
			'					<tr class="fila-awesome-markers">'+
			'					<td colspan="8">'+
			'						<div id="iconsgli" style="height: 150px; overflow: auto">'+
			'							<ul class="bs-glyphicons">'+
			'								<li><span class="fa fa-"></span></li>'+
			'								<li><span class="fa fa-ambulance"></span></li>'+
			'								<li><span class="fa fa-asterisk"></span></li>'+
			'								<li><span class="fa fa-anchor"></span></li>'+
			'								<li><span class="fa fa-ban circle"></span></li>'+
			'								<li><span class="fa fa-bar-chart-o"></span></li>'+
			'								<li><span class="fa fa-beer"></span></li>'+
			'								<li><span class="fa fa-bell"></span></li>'+
			'								<li><span class="fa fa-bolt"></span></li>'+
			'								<li><span class="fa fa-book"></span></li>'+
			'								<li><span class="fa fa-briefcase"></span></li>'+
			'								<li><span class="fa fa-building-o"></span></li>'+
			'								<li><span class="fa fa-bullhorn"></span></li>'+
			'								<li><span class="fa fa-calendar"></span></li>'+
			'								<li><span class="fa fa-camera"></span></li>'+
			'								<li><span class="fa fa-certificate"></span></li>'+
			'								<li><span class="fa fa-check"></span></li>'+
			'								<li><span class="fa fa-circle"></span></li>'+
			'								<li><span class="fa fa-cloud"></span></li>'+
			'								<li><span class="fa fa-coffee"></span></li>'+
			'								<li><span class="fa fa-cog"></span></li>'+
			'								<li><span class="fa fa-cogs"></span></li>'+
			'								<li><span class="fa fa-dot-circle-o"></span></li>'+
			'								<li><span class="fa fa-comment"></span></li>'+
			'								<li><span class="fa fa-eur"></span></li>'+
			'								<li><span class="fa fa-smile-o"></span></li>'+
			'								<li><span class="fa fa-envelope"></span></li>'+
			'								<li><span class="fa fa-android"></span></li>'+
			'								<li><span class="fa fa-apple"></span></li>'+
			'								<li><span class="fa fa-exclamation sign"></span></li>'+
			'								<li><span class="fa fa-youtube-play"></span></li>'+
			'								<li><span class="fa fa-eye open"></span></li>'+
			'								<li><span class="fa fa-flask"></span></li>'+
			'								<li><span class="fa fa-female"></span></li>'+
			'								<li><span class="fa fa-male"></span></li>'+
			'								<li><span class="fa fa-facebook"></span></li>'+
			'								<li><span class="fa fa-smile-o"></span></li>'+
			'								<li><span class="fa fa-fighter-jet"></span></li>'+
			'								<li><span class="fa fa-film"></span></li>'+
			'								<li><span class="fa fa-fire"></span></li>'+
			'								<li><span class="fa fa-flag"></span></li>'+
			'								<li><span class="fa fa-gift"></span></li>'+
			'								<li><span class="fa fa-github"></span></li>'+
			'								<li><span class="fa fa-globe"></span></li>'+
			'								<li><span class="fa fa-google-plus"></span></li>'+
			'								<li><span class="fa fa-group"></span></li>'+
			'								<li><span class="fa fa-headphones"></span></li>'+
			'								<li><span class="fa fa-heart"></span></li>'+
			'								<li><span class="fa fa-home"></span></li>'+
			'								<li><span class="fa fa-hospital-o"></span></li>'+
			'								<li><span class="fa fa-plus-square"></span></li>'+
			'								<li><span class="fa fa-h-square"></span></li>'+
			'								<li><span class="fa fa-info sign"></span></li>'+
			'								<li><span class="fa fa-cutlery"></span></li>'+
			'								<li><span class="fa fa-leaf"></span></li>'+
			'								<li><span class="fa fa-legal"></span></li>'+
			'								<li><span class="fa fa-lemon-o"></span></li>'+
			'								<li><span class="fa fa-lightbulb-o"></span></li>'+
			'								<li><span class="fa fa-link"></span></li>'+
			'								<li><span class="fa fa-linkedin"></span></li>'+
			'								<li><span class="fa fa-lock"></span></li>'+
			'								<li><span class="fa fa-magic"></span></li>'+
			'								<li><span class="fa fa-magnet"></span></li>'+
			'								<li><span class="fa fa-map-marker"></span></li>'+
			'								<li><span class="fa fa-medkit"></span></li>'+
			'								<li><span class="fa fa-mobile phone"></span></li>'+
			'								<li><span class="fa fa-money"></span></li>'+
			'								<li><span class="fa fa-music"></span></li>'+
			'								<li><span class="fa fa-pencil"></span></li>'+
			'								<li><span class="fa fa-phone"></span></li>'+
			'								<li><span class="fa fa-picture-o"></span></li>'+
			'								<li><span class="fa fa-pinterest"></span></li>'+
			'								<li><span class="fa fa-plane"></span></li>'+
			'								<li><span class="fa fa-play-circle"></span></li>'+
			'								<li><span class="fa fa-rss"></span></li>'+
			'								<li><span class="fa fa-search"></span></li>'+
			'								<li><span class="fa fa-shopping-cart"></span></li>'+
			'								<li><span class="fa fa-signal"></span></li>'+
			'								<li><span class="fa fa-sitemap"></span></li>'+
			'								<li><span class="fa fa-spinner"></span></li>'+
			'								<li><span class="fa fa-star"></span></li>'+
			'								<li><span class="fa fa-stethoscope"></span></li>'+
			'								<li><span class="fa fa-stop"></span></li>'+
			'								<li><span class="fa fa-suitcase"></span></li>'+
			'								<li><span class="fa fa-tablet"></span></li>'+
			'								<li><span class="fa fa-tag"></span></li>'+
			'								<li><span class="fa fa-tags"></span></li>'+
			'								<li><span class="fa fa-th-large"></span></li>'+
			'								<li><span class="fa fa-thumbs-down"></span></li>'+
			'								<li><span class="fa fa-thumbs-up"></span></li>'+
			'								<li><span class="fa fa-times"></span></li>'+
			'								<li><span class="fa fa-tint"></span></li>'+
			'								<li><span class="fa fa-trash-o"></span></li>'+
			'								<li><span class="fa fa-trophy"></span></li>'+
			'								<li><span class="fa fa-truck"></span></li>'+
			'								<li><span class="fa fa-twitter"></span></li>'+
			'								<li><span class="fa fa-umbrella"></span></li>'+
			'								<li><span class="fa fa-unlock"></span></li>'+
			'								<li><span class="fa fa-user"></span></li>'+
			'								<li><span class="fa fa-wheelchair"></span></li>'+
			'								<li><span class="fa fa-volume-off"></span></li>'+
			'								<li><span class="fa fa-volume-up"></span></li>'+
			'								<li><span class="fa fa-warning sign"></span></li>'+
			'								<li><span class="fa fa-wrench"></span></li>'+
			'							</ul>'+
			'						</div>'+
			'					</td>'+
			'					</tr>'+
			'				</table>'+
			'			</div>'+
			'			<div class="modal-footer">'+
			'				<button type="button" lang="ca" class="btn btn-default"'+
			'					data-dismiss="modal">Cancel·lar</button>'+
			'				<button type="button" lang="ca" class="btn btn-success">Canviar</button>'+
			'			</div>'+
			'		</div>'+
			'		<!-- /.modal-content -->'+
			'	</div>'+
			'	<!-- /.modal-dialog -->'+
			'</div>'+
			'<!-- /.modal -->'+
			'<!-- fi modal punts -->'
	);
}

function addHtmlModalLinies(){
	jQuery('#mapa_modals').append(
	'	<!-- Modal Linies -->'+
	'		<div class="modal fade" id="dialog_estils_linies">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title" lang="ca">Estils de línia</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<table width="100%" class="tbl_taula" border="0" cellspacing="1"'+
	'						cellpadding="1">'+
	'						<tr>'+
	'							<td height="50" colspan="8">'+
	'								<div class="tbl">'+
	'									<div id="div_linia0" class="vector-web">'+
	'										<canvas id="cv_linia0" width="40" height="40"></canvas>'+
	'									</div>'+
	'								</div>'+
	'							</td>'+
	'						</tr>'+
	'						<tr>'+
	'							<td colspan="8"><span lang="ca">Estils disponibles</span></td>'+
	'						</tr>'+
	'						<tr>'+
	'							<td>'+
	'								<div id="dv_html_pol" class="tbl">'+
	'									<table>'+
	'										<tr>'+
	'											<td><span lang="ca">Color linia:</span></td>'+
	'											<td>'+
	'												<div class="btn-group">'+
	'													<a class="btn btn-mini dropdown-toggle"'+
	'														data-toggle="dropdown">'+
	'														<div id="dv_border_color_linia" class="border_color_linia"></div>'+
	'													</a>'+
	'													<ul class="dropdown-menu">'+
	'														<li><div id="colorpalette_ll"></div></li>'+
	'													</ul>'+
	'												</div>'+
	'											</td>'+
	'										</tr>'+
	'										<tr>'+
	'											<td><span lang="ca">Gruix linia:</span></td>'+
	'											<td><select id="cmb_gruix_l" class="form-control">'+
	'													<option value="1">1</option>'+
	'													<option value="2">2</option>'+
	'													<option selected value="3">3</option>'+
	'													<option value="4">4</option>'+
	'													<option value="5">5</option>'+
	'											</select></td>'+
	'										</tr>'+
	'									</table>'+
	'								</div>'+
	'							</td>'+
	'						</tr>'+
	'					</table>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
	'					<button type="button" class="btn btn-success">Canviar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!--  fi modal lineas -->'
	);
}

function addHtmlModalArees(){
	jQuery('#mapa_modals').append(
	'	<!-- Modal Arees -->'+
	'		<div class="modal fade" id="dialog_estils_arees">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title" lang="ca">Estils d\'àrees</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<table width="100%" class="tbl_taula" border="0" cellspacing="1"'+
	'						cellpadding="1">'+
	'						<tr>'+
	'							<td height="50" colspan="8">'+
	'								<div class="tbl">'+
	'									<div id="div_area0" class="vector-web">'+
	'										<canvas id="cv_pol0" width="40" height="40"></canvas>'+
	'									</div>'+
	'								</div>'+
	'							</td>'+
	'						</tr>'+
	'						<tr>'+
	'							<td colspan="8"><span lang="ca">Estils disponibles</span></td>'+
	'						</tr>'+
	'						<tr>'+
	'							<td>'+
	'								<div id="dv_html_pol" class="tbl">'+
	'									<table>'+
	'										<tr>'+
	'											<td><span lang="ca">Color contorn:</span></td>'+
	'											<td>'+
	'												<div class="btn-group">'+
	'													<a class="btn btn-mini dropdown-toggle"'+
	'														data-toggle="dropdown">'+
	'														<div id="dv_border_color_pol" class="border_color_pol"></div>'+
	'													</a>'+
	'													<ul class="dropdown-menu">'+
	'														<li><div id="colorpalette_pl"></div></li>'+
	'													</ul>'+
	'												</div>'+
	'											</td>'+
	'										</tr>'+
	'										<tr>'+
	'											<td><span lang="ca">Gruix contorn:</span></td>'+
	'											<td><select id="cmb_gruix" class="form-control">'+
	'													<option value="1">1</option>'+
	'													<option value="2">2</option>'+
	'													<option selected value="3">3</option>'+
	'													<option value="4">4</option>'+
	'													<option value="5">5</option>'+
	'											</select></td>'+
	'										</tr>'+
	'										<tr>'+
	'											<td><span lang="ca">Color fons:</span></td>'+
	'											<td>'+
	'												<div class="btn-group">'+
	'													<a class="btn btn-mini dropdown-toggle"'+
	'														data-toggle="dropdown">'+
	'														<div id="dv_fill_color_pol" class="fill_color_pol"></div>'+
	'													</a>'+
	'													<ul class="dropdown-menu">'+
	'														<li><div id="colorpalette_pf"></div></li>'+
	'													</ul>'+
	'												</div>'+
	'											</td>'+
	'										</tr>'+
	'										<tr>'+
	'											<td><span lang="ca">Transperència fons:</span></td>'+
	'											<td><select id="cmb_trans" class="form-control">'+
	'													<option value="0">100%</option>'+
	'													<option value="0.25">75%</option>'+
	'													<option selected value="0.5">50%</option>'+
	'													<option value="0.75">25%</option>'+
	'													<option value="1">0%</option>'+
	'											</select></td>'+
	'										</tr>'+
	'									</table>'+
	'								</div>'+
	'							</td>'+
	'						</tr>'+
	'					</table>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
	'					<button type="button" class="btn btn-success">Canviar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!--  fi modal arees -->'		
	);
}