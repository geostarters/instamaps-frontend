/**
 * Funcionalitat edicio nom del mapa
 * */
function addFuncioRenameMap(){

	$('#nomAplicacio').editable({
		type: 'text',
		mode: 'inline',
	    validate: function(value) {
	        if($.trim(value) == '') {
	        	return {newValue: this.innerHTML};
	        }
        },
		success: function(response, newValue) {
			var data = {
			 	businessId: url('?businessid'),
			 	nom: newValue,
			 	uid: $.cookie('uid')
			}
			updateMapName(data).then(function(results){
				_gaq.push(['_trackEvent', 'mapa', tipus_user+'editar nom aplicacio', 'label editar nom', 1]);

				if(results.status=='OK'){
					$('#dialgo_publicar #nomAplicacioPub').val(results.results);
					mapConfig.nomAplicacio = results.results;
				}
			},function(results){
				$('#nomAplicacio').val(mapConfig.nomAplicacio);
			});
		}
	});
}

function reOrderGroupsAndLayers(action){
	//console.info("reOrderGroupsAndLayers");
	 var z_order=-1;

	 var _groupName,_groupId,_groupSubId,_businessId,_expanded;
	   // $("span.span_ac").each(function( index, element ) {
	  $("div.leaflet-control-accordion-layers").each(function( index, element ) {
		 var $this = $(this);


	    	 var gr=$this.children("label").children('span.span_ac');
	    	 
	    	 _groupId=index;

	    	 _groupName=gr.text();


	    	 var _exp=$this.children("label").children('i.label_gl');

	    		 var _id=$(_exp).attr("id");

				_expanded=true;

			if($('#'+_id).hasClass('glyphicon-triangle-right')){

					_expanded=false;


				}


	    	 $this.children("ol.ac-large").children("li.leaflet-row").each(function(){
	    	        $this; // parent li
	    	        _businessId=this.id.replace("LI-",""); // child li
	    	        z_order=z_order+1;

	    	     //  if(_businessId=='e354bfdd53c8422ecd529889d6ab6c99') {


	    	  if(action){


	    	   // var resp_Layer= controlCapes.updateTreeGroupLayers(_groupId,_groupName,_businessId,z_order,_expanded);
	    		  controlCapes.updateTreeGroupLayers(_groupId,_groupName,_businessId,z_order,_expanded).then(function(resp_Layer){
						
						if(resp_Layer){

					var data = {
							mapBusinessId: url('?businessid'),
							businessId: resp_Layer.options.businessId, //url('?businessid')
							uid: $.cookie('uid'),
							options: JSON.stringify(resp_Layer.options.group)
						 }

					var data2 = {
							servidorWMSbusinessId:resp_Layer.options.businessId,
							businessId:url('?businessid'), //url('?businessid')
							uid: $.cookie('uid'),
							order: z_order
						 }



					updateGroupsLayerGroup(data,data2);
					}
					});

	    	  }

	    	    });

	  ////console.warn("FI GROUP:");
	  });



}

function updateGroupsLayerGroup(data,data2){


	updateServidorWMSGroup(data).then(function(results){

		if(results.status==='OK'){

			if(data2){

				updateServerOrderToMap(data2).then(function(results) {
					//console.debug(results);
					if (results.status != 'OK')
						return;// SI no ha anat be el canvi a BD. que
								// no es faci tampoc a client, i es
								// mostri un error
				}, function(results) {
					return;// SI no ha anat be el canvi a BD. que no es
							// faci tampoc a client, i es mostri un
							// error
				});

			}

		}
	});


}

var group_sortable1=null;
var group_sortable2=null;



function refreshSortablesElements(){

	updateSortablesElements();
}

function updateSortablesElements(){


if(getModeMapa()){

group_sortable1 = $("ol.leaflet-control-layers-overlays").sortable({
	 connectWith: "ol.leaflet-control-layers-overlays",
  change: function( event, ui ) {
	  setTimeout(function(){ reOrderGroupsAndLayers(true); }, 1000);
  }
});

group_sortable2 = $("ol.ac-large").sortable({
	 connectWith: "ol.ac-large",
  change: function( event, ui ) {
	   setTimeout(function(){ reOrderGroupsAndLayers(true); }, 1000);
  }
});

}
/*
group_sortable1 = $("ol.leaflet-control-layers-overlays").sortableTree({
		  group: 'no-drop',
		  handle: 'span.glyphicon-move',
		  onDragStart: function ($item, container, _super,event) {

		    if(!container.options.drop)
		      $item.clone().insertAfter($item);
		    _super($item, container);
		  },
		  onDrag:function ($item, position, _super, event) {

			  position.left=0;
			  $item.css(position);
		  },
		  onDrop: function ($item, container, _super) {

			  $('.tooltip').hide();

			  console.warn($item);
			  console.warn(container);
			    _super($item, container);
			    reOrderGroupsAndLayers(true);

			  }

		});


group_sortable2 = $("ol.ac-large").sortableTree({

		  group: 'no-drop-layer',
		  handle: 'div.glyphicon-move',
		  onDragStart: function ($item, container, _super,event) {

		    if(!container.options.drop)
		      $item.clone().insertAfter($item);
		    _super($item, container);
		  },
		  onDrag:function ($item, position, _super, event) {
			  position.left=0;
			  $item.css(position);
		  },
		  onDrop: function ($item, container, _super) {

			  $('.tooltip').hide();

			  try{
				  console.warn($item);
				  console.warn(container);
			    _super($item, container);
			   reOrderGroupsAndLayers(true);

			  }catch(err){

				  console.info(err);
			  }

		  }

		});
*/

}






/**
 * Funcionalitats edicio noms capes
 * */

function updateEditableElements(){

	//setTimeout(function(){ updateSortablesElements(); }, 3000);

	$('.label_ac .editable').editable({
		type: 'text',
		mode: 'inline',
	    validate: function(value) {

	        if($.trim(value) == '') {
	        	return {newValue: this.innerHTML};
	        }
        },

		success: function(response, newName) {

			var oldName=this.groupName;
			var resp_Layer=	controlCapes.updateGroupName(oldName,newName,this.groupId);

			for(i=0;i < resp_Layer.length;i++){

				var data = {
						mapBusinessId: url('?businessid'),
					 	businessId: resp_Layer[i].options.businessId, //url('?businessid')
					 	uid: $.cookie('uid'),
					 	options: JSON.stringify(resp_Layer[i].options.group)
					 }

				updateGroupsLayerGroup(data,null);

			}

		}
	});

	 $('.label_ac .editable').on('shown', function(e, editable) {
	        jQuery('.group-conf').hide();

	    });
	    $('.label_ac .editable').on('hidden', function(e, editable) {
	        jQuery('.group-conf').show();

	    });


	$('.leaflet-name .editable').editable({
		type: 'text',
		mode: 'inline',
	    validate: function(value) {
		        if($.trim(value) == '') {
		        	return {newValue: this.innerHTML};
		        }
	    },
		success: function(response, newValue) {
				map.closePopup();//Perque no queden desactualitzats
				var id = this.id;
				var idParent = this.idParent;
				//Controlem si es sublayer
				var editableLayer;
				if(idParent){
					editableLayer = controlCapes._layers[this.idParent]._layers[this.id];
				}else{
					editableLayer = controlCapes._layers[this.id];
				}

				var op="";
				if(editableLayer.layer.options.tipus.indexOf(t_wms) != -1){
					op="##"+ editableLayer.layer.options.opacity;

				}
				var data = {
					 	businessId: editableLayer.layer.options.businessId, //url('?businessid')
					 	uid: $.cookie('uid'),
					 	serverName: newValue + op
					 }
					var oldName = this.innerHTML;

					updateServidorWMSName(data).then(function(results){
						if(results.status==='OK'){
							_gaq.push(['_trackEvent', 'mapa', tipus_user+'editar nom capa', 'label editar nom', 1]);

							editableLayer.name = newValue;
							editableLayer.layer.options.nom = newValue;

							if(editableLayer.layer.options.businessId == $("#mapLegendEdicio").data("businessid")){
								$(".titol-legend").html(newValue);
							}
						}else{
							editableLayer.name = oldName;
							$('.leaflet-name label span#'+id).text(results.results.nom);
						}
					},function(results){
						editableLayer.name = oldName;
						var obj = $('.leaflet-name label span#'+id).text();
						$('.leaflet-name label span#'+id).text(oldName);
					});
		}
	});

    $('.leaflet-name .editable').on('shown', function(e, editable) {
        jQuery('.opcio-conf').hide();
        jQuery('.subopcio-conf').hide();
        jQuery('.leaflet-data-table').hide();

    });
    $('.leaflet-name .editable').on('hidden', function(e, editable) {
        jQuery('.opcio-conf').show();
        jQuery('.leaflet-data-table').show();
    });
}

/**
 * Funcionalitat de descarrega de capes
 * */

function addFuncioDownloadLayer(from){

	addHtmlModalDownloadLayer();

	//Si la capa conté polígons no es podrà descarregar en format GPX
	$('#modal_download_layer').on('show.bs.modal', function (e) {
		  if(download_layer.layer.options.geometryType
				  && download_layer.layer.options.geometryType==t_polygon){
			  $("#select-download-format option[value='GPX#.gpx']").attr('disabled','disabled');
		  }else{
			  $("#select-download-format option[value='GPX#.gpx']").removeAttr('disabled');
		  }
	});

	jQuery('#select-download-format').change(function() {
		var ext = jQuery(this).val();
		if ((ext=="KML#.kml")||(ext=="GPX#.gpx")){
		jQuery("#select-download-epsg").val("EPSG:4326").attr('disabled',true);
		}else{
			jQuery("#select-download-epsg").attr('disabled',false);
		}
	});


	$('#bt_download_accept').on('click', function(evt){
		var formatOUT = $('#select-download-format').val();
		var epsgOUT = $('#select-download-epsg').val();
		var filename = $('#input-download-name').val();
		var layer_GeoJSON = download_layer.layer.toGeoJSONcustom();
		//console.debug(layer_GeoJSON);

		var data = {
			cmb_formatOUT: formatOUT,
			cmb_epsgOUT: epsgOUT,
			layer_name: filename,
			fileIN: JSON.stringify(layer_GeoJSON)
		};

		_gaq.push(['_trackEvent', from, tipus_user+'descarregar capa', formatOUT+"-"+epsgOUT, 1]);

		getDownloadLayer(data).then(function(results){
			results = results.trim();
			if (results == "ERROR"){
				$('#modal-body-download-error').show();
				$('#modal-body-download').hide();
				$('#modal_download_layer .modal-footer').hide();
				$('#modal_download_layer').modal('show');
			}else{
				window.open(GEOCAT02+results,'_blank');
			}
		},function(results){
			$('#modal-body-download-error').show();
			$('#modal-body-download').hide();
			$('#modal_download_layer .modal-footer').hide();
			$('#modal_download_layer').modal('show');
		});

	});

}

/**
 * Funcionalitat remove layers
 **/


function removeAtomicLayer(data,matriuObj){

	removeServerToMap(data).then(function(results){
		if(results.status==='OK'){


			for(var j=0; j < matriuObj.length;j++){
			var obj=matriuObj[j];
			map.closePopup();
			map.removeLayer(obj.layer);
			//Eliminem la capa de controlCapes
			controlCapes.removeLayer(obj);

			//actualitzem valors zindex de la resta si no es sublayer
			if(!obj.sublayer){
				var removeZIndex = obj.layer.options.zIndex;
				controlCapes._lastZIndex--;
				var aux = controlCapes._layers;
				for (var i in aux) {
					if (aux[i].layer.options.zIndex > removeZIndex) aux[i].layer.options.zIndex--;
				}
				//Eliminem les seves sublayers en cas que tingui
				for(indexSublayer in obj._layers){
					map.removeLayer(map._layers[indexSublayer]);
				}
			}

			//Actualitzem capaUsrActiva
			if(capaUsrActiva!=null && capaUsrActiva.options.businessId == obj.layer.options.businessId){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = null;
			}

			deleteServerRemoved(data).then(function(results){
				//se borran del listado de servidores
			});

			}


		}else{
			return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
		}
	},function(results){
		return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
	});




}



function addFuncioRemoveLayer(){

	addHtmlModalRemoveLayer();
	addHtmlModalRemoveGroup();

	$('#dialog_delete_capa .btn-danger').on('click', function(event){
		var $this = $(this);
		var data = $this.data("data");
		var obj = $this.data("obj");
		var matriuObj=[];
		matriuObj.push(obj);

		 removeAtomicLayer(data,matriuObj);

	});


	//Esborra grup capes

	$('#dialog_delete_group .btn-danger').on('click', function(event){
		var $this = $(this);
		var group = $this.data("group");


		var matriuCapesGroup=controlCapes.getLayersFromGroupId(group.groupId,group.groupName);


		var lbusinessId = [];
		var matriuObj=[];
			for(i=0; i < matriuCapesGroup.length;i++){

				var obj;
				//var layerId = e.currentTarget.layerId;
				var layerIdParent = matriuCapesGroup[i].layerIdParent;

				if(!layerIdParent){
					 obj = matriuCapesGroup[i];
					lbusinessId.push(obj.layer.options.businessId);
					for(j in obj._layers){
						lbusinessId.push(obj._layers[j].layer.options.businessId);
					}
				}else{
					//var objParent = this._layers[layerIdParent];
					 obj =matriuCapesGroup[i];
					lbusinessId.push(obj.layer.options.businessId);
				}

				matriuObj.push(obj);
				if(!obj.overlay) {
					return;
				}

			}

			if(typeof url('?businessid') == "string"){
				var data = {
						businessId: url('?businessid'),
						uid: $.cookie('uid'),
						servidorWMSbusinessId:lbusinessId.toString()
					};
				//console.info("esborro capes:"+i);
				removeAtomicLayer(data,matriuObj);

			}


			//console.info("Ara esborra grup"+group.groupName);
			controlCapes.removeGroup(group.groupName,group.groupId);



	});









}

/**
 * Funcionalitat addToolTips Panell de capes
 **/

function addTooltipsConfOptions(businessId){

	$(".conf-"+businessId+".leaflet-up").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("puja")
	});

	$(".conf-"+businessId+".leaflet-down").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("baixa")
	});

	$(".conf-"+businessId+".leaflet-remove").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("elimina")
	});

	$(".conf-"+businessId+".leaflet-download").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("descarrega")
	});

	$(".data-table-"+businessId+".leaflet-data-table").tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert("dades")
	});
}

function addHtmlModalDownloadLayer(){

	jQuery('#mapa_modals').append(
	'	<div class="modal fade" id="modal_download_layer">'+
	'	<div class="modal-dialog">'+
	'		<div class="modal-content">'+
	'			<div class="modal-header">'+
	'				<button type="button" class="close" data-dismiss="modal"'+
	'					aria-hidden="true">&times;</button>'+
	'				<h4 class="modal-title" lang="ca">Descarrega de dades</h4>'+
	'			</div>'+
	'			<div lang="ca" class="modal-body">'+
	'				<div id="modal-body-download">'+
	'					<div class="input-group input-group-sm">'+
	'					  <span lang="ca" class="input-group-addon">Guardar com</span>'+
	'					  <input lang="ca" type="text" id="input-download-name" class="form-control" placeholder="Nom fitxer">'+
	'					</div>'+
	'					<small class="label label-default" lang="ca">Opcional: en blanc s\'assignarà un nom automàtic</small>'+
	'					<br><br>'+
	'					<div>'+
	'					<span lang="cat">Format:&nbsp;</span>'+
	'						<select id="select-download-format" class="form-download-format">'+
	'						  <option value="GeoJSON#.geojson">GeoJSON</option>'+
	'						  <option value="ESRI Shapefile#.shp">ESRI Shapefile</option>'+
	'						  <option value="DXF#.dxf">DXF</option>'+
	'						  <option value="KML#.kml">KML</option>'+
	'						  <option value="GPX#.gpx">GPX</option>'+
	'						</select>'+
	'						<br><br>'+
	'					EPSG:&nbsp;'+
	'						<select id="select-download-epsg" class="form-download-epsg">'+
	'							<option value="EPSG:4326">EPSG:4326 (WGS84 geogràfiques (lat, lon) - G.G)</option>'+
	'	              			<option value="EPSG:23031"><b>EPSG:23031</b> (ED50-UTM 31N Easting,Northing o X,Y)</option>'+
	'	              			<option value="EPSG:25831">EPSG:25831 (ETRS89-UTM 31N Easting,Northing o X,Y)</option>'+
	'	              			<option value="EPSG:4258">EPSG:4258 INSPIRE(ETRS89 geogràfiques (lat, lon) - G.G)</option>'+
	'	              			<option value="EPSG:4230">EPSG:4230 (ED50 geogràfiques (lat, lon) - G.G)</option>'+
	'	              			<option value="EPSG:32631">EPSG:32631 (WGS84 31N Easting,Northing o X,Y)</option>'+
	'	              			<option value="EPSG:3857">EPSG:3857 (WGS84 Pseudo-Mercator Easting,Northing o X,Y)</option>'+
	'						</select>'+
	'					</div>'+
	'				</div>'+
	'				<div id="modal-body-download-error">'+
	'					<h5><span class="glyphicon glyphicon-warning-sign yellow"></span>&nbsp;<span lang="ca">No s\'ha pogut efectuar la descàrrega. Torni a intentar-ho.</span></h5>'+
	'				</div>'+
	'				<div id="modal-body-download-not-available">'+
	'					<h5><span class="glyphicon glyphicon-info-sign"></span>&nbsp;<span lang="ca">Capa no disponible per la descàrrega.</span></h5>'+
	'				</div>'+
	'			</div>'+
	'			<div class="modal-footer">'+
	'		    	<button id="bt_download_accept" lang="ca" type="button" class="btn bt-sessio" data-dismiss="modal">Acceptar</button>'+
	'		    	<button id="bt_download_tancar" lang="ca" type="button" class="btn bt-sessio" data-dismiss="modal">Acceptar</button>'+
	'		    </div>'+
	'		</div>'+
	'		<!-- /.modal-content -->'+
	'	</div>'+
	'	<!-- /.modal-dialog -->'+
	'</div>'+
	'<!-- /.modal -->'+
	'<!-- fi Modal descarrega dades -->'
	);
}

function addHtmlModalRemoveLayer(){

	jQuery('#mapa_modals').append(
	'	<!-- Modal delete layer -->'+
	'		<div id="dialog_delete_capa" class="modal fade">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<!-- <div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 lang="ca" class="modal-title">Esborrar el mapa</h4>'+
	'				</div> -->'+
	'				<div class="modal-body">'+
	'					<h4><span lang="ca">Vols esborrar la capa</span> "<span id="nom_capa_delete"></span>" ?</h4>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button lang="ca" type="button" class="btn btn-default"'+
	'						data-dismiss="modal">Cancel·lar</button>'+
	'					<button lang="ca" type="button" class="btn btn-danger"'+
	'						data-dismiss="modal">Esborrar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- Fi Modal delete -->'
	);

}


function addHtmlModalRemoveGroup(){

	jQuery('#mapa_modals').append(
	'	<!-- Modal delete layer -->'+
	'		<div id="dialog_delete_group" class="modal fade">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<!-- <div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 lang="ca" class="modal-title">Esborrar el grup de capes</h4>'+
	'				</div> -->'+
	'				<div class="modal-body">'+
	'					<h4><span lang="ca">Vols esborrar el grup </span> "<span id="nom_group_delete"></span>" i totes les seves capes ?</h4>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button lang="ca" type="button" class="btn btn-default"'+
	'						data-dismiss="modal">Cancel·lar</button>'+
	'					<button lang="ca" type="button" class="btn btn-danger"'+
	'						data-dismiss="modal">Esborrar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- Fi Modal delete -->'
	);
}
