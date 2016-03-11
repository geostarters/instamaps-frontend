/**
 * require Jquery
 * require Handelbars
 */
;(function(global, $){
	
	var Galeria = function(options){
		return new Galeria.init(options);
	}
	
	var pageGaleria = 0;
	var	userList;
	var loading = false;
	var searchString;
	var businessIds = [];
	var mapsGalery = [];
	var codiUsuari;
	var tipusEntitat;
	
	//TODO definir los templates dentro del modulo
	var source = $("#galeria-template").html();
	var template = Handlebars.compile(source);
	
	var sourcePublic = $("#galeriaPublic-template").html();
	var templatePublic = Handlebars.compile(sourcePublic);

	var sourceAdmin = $("#galeriaAdmin-template").html();
	var templateAdmin = Handlebars.compile(sourceAdmin);
	
	var sourceAplicacions = $("#aplicacions-template").html();
	var templateAplicacions = Handlebars.compile(sourceAplicacions);
	
	var sourceConfigurades = $("#configurades-template").html();
	var templateConfigurades = Handlebars.compile(sourceConfigurades);
	
	Handlebars.registerHelper('if_eq', function(a, b, opts) {
	    if(a == b) // Or === depending on your needs
	        return opts.fn(this);
	    else
	        return opts.inverse(this);
	});
	
	var galeriaOptions = { //default instamaps
		tipusApp: 1,
		isGeolocal: false,
		publica: true
	};
	
	Galeria.prototype = {
		
		getNumMaps: function(){
			var self = this;
			var data = {
				tipusApp: self.options.tipusApp	
			}
			return $.ajax({
				url: paramUrl.getNumGaleria,
				dataType: 'jsonp',
				data: data
			}).promise();	
		}, 
		
		showTabs: function(){
			var self = this;
			$('#tabs_links').removeClass('hide');
		},
		
		hideTabs: function(){
			var self = this;
			$('#tabs_links').addClass('hide');
		},
		
		drawGaleria: function(data){
			var self = this;
			if(self.options.publica){
				self.drawPublic();
			}else{
				self.drawPrivate(data);
				if(self.options.isGeolocal){
					self.drawGeoLocal();
				}
			}
		},
		
		updateTotal: function(){
			var self = this;
			if ($('.new_map').is(':visible')){
				self.escriuResultats(userList.visibleItems.length-1);
			}else{
				self.escriuResultats(userList.visibleItems.length);
			}
		},
		
		escriuResultats: function(total){
			$('.sp_rs_maps').html(total);
			$('.sp_total_maps').hide();
			$('.sp_rs_maps').show();
			if(total === 0){
				$('.msg_no_result').removeClass('hide').show();
			}else{
				$('.msg_no_result').hide();
			}
		},
		
		escriuTotal: function(){
			$('.sp_total_maps').show();
			$('.sp_rs_maps').hide();
		},
		
		updateResultats: function(){
			var total=(parseInt($('.sp_rs_maps').html()) -1);
			$('.sp_rs_maps').html(total);
			$('.sp_total_maps').hide();
			$('.sp_rs_maps').show();
		}, 
		
		drawPrivate: function(results){
			var self = this;
			$('#loadingGaleria').hide();
			
			$('#galeriaSort #obtenirUrlPublica').show();
			
			results.results = jQuery.map( results.results, function( val, i ) {
				val.thumbnail = HOST_APP+"galeria/"+ val.businessId+".jpeg";
				if (val.options){
					val.options = $.parseJSON(val.options);	
				}
				val.uid=$.cookie('uid');
				val.convidats=val.convidats;				
				return val;
			});
			var html = template(results);
			$('#galeriaSort .list').append(html);	
			//Search function
			var optionsSearch = {
				valueNames: [ 'nomAplicacioSort','dataPublicacio', 'rankSort' ],
				page:1000
			};
			$('#sortbyuser').attr("style","display:none;");
			userList = new List('galeriaSort', optionsSearch);
					
			$('input.search.form-control').on('keyup', function(event){
				self.updateTotal();
			});					
			
			$('.new_map').on('click', function(event){
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'fer mapa'/*, 'acquisition'*/]);
				window.location.href = paramUrl.mapaPage;
			});
			
			$('#galeriaRow').on('click', '.btn.btn-danger', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				$('#dialgo_delete').modal('show');
				$('#dialgo_delete .nom_mapa').text($this.data("nom"));
				$('#dialgo_delete .btn-danger').data("businessid", $this.data("businessid"));
				$('#dialgo_delete .btn-danger').data("idusr", $this.data("idusr"));
			});
			
			$('#dialgo_delete .btn-danger').on('click', function(event){
				var $this = $(this);
				var data = {
					businessId: $this.data("businessid"),
					uid: $.cookie('uid')
				};
				deleteMap(data).then(function(results){
					if (results.status == "OK"){
						$('#'+$this.data("businessid")).remove();
						$('#dialgo_delete').modal('hide');
						_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'esborrar mapa'/*, 'acquisition'*/]);
						self.updateResultats();
						
						var data2 = {
							businessId: $this.data("businessid"),
							metode: "rmGaleria"
						};
						deleteImageGaleria(data2).then(function(results){
							
						});
						
						if($this.data("idusr")){
							var data3 = {
								businessId: $this.data("businessid"),
								entitatUid: $this.data("idusr"),
								metode: "deleteWMSfromMap"
							};
							
							createMapToWMS(data3).then(function(results){});
						}
					}
				});
			});
						
			$('#galeriaRow').on('click', '.btn.btn-warning', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				var urlMap = paramUrl.mapaPage+"?businessid="+$this.data("businessid");
				if ($this.data("colaboracio")) {
					urlMap = urlMap +"&mapacolaboratiu=si";
					_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'editar mapa','col.laboratiu']);
				}	
				else _gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'editar mapa','no col.laboratiu']);
				window.location.href = urlMap;
			});
			
			$('#galeriaRow').on('click', '.btn.btn-success', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);

				$('#dialgo_colaborate').data('businessid', $this.data("businessid")).modal('show');
				
				if ($this.data("title")!=undefined) {
					var idConvidats="#convidats_"+$this.data("businessid");
					var data1 = {
						businessId: $this.data("businessid"),
						uid: $.cookie('uid')
					}
					getConvidatsByBusinessId(data1).then(function(results){
						for (var j=1;j<6;j++){ //Netejem els camps dels convidats
							$('#convidats'+j).val("");
							$('#convidats'+j).prop('disabled',false);
							$('#convidats'+j).attr("style","margin-bottom:3px;width:88%;");
							$('#convidats'+j+"_remove").attr("style","display:none;");
							$('#convidats'+j+"_remove").on('click', function(event){
								event.preventDefault();
								event.stopImmediatePropagation();
								var id=event.target.attributes.id.value;
								var idC=id.toString().substring(0,10);
								var data = {
									convidatEsborrar: $('#'+idC).val(),
									businessId: $('#dialgo_colaborate').data('businessid'),
									uid: $.cookie('uid')
								}
								deleteConvidatByBusinessId(data).then(function(results2){
									if (results2.status=="OK"){
										alert( window.lang.convert("Col·laborador ")+$('#'+idC).val()+window.lang.convert(" esborrat"));
										$('#'+idC).val("");
										$('#'+idC).prop('disabled',false);
										$('#'+idC).attr("style","margin-bottom:3px;width:88%;");
										$('#'+idC+"_remove").attr("style","display:none;");										
									}				
								});
							});
						}
						if (results.results!=null) {
							var convidatsJson=$.parseJSON(results.results);
							var jsonObj = [];
							jQuery.map( convidatsJson, function( val, i ) {
								var conv='#convidats'+(i+1);
								var convR='#convidats'+(i+1)+"_remove";	
								if (val.validat=="S") {
									$(conv).val(val.email);
									$(conv).prop('disabled', true);
									var item = {};
							        item ["email"] = val.email;
							        jsonObj.push(item);
							        $(convR).attr("style","display:none;");
								}
								else {
									$(conv).val(val.email);
									$(conv).prop('disabled', true);
									$(conv).attr("style","background-color:#d9534f;opacity:0.85;margin-bottom:3px;width:88%;");
									var item = {};
							        item ["email"] = val.email;
							        jsonObj.push(item);
							        $(convR).attr("style","display:block;");
								}					
							});		
						}
					});
					
					$('#businessIdConvidar').val($this.data("businessid"));
				}
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'preconvidar']);
			});
			
			$('#galeriaRow').on('click', '.btn.btn-primary', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				var urlMap = 'http://'+DOMINI+paramUrl.visorPage+'?businessid='+$this.data("businessid");
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				shortUrl(urlMap).then(function(results){
					$('#urlMap').val(results.data.url);
				});
				$('#urlVisor').attr("href", urlMap);
				$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
				$('#dialgo_url_iframe').modal('show');
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'enllaça mapa', 'referral', 1]);
			});
			
			$('#galeriaRow').on('click', '.caption.descAplicacio', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				var appbusinessid = appbusinessid = $this.parent().data("businessid");
				var urlMap = paramUrl.visorPage+"?businessid="+appbusinessid;
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				_gaq.push(['_trackEvent', 'galeria privada', tipus_user+'veure mapa']);
				window.open(urlMap);
			});
			
			//Change visibility
			$('#galeriaRow').on('click', '.btn.btn-visibility', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				
				var visibilitatAntiga="P";
				var idPriv="#privacitat_"+$this.data("businessid");
				
				if ($(idPriv).attr("class") == "glyphicon glyphicon-eye-open" ) visibilitatAntiga="O";				
				
				var visibilitatNova="";
				var textVisibilitatNova="";
				if (visibilitatAntiga=="P") {
					visibilitatNova="O";
					textVisibilitatNova="public";
				}
				else {
					visibilitatNova="P";
					textVisibilitatNova="privat";
				}
				
				var data1 = {
						businessId: $this.data("businessid"),
						uid: $.cookie('uid'),
						visibilitat: visibilitatNova
				};
				updateMapVisibility(data1).then(function(results){
					if (results.status=="OK") {
						if (visibilitatAntiga=="P") {
							$(idPriv).attr("class", "glyphicon glyphicon-eye-open");
							$this.data("title", window.lang.convert("El mapa és visible a la galeria pública"));
							//$this.attr('title', window.lang.convert("El mapa és visible a la galeria pública")).tooltip('fixTitle').tooltip('show');
						}
						else {
							$(idPriv).attr("class", "glyphicon glyphicon-eye-close");
							$this.data("title",window.lang.convert("El mapa només és visible a la teva galeria privada"));
							//$this.attr('title', window.lang.convert("El mapa només és visible a la teva galeria privada")).tooltip('fixTitle').tooltip('show');
							
						}
					}
					else alert(window.lang.convert("No ha sigut possible canviar la visibilitat del mapa"));
				});
				
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'visibilitat',textVisibilitatNova]);
				
			});			

			$('.thumbnail').hover(function(){
				var descAplicacio = $(this).find(".descAplicacio");
				descAplicacio.fadeIn(500);
				if (descAplicacio.find(".starwarsbody").text().length > 160){
					descAplicacio.find(".starwarsmain").addClass('starwars');
					descAplicacio.find(".starwarsbody").addClass('starwarscontent');
				}
				return false;	
			}, function(){
				$(this).find(".descAplicacio").fadeOut();
				return false;	
			});
			
			$('#dialgo_colaborate #convidar').on('click', function(event){
				var businessId= $('#dialgo_colaborate').data('businessid');
				var urlMap = HOST_APP+paramUrl.visorPage+'?businessid='+businessId;
				var contingut= window.lang.convert("Et convido a col&#183;laborar en el mapa ")+"<span style='font-weight:bold'>"+$('#nomAplicacioSort_'+businessId).val()+"</span>"+ window.lang.convert(" d'Instamaps (creat per ")+$('#userAplicacio_'+businessId).val()+window.lang.convert(" ). Clica a l'enllaç per accedir-hi. Hauràs de registrar-te si no ho has fet encara.")+"<br/>";
				contingut=htmlentities(contingut)+urlMap;
				var to = "";
				var idConv="#convidats_"+businessId;
				var convidats=$(idConv).val();
				var totalConv=0;
				for (var i=1;i<6;i++){
					if ($('#convidats'+i) && $('#convidats'+i).val()!="" ) {
						var convidat=$('#convidats'+i).val();
						if (convidats.indexOf(convidat)!=-1) {
							if ($('#convidats'+i).prop("disabled")!=true) alert("Aquest mail "+convidat+" ja el tens afegit com a col·laborador");
						}
						else {
							if ($('#convidats'+i).prop("disabled")!=true)
							{
								if (to!="")	to=to+","+$('#convidats'+i).val();
								else to=to+$('#convidats'+i).val();
							}

							totalConv++;
							var data = {
								uid: $.cookie('uid'),
								to:to,
								subject:window.lang.convert('Mapa col&#183;laboratiu a Instamaps. Invitaci&oacute;'),
								content: contingut,
								esColaboratiu: 'S',
								businessId: businessId
							};
							sendMail(data).then(function(results){
								if (results.status=="OK") {
									$('#dialgo_colaborate').modal('hide');
								}
								else alert(window.lang.convert("Hi ha hagut algun problema amb la tramesa dels correus electrònics"));
							});
						}
					}
				}
				
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'convidar',totalConv]);
				
			});
			
			$('#galeriaSort #obtenirUrlPublica').on('click', function(event){
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'obtenir URL galeria pública']);
				var urlGaleriaUsuari = "http://www.instamaps.cat/"+paramUrl.galeriaPage.substring(1,paramUrl.galeriaPage.length)+"?user="+$.cookie('uid');
				
				$('#urlPublicaLlarga').val(urlGaleriaUsuari);
				shortUrl(urlGaleriaUsuari).then(function(results){
					$('#urlPublicaCurta').val(results.data.url);
				});
				$('#dialog_public_url').modal('show');
			});
			
			$('#typesTabs a[href="#galeriaTab"]').on('click',function(){
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'accés galeria de mapes']);
			});
			
			$('#typesTabs a[href="#aplicacionsTab"]').on('click',function(){
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'accés aplicacions']);
			});
		},
		
		drawPublic: function(){
			var self = this;
			$('#galeriaSort #obtenirUrlPublica').hide();
			
			$('.cleansort').on('click', function(){
				userList.sort('rankSort', { order: "desc" });
			});
			
			var data = {};
			data.tipusApp = self.options.tipusApp;
			if(typeof $.cookie('uid') !== "undefined"){
				data = {uid: $.cookie('uid')};
			}
				
			var delay = (function(){
				  var timer = 0;
				  return function(callback, ms){
				    clearTimeout (timer);
				    timer = setTimeout(callback, ms);
				  };
			})();
			
			$('input.search.form-control').on('keyup', function(event){
				var q = $(this).val();
				q = $.trim(q);
				if(q != "" && q.length >= 3 && (typeof url('?user')== "undefined")){
					if (userList.size() < $('.sp_total_maps').text()){
						delay(function(){
							loading = true;
							$('#loadingGaleria').show();
							if (userList && userList.searched){
				    			searchString = userList.searchString;
				    			searchString = $.trim(searchString);
				    			//userList.search();
				    		}
							var searchdata = {q: q.toLowerCase()};
							searchdata.tipusApp = self.options.tipusApp;
							searchGaleriaMaps(searchdata).then(function(results){
								self.pintaGaleria(results);
								loading = false;
								if (searchString && searchString != ""){
									userList.search(searchString);
									searchString = null;
								}
							});
							
					    }, 400 );
					}	
				}else if ((typeof url('?user') == "string")){
					delay(function(){
						loading = true;
						$('#loadingGaleria').show();
						if (userList && userList.searched){
			    			searchString = userList.searchString;
			    			searchString = $.trim(searchString);
			    			//userList.search();
			    		}
						var searchString2 = $.trim(q.toLowerCase());
						var searchdata = {user: url('?user'),q: searchString2};
						searchdata.tipusApp = self.options.tipusApp;
						searchGaleriaMapsByUser(searchdata).then(function(results){
							if(searchString2 && searchString2 != ""){
								self.pintaGaleriaMapsByUser(results, searchString);
							}else{
								self.pintaGaleriaMapsByUser(results, null);
							}
						});
					 }, 400 );
				}
				else if (q == ""){
					self.escriuTotal();
				}
			});
			
			$('#geoRss').on('click', function(event){
				_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'rss']);
			});
			
			$('#galeriaSort > button.sort').on('click',function(event){
				if (userList && !userList.searched){
					var that = $(this);
					data.field = that.data('sort');
					data.ordre = 'asc';
					if(that.hasClass('asc')){
						data.ordre = 'desc';
					}
					loading = true;
					data.tipusApp = self.options.tipusApp;
					loadPublicGaleria(data).then(function(results){
						var sort = self.getOrderGaleria();
						$('#loadingGaleria').show();
						self.pintaGaleria(results);
						loading = false;
						self.reorderGaleria(sort);
					});
				}
			});
			
			//cargar mapas
			if(typeof url('?q') == "string"){
				var searchString = url('?q');
				searchString = $.trim(searchString);
				if(searchString != "" && searchString.length >= 3){
					$('#galeriaSort>div>input').val(searchString);
					var searchdata = {q: searchString.toLowerCase(), page: pageGaleria};
					searchdata.tipusApp = self.options.tipusApp;
					searchGaleriaMaps(searchdata).then(function(results){
						if(results.results.length > 0){
							self.pintaGaleria(results);	
						}
						loading = false;
						if (searchString && searchString != "" && userList){
							userList.search(searchString);
						}
						data.tipusApp = self.options.tipusApp;
						loadPublicGaleria(data).then(function(results){
							self.pintaGaleria(results);
							if (searchString && searchString != ""){
								userList.search(searchString);
								searchString = null;
							}
						});
					});
				}else{
					data.tipusApp = self.options.tipusApp;
					loadPublicGaleria(data).then(function(results){
						self.pintaGaleria(results);
					});
				}
			}else if(typeof url('?user') == "string"){
				var searchString = url('?user');
				searchString = $.trim(searchString);
				var searchString2 = url('?q');
				searchString2 = $.trim(searchString2);
				$('#galeriaSort>div>input').val(searchString);
				var searchdata = {user: searchString, q:searchString2.toLowerCase(), page: pageGaleria};
				searchdata.tipusApp = self.options.tipusApp;
				searchGaleriaMapsByUser(searchdata).then(function(results){
					if(searchString2 && searchString2 != ""){
						self.pintaGaleriaMapsByUser(results, searchString2);
					}else{
						self.pintaGaleriaMapsByUser(results, null);
					}
				});			
			}else{
				data.tipusApp = self.options.tipusApp;
				loadPublicGaleria(data).then(function(results){
					self.pintaGaleria(results);
				});
			}
			
			$(window).scroll(function(){
			    if ($(window).scrollTop() == $(document).height() - $(window).height()){
			    	if (!loading){
			    		if(userList && !userList.searched){
				    		if (userList.size() < $('.sp_total_maps').text()){
				    			loading = true;
				    			pageGaleria++;
				    			var sort = self.getOrderGaleria();
				    			$('#loadingGaleria').show();
			    				var data = {};
								if(typeof $.cookie('uid') !== "undefined"){
									data = {uid: $.cookie('uid')};
								}
								data.page = pageGaleria;
								data.ordre = sort.order;
								data.field = sort.sortField;
								data.tipusApp = self.options.tipusApp;
								loadPublicGaleria(data).then(function(results){
									self.pintaGaleria(results);
									loading = false;
									self.reorderGaleria(sort);
								});
			    			
				    		}
			    		}
			    	}
				}
			});
		},
		
		drawGeoLocal: function(){
			var self = this;
			self.showTabs();
			
			//cambiar el footer
			$('footer div.container span').text("InstaMaps.Geolocal");
			
			getUserData($.cookie('uid')).then(function(results){
				loadAplicacionsUser().then(function(results1){
					codiUsuari = $.cookie('uid');
					tipusEntitat = $.cookie('tipusEntitat');
					self.pintaGaleriaAplicacions(results1, tipusEntitat);
					getConfiguradesUser({codiUsuari: codiUsuari}).then(function(results){
						self.pintaGaleriaConfigurades(results);
					});
				});
			});
		}, 
		
		pintaGaleriaAplicacions: function(results, tipusEntitat){
			var self = this;
			var html = templateAplicacions({results: results[tipusEntitat]});
			$('#AplicacionsRow .list').append(html);
			$('#AplicacionsRow').on('click', '.btn.btn-warning' ,function(event){
				var urlMap = $(this).data('url');
				if (!urlMap){
					var editor = $(this).data('editor');
					if(editor){
						editor = editor.split("|");
						urlMap = paramAplications[editor[0]].editor + editor[1]
					}
				}			
				//usar el cookie token	
				urlMap += $.cookie('uid')+"&token="+$.cookie('token');
				if(urlMap.indexOf("EdCarrerer") != -1){
					urlMap += "&muniIne="+$.cookie('uid').substring(1); 
				}
				window.open(urlMap);	
			});
		}, 
		
		pintaGaleriaConfigurades: function(results){
			var self = this;
			var configurades = $.map(results,function(val, i){
				if (val.tipusAplicacio.businessId == "at" || 
					val.tipusAplicacio.businessId == "par" ||
					val.tipusAplicacio.businessId == "ics"){
					return val;
				}
			});
			var html = templateConfigurades({results: configurades});
			$('#AplicacionsRow .list').append(html);
			
			$('#AplicacionsRow').on('click', '.btn.btn-success' ,function(event){
				var urlMap = $(this).data('url');
				window.open(urlMap);
			});
			
			$('#AplicacionsRow').on('click', '.btn.btn-danger', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				$('#dialgo_delete_aplicacio').modal('show');
				$('#dialgo_delete_aplicacio .nom_mapa').text($this.data("nom"));
				$('#dialgo_delete_aplicacio .btn-danger').data("businessid", $this.data("businessid"));
				$('#dialgo_delete_aplicacio .btn-danger').data("idusr", $this.data("idusr"));
				var eliminar = $(this).data('eliminar');
				eliminar = eliminar.split("|");
				var urlMap = "";
				switch (eliminar[0]){
					case 'ics': 
						urlMap = paramAplications.incasol.eliminar;
						break;
					case 'at':
						urlMap = paramAplications.atles.eliminar;
						break;
					case 'par':
						urlMap = paramAplications.infoparcela.eliminar;
						break;
				}
				//usar el cookie token
				urlMap += eliminar[1] + "&token="+$.cookie('token');
				$('#dialgo_delete_aplicacio .btn-danger').data("url", urlMap);
			});
			
			$('#dialgo_delete_aplicacio .btn-danger').on('click', function(event){
				var $this = $(this);
				deleteAplicacionsGeolocal($this.data("url")).then(function(results){
					if (results.status == "OK"){
						$('#'+$this.data("businessid")).remove();
						$('#dialgo_delete_aplicacio').modal('hide');
						_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'esborrar aplicacio']);
					}
				});
			});
			
		}, 
		
		reorderGaleria: function(sort){
			var self = this;
			if (sort.order == "asc"){
				userList.sort(sort.sortField, { order: "asc" });
			}else if(sort.order == "desc"){
				userList.sort(sort.sortField, { order: "desc" });
			}
		}, 
		
		getOrderGaleria: function(){
			var selft = this;
			var asc = $('#galeriaSort > button.sort.asc');
			var desc = $('#galeriaSort > button.sort.desc');
			var sort = {};
			if (asc.length > 0){
				var btn = asc[0];
				var sortField = $(btn).data('sort');
				sort.sortField = sortField;
				sort.order = "asc";
			}else if(desc.length > 0){
				var btn = desc[0];
				var sortField = $(btn).data('sort');
				sort.sortField = sortField;
				sort.order = "desc";
			}
			return sort;
		}, 
		
		pintaGaleria: function(results){
			var self = this;
			$('#loadingGaleria').hide();
			results.results = jQuery.map( results.results, function( val, i ) {
				if($.inArray(val.businessId, businessIds) == -1){
					businessIds.push(val.businessId);
					//val.thumbnail = paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + val.businessId;
					val.thumbnail = HOST_APP+"galeria/"+ val.businessId+".jpeg";
					if (val.options){
						val.options = $.parseJSON(val.options);	
					}
					if (isDefaultMapTitle(val.nomAplicacio)){
						val.rank = -1;
					}
					val.entitatUid = val.entitatUid.split("@")[0];
					val.data =  new Date(val.dataPublicacio).toLocaleDateString();
					mapsGalery.push(val);
					return val;
				}else{
					return null;
				}
			});
			
			results.results = mapsGalery;
			
			results.results.sort(function(a,b) { 
	            return parseFloat(a.rank) < parseFloat(b.rank) 
			});
			
			if (results.admin == "OK"){
				var html = templateAdmin(results);
			}else{
				var html = templatePublic(results);
			}
						
			$('#galeriaSort .list').html(html);						
			
			$('#galeriaRow').on('click', '.btn.btn-success', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopImmediatePropagation();
				var $this = $(this);
				var appbusinessid = $this.data("businessid");
				if (!appbusinessid){
					appbusinessid = $this.parent().data("businessid");
				}
				var urlMap = paramUrl.visorPage+"?businessid="+appbusinessid;
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
					
				}
				_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'veure mapa']);
				//_kmq.push(['record', 'veure mapa', {'from':'galeria publica', 'tipus user':tipus_user}]);
				window.open(urlMap);
			});
			
			$('#galeriaRow').on('click', '.btn-acctions .btn.btn-primary', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				var urlMap = 'http://'+DOMINI+paramUrl.visorPage+'?businessid='+$this.data("businessid");
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				//$('#urlMap').val(urlMap);
				shortUrl(urlMap).then(function(results){
					$('#urlMap').val(results.data.url);
				});
				$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
				$('#dialgo_url_iframe').modal('show');
				_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'enllaça mapa', 'referral', 1]);
				//_kmq.push(['record', 'enllaça mapa', {'from':'galeria publica', 'tipus user':tipus_user}]);
			});
			
			$('#galeriaRow').on('click', '.btn.btn-warning', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				$('#dialgo_rank').modal('show');
				$('#dialgo_rank .rank_mapa').val($this.data("rank"));
				$('#dialgo_rank .btn-primary').data("businessid", $this.data("businessid"));
			});
			
			$('#galeriaRow').on('click', '#dialgo_rank .btn-primary', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				var businessid =  $this.data("businessid");
				var params = {
					businessId: businessid,
					rank: $('#dialgo_rank .rank_mapa').val(),
					uid: $.cookie('uid')
				};
				updateRankAplicacio(params).then(function(results){
					if (results.status == "OK"){
						$('#'+businessid + ' .rank').text(results.results);
						$('#'+businessid + ' .rankSort').text(results.results);
						userList.sort('rankSort', { order: "desc" });
					}
					$('#dialgo_rank').modal('hide');
				});
			});
			
			$('.tab-content').on('mouseenter', '.thumbnail', function(){
				var descAplicacio = $(this).find(".descAplicacio");
				descAplicacio.fadeIn(500);
				if (descAplicacio.find(".starwarsbody").text().length > 160){
					descAplicacio.find(".starwarsmain").addClass('starwars');
					descAplicacio.find(".starwarsbody").addClass('starwarscontent');
				}
				return false;	
			});
			
			$('.tab-content').on('mouseleave', '.thumbnail', function(){
				$(this).find(".descAplicacio").fadeOut();
				return false;	
			});
			
			$('#galeriaRow').on('click', '.caption.descAplicacio', function(event){
				event.preventDefault();
				event.stopImmediatePropagation();
				var $this = $(this);
				var appbusinessid = appbusinessid = $this.parent().data("businessid");
				var urlMap = paramUrl.visorPage+"?businessid="+appbusinessid;
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				_gaq.push(['_trackEvent', 'galeria privada', tipus_user+'veure mapa']);
				window.open(urlMap);
			});
			
			if (userList){
				userList.reIndex();
			}else{
				//Search function
				var optionsSearch = {
					valueNames: [ 'nomAplicacioSort', 'byuser', 'dataPublicacio', 'rankSort' ],
					page: 10000
				};
				
				userList = new List('galeriaSort', optionsSearch);
				
				userList.on('searchComplete',function(){
					self.escriuResultats(userList.visibleItems.length);
				});
			}
			
			if(userList && userList.searched){
				self.escriuResultats(userList.visibleItems.length);
			}else{
				self.escriuTotal();
			}
		}, 
		
		onMessage: function(e){
			var self = this;
			if (e.origin == "http://www.geolocal.cat"){
				switch(e.data){
					case 'reload':
						self.reload();
						break;
				}
			}
		}, 
		
		reload: function(){
			var self = this;
			if( isGeolocalUser() ){
				$("#AplicacionsRow .configurades").remove();
				getConfiguradesUser({codiUsuari: codiUsuari}).then(function(results){
					self.pintaGaleriaConfigurades(results);
				});
			}
		}, 
		
		pintaGaleriaMapsByUser: function(results, searchString){
			var self = this;
			if (results.results!=undefined && results.results.length>0){
				self.pintaGaleria(results);
				loading = false;
				if (searchString && searchString != ""){
					userList.search(searchString);
				}
				self.updateTotal();
			}
			else {
				loading = false;
				self.updateTotal();
				$('#loadingGaleria').hide();
				/*
				if(userList.visibleItems.length === 0){
					//antes se redireccionaba
					//var redirect=paramUrl.galeriaPage;
					//window.location.href=redirect;
				}
				*/
			}
		}

	};
	
	Galeria.init = function(options){
		var self = this;
		self.options = $.extend({}, galeriaOptions, options);
	}
	
	Galeria.init.prototype = Galeria.prototype;
	
	global.Galeria = Galeria; 
	
}(window, jQuery));

