/**
 * Gestio del temàtic de tipus Categories 
 */

var paletasColors = [
  ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#999999'],
  ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#bc80bd','#d9d9d9'],
  ['#c0cdc0','#adbea2','#a2ae81','#9e9c60','#9d893f','#9e7321','#a05a04','#a23c00','#a30000','#dadada'],
  ['#d2c1c1','#cba9a9','#c49191','#bc7979','#b56060','#ae4848','#a63030','#9f1818','#980000','#dadada']
];

function showModalTematicCategories(data){
	//console.debug("createTematicClasic");
	jQuery('.modal').modal('hide');
	jQuery('#dialog_tematic_rangs').modal('show');
	
	jQuery('#dialog_tematic_rangs .btn-success').on('click',function(e){
		createTematicLayerCategories(e);
	});	
	//console.debug(data);
	
	jQuery('#palet_warning').hide();
	
	jQuery(".ramp").on('click',function(evt){
		var _this = jQuery(this);
		var brewerClass = _this.attr('class').replace("ramp ","");
		jQuery("#dialog_tematic_rangs").data("paleta", brewerClass);
		/*
		if (_this.attr('id') == 'paletaPaired'){
			jQuery("#dialog_tematic_rangs").data("paleta", 0);
		}else if (_this.attr('id') == 'paletaPastel'){
			jQuery("#dialog_tematic_rangs").data("paleta", 1);
		}else if (_this.attr('id') == 'paletaDivergent'){
			jQuery("#dialog_tematic_rangs").data("paleta", 2);
		}else if (_this.attr('id') == 'paletaSecuencial'){
			jQuery("#dialog_tematic_rangs").data("paleta", 3);
		}else{
			jQuery("#dialog_tematic_rangs").data("paleta", 0);
		}
		*/
		if (jQuery('#list_tematic_values').html() != ""){
			updatePaletaRangs();
		}
	});
	
	jQuery("#dialog_tematic_rangs").data("capamare", data);
	
	jQuery('#tipus_agrupacio_grp').hide();
	jQuery('#num_rangs_grp').hide();
	jQuery('#list_tematic_values').html("");
	jQuery('#dialog_tematic_rangs .btn-success').hide();
	
	var dataTem={
		businessId: data.businessid,
		uid: jQuery.cookie('uid')
	};
		
	getVisualitzacioByBusinessId(dataTem).then(function(results){
		if (results.status == "OK"){
			var visualitzacio = results.results;
			jQuery("#dialog_tematic_rangs").data("visualitzacio", visualitzacio);
			var fields = {};
			fields[window.lang.convert('Escull el camp')] = '---';
			if (results.geometries && results.geometries.options){
				
				var dataNames = results.geometries.options.split(',');
				jQuery.each(dataNames, function( index, value ) {
					fields[value] = value;
				});
			}
			
			//creamos el select con los campos
			var source1 = jQuery("#tematic-layers-fields").html();
			var template1 = Handlebars.compile(source1);
			var html1 = template1({fields:fields});
			jQuery('#dataField').html(html1);
			
			jQuery('#dataField').on('change',function(e){
				var this_ = jQuery(this);
				if (this_.val() == "---"){
					jQuery('#tipus_agrupacio_grp').hide();
					jQuery('#num_rangs_grp').hide();
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
				}else{
					readDataVisualitzacio(visualitzacio, this_.val()).then(function(results){
						jQuery("#dialog_tematic_rangs").data("values", results);
						getTipusValuesVisualitzacio(results);
					});

				}
			});				
		}else{
			//TODO error
			console.debug("getVisualitzacioByBusinessId ERROR");				
		}
	},function(results){
		//TODO error
		console.debug("getVisualitzacioByBusinessId ERROR");
	});				
}

function getTipusValuesVisualitzacio(results){
	
	if (results.length == 0){
		var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Aquest camp no te valors')+"<strong>  <span class='fa fa-warning sign'></span></div>";
		jQuery('#list_tematic_values').html(warninMSG);
		jQuery('#dialog_tematic_rangs .btn-success').hide();
	}else{
		var arr = jQuery.grep(results, function( n, i ) {
			return !jQuery.isNumeric(n);
		});
		if (arr.length == 0){
			jQuery('#tipus_agrupacio_grp').show();
			jQuery('#num_rangs_grp').show();
			jQuery('#list_tematic_values').html("");
			
			jQuery( "input:radio[name=rd_tipus_agrupacio]").on('change',function(e){
				var this_ = jQuery(this);
				if (this_.val() == "U"){
					jQuery('#num_rangs_grp').hide();
					showVisualitzacioDataUnic(results).then(function(results1){
						loadTematicValueUnicTemplate(results1);
					});
				}else{
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
					jQuery('#num_rangs_grp').show();
					jQuery('#cmb_num_rangs').val("---");
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
					//createRangsValues(jQuery('#cmb_num_rangs').val());
				}
			});
			
			jQuery('#cmb_num_rangs').on('change',function(e){
				var this_ = jQuery(this);
				if (this_.val() == "---"){
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
				}else{
					createRangsValues(this_.val());
				}
			});
			
			jQuery('#rd_tipus_rang').click().change();		
		}else{ //unicos
			jQuery('#tipus_agrupacio_grp').hide();
			jQuery('#num_rangs_grp').hide();
			showVisualitzacioDataUnic(results).then(function(results1){
				loadTematicValueUnicTemplate(results1);
			});
		}
	}
}

function showVisualitzacioDataUnic(values){
	//console.debug("showTematicRangsUnic");
	var defer = jQuery.Deferred();
//	jQuery("#dialog_tematic_rangs").data("values", values);
	var visualitzacio = jQuery("#dialog_tematic_rangs").data("visualitzacio");
	var paleta = jQuery("#dialog_tematic_rangs").data("paleta");
	
	//Ordenar valores
	values.sort();
	
	var scale;
	paleta = paleta ? paleta : 'Paired';
	if (paleta == 'Paired' || paleta == 'Set3' || paleta == 'Set1' || paleta == 'Dark2'){
		scale = chroma.scale(paleta).domain([0,12],12).out('hex');
	}else{
		scale = chroma.scale(paleta).domain([0,values.length],values.length).out('hex');
	}
		
	var ftype = transformTipusGeometry(visualitzacio.geometryType);
	
	var valuesStyle = jQuery.map( values, function( a, i) {
		return {v: a, style: createIntervalStyle(i,ftype,scale), index: i};
	});
	
	/*
	if (ftype == t_marker){
		valuesStyle = jQuery.map( values, function( a, i) {
			return {v: a, style: createIntervalStyle(i,ftype,paleta), index: i};
		});
	}else if (ftype == t_polyline){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,ftype,paleta), index: i};
		});
	}else if (ftype == t_polygon){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,ftype,paleta), index: i};
		});
	}
	*/
	defer.resolve(valuesStyle);
	return defer.promise();
}

function updateSelecTipusRangs(results){
	//console.debug("updateSelecTipusRangs");
	jQuery("#dialog_tematic_rangs").data("values", results);
	getTipusValues();
}

function getTipusValues(){
	//console.debug("getTipusValues");
	var results = jQuery("#dialog_tematic_rangs").data("values");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	
	if (results.length == 0){
		var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Aquest camp no te valors')+"<strong>  <span class='fa fa-warning sign'></span></div>";
		jQuery('#list_tematic_values').html(warninMSG);
		jQuery('#dialog_tematic_rangs .btn-success').hide();
	}else{
		var arr = jQuery.grep(results, function( n, i ) {
			return !jQuery.isNumeric(n);
		});
		if (arr.length == 0){
			jQuery('#tipus_agrupacio_grp').show();
			jQuery('#num_rangs_grp').show();
			jQuery('#list_tematic_values').html("");
			
			jQuery( "input:radio[name=rd_tipus_agrupacio]").on('change',function(e){
				var this_ = jQuery(this);
				if (this_.val() == "U"){
					jQuery('#num_rangs_grp').hide();
					showTematicRangsUnic().then(function(results1){
						loadTematicValueUnicTemplate(results1);
					});
				}else{
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
					jQuery('#num_rangs_grp').show();
					jQuery('#cmb_num_rangs').val("---");
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
					//createRangsValues(jQuery('#cmb_num_rangs').val());
				}
			});
			
			jQuery('#cmb_num_rangs').on('change',function(e){
				var this_ = jQuery(this);
				if (this_.val() == "---"){
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
				}else{
					createRangsValues(this_.val());
				}
			});
			
			jQuery('#rd_tipus_rang').click().change();		
		}else{ //unicos
			jQuery('#tipus_agrupacio_grp').hide();
			jQuery('#num_rangs_grp').hide();
			showTematicRangsUnic().then(function(results1){
				loadTematicValueUnicTemplate(results1);
			});
		}
	}
}

function loadTematicValueUnicTemplate(results1){
	var source1;
	var geometryType = results1[0].style.geometryType;
	if (!geometryType){
		geometryType = results[0].style.tipus;
	}
	var ftype = transformTipusGeometry(geometryType);
	if (ftype == t_marker){
		source1 = jQuery("#tematic-values-unic-punt-template").html();
	}else if (ftype == t_polyline){
		source1 = jQuery("#tematic-values-unic-polyline-template").html();
	}else if (ftype == t_polygon){
		source1 = jQuery("#tematic-values-unic-polygon-template").html();
	}
	var template1 = Handlebars.compile(source1);
	var html1 = template1({values:results1});
	jQuery('#list_tematic_values').html(html1);
	jQuery('#dialog_tematic_rangs .btn-success').show();
	if (ftype == t_polyline){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitLRang(val, results1[i]);
		});
	}else if (ftype == t_polygon){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitPRang(val, results1[i]);
		});
		
		jQuery('#list_tematic_values canvas').on('click',function(e){
			var _this = this;
			var _$this = $(this);
			_$this.after('<div id="temp_color_pallete" class="dropdown-menu"></div>');
			
			$("#temp_color_pallete").css({'top':_$this.position().top,'left':_$this.position().left+25}).colorPalette().on('selectColor', function(e) {
				var canvas = _this;
				var style = {style:{}};
				style.style.color = e.color;
				addGeometryInitPRang(canvas, style);
				$("#temp_color_pallete").remove();
			});
			
		});
		
	}	
	
	/*
	if (jQuery('#list_tematic_values tr').length > 9){
		jQuery('#palet_warning').show();
	}else{
		jQuery('#palet_warning').hide();
	}
	*/
}

function createIntervalStyle(index, geometryType, paleta){
//	console.debug("createIntervalStyle");
	var defStyle;
	//var markerColors = (paleta)? paletasColors[paleta] : paletasColors[0];
	/*
	if (index > 9){
		index = 9;
	}
	*/
	
	var ftype = transformTipusGeometry(geometryType);
		
	if (ftype == t_marker){
		defStyle = jQuery.extend({}, default_circulo_style);
		//defStyle.fillColor = markerColors[index];
		defStyle.fillColor = paleta(index);
		defStyle.isCanvas = true;		
	}else if (ftype == t_polyline){
		defStyle = jQuery.extend({}, default_line_style);
		//defStyle.color = markerColors[index];
		defStyle.color = paleta(index);
	}else if (ftype == t_polygon){
		defStyle = jQuery.extend({}, default_area_style);
		//defStyle.color = markerColors[index];
		defStyle.color = paleta(index);
	}
	defStyle.geometryType = ftype;
	
	return defStyle;
}

function showTematicRangs(){
	var values = jQuery("#dialog_tematic_rangs").data("rangs");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var visualitzacio = jQuery("#dialog_tematic_rangs").data("visualitzacio");
	var paleta = jQuery("#dialog_tematic_rangs").data("paleta");
	
	var scale;
	paleta = paleta ? paleta : 'Paired';
	if (paleta == 'Paired' || paleta == 'Set3' || paleta == 'Set1' || paleta == 'Dark2'){
		scale = chroma.scale(paleta).domain([0,12],12).out('hex');
	}else{
		scale = chroma.scale(paleta).domain([0,values.length],values.length).out('hex');
	}
		
	var defer = jQuery.Deferred();
	var valuesStyle = [];
	var ftype = transformTipusGeometry(visualitzacio.geometryType);
	
	if (ftype == t_marker){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,ftype,scale), index: i};
		});
	}else if (ftype == t_polyline){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,ftype,scale), index: i};
		});
	}else if (ftype == t_polygon){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,ftype,scale), index: i};
		});
	}
	defer.resolve(valuesStyle);
	return defer.promise();
}

function showTematicRangsUnic(){
	//console.debug("showTematicRangsUnic");
	var defer = jQuery.Deferred();
	var pvalues = jQuery("#dialog_tematic_rangs").data("values");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var paleta = jQuery("#dialog_tematic_rangs").data("paleta");
	
	var scale;
	paleta = paleta ? paleta : 'Paired';
	if (paleta == 'Paired' || paleta == 'Set3' || paleta == 'Set1' || paleta == 'Dark2'){
		scale = chroma.scale(paleta).domain([0,12],12).out('hex');
	}else{
		scale = chroma.scale(paleta).domain([0,values.length],values.length).out('hex');
	}
	
	//Eliminem valors repetits de values
	var seen = {};
	var values = [];
	
	jQuery(pvalues).each(function(i, val) {
		val = jQuery.trim(val);
		if (!seen[val]){
	    	seen[val] = true;
	    	values.push(val);	    	
	    }
	});
	//Ordenar valores
	values.sort();
	
	var rangs = tematic.rangs;
	var valuesStyle = [];
	var ftype = transformTipusGeometry(tematic.geometryType);
	if (ftype == t_marker){
		valuesStyle = jQuery.map( values, function( a, i) {
			return {v: a, style: createIntervalStyle(i,ftype,scale), index: i};
		});
	}else if (ftype == t_polyline){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,ftype,scale), index: i};
		});
	}else if (ftype == t_polygon){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,ftype,scale), index: i};
		});
	}
	defer.resolve(valuesStyle);
	return defer.promise();
}

function div2RangStyle(tematic, tdElem){
	var rangStyle;
	
	var ftype = transformTipusGeometry(tematic.geometrytype);
		
	if (ftype == t_marker){
		var divElement = tdElem.find('div');
		rangStyle = {
			borderColor :  "#ffffff",
			borderWidth :  2,
			simbolSize: parseInt(parseInt(divElement.css('height'))/2.4),
			color: jQuery.Color(divElement.css('background-color')).toHexString(),
			opacity: 90
		};
	}else if (ftype == t_polyline){
		var divElement = tdElem.find('canvas')[0].getContext("2d");
		rangStyle = {
			lineWidth :  divElement.lineWidth,
			color: divElement.strokeStyle,
		};
	}else if (ftype == t_polygon){
		var divElement = tdElem.find('canvas')[0].getContext("2d");
		rangStyle = {
			borderColor :  divElement.strokeStyle,
			borderWidth :  divElement.lineWidth,
			color: jQuery.Color(divElement.fillStyle).toHexString(),
			opacity: Math.round(jQuery.Color(divElement.fillStyle).alpha()*100)
		};
	}
	return rangStyle;
}

function createTematicLayerCategories(event){
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'estils', 'categories', 1]);
	
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var visualitzacio = jQuery("#dialog_tematic_rangs").data("visualitzacio");
	var tematicFrom = jQuery("#dialog_tematic_rangs").data("capamare");
	var capaMare = controlCapes._layers[tematicFrom.leafletid].layer;
	var rangsTr = jQuery('#list_tematic_values tbody tr');
		
	var rangs = [];
	jQuery.each(rangsTr, function( index, value ) {
		var _this = jQuery(value);
		var tdRang, tdMin, tdMax;
		var tdVal;
		if (_this.children().length == 2){
			tdRang = _this.find('td:eq(0)');
			tdVal = _this.find('td:eq(1)');
			var rangEstil = div2RangStyle(tematicFrom, tdVal);
			var rang = {};
			rang.estil = rangEstil;
			rang.valueMax = tdRang.text();
			rang.valueMin = tdRang.text();
			rangs.push(rang);
		}else{
			tdMin = _this.find('td:eq(0)');
			tdMax = _this.find('td:eq(1)');
			tdVal = _this.find('td:eq(2)');
			var rangEstil = div2RangStyle(tematicFrom, tdVal);
			var rang = {};
			rang.estil = rangEstil; 
			rang.valueMin = tdMin.find('input').val();
			rang.valueMax = tdMax.find('input').val();
			rangs.push(rang);
		}
	});	
	
	var estils = {
		estils: rangs,
		dataField: jQuery('#dataField').val(),
		labelField: jQuery('#dataField').val()
	};
	var data = {
			businessId: tematicFrom.businessid,//businessId id de la visualización de origen
			uid: $.cookie('uid'),//uid id de usuario
	        mapBusinessId: url('?businessid'),//mapBusinessId id del mapa donde se agrega la visualización	           
	        nom: capaMare.options.nom+" "+window.lang.convert("Categories"),
	        activas: true,
	        order: capesOrdre_sublayer,//order (optional) orden de la capa en el mapa
	        dataField: jQuery('#dataField').val(),//¿?¿?¿?¿?
//				tipusRang: tematicFrom.from,
			tem: tem_clasic,//visualitzacio.from,//tem_simple
//				estils: JSON.stringify(rangs)
			estils: JSON.stringify(estils)
		};
	
	createVisualitzacioTematica(data).then(function(results){
		if(results.status == 'OK'){
			var defer = $.Deferred();
			readVisualitzacio(defer, results.visualitzacio, results.layer);
			jQuery('#dialog_tematic_rangs').modal('hide');
			activaPanelCapes(true);
		}else{
			//TODO error
			console.debug("createVisualitzacioTematica ERROR");					
		}
	},function(results){
		//TODO error
		console.debug("createVisualitzacioTematica ERROR");
	});	
	event.preventDefault();
	event.stopImmediatePropagation();
	
}

function updatePaletaRangs(){
	var paleta = jQuery("#dialog_tematic_rangs").data("paleta");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var tematicFrom = jQuery("#dialog_tematic_rangs").data("capamare");
	//solo para los 9 primeros (cuando usuario pueda cambiar los estilos)
	var values = jQuery("#dialog_tematic_rangs").data("values");
	//console.debug(jQuery('#list_tematic_values canvas:lt(9)'));
	
	var ftype = transformTipusGeometry(tematicFrom.geometrytype);
	
	var scale;
	paleta = paleta ? paleta : 'Paired';
	if (paleta == 'Paired' || paleta == 'Set3' || paleta == 'Set1' || paleta == 'Dark2'){
		if (values.length <= 12){
			scale = chroma.scale(paleta).domain([0,12],12).out('hex');
		}else{
			scale = chroma.scale(paleta).domain([0,values.length],values.length).out('hex');
		}
	}else{
		scale = chroma.scale(paleta).domain([0,values.length],values.length).out('hex');
	}
	
	if (ftype == t_marker){
		jQuery('#list_tematic_values tbody td div').each(function(i, elm){
			/*
			if (i > 9){
				i = 9;
			}
			*/
			//var color = paletasColors[paleta][i];
			var color = scale(i);
			jQuery(elm).css('background-color', color);
		});
	}else if (ftype == t_polyline){
		jQuery('#list_tematic_values canvas').each(function(i, elm){
			/*
			if (i > 9){
				i = 9;
			}
			*/
			//var color = paletasColors[paleta][i];
			var color = scale(i);
			addGeometryInitLRang(elm, {style:{color: color}});
		});
	}else if (ftype == t_polygon){
		jQuery('#list_tematic_values canvas').each(function(i, elm){
			/*
			if (i > 9){
				i = 9;
			}
			*/
			//var color = paletasColors[paleta][i];
			var color = scale(i);
			addGeometryInitPRang(elm, {style:{color: color}});
		});
		//TODO
		/*
		jQuery('#list_tematic_values canvas').on('click',function(){
			console.debug(this);
		});
		*/
	}
}

function createRangsValues(rangs){
	//console.debug("createRangsValues");
	var values = jQuery("#dialog_tematic_rangs").data("values");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var visualitzacio = jQuery("#dialog_tematic_rangs").data("visualitzacio");
	
	values = jQuery.map(values, function( n, i ) {
		return parseFloat(n);
	});
	
	values.sort(function(a,b){return a-b});
	
	var min = parseFloat(values[0]);
	var max = parseFloat(values[values.length-1]);
	var deltaR = (max - min)/rangs;
	deltaR = parseFloat(deltaR.toFixed(2));
	var newRangs = [];
	var i = 0;
	while (min < max && i < rangs){
		if (i == (rangs-1)){
			newRangs.push({min: min, max: max});
		}else{
			var tmpmax = parseFloat((min+deltaR).toFixed(2));
			newRangs.push({min: min, max: tmpmax});
			min = tmpmax;
		}
		i++;
	}
	jQuery("#dialog_tematic_rangs").data("rangs", newRangs);
	showTematicRangs().then(function(results){
		loadTematicValueRangsTemplate(results);
	});
}

function loadTematicValueRangsTemplate(results){
	var source1;
	var geometryType = results[0].style.geometryType;
	if (!geometryType){
		geometryType = results[0].style.tipus;
	}
	var ftype = transformTipusGeometry(geometryType);
	if (ftype == t_marker){
		source1 = jQuery("#tematic-values-rangs-punt-template").html();
	}else if (ftype == t_polyline){
		source1 = jQuery("#tematic-values-rangs-polyline-template").html();
	}else if (ftype == t_polygon){
		source1 = jQuery("#tematic-values-rangs-polygon-template").html();
	}
	var template1 = Handlebars.compile(source1);
	var html1 = template1({values:results});
	jQuery('#list_tematic_values').html(html1);
	jQuery('#dialog_tematic_rangs .btn-success').show();
	if (ftype == t_polyline){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitLRang(val, results[i]);
		});
	}else if (ftype == t_polygon){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitPRang(val, results[i]);
		});
		//TODO
		/*
		jQuery('#list_tematic_values canvas').on('click',function(){
			console.debug(this);
		});
		*/
	}
	/*
	if (jQuery('#list_tematic_values tr').length > 9){
		jQuery('#palet_warning').show();
	}else{
		jQuery('#palet_warning').hide();
	}
	*/
}

function addGeometryInitLRang(canvas, style){
	var	cv_ctx_l=canvas.getContext("2d");
	cv_ctx_l.clearRect(0, 0, canvas.width, canvas.height);
	
	cv_ctx_l.shadowColor = '#999';
	cv_ctx_l.shadowBlur = 4;
	cv_ctx_l.shadowOffsetX = 2;
	cv_ctx_l.shadowOffsetY = 2;
	
	cv_ctx_l.moveTo(0.7,39.42);
	cv_ctx_l.lineTo(2.05,34.43);
	cv_ctx_l.lineTo(3.62,31.00);
	cv_ctx_l.lineTo(5.95,27.72);
	cv_ctx_l.lineTo(8.17,25.61);
	cv_ctx_l.lineTo(10.72,23.84);
	cv_ctx_l.lineTo(13.059,22.73);
	cv_ctx_l.lineTo(15.32,22.28);
	cv_ctx_l.lineTo(17.76,22.08);
	cv_ctx_l.lineTo(20.30,21.47);
	cv_ctx_l.lineTo(23.28,20.51);
	cv_ctx_l.lineTo(25.88,18.90);
	cv_ctx_l.lineTo(28.265,16.83);
	cv_ctx_l.lineTo(29.9,14.71);
	cv_ctx_l.lineTo(31.89,12.195);
	cv_ctx_l.lineTo(33.62,9.42);
	cv_ctx_l.lineTo(34.81,6.64);
	cv_ctx_l.lineTo(35.46,3.92);
	cv_ctx_l.lineTo(35.52,0.54);
	//cv_ctx_l.setLineDash([1,2]);
	cv_ctx_l.strokeStyle=style.style.color;
	cv_ctx_l.lineWidth=3;
	cv_ctx_l.stroke(); 	
}

function addGeometryInitPRang(canvas, style){
	var	cv_ctx_p=canvas.getContext("2d");
	
	cv_ctx_p.clearRect(0, 0, canvas.width, canvas.height);
	
	//cv_ctx_p.scale(0.5,0.5);
	var scale = 0.7;
	
	cv_ctx_p.shadowColor = '#999';
	cv_ctx_p.shadowBlur = 4;
	cv_ctx_p.shadowOffsetX = 2;
	cv_ctx_p.shadowOffsetY = 2;
	
	cv_ctx_p.moveTo(5.13*scale,15.82*scale);
	cv_ctx_p.lineTo(25.49*scale,5.13*scale);
	cv_ctx_p.lineTo(37.08*scale,13.16*scale);
	cv_ctx_p.lineTo(20.66*scale,38.01*scale);
	cv_ctx_p.lineTo(2.06*scale,33.67*scale);
	cv_ctx_p.closePath();
	cv_ctx_p.strokeStyle="#ffffff"; //hex
	cv_ctx_p.fillStyle=jQuery.Color(style.style.color).alpha(0.75).toRgbaString(); //rgba
	cv_ctx_p.lineWidth=1;
	cv_ctx_p.fill();
	cv_ctx_p.stroke();
	
}

function readDataTematicFromSlotd(tematic, slotd){
	//console.debug("readDataTematicFromSlotd");
	var defer = jQuery.Deferred();
	var dades = tematic.capes.dades;
	var values = jQuery.map( dades, function( a ) {
		return a[slotd];
	});
	defer.resolve(values);
	return defer.promise();
}

function readDataTematicFromSlotf(tematic, slotf){
	//console.debug("readDataTematicFromSlotd");
	var defer = jQuery.Deferred();
	var features = tematic.geometries.features.features;
	var values = jQuery.map( features, function( a ) {
		return a.properties[slotf];
	});
	defer.resolve(values);
	return defer.promise();
}

function readDataVisualitzacio(visualitzacio, key){
	//console.debug("readDataTematicFromSlotd");
	var defer = jQuery.Deferred();
//	console.debug(visualitzacio);
	var data = {};
	var dataValues = [];
	jQuery.each(visualitzacio.estil, function(index, item){
		jQuery.each( item.geometria.features, function(i,feature) {
			var value = feature.properties[key.toLowerCase()];
			if(!data[value]){
				data[value] = value;
				dataValues.push(value);
			}
		});
	});
//	console.debug(data);
//	console.debug(dataValues);
	defer.resolve(dataValues);
	return defer.promise();
}