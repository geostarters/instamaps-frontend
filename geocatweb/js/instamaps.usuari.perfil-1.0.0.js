/**
 * 
 */
;(function(global, $){
	var perfilOptions = {
		errMsg: "Error al recuperar les dades"
	};
	
	var Perfil = function(options){
		return new Perfil.init(options);
	}
	
	Perfil.prototype = {
		_getPerfil: function(uid){
			var self = this;
			return $.ajax({
				url: paramUrl.getUserSimple,
				data: {uid : uid},
				method: 'post',
				dataType: 'jsonp'
			}).promise();
		},
		getPerfil: function(){
			var self = this;
			self._getPerfil(self.uid).then(function(results){
				if(results.status==='OK'){
					$.publish('loadPerfil', results);
				}else{
					$.publish('loadPerfilErr', self.errMsg);
				}
			});
		}
	};
	
	Perfil.init = function(options){
		var self = this;
		self = $.extend(self, perfilOptions, options);
		$.publish('initPerfil', self);
	}
	
	Perfil.init.prototype = Perfil.prototype;
	
	global.Perfil = Perfil;
	
}(window, jQuery));