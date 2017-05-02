/**
 * Gestio del temàtic de tipus Bubbles 
 */
function showModalTematicBubbles(data){
	//console.debug("showModalTematicBubbles");
	//console.debug(data);
	jQuery('.modal').modal('hide');
	jQuery('#dialog_tematic_bubble').modal('show');
	
	jQuery("#dialog_tematic_bubble").data("capamare", data);
	
	//se ponen los off para evitar el doble evento
	//TODO hay que revisar como evitar el doble evento.
	jQuery('#dialog_tematic_bubble .btn-success').off('click');
	jQuery('#dialog_tematic_bubble .btn-success').on('click',function(e){
		jQuery('#dialog_tematic_bubble').hide();
		jQuery('#info_uploadFile').show();
		busy=true;
		jQuery("#div_uploading_txt").html("");
		jQuery("#div_uploading_txt").html(
				'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic de mides')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
				'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'
		);	
		createTematicLayerBubbles(e);
	});
	
	$("#dialog_tematic_bubble #colorpalette_punt_bubble").colorPalette().on('selectColor', function(e) {
		//var canvas = _this;
		$('#dv_fill_color_punt_bubble').css('background-color',e.color);
		jQuery("#dialog_tematic_bubble").data("paleta",e.color);
		//cambiar los colores del tematic
		
		var rtype = $("input:radio[name=rd_tipus_agrupacio_bubble]:checked").val();
		var crea = false;
		if (rtype == 'P'){
			crea = true;
		}else{
			if (jQuery('#cmb_num_rangs_bubble').val() != "---"){
				crea = true;
			}
		}
		if (crea){
			createRangsValuesBubbles(jQuery('#cmb_num_rangs_bubble').val(),jQuery("#dialog_tematic_bubble").data("bubbles"));
		}
	});
	
	jQuery('#tipus_agrupacio_grp_bubble').hide();
	jQuery('#num_rangs_grp_bubble').hide();
	jQuery('#list_tematic_values_bubble').html("");
	jQuery('#dialog_tematic_bubble .btn-success').hide();
	jQuery('#palet_warning_bubble').hide();
	jQuery('#size_warning_bubble_grad').hide();
	jQuery('#size_warning_bubble_prop').hide();
	
	var dataTem={
		businessId: data.businessid,
		uid: Cookies.get('uid')
	};
	
	if(data.tipus == t_url_file){
		var urlFileLayer = controlCapes._layers[data.leafletid].layer;
		jQuery("#dialog_tematic_bubble").data("visualitzacio", urlFileLayer.options);
		var fields = {};
		//fields[window.lang.translate('Escull el camp')] = '---';
		//Recollim propName de les geometries de la capa
		var dataNames = urlFileLayer.options.propName.split(',');
		jQuery.each(dataNames, function( index, value ) {
			fields[value] = value;
		});
		
		//creamos el select con los campos
		var source1 = jQuery("#tematic-layers-fields-bubble").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1({fields:fields});
		jQuery('#dataFieldBubble').html(html1);
		
		jQuery('#dataFieldBubble').off('change');
		jQuery('#dataFieldBubble').on('change',function(e){
			var this_ = jQuery(this);
			if (this_.val() == "---"){
				jQuery('#tipus_agrupacio_grp_bubble').hide();
				jQuery('#num_rangs_grp_bubble').hide();
				jQuery('#list_tematic_values_bubble').html("");
				jQuery('#dialog_tematic_bubble .btn-success').hide();
				jQuery('#palet_warning_bubble').hide();
				jQuery('#size_warning_bubble_grad').hide();
				jQuery('#size_warning_bubble_prop').hide();
			}else{
				readDataUrlFileLayer(urlFileLayer, this_.val()).then(function(results){
					jQuery("#dialog_tematic_bubble").data("values", results);
					getTipusValuesVisualitzacioBubbles(results);
				});
			}
		});			
		
	}else{//Si es una visualitzacio
		getVisualitzacioByBusinessId(dataTem).then(function(results){
			if (results.status == "OK"){
				var visualitzacio = results.results;
				jQuery("#dialog_tematic_bubble").data("visualitzacio", visualitzacio);
				var fields = {};
				//fields[window.lang.translate('Escull el camp')] = '---';
				if (visualitzacio.options){
					//var options = JSON.parse(visualitzacio.options);
					var options;
					if(typeof (visualitzacio.options)=="string"){
						try {
							options = JSON.parse(visualitzacio.options);
						}
						catch (err) {
							options = visualitzacio.options;	
						}
						
					}else{
						
						options = visualitzacio.options;	
					}
					
					var dataNames;
					if(options.propName){
						dataNames = options.propName.split(',');
						jQuery.each(dataNames, function( index, value ) {
							fields[value] = value;
						});
					}else{
						if (results.geometries && results.geometries.options){
							dataNames = results.geometries.options.split(',');
							jQuery.each(dataNames, function( index, value ) {
								fields[value] = value;
							});
						}
					}
					/*
					var dataNames = options.propName.split(',');
					jQuery.each(dataNames, function( index, value ) {
						fields[value] = value;
					});
					*/
				}else{
					if (results.geometries && results.geometries.options){
						var dataNames = results.geometries.options.split(',');
						jQuery.each(dataNames, function( index, value ) {
							fields[value] = value;
						});
					}
				}
				
				//creamos el select con los campos
				var source1 = jQuery("#tematic-layers-fields-bubble").html();
				var template1 = Handlebars.compile(source1);
				var html1 = template1({fields:fields});
				jQuery('#dataFieldBubble').html(html1);
				jQuery('#dataFieldBubble').off('change');
				jQuery('#dataFieldBubble').on('change',function(e){
					var this_ = jQuery(this);
					if (this_.val() == "---"){
						jQuery('#tipus_agrupacio_grp_bubble').hide();
						jQuery('#num_rangs_grp_bubble').hide();
						jQuery('#list_tematic_values_bubble').html("");
						jQuery('#dialog_tematic_bubble .btn-success').hide();
						jQuery('#palet_warning_bubble').hide();
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').hide();
					}else{
						readDataVisualitzacio(visualitzacio, this_.val()).then(function(results){
							jQuery("#dialog_tematic_bubble").data("values", results);
							getTipusValuesVisualitzacioBubbles(results);
						});
					}
				});
			}else{
				//TODO error
				console.debug("getVisualitzacioByBusinessId ERROR");	
				$.publish('analyticsEvent',{event:['error', 'getVisualitzacioByBusinessId','bubble']});
			}
		},function(results){
			//TODO error
			$.publish('analyticsEvent',{event:['error', 'getVisualitzacioByBusinessId','bubble']});
		});	
	}
	
}

function getTipusValuesVisualitzacioBubbles(results){
	//console.debug("getTipusValuesVisualitzacioBubbles");
	if (results.length == 0){
		var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.translate('Aquest camp no te valors')+"<strong>  <span class='fa fa-warning sign'></span></div>";
		jQuery('#list_tematic_values_bubble').html(warninMSG);
		jQuery('#palet_warning_bubble').hide();
		jQuery('#size_warning_bubble_grad').hide();
		jQuery('#size_warning_bubble_prop').hide();
		jQuery('#dialog_tematic_bubble .btn-success').hide();
	}else{
		var nodata = [];
		var arr = jQuery.grep(results, function( n, i ) {
			var isText = false;
			if (!jQuery.isNumeric(n)){
				if (n == "Sense valor" || n == "Sin valor" || n == "Empty value" || n == NODATA_VALUE){
					nodata.push(n);
				}else{
					isText = true;
				}
			}
			return isText;
		});
		if (nodata.length != 0){
			jQuery("#dialog_tematic_bubble").data("nodata",true);
		}
		if (arr.length == 0){
			jQuery('#tipus_agrupacio_grp_bubble').show();
			jQuery('#num_rangs_grp_bubble').show();
			jQuery('#list_tematic_values_bubble').html("");
			jQuery('#palet_warning_bubble').hide();
			jQuery('#size_warning_bubble_grad').hide();
			jQuery('#size_warning_bubble_prop').hide();
			
			//cambiar tipus radio click
			jQuery( "input:radio[name=rd_tipus_agrupacio_bubble]").on('change',function(e){
				var this_ = jQuery(this);
				var crea = false;
				jQuery('#list_tematic_values_bubble').html("");
				jQuery('#dialog_tematic_bubble .btn-success').hide();
				jQuery('#palet_warning_bubble').hide();
				jQuery('#size_warning_bubble_grad').hide();
				jQuery('#size_warning_bubble_prop').hide();
				//jQuery('#cmb_num_rangs_bubble').val("---");
				jQuery("#dialog_tematic_bubble").data("bubbles",this_.val());
				jQuery("#dialog_tematic_bubble").data("rangs",null);
				if (this_.val() == "P"){
					jQuery('#num_rangs_grp_bubble').hide();
					crea = true;
				}else{
					jQuery('#num_rangs_grp_bubble').show();
					if (jQuery('#cmb_num_rangs_bubble').val() != "---"){
						crea = true;
					}
				}
				if (crea){
					createRangsValuesBubbles(jQuery('#cmb_num_rangs_bubble').val(),this_.val());
				}
			});
			
			jQuery('#cmb_num_rangs_bubble').on('change',function(e){
				var this_ = jQuery(this);
				jQuery('#list_tematic_values_bubble').html("");
				jQuery('#size_warning_bubble_grad').hide();
				jQuery('#size_warning_bubble_prop').hide();
				if (this_.val() == "---"){
					jQuery('#dialog_tematic_bubble .btn-success').hide();
				}else{
					createRangsValuesBubbles(this_.val(),jQuery("#dialog_tematic_bubble").data("bubbles"));
				}
			});
			//jQuery('#rd_tipus_proporcional').click().change();
			jQuery('#rd_tipus_graduado').click().change();	
		}else{ //unicos no se puede hacer el tematic
			jQuery('#tipus_agrupacio_grp_bubble').hide();
			jQuery('#num_rangs_grp_bubble').hide();
			jQuery('#dialog_tematic_bubble .btn-success').hide();
			jQuery('#list_tematic_values_bubble').html("");
			jQuery('#palet_warning_bubble').show();
			jQuery('#size_warning_bubble_grad').hide();
			jQuery('#size_warning_bubble_prop').hide();
		}
	}
}

function createRangsValuesBubbles(nrangs,rtype){
	//console.debug("createRangsValuesBubbles");
	var midaMin = 15;
	var midaMax = 150;
	var deltaM = 20;
	
	var values = jQuery("#dialog_tematic_bubble").data("values");
	var tematic = jQuery("#dialog_tematic_bubble").data("tematic");
	var visualitzacio = jQuery("#dialog_tematic_bubble").data("visualitzacio");
	var rangs = jQuery("#dialog_tematic_bubble").data("rangs");
	var nodata = jQuery("#dialog_tematic_bubble").data("nodata");
	var reverse = jQuery("#dialog_tematic_bubble").data("reverse");
	
	values = jQuery.grep(values, function( n, i ) {
		return (n != NODATA_VALUE && jQuery.isNumeric(parseFloat(n)));
	});
	values.sort(function(a,b){return a-b});
	
	var min = parseFloat(values[0]);
	var max = parseFloat(values[values.length-1]);
	var newRangs = [];
	if (rtype == 'P'){
		if (rangs){
			newRangs = jQuery("#dialog_tematic_bubble").data("rangs");
		}else{
			newRangs.push({min: min, max: max, mida: midaMin, midaMax: midaMax});
		}
	}else{
		var deltaR = (max - min)/nrangs;
		deltaR = parseFloat(deltaR.toFixed(2));
		//var deltaM = (midaMax - midaMin)/(nrangs -1);
		//deltaM = parseInt(deltaM);
		var i = 0;
		
		if(rangs && rangs.length == nrangs){
			newRangs = jQuery("#dialog_tematic_bubble").data("rangs");
		}else{
			while (min < max && i < nrangs){
				if (i == (nrangs-1)){
					newRangs.push({min: min, max: max, mida:midaMin});
				}else{
					var tmpmax = parseFloat((min+deltaR).toFixed(2));
					var tmpmida = parseInt(midaMin+deltaM);
					newRangs.push({min: min, max: tmpmax, mida:midaMin});
					min = tmpmax;
					midaMin = tmpmida;
				}
				i++;
			}
		}		
	}
	
	if (nodata){
		newRangs.push({min: NODATA_VALUE, max: NODATA_VALUE, nodata:true});
	}
	
	jQuery("#dialog_tematic_bubble").data("rangs", newRangs);
	showTematicRangsBubbles().then(function(results){
		loadTematicValueTemplateBubbles(results, rtype);
	});
	
}

function showTematicRangsBubbles(){
	//console.debug("showTematicRangsBubbles");
	var values = jQuery("#dialog_tematic_bubble").data("rangs");
	var visualitzacio = jQuery("#dialog_tematic_bubble").data("visualitzacio");
	var paleta = jQuery("#dialog_tematic_bubble").data("paleta");
	var reverse = jQuery("#dialog_tematic_bubble").data("reverse");
	jQuery("#dialog_tematic_bubble").data("tipusrang","rangs");
	
	paleta = paleta ? paleta : '#FFC500';
	var scale = createScaleBubbles([paleta,paleta], values.length, reverse);
			
	var defer = jQuery.Deferred();
	var valuesStyle = [];
	var ftype = transformTipusGeometry(visualitzacio.geometryType);
	
	if (ftype == t_marker){
		valuesStyle = jQuery.map( values, function( a, i ) {
			if (a.nodata){
				a.mida = NODATA_MIDA;
				return {v: a, style: createBubbleStyle(i,ftype,scale,a.mida,a.midaMax,true), index: i};
			}else{
				return {v: a, style: createBubbleStyle(i,ftype,scale,a.mida,a.midaMax,false), index: i};
			}
		});
	}
	defer.resolve(valuesStyle);
	return defer.promise();
}

function loadTematicValueTemplateBubbles(results, rtype){
	//console.debug("loadTematicValueTemplateBubbles");
	var source1;
	
	var delayKeyUp = (function(){
	  var timer = 0;
	  return function(callback, ms){
	    clearTimeout (timer);
	    timer = setTimeout(callback, ms);
	  };
	})();
	
	var geometryType = results[0].style.geometryType;
	if (!geometryType){
		geometryType = results[0].style.tipus;
	}
	var ftype = transformTipusGeometry(geometryType);
	
	rtype = rtype ? rtype: $("input:radio[name=rd_tipus_agrupacio_bubble]:checked").val();
	
	if (ftype == t_marker){
		if (rtype == 'P'){
			source1 = jQuery("#tematic-values-proportional-punt-template-bubble").html();
		}else{
			source1 = jQuery("#tematic-values-rangs-punt-template-bubble").html();
		}
		
	}
	var template1 = Handlebars.compile(source1);
	var html1 = template1({values:results});
	jQuery('#list_tematic_values_bubble').html(html1);
	jQuery('#dialog_tematic_bubble .btn-success').show();
		
	if (ftype == t_marker){
		jQuery('#list_tematic_values_bubble div.awesome-marker-web').on('click',function(e){
			var _this = this;
			var _$this = $(this);
			
			$("#temp_color_pallete").remove();
			
			_$this.after('<div id="temp_color_pallete" class="dropdown-menu"></div>');
			
			$("#temp_color_pallete").css({'top':_$this.position().top,'left':_$this.position().left+25}).colorPalette().on('selectColor', function(e) {
				_$this.css('background-color',e.color);
				$("#temp_color_pallete").remove();
			});
		});
		
		jQuery('#list_tematic_values_bubble .mida').on('change keyup',function(e){
			var _this = this;
			var _$this = $(this);
			delayKeyUp(function(){
			if (_$this.closest('.buble_prop').length > 0){ //proportional
				var mida = parseInt(jQuery('#list_tematic_values_bubble input[name=mida]').val());
				var midaMax = parseInt(jQuery('#list_tematic_values_bubble input[name=mida_max]').val());
				if(_$this.prop('name') == "mida"){
					if (mida > midaMax ){
						_$this.val(midaMax-1);
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').show();
					}else{
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').hide();
					}
				}else{
					if (mida > midaMax ){
						_$this.val(mida+1);
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').show();
					}else{
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').hide();
					}
				}
			}else{
				var _listMida = jQuery('#list_tematic_values_bubble .mida').not('.nodata');
				var index = _listMida.index(_$this);
				if (index == 0){ //primer
					if (parseInt(_$this.val()) > parseInt(jQuery(_listMida[index+1]).val())){
						_$this.val(parseInt(jQuery(_listMida[index+1]).val())-1);
						jQuery('#size_warning_bubble_grad').show();
						jQuery('#size_warning_bubble_prop').hide();
					}else{
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').hide();
					}
				}else if (index == (_listMida.length-1)){ //ultim
					if(parseInt(_$this.val()) < parseInt(jQuery(_listMida[index-1]).val())){
						_$this.val(parseInt(jQuery(_listMida[index-1]).val())+1);
						jQuery('#size_warning_bubble_grad').show();
						jQuery('#size_warning_bubble_prop').hide();
					}else{
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').hide();
					}
				}else if (index != -1){
					if((parseInt(_$this.val()) > parseInt(jQuery(_listMida[index+1]).val())) || (parseInt(_$this.val()) < parseInt(jQuery(_listMida[index-1]).val()))){
						if (parseInt(_$this.val()) > parseInt(jQuery(_listMida[index+1]).val())){
							_$this.val(parseInt(jQuery(_listMida[index+1]).val())-1);
						}else{
							_$this.val(parseInt(jQuery(_listMida[index-1]).val())+1);
						}
						jQuery('#size_warning_bubble_grad').show();
						jQuery('#size_warning_bubble_prop').hide();
					}else{
						jQuery('#size_warning_bubble_grad').hide();
						jQuery('#size_warning_bubble_prop').hide();
					}
				}
			}			
			changeBubbleSize(_$this.val(),_$this.parent().parent().find('.awesome-marker-web'));
			changeBubbleValueMida(_$this.val(),_$this.closest('tr').index(), _$this.prop('name'));
			},300);
		});
				
		jQuery("input:text[name=min]").on('change keyup',function(e){
			var _this = this;
			var _$this = $(this);
			changeBubbleMinValue(_$this.val(),_$this.closest('tr').index());
		});
		
		jQuery("input:text[name=max]").on('change keyup',function(e){
			var _this = this;
			var _$this = $(this);
			changeBubbleMaxValue(_$this.val(),_$this.closest('tr').index());
		});
		
	}
}

function changeBubbleValueMida(mida, index, name){
	//console.debug("changeBubbleValueMida");
	var values = jQuery("#dialog_tematic_bubble").data("rangs");
	var val = values[index];
	if (name == 'mida_max'){
		val.midaMax = mida;
	}else{
		val.mida = mida;
	}
	values[index] = val;
	jQuery("#dialog_tematic_bubble").data("rangs", values);
}

function changeBubbleMinValue(value, index){
	var values = jQuery("#dialog_tematic_bubble").data("rangs");
	var val = values[index];
	val.min = value;
	values[index] = val;
	jQuery("#dialog_tematic_bubble").data("rangs", values);
}

function changeBubbleMaxValue(value, index){
	var values = jQuery("#dialog_tematic_bubble").data("rangs");
	var val = values[index];
	val.max = value;
	values[index] = val;
	jQuery("#dialog_tematic_bubble").data("rangs", values);
}

function createScaleBubbles(paleta, length, reverse){
	//console.debug("createScaleBubbles");
	var scale = ColorScales.createScale(paleta, length, reverse);
	return scale;
}

function changeBubbleSize(size, bubble){
	//console.debug("changeBubbleSize");
	$(bubble).css({
		'width': size+'px',
		'height': size+'px',
		'border-radius': size/2+'px'
	});
}

function createBubbleStyle(index, geometryType, paleta, mida, midaMax, nodata){
	//console.debug("createBubbleStyle");
	var defStyle;
		
	var ftype = transformTipusGeometry(geometryType);
		
	if (ftype == t_marker){
		defStyle = jQuery.extend({}, default_circulo_style);
		defStyle.fillColor = paleta(index).hex();
		if(nodata){
			defStyle.fillColor = NODATA_COLOR;
		}
		defStyle.size = mida;
		defStyle.sizeMax = midaMax;
		defStyle.radius = mida/2;
		defStyle.radiusMax = midaMax/2;
		defStyle.isCanvas = true;		
	}
	defStyle.geometryType = ftype;
	
	return defStyle;
}

function createTematicLayerBubbles(event){

	$.publish('analyticsEvent',{event:['mapa', tipus_user+'estils', 'bubbles', 1]});
	
	var tematic = jQuery("#dialog_tematic_bubble").data("tematic");
	var visualitzacio = jQuery("#dialog_tematic_bubble").data("visualitzacio");
	var tematicFrom = jQuery("#dialog_tematic_bubble").data("capamare");
	var capaMare = controlCapes._layers[tematicFrom.leafletid].layer;
	var rtype = jQuery("input:radio[name=rd_tipus_agrupacio_bubble]:checked").val();
	var values = jQuery("#dialog_tematic_bubble").data("values");
	var brangs = jQuery("#dialog_tematic_bubble").data("rangs");
	var paleta = jQuery("#dialog_tematic_bubble").data("paleta");
	var reverse = jQuery("#dialog_tematic_bubble").data("reverse");
	var rangs = [];
	if (rtype == 'P'){
		var min = jQuery('#list_tematic_values_bubble input[name=min]').val();
		var mida = jQuery('#list_tematic_values_bubble input[name=mida]').val();
		var max = jQuery('#list_tematic_values_bubble input[name=max]').val();
		var midaMax = jQuery('#list_tematic_values_bubble input[name=mida_max]').val();
		var styleMin = bubble2RangStyle(jQuery('#list_tematic_values_bubble #div_punt_min'));
		var styleMax = bubble2RangStyle(jQuery('#list_tematic_values_bubble #div_punt_max'));
		
		var scale = ColorScales.createScale([styleMin.color, styleMax.color], [min, max], reverse);
		//var scale = chroma.scale([styleMin.color, styleMax.color]).domain([min, max]);
		//var scale = createScale([styleMin.color, styleMax.color], [min, max]);
		jQuery.each(values,function(index, value){
			var rangEstil;
			var size;
			if (value == NODATA_VALUE){
				rangEstil = bubble2RangStyle(jQuery('#list_tematic_values_bubble #div_punt_nodata'));
			}else{
				rangEstil = bubble2RangStyle(jQuery('#list_tematic_values_bubble #div_punt_min'));
				rangEstil.color = scale(value).hex();
				size = bubblePropostionalSize(min,max,mida,midaMax,value);
				rangEstil.simbolSize = parseInt(size/2.4);
			}
			var rang = {};
			rang.estil = rangEstil;
			rang.valueMax = value;
			rang.valueMin = value;
			rangs.push(rang);
		});
	}else{
		var rangsTr = jQuery('#list_tematic_values_bubble tbody tr');
		jQuery.each(rangsTr, function( index, value ) {
			var _this = jQuery(value);
			var tdRang, tdMin, tdMax;
			var tdVal;
			tdMin = _this.find('td:eq(0)');
			tdMax = _this.find('td:eq(1)');
			tdVal = _this.find('td:eq(3)');
			var rangEstil = div2RangStyle(tematicFrom, tdVal);
			var rang = {};
			rang.estil = rangEstil; 
			rang.valueMin = tdMin.find('input').val();
			rang.valueMax = tdMax.find('input').val();
			rangs.push(rang);
		});
	}
	var estils = {
		estils: rangs,
		dataField: jQuery('#dataFieldBubble').val().toLowerCase(),
		labelField: jQuery('#dataFieldBubble').val().toLowerCase()
	};
	
	if(visualitzacio.tipus == t_url_file){	
		var data1 = {
			uid: Cookies.get('uid'),
			businessId1: capaMare.options.businessId
		}
		crearFitxerPolling(data1).then(function(results) {
			var tmpFile="";
			if (results.status=="OK"){
				tmpFile = results.tmpFilePath;
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime =3000;
				//Fem polling
				(function(){							
					pollBuffer = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
							dataType: 'json',
							type: 'get',
							success: function(data){
								//console.debug(data);
								jQuery('#dialog_tematic_rangs').hide();
								jQuery('#info_uploadFile').show();
								if(data.status.indexOf("PAS 1")!=-1 && busy){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic de mides')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);									
									
								}else if(data.status.indexOf("PAS 3")!=-1 && busy){
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic de mides creat')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);										
								}else if(data.status.indexOf("OK")!=-1 && busy){
									clearInterval(pollInterval);
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic de mides creat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Processant la resposta')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'
									);									
									loadURLfileLayer(data.results).then(function(results){
										busy=false;					
										jQuery('#info_uploadFile').hide();
										activaPanelCapes(true);
										//Desactivem la capa mare
										if ($( "#input-"+capaMare.options.businessId).attr("checked")!=undefined) $( "#input-"+capaMare.options.businessId).click();
									});
									
								}else if(data.status.indexOf("ERROR")!=-1 && busy){
									console.error("Error calculant l'operació");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									$('#dialog_error_upload_txt').text(window.lang.translate("Error calculant l'operació"));										
									
									$('#dialog_error_upload').modal('show');
								}
								else if (!busy){
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						pollBuffer();
					},pollTime);
					
				})();
			}
			else {
				jQuery('#info_uploadFile').hide();		
				busy=false;
			}
			var options = {
				url: capaMare.options.url,
				tem: tem_size,
				style: estils,
				origen: capaMare.options.businessId,
				tipus : t_url_file,
				tipusFile: capaMare.options.tipusFile,
				estil_do: estils,
				epsgIN: capaMare.options.epsgIN,
				geometryType: capaMare.options.geometryType,
				colX: capaMare.options.colX,
				colY: capaMare.options.colY,
				dinamic: capaMare.options.dinamic
			};
		
			var data = {
				uid:Cookies.get('uid'),
				mapBusinessId: url('?businessid'),
				serverName: capaMare.options.nom+" "+window.lang.translate("Mides"),
				serverType: capaMare.options.tipus,
				calentas: false,
		        activas: true,
		        visibilitats: true,
		        order: capesOrdre_sublayer,				
		        epsg: capaMare.options.epsgIN,
		        transparency: true,
		        opacity: 1,
		        visibilitat: 'O',
		        url: capaMare.options.url,
				options: JSON.stringify(options),
				tmpFilePath: tmpFile,
				urlTematic:paramUrl.createServidorInMap,
				tipusTematic: "t_url_file"
			};
			callActions(data);
			/*createServidorInMap(data);/*.then(function(results){
				loadURLfileLayer(results.results).then(function(results){
					busy=false;					
					jQuery('#info_uploadFile').hide();
					activaPanelCapes(true);
				});
			});*/		
		 });	
	}else{
		var data1 = {
				uid: Cookies.get('uid'),
				businessId1: tematicFrom.businessid
		}
		crearFitxerPolling(data1).then(function(results) {
			var tmpFile="";
			if (results.status=="OK"){
				tmpFile = results.tmpFilePath;
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime =3000;
				//Fem polling
				(function(){							
					pollBuffer = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
							dataType: 'json',
							type: 'get',
							success: function(data){
								//console.debug(data);
								jQuery('#dialog_tematic_rangs').hide();
								jQuery('#info_uploadFile').show();
								if(data.status.indexOf("PAS 1")!=-1 && busy){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic de mides')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);									
									
								}else if((data.status.indexOf("PAS 2") || data.status.indexOf("PAS 3"))!=-1 && busy){
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic de mides creat')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);										
								}else if(data.status.indexOf("OK")!=-1 && busy){
									clearInterval(pollInterval);
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic de mides creat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Processant la resposta')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'
									);		
									busy=false;					
									jQuery('#info_uploadFile').hide();
									var defer = $.Deferred();
									
									readVisualitzacio(defer, data.visualitzacio, data.layer).then(function(results){
										activaPanelCapes(true);
										//Desactivem la capa mare
										if ($( "#input-"+capaMare.options.businessId).attr("checked")!=undefined) $( "#input-"+capaMare.options.businessId).click();
									});
									
									
								}else if(data.status.indexOf("ERROR")!=-1 && busy){
									console.error("Error calculant l'operació");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									$('#dialog_error_upload_txt').text(window.lang.translate("Error calculant l'operació"));										
									
									$('#dialog_error_upload').modal('show');
								}
								else if (!busy){
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						pollBuffer();
					},pollTime);
					
				})();
			}
			else {
				jQuery('#info_uploadFile').hide();		
				busy=false;
			}
			var data = {
				businessId: tematicFrom.businessid,//businessId id de la visualización de origen
				uid: Cookies.get('uid'),//uid id de usuario
		        mapBusinessId: url('?businessid'),//mapBusinessId id del mapa donde se agrega la visualización	           
		        nom: capaMare.options.nom+" "+window.lang.translate("Mides"),
		        activas: true,
		        order: capesOrdre_sublayer,//order (optional) orden de la capa en el mapa
		        dataField: jQuery('#dataFieldBubble').val(),//¿?¿?¿?¿?
				tem: tem_size,//visualitzacio.from,//tem_size
				estils: JSON.stringify(estils),			
				tmpFilePath: tmpFile,
				urlTematic:paramUrl.createVisualitzacioTematica,
				tipusTematic:"t_visualitzacio_categories"
			};
			callActions(data);
			/*createVisualitzacioTematica(data);/*.then(function(results){
				if(results.status == 'OK'){
					var defer = $.Deferred();
					busy=false;					
					jQuery('#info_uploadFile').hide();
					readVisualitzacio(defer, results.visualitzacio, results.layer).then(function(results){
						activaPanelCapes(true);
					});
					
				}
			});	*/
		 });				
	}
	
	event.preventDefault();
	event.stopImmediatePropagation();
	
}

function bubble2RangStyle(divElement){
	//console.debug("bubble2RangStyle");
	var rangStyle = {
		borderColor :  "#ffffff",
		borderWidth :  2,
		simbolSize: parseInt(parseInt(divElement.css('height'))/2.4),
		color: jQuery.Color(divElement.css('background-color')).toHexString(),
		opacity: 90
	};
	return rangStyle;
}

function bubblePropostionalSize(min, max, minSize, maxSize, value){
	//console.debug("bubblePropostionalSize");
	var size;
	var dv = parseFloat(max) - parseFloat(min);
	var dm = parseInt(maxSize) - parseInt(minSize);
	var scale = dm/dv;
	var difVal = parseFloat(value) - parseFloat(min);
	size = parseInt(difVal*scale);
	size = size + parseInt(minSize);
	return size;
}
