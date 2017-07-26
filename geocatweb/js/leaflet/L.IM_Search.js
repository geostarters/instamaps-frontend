/*
Based on git@github.com:stefanocudini/leaflet-search.git 

*/


(function() {

L.Control.Search = L.Control.extend({
	includes: L.Mixin.Events,

	options: {
		url: '',					//url for search by ajax request, ex: "search.php?q={s}"
		jsonpParam: null,			//jsonp param name for search by jsonp service, ex: "callback"
		layer: null,				//layer where search markers(is a L.LayerGroup)		
		callData: null,				//function that fill _recordsCache, passed searching text by first param and callback in second
		//TODO important! implements uniq option 'sourceData' that recognizes source type: url,array,callback or layer		
		//TODO implement can do research on multiple sources
		propertyName: 'title',		//property in marker.options(or feature.properties for vector layer) trough filter elements in layer
		propertyLoc: 'loc',			//field name for remapping location, using array: ['latname','lonname'] for select double fields(ex. ['lat','lon'] )
		//TODO implement sub property filter for propertyName,propertyLoc like this:  "prop.subprop.title"
		callTip: null,				//function that return row tip html node(or html string), receive text tooltip in first param
		filterJSON: null,			//callback for filtering data to _recordsCache
		minLength: 1,				//minimal text length for autocomplete
		initial: true,				//search elements only by initial text
		autoType: true,			//complete input with first suggested result and select this filled-in text.
		delayType: 400,				//delay while typing for show tooltip
		tooltipLimit: -1,			//limit max results to show in tooltip. -1 for no limit.
		tipAutoSubmit: true,  		//auto map panTo when click on tooltip
		autoResize: true,			//autoresize on input change
		autoCollapse: true,		//collapse search control after submit(on button or on tips if enabled tipAutoSubmit)
		//TODO add option for persist markerLoc after collapse!
		autoCollapseTime: 1200,		//delay for autoclosing alert and collapse after blur
		animateLocation: true,		//animate a circle over location found
		circleLocation: true,		//draw a circle in location found
		markerLocation: false,		//draw a marker in location found
		zoom: null,					//zoom after pan to location found, default: map.getZoom()
		idInputText : null,
		text: 'Cercar...',			//placeholder value	
		textCancel: 'Cancel',		//title in cancel button
		textErr: 'No trobat',
		textEdit:'Edit',//error message
		textLoad:'',
		scope:'visor',
		position: 'topcenter'
		//TODO add option collapsed, like control.layers
	},
//FIXME option condition problem {autoCollapse: true, markerLocation: true} not show location
//FIXME option condition problem {autoCollapse: false }

	initialize: function(options) {
		L.Util.setOptions(this, options || {});
		this._inputMinSize = this.options.text ? this.options.text.length : 10;
		this._layer = this.options.layer || new L.LayerGroup();
		this._filterJSON = this.options.filterJSON || this._defaultFilterJSON;
		this._autoTypeTmp = this.options.autoType;	//useful for disable autoType temporarily in delete/backspace keydown
		this._countertips = 0;		//number of tips items
		this._recordsCache = {};	//key,value table! that store locations! format: key,latlng
	},

	onAdd: function (map) {
		
		 var $controlContainer = map._controlContainer,
         nodes = $controlContainer.childNodes,
         topCenter = false;

	     for (var i = 0, len = nodes.length; i < len; i++) {
	         var klass = nodes[i].className;
	         if (/leaflet-top/.test(klass) && /leaflet-center/.test(klass)) {
	             topCenter = true;
	             break;
	         }
	     }

	     if (!topCenter) {
	         var tc = document.createElement('div');
	         tc.className += 'leaflet-top leaflet-center';
	         
	         if(this.options.idInputText==null){
	        	 $controlContainer.appendChild(tc); 
	         }else{
	        	 jQuery(this.options.idInputText).append(tc);
	         }
	         map._controlCorners.topcenter = tc;
	     }
		
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-search');
		
		this._cancel = this._createCancel(this.options.textCancel, 'search-cancel');
//		this._button = this._createButton(this.options.text, 'search-button glyphicon glyphicon-search grisfort');
		this._input = this._createInput(this.options.text, 'search-input');
		this._icon= this._createIcon('fa fa-search iconSearch');
		this._helpIcon= this._createHelpIcon('fa fa-question-circle-o fa-lg iconHelp');
		this._tooltip = this._createTooltip('search-tooltip');
		this._alert = this._createAlert('search-alert');
		this._edit = this._createEdit(this.options.textEdit,'search-edit');
		this._loadv = this._createLoad(this.options.textLoad,'search-load');
		
		
		if(this.options.circleLocation || this.options.markerLocation) {
			//this._markerLoc = new SearchMarker([0,0], {marker: this.options.markerLocation});//see below
			//Mira si és icona
			var defaultPunt= L.AwesomeMarkers.icon(default_marker_style);
//			console.debug(defaultPunt);
			if(!defaultPunt.options.isCanvas){
				this._markerLoc=L.marker([0,0],
					{icon: defaultPunt,isCanvas:defaultPunt.options.isCanvas,
					 tipus: t_marker});
			}else{
				//Si és cercle sense glifon
				this._markerLoc= L.circleMarker([0,0],
						{ radius : defaultPunt.options.radius, 
						  isCanvas:defaultPunt.options.isCanvas,
						  fillColor : defaultPunt.options.fillColor,
						  color :  defaultPunt.options.color,
						  weight :  defaultPunt.options.weight,
						  opacity :  defaultPunt.options.opacity,
						  fillOpacity : defaultPunt.options.fillOpacity,
						  tipus: t_marker}
						
				);
			}
	    }
		
		//this.setLayer( this._layer );
		
		map.on({'resize':this._handleAutoresize()}, this);
		 
		return this._container;
	},

	onRemove: function(map) {
		this._recordsCache = {};
		// map.off({
		// 		'layeradd': this._onLayerAddRemove,
		// 		'layerremove': this._onLayerAddRemove
		// 	}, this);
	},

	// _onLayerAddRemove: function(e) {
	// 	//console.info('_onLayerAddRemove');
	// 	//without this, run setLayer also for each Markers!! to optimize!
	// 	if(e.layer instanceof L.LayerGroup)
	// 		if( L.stamp(e.layer) != L.stamp(this._layer) )
	// 			this.setLayer(e.layer);
	// },
	
	setLayer: function(layer) {	//set search layer at runtime
		//this.options.layer = layer; //setting this, run only this._recordsFromLayer()
		this._layer = layer;
		this._layer.addTo(this._map);
		if(this._markerLoc)
			this._layer.addLayer(this._markerLoc);
		return this;
	},
	
	showAlert: function(text) {
		text = text || this.options.textErr;
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		clearTimeout(this.timerAlert);
		var that = this;		
		this.timerAlert = setTimeout(function() {
			that.hideAlert();
		},this.options.autoCollapseTime);
		$.publish('analyticsEvent',{event:[this.options.scope,'input#cercaTopoFAIL',this._input.value, 8]});
		return this;
	},
	
	
	showLoad: function(text) {
		text = text || this.options.textLoad;
		this._loadv.style.display = 'block';
		this._loadv.innerHTML = text;
		clearTimeout(this.timerAlert);
		var that = this;		
		this.timerAlert = setTimeout(function() {
			that.hideAlert();
		},this.options.autoCollapseTime);
		return this;
	},
	
	hideLoad: function() {
		this._loadv.style.display = 'none';
		return this;
	},
	
	
	showEdit: function(text) {
		text = text || this.options.textEdit;
		
		this._edit.style.display = 'block';
		this._edit.innerHTML = text;
		//clearTimeout(this.timerAlert);
		var that = this;		
		
		return this;
	},
	
	hideAlert: function() {
		this._alert.style.display = 'none';
		return this;
	},
		
	hideEdit: function() {
		this._edit.style.display = 'none';
		return this;
	},
	
	cancel: function() {
		this._input.value = '';
		//this._handleKeypress({keyCode:46});//simulate backspace keypress
		//this._input.focus();
		this._cancel.style.display = 'none';
		return this;
	},
	
	expand: function() {		
		this._input.style.display = 'block';
		L.DomUtil.addClass(this._container, 'search-exp');	
		this._input.focus();
		this._map.on('dragstart', this.collapse, this);
		return this;	
	},

	collapse: function() {
		this._hideTooltip();
		this.cancel();
		this._alert.style.display = 'none';
		this._input.style.display = 'block';
		this._input.blur();
		this._cancel.style.display = 'none';
		L.DomUtil.removeClass(this._container, 'search-exp');		
		//this._markerLoc.hide();//maybe unuseful
		this._map.off('dragstart', this.collapse, this);
		this.fire('search_collapsed');
		return this;
	},
	
	collapseDelayed: function() {	//collapse after delay, used on_input blur
		if (!this.options.autoCollapse) return this;
		var that = this;
		clearTimeout(this.timerCollapse);
		this.timerCollapse = setTimeout(function() {
			that.collapse();
		}, this.options.autoCollapseTime);
		return this;		
	},

	collapseDelayedStop: function() {
		clearTimeout(this.timerCollapse);
		return this;		
	},

////start DOM creations
	_createAlert: function(className) {
		var alert = L.DomUtil.create('div', className, this._container);
		alert.style.display = 'none';

		L.DomEvent
			.on(alert, 'click', L.DomEvent.stop, this)
			.on(alert, 'click', this.hideAlert, this);

		return alert;
	},
	
	_createEdit: function(text,className) {
		var edit = L.DomUtil.create('div', className, this._container);
		edit.style.display = 'none';
		edit.innerHTML = text;
		//L.DomEvent.on(edit, 'click', L.DomEvent.stop, this);
			//.on(edit, 'click', this.hideEdit, this);

		return edit;
	},
	
	_createLoad: function(text,className) {
		var loadv = L.DomUtil.create('div', className, this._container);
		loadv.style.display = 'none';
		loadv.innerHTML = text;
		//L.DomEvent.on(load, 'click', L.DomEvent.stop, this);
			//.on(edit, 'click', this.hideEdit, this);

		return loadv;
	},

	_createInput: function (text, className) {
		var input = L.DomUtil.create('input', className, this._container);
		input.type = 'text';
		input.size = this._inputMinSize;
		input.value = '';
		input.autocomplete = 'off';
		input.placeholder = text;
		input.style.display = 'block';
		input.lang = 'ca';
		input.id = 'search-input';
		
		
		L.DomEvent
			.disableClickPropagation(input)
			.on(input, 'keyup', this._handleKeypress, this)
			.on(input, 'keydown', this._handleAutoresize, this)
			.on(input, 'blur', this.collapseDelayed, this)
			.on(input, 'focus', this.collapseDelayedStop, this);
		
		return input;
	},

	_createCancel: function (title, className) {
		var cancel = L.DomUtil.create('a', className, this._container);
		cancel.href = '#';
		cancel.title = title;
		cancel.style.display = 'none';
		cancel.innerHTML = "<span>&otimes;</span>";//imageless(see css)

		L.DomEvent
			.on(cancel, 'click', L.DomEvent.stop, this)
			.on(cancel, 'click', this.cancel, this);

		return cancel;
	},
	
	_createButton: function (title, className) {
		var button = L.DomUtil.create('a', className, this._container);
		button.href = '#';
		button.title = title;

		L.DomEvent
			.on(button, 'click', L.DomEvent.stop, this)
			.on(button, 'click', this._handleSubmit, this)			
			.on(button, 'focus', this.collapseDelayedStop, this)
			.on(button, 'blur', this.collapseDelayed, this);

		return button;
	},

	_createTooltip: function(className) {
		var tool = L.DomUtil.create('div', className, this._container);
		tool.style.display = 'none';

		var that = this;
		L.DomEvent
			.disableClickPropagation(tool)
			.on(tool, 'blur', this.collapseDelayed, this)
			.on(tool, 'mousewheel', function(e) {
				that.collapseDelayedStop();
				L.DomEvent.stopPropagation(e);//disable zoom map
			}, this)
			.on(tool, 'mouseover', function(e) {
				that.collapseDelayedStop();
			}, this);
		return tool;
	},

	_createTip: function(text, val) {//val is object in recordCache, usually is Latlng
		var tip;
		
		if(this.options.callTip)
		{
			tip = this.options.callTip(text,val); //custom tip node or html string
			if(typeof tip === 'string')
			{
				var tmpNode = L.DomUtil.create('div');
				tmpNode.innerHTML = tip;
				tip = tmpNode.firstChild;
			}
		}
		else
		{
			tip = L.DomUtil.create('a', '');
			tip.href = '#';
			tip.setAttribute("title", text);
			tip.innerHTML = text;
		}
		
		L.DomUtil.addClass(tip, 'search-tip');
		tip._text = text; //value replaced in this._input and used by _autoType

		L.DomEvent
			.disableClickPropagation(tip)		
			.on(tip, 'click', L.DomEvent.stop, this)
			.on(tip, 'click', function(e) {
				this._input.value = text;
				this._handleAutoresize();
				this._input.focus();
				this._hideTooltip();	
				if(this.options.tipAutoSubmit)//go to location at once
					this._handleSubmit();
			}, this);

		return tip;
	},

	_createIcon: function ( className) {
		var icon = L.DomUtil.create('i', className, this._container);
		icon.id = 'searchIcon';
		
		L.DomEvent
		.disableClickPropagation(icon)
		.on(icon, 'click', this._makeSearch,this);
		return icon;
	},

	_createHelpIcon: function ( className) {
		var anchor = L.DomUtil.create('a', '', this._container);
		anchor.setAttribute('target', '_blank');
		anchor.setAttribute('href', 'http://betaportal.icgc.cat/wordpress/faq-dinstamaps/#capçacerca');
		var icon = L.DomUtil.create('i', className, anchor);
		icon.id = 'helpIcon';
		
		return anchor;
	},
//////end DOM creations

	_filterRecords: function(text) {	//Filter this._recordsCache case insensitive and much more..
	
		var regFilter = new RegExp("^[.]$|[\[\]|()*]",'g'),	//remove . * | ( ) ] [
			I, regSearch,
			frecords = {};

		text = text.replace(regFilter,'');	  //sanitize text
		I = this.options.initial ? '^' : '';  //search only initial text
		//TODO add option for case sesitive search, also showLocation
		regSearch = new RegExp(I + text,'i');

		//TODO use .filter or .map
		for(var key in this._recordsCache)
			if( regSearch.test(key) )
				frecords[key]= this._recordsCache[key];
		
		return frecords;
	},

	showTooltip: function() {
		
		var filteredRecords, newTip;

		this._countertips = 0;
		
	//FIXME problem with jsonp/ajax when remote filter has different behavior of this._filterRecords
		if(this.options.layer)
			filteredRecords = this._filterRecords( this._input.value );
		else
			filteredRecords = this._recordsCache;
			
		this._tooltip.innerHTML = '';
		this._tooltip.currentSelection = -1;  //inizialized for _handleArrowSelect()

		for(var key in filteredRecords)//fill tooltip
		{
			if(++this._countertips == this.options.tooltipLimit) break;

			newTip = this._createTip(key, filteredRecords[key] );

			this._tooltip.appendChild(newTip);
		}
		
		if(this._countertips > 0)
		{
			this._tooltip.style.display = 'block';
			if(this._autoTypeTmp)
				this._autoType();
			this._autoTypeTmp = this.options.autoType;//reset default value
		}
		else
			this._hideTooltip();

		this._tooltip.scrollTop = 0;
		return this._countertips;
	},

	_hideTooltip: function() {
		this._tooltip.style.display = 'none';
		this._tooltip.innerHTML = '';
		return 0;
	},

	_defaultFilterJSON: function(json) {	//default callback for filter data	
		
		var jsonret = {},
			propName = this.options.propertyName;
			propLoc = this.options.propertyLoc;

		if( L.Util.isArray(propLoc) )
			for(var i in json)
				jsonret[ json[i][propName] ]= L.latLng( json[i][ propLoc[0] ], json[i][ propLoc[1] ] );
		else
			for(var n in json)
				jsonret[ json[n][propName] ]= L.latLng( json[n][ propLoc ] );
		//TODO verify json[n].hasOwnProperty(propName)
		//throw new Error("propertyName '"+propName+"' not found in JSON data");
		return jsonret;
	},

	_recordsFromJsonp: function(text, callAfter) {  //extract searched records from remote jsonp service
		//TODO remove script node after call run
		var that = this;
		L.Control.Search.callJsonp = function(data) {	//jsonp callback
			
			
			var fdata = that._filterJSON(data);//_filterJSON defined in inizialize...
			
			callAfter(fdata);
		}
		if (this.options.url.indexOf("geocodificador")>-1) {
			
			text=escape(text);
			
		}
				
		var script = L.DomUtil.create('script','search-jsonp', document.getElementsByTagName('body')[0] ),	
			url = L.Util.template(this.options.url+'&'+this.options.jsonpParam+'=L.Control.Search.callJsonp', {s: text}); //parsing url
			//rnd = '&_='+Math.floor(Math.random()*10000);
			//TODO add rnd param or randomize callback name! in recordsFromJsonp
		script.type = 'text/javascript';
		script.src = url;
		return this;
		//may be return {abort: function() { script.parentNode.removeChild(script); } };
	},

	_recordsFromAjax: function(text, callAfter) {	//Ajax request
		if (window.XMLHttpRequest === undefined) {
			window.XMLHttpRequest = function() {
				try { return new ActiveXObject("Microsoft.XMLHTTP.6.0"); }
				catch  (e1) {
					try { return new ActiveXObject("Microsoft.XMLHTTP.3.0"); }
					catch (e2) { throw new Error("XMLHttpRequest is not supported"); }
				}
			};
		}
		var request = new XMLHttpRequest(),
			url = L.Util.template(this.options.url, {s: text}), //parsing url
			//rnd = '&_='+Math.floor(Math.random()*10000);
			//TODO add rnd param or randomize callback name! in recordsFromAjax			
			response = {};
		
		request.open("GET", url);
		var that = this;
		request.onreadystatechange = function() {
		    if(request.readyState === 4 && request.status === 200) {
		    	response = JSON.parse(request.responseText);
		    	var fdata = that._filterJSON(response);//_filterJSON defined in inizialize...
		        callAfter(fdata);
		    }
		};
		request.send();
		return this;   
	},	

	_recordsFromLayer: function() {	//return table: key,value from layer
		var retRecords = {},
			propName = this.options.propertyName,
			loc;
		
		this._layer.eachLayer(function(layer) {

			if(layer instanceof SearchMarker) return;

			if(layer instanceof L.Marker)
			{
				if(layer.options.hasOwnProperty(propName))
				{
					loc = layer.getLatLng();
					loc.layer = layer;
					retRecords[ layer.options[propName] ] = loc;			
					
				}else if(layer.feature.properties.hasOwnProperty(propName)){

					loc = layer.getLatLng();
					loc.layer = layer;
					retRecords[ layer.feature.properties[propName] ] = loc;
					
				}else{
					console.log("propertyName '"+propName+"' not found in marker", layer);
				}
			}
			else if(layer.hasOwnProperty('feature'))//GeoJSON layer
			{
				if(layer.feature.properties.hasOwnProperty(propName))
				{
					loc = layer.getBounds().getCenter();
					loc.layer = layer;			
					retRecords[ layer.feature.properties[propName] ] = loc;
				}
				else
					console.log("propertyName '"+propName+"' not found in feature", layer);			
			}
			
		},this);
		
		return retRecords;
	},

	_autoType: function() {
		
		//TODO implements autype without selection(useful for mobile device)
		
		var start = this._input.value.length,
			firstRecord = this._tooltip.firstChild._text,
			end = firstRecord.length;

		if (firstRecord.indexOf(this._input.value) === 0) { // If prefix match
			this._input.value = firstRecord;
			this._handleAutoresize();

			if (this._input.createTextRange) {
				var selRange = this._input.createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end);
				selRange.select();
			}
			else if(this._input.setSelectionRange) {
				this._input.setSelectionRange(start, end);
			}
			else if(this._input.selectionStart) {
				this._input.selectionStart = start;
				this._input.selectionEnd = end;
			}
		}
	},

	_hideAutoType: function() {	// deselect text:

		var sel;
		if ((sel = this._input.selection) && sel.empty) {
			sel.empty();
		}
		else if (this._input.createTextRange) {
			sel = this._input.createTextRange();
			sel.collapse(true);
			var end = this._input.value.length;
			sel.moveStart('character', end);
			sel.moveEnd('character', end);
			sel.select();
		}
		else {
			if (this._input.getSelection) {
				this._input.getSelection().removeAllRanges();
			}
			this._input.selectionStart = this._input.selectionEnd;
		}
	},
	
	_handleKeypress: function (e) {	//run _input keyup event
		switch(e.keyCode)
		{
			case 27: //Esc
				this.collapse();
			break;
			case 13: //Enter
				this._makeSearch(this);				
			break;
			case 38://Up
				this._handleArrowSelect(-1);
			break;
			case 40://Down
				this._handleArrowSelect(1);
			break;
			case 37://Left
			case 39://Right
			case 16://Shift
			case 17://Ctrl
			//case 32://Space
			break;
			case 8://backspace
			case 46://delete
				this._autoTypeTmp = false;//disable temporarily autoType
			break;
			default://All keys

		}
	},
	
	_makeSearch: function(){
		if(this._input.value.length)
			this._cancel.style.display = 'block';
		else
			this._cancel.style.display = 'none';

		if(this._input.value.length >= this.options.minLength)
		{
			var that = this;
			clearTimeout(this.timerKeypress);	//cancel last search request while type in				
			//this.timerKeypress = setTimeout(function() {	//delay before request, for limit jsonp/ajax request

				that._fillRecordsCache();
			
			//}, this.options.delayType);
		}
		else
			this._hideTooltip();
	},

	_removeDiacritics : function(str) {
		//Extracted from: https://stackoverflow.com/a/18123985
		var defaultDiacriticsRemovalMap = [
			{'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
			{'base':'AA','letters':/[\uA732]/g},
			{'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
			{'base':'AO','letters':/[\uA734]/g},
			{'base':'AU','letters':/[\uA736]/g},
			{'base':'AV','letters':/[\uA738\uA73A]/g},
			{'base':'AY','letters':/[\uA73C]/g},
			{'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
			{'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
			{'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
			{'base':'DZ','letters':/[\u01F1\u01C4]/g},
			{'base':'Dz','letters':/[\u01F2\u01C5]/g},
			{'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
			{'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
			{'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
			{'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
			{'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
			{'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
			{'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
			{'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
			{'base':'LJ','letters':/[\u01C7]/g},
			{'base':'Lj','letters':/[\u01C8]/g},
			{'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
			{'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
			{'base':'NJ','letters':/[\u01CA]/g},
			{'base':'Nj','letters':/[\u01CB]/g},
			{'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
			{'base':'OI','letters':/[\u01A2]/g},
			{'base':'OO','letters':/[\uA74E]/g},
			{'base':'OU','letters':/[\u0222]/g},
			{'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
			{'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
			{'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
			{'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
			{'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
			{'base':'TZ','letters':/[\uA728]/g},
			{'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
			{'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
			{'base':'VY','letters':/[\uA760]/g},
			{'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
			{'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
			{'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
			{'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
			{'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
			{'base':'aa','letters':/[\uA733]/g},
			{'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
			{'base':'ao','letters':/[\uA735]/g},
			{'base':'au','letters':/[\uA737]/g},
			{'base':'av','letters':/[\uA739\uA73B]/g},
			{'base':'ay','letters':/[\uA73D]/g},
			{'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
			{'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
			{'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
			{'base':'dz','letters':/[\u01F3\u01C6]/g},
			{'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
			{'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
			{'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
			{'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
			{'base':'hv','letters':/[\u0195]/g},
			{'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
			{'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
			{'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
			{'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
			{'base':'lj','letters':/[\u01C9]/g},
			{'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
			{'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
			{'base':'nj','letters':/[\u01CC]/g},
			{'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
			{'base':'oi','letters':/[\u01A3]/g},
			{'base':'ou','letters':/[\u0223]/g},
			{'base':'oo','letters':/[\uA74F]/g},
			{'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
			{'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
			{'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
			{'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
			{'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
			{'base':'tz','letters':/[\uA729]/g},
			{'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
			{'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
			{'base':'vy','letters':/[\uA761]/g},
			{'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
			{'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
			{'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
			{'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
		];

		for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
			str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
		}

		return str;

	},

	_areCoordinates: function(input) {

		var latlng = (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/).test(input);
		var lnglat = (/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?),\s*[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/).test(input);
		var deg = (/^([-|\+]?\d{1,3}[d|D|\u00B0|\s](\s*\d{1,2}['|\u2019|\s])?(\s*\d{1,2}[\"|\u201d|\s])?\s*([N|n|S|s|E|e|W|w])?\s?)(\s|\s*,\s*)([-|\+]?\d{1,3}[d|D|\u00B0|\s](\s*\d{1,2}['|\u2019|\s])?(\s*\d{1,2}[\"|\u201d|\s])?\s*([N|n|S|s|E|e|W|w])?\s?)$/).test(input);
		var etrs89 = (/^([2-5]\d{5}(\.\d*))(\s+|\s*,\s*)(\d{7}(\.\d*))$/).test(input);

		return latlng || lnglat || deg || etrs89;

	},

	_convertCoordinates: function(input) {

		var coords = [];
		var latlng = (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/).test(input);
		var lnglat = (/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?),\s*[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/).test(input);
		var deg = (/^([-|\+]?\d{1,3}[d|D|\u00B0|\s](\s*\d{1,2}['|\u2019|\s])?(\s*\d{1,2}[\"|\u201d|\s])?\s*([N|n|S|s|E|e|W|w])?\s?)(\s|\s*,\s*)([-|\+]?\d{1,3}[d|D|\u00B0|\s](\s*\d{1,2}['|\u2019|\s])?(\s*\d{1,2}[\"|\u201d|\s])?\s*([N|n|S|s|E|e|W|w])?\s?)$/).test(input);
		var etrs89 = (/^([2-5]\d{5}(\.\d*))(\s+|\s*,\s*)(\d{7}(\.\d*))$/).test(input);

		if (latlng) {

			var matches = input.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
			coords = [parseFloat(matches[1]), parseFloat(matches[4])];

		} else if (lnglat) {

			var matches = input.match(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?),\s*[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/);
			coords = [parseFloat(matches[1]), parseFloat(matches[7])];

		} else if (deg) {

			var matches = input.match(/^(([-|\+]?\d{1,3})[d|D|\u00B0|\s](\s*(\d{1,2})['|\u2019|\s])?(\s*(\d{1,2})[\"|\u201d|\s])?\s*([N|n|S|s|E|e|W|w])?\s?)(\s|\s*,\s*)(([-|\+]?\d{1,3})[d|D|\u00B0|\s](\s*(\d{1,2})['|\u2019|\s])?(\s*(\d{1,2})[\"|\u201d|\s])?\s*([N|n|S|s|E|e|W|w])?\s?)$/);
			var lat = parseFloat(matches[2]) + (undefined != matches[4] ? parseFloat(matches[4])/60 : 0) + (undefined != matches[6] ? parseFloat(matches[6])/3600 : 0);
			var lon = parseFloat(matches[10]) + (undefined != matches[12] ? parseFloat(matches[12])/60 : 0) + (undefined != matches[14] ? parseFloat(matches[14])/3600 : 0);

			coords = [lat, lon];

		} else if (etrs89) {

			proj4.defs('EPSG:25831', '+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs');
			var matches = input.match(/^([2-5]\d{5}(\.\d*))(\s+|\s*,\s*)(\d{7}(\.\d*))$/);
			coords = proj4('EPSG:25831', 'WGS84', [matches[1], matches[4]]);

		}

		var coordsStr = coords[1].toFixed(5) + "," + coords[0].toFixed(5);
		var nomCoords = coords[0].toFixed(5) + "," + coords[1].toFixed(5)
		return {resposta: JSON.stringify({ resultats: [{coordenades: coordsStr, nom: nomCoords}]}), status: "OK"};;

	},
	
	_fillRecordsCache: function() {
		//that.hideAlert();
//TODO important optimization!!! always append data in this._recordsCache
//  now _recordsCache content is emptied and replaced with new data founded
//  always appending data on _recordsCache give the possibility of caching ajax, jsonp and layersearch!
//
//TODO here insert function that search inputText FIRST in _recordsCache keys and if not find results.. 
//  run one of callbacks search(callData,jsonpUrl or options.layer) and run this.showTooltip
//
//TODO change structure of _recordsCache
//	like this: _recordsCache = {"text-key1": {loc:[lat,lng], ..other attributes.. }, {"text-key2": {loc:[lat,lng]}...}, ...}
//	in this mode every record can have a free structure of attributes, only 'loc' is required
		var inputText = this._removeDiacritics(this._input.value),
			that = this;
		
		L.DomUtil.addClass(this._container, 'search-load');

		if(this._areCoordinates(inputText)) {

			//Convert coordinates in the client side instead of doing a request to the server
			var jsonraw = this._convertCoordinates(inputText);

			//If we can convert, disable show the tooltip and remove the search icon
			that._recordsCache = that._filterJSON(jsonraw);
			this.showTooltip();
			L.DomUtil.removeClass(this._container, 'search-load');

		} else {

			if(this.options.callData)	//CUSTOM SEARCH CALLBACK(USUALLY FOR AJAX SEARCHING)
			{

				this.options.callData(inputText, function(jsonraw) {

					that._recordsCache = that._filterJSON(jsonraw);

					that.showTooltip();

					L.DomUtil.removeClass(that._container, 'search-load');
				});
			}
			else if(this.options.url)	//JSONP/AJAX REQUEST
			{	if(this.options.jsonpParam)
				{

					
					this._recordsFromJsonp(inputText, function(data) {// is async request then it need callback
						
						
						that._recordsCache = data;
						that.showTooltip();
						L.DomUtil.removeClass(that._container, 'search-load');
					});
				}
				else
				{

					this._recordsFromAjax(inputText, function(data) {// is async request then it need callback
						that._recordsCache = data;
						that.showTooltip();
						L.DomUtil.removeClass(that._container, 'search-load');
					});
				}
			}
			else if(this.options.layer)	//SEARCH ELEMENTS IN PRELOADED LAYER
			{
				this._recordsCache = this._recordsFromLayer();	//fill table key,value from markers into layer				
				this.showTooltip();
				L.DomUtil.removeClass(this._container, 'search-load');
			}

		}

	},
	
	_handleAutoresize: function() {	//autoresize this._input
	    //TODO refact _handleAutoresize now is not accurate
	    if (this._input.style.maxWidth != this._map._container.offsetWidth) //If maxWidth isn't the same as when first set, reset to current Map width
	        this._input.style.maxWidth = L.DomUtil.getStyle(this._map._container, 'width');

		if(this.options.autoResize && (this._container.offsetWidth + 45 < this._map._container.offsetWidth))
			this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
	},

	_handleArrowSelect: function(velocity) {
	
		var searchTips = this._tooltip.hasChildNodes() ? this._tooltip.childNodes : [];
			
		for (i=0; i<searchTips.length; i++)
			L.DomUtil.removeClass(searchTips[i], 'search-tip-select');
		
		if ((velocity == 1 ) && (this._tooltip.currentSelection >= (searchTips.length - 1))) {// If at end of list.
			L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
		}
		else if ((velocity == -1 ) && (this._tooltip.currentSelection <= 0)) { // Going back up to the search box.
			this._tooltip.currentSelection = -1;
		}
		else if (this._tooltip.style.display != 'none') { // regular up/down
			this._tooltip.currentSelection += velocity;
			
			L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
			
			this._input.value = searchTips[this._tooltip.currentSelection]._text;

			// scroll:
			var tipOffsetTop = searchTips[this._tooltip.currentSelection].offsetTop;
			
			if (tipOffsetTop + searchTips[this._tooltip.currentSelection].clientHeight >= this._tooltip.scrollTop + this._tooltip.clientHeight) {
				this._tooltip.scrollTop = tipOffsetTop - this._tooltip.clientHeight + searchTips[this._tooltip.currentSelection].clientHeight;
			}
			else if (tipOffsetTop <= this._tooltip.scrollTop) {
				this._tooltip.scrollTop = tipOffsetTop;
			}
		}
	},

	_handleSubmit: function() {	//button and tooltip click and enter submit

		this._hideAutoType();
		
		this.hideAlert();
		this._hideTooltip();

		if(this._input.style.display == 'none')	//on first click show _input only
			this.expand();
		else
		{
			if(this._input.value === '')	//hide _input only
				this.collapse();
			else
			{
				var loc = this._getLocation(this._input.value);
				$.publish('analyticsEvent',{event:[this.options.scope,'input#cercaTopoOK',this._input.value, 8]});
				
					this.showLocation(loc, this._input.value,this._input.value);
					this.fire('search_locationfound', {
							latlng: loc,
							text: this._input.value,
							layer: loc.layer ? loc.layer : null
						});
				//}
				//this.collapse();
				//FIXME if collapse in _handleSubmit hide _markerLoc!
			}
		}
	},

	_getLocation: function(key) {	//extract latlng from _recordsCache

		if( this._recordsCache.hasOwnProperty(key) )
			return this._recordsCache[key];//then after use .loc attribute
		else
			return false;
	},

	showLocation: function(latlng, title,nom) {	//set location on map from _recordsCache
		if(this.options.zoom)
			this._map.setView(latlng, this.options.zoom);
		else
			this._map.panTo(latlng);
	
		var v_url = window.location.href;
		var defaultPunt= L.AwesomeMarkers.icon(default_marker_style);	
		if(this._markerLoc)
		{
			
			
			if(v_url.indexOf('visor')==-1){
				
				var marker;
				//this._markerLoc.setLatLng(latlng);  //show circle/marker in location found
				if(defaultPunt.options.markerColor!="punt_r"){					
					marker=L.marker([0,0],
						{icon: defaultPunt,isCanvas:defaultPunt.options.isCanvas,
						 tipus: t_marker});
				}else{
					//Si és cercle sense glifon
					marker= L.circleMarker([0,0],
							{ radius : defaultPunt.options.radius, 
							  isCanvas:defaultPunt.options.isCanvas,
							  fillColor : defaultPunt.options.fillColor,
							  color :  defaultPunt.options.color,
							  weight :  defaultPunt.options.weight,
							  opacity :  defaultPunt.options.opacity,
							  fillOpacity : defaultPunt.options.fillOpacity,
							  tipus: t_marker}							
					);
					
				}
				marker.setLatLng(latlng);
				
				
				
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : nom,
					zIndex :  -1,
	//				tipus : t_tematic,
					tipus : t_visualitzacio,
					geometryType: t_marker
				};
				
				map.addLayer(capaUsrActiva);
				marker.properties={
						'capaNom':capaUsrActiva.options.nom,//TODO desactualitzat quan es canvii nom capa!
						'capaBusinessId':capaUsrActiva.options.businessId,
						'capaLeafletId': capaUsrActiva._leaflet_id,
						'tipusFeature':t_marker};	
				
				marker.properties.data={
						'nom':nom,
						'text':title,
				};
				
				capaUsrActiva.on('layeradd',objecteUserAdded);
				capaUsrActiva.addLayer(marker);
				
			}
			else {
							
				
				var marker=null;
				if(!defaultPunt.options.isCanvas){
					marker=L.marker([0,0],
						{icon: defaultPunt,isCanvas:defaultPunt.options.isCanvas,
						 tipus: t_marker});
				}else{
					//Si és cercle sense glifon
					marker= L.circleMarker([0,0],
							{ radius : defaultPunt.options.radius, 
							  isCanvas:defaultPunt.options.isCanvas,
							  fillColor : defaultPunt.options.fillColor,
							  color :  defaultPunt.options.color,
							  weight :  defaultPunt.options.weight,
							  opacity :  defaultPunt.options.opacity,
							  fillOpacity : defaultPunt.options.fillOpacity,
							  tipus: t_marker}							
					);
					
				}
				
				marker.setLatLng(latlng); 
				
				//console.debug("createPopupWindowData");
				var html='';
				
				html+='<h4>'+nom+'</h4>';				
				html+='<div>'+title+'</div>';
				
				marker.bindPopup(html,{'offset':[0,-25]});
				
				this._layer.addLayer(marker);
				map.addLayer(this._layer);
				//map.addLayer(this._layer);
			}
			
		}
		clearTimeout(this.timerKeypress);
		
		//FIXME autoCollapse option hide this._markerLoc before that visualized!!
		if(this.options.autoCollapse)
			this.collapse();
		return this;
	}
});

/*
var SearchMarker = L.Marker.extend({

	includes: L.Mixin.Events,
	
	options: {
		radius: 10,
		weight: 3,
		color: '#e03',
		stroke: true,
		fill: false,
		title: '',
		//TODO add custom icon!	
		marker: false	//show icon optional, show only circleLoc
	},
	
	initialize: function (latlng, options) {
		L.setOptions(this, options);
		L.Marker.prototype.initialize.call(this, latlng, options);
		this._circleLoc = new L.CircleMarker(latlng, this.options);
		//TODO add inner circle
	},

	onAdd: function (map) {
		L.Marker.prototype.onAdd.call(this, map);
		map.addLayer(this._circleLoc);
		this.hide();
	},

	onRemove: function (map) {
		L.Marker.prototype.onRemove.call(this, map);
		map.removeLayer(this._circleLoc);
	},	
	
	setLatLng: function (latlng) {
		L.Marker.prototype.setLatLng.call(this, latlng);
		this._circleLoc.setLatLng(latlng);
		return this;
	},
	
	setTitle: function(title) {
		title = title || '';
		this.options.title = title;
		if(this._icon)
			this._icon.title = title;
		return this;
	},

	show: function() {
		if(this.options.marker)
		{
			if(this._icon)
				this._icon.style.display = 'block';
			if(this._shadow)
				this._shadow.style.display = 'block';
			//this._bringToFront();
		}
		if(this._circleLoc)
		{
			this._circleLoc.setStyle({fill: this.options.fill, stroke: this.options.stroke});
			//this._circleLoc.bringToFront();
		}
		return this;
	},

	hide: function() {
		if(this._icon)
			this._icon.style.display = 'none';
		if(this._shadow)
			this._shadow.style.display = 'none';
		if(this._circleLoc)			
			this._circleLoc.setStyle({fill: false, stroke: false});
		return this;
	},

	animate: function() {
	//TODO refact animate() more smooth! like this: http://goo.gl/DDlRs
		var circle = this._circleLoc,
			tInt = 200,	//time interval
			ss = 10,	//frames
			mr = parseInt(circle._radius/ss),
			oldrad = this.options.radius,
			newrad = circle._radius * 2.5,
			acc = 0;

		circle._timerAnimLoc = setInterval(function() {
			acc += 0.5;
			mr += acc;	//adding acceleration
			newrad -= mr;
			
			circle.setRadius(newrad);

			if(newrad<oldrad)
			{
				clearInterval(circle._timerAnimLoc);
				circle.setRadius(oldrad);//reset radius
				//if(typeof afterAnimCall == 'function')
					//afterAnimCall();
					//TODO use create event 'animateEnd' in SearchMarker 
			}
		}, tInt);
		
		return this;
	 }
});*/

L.Map.addInitHook(function () {
    if (this.options.searchControl) {
        this.searchControl = L.control.search(this.options.searchControl);
        this.addControl(this.searchControl);
    }
});

L.control.search = function (options) {
    return new L.Control.Search(options);
};

}).call(this);

