$.widget( "idec.selectOptionsAjax", {
	options:{
		search : 'municipiCodi',
		wrapEachWith : '<option></option>',
		textOption : 'municipi',
		valueOption : 'municipiCodi',
		onComplete : null,
		dataKey : 'attributes',
		url : '/idecwebservices/share/dades/municipis.json'
	},
	
	_create: function() {
		var self = this;
		self._cycle();
	},

	_cycle : function () {
		var self = this;
		self._fetch().done(function (results) {
			self._buildFrag(results);
			self._display();
			if (typeof self.options.onComplete === 'function') {
				self.options.onComplete.apply(self.element, arguments);
			}
		});
	},
	
	_buildFrag : function (results) {
		var self = this;
		self.municipis = $.map(results, function (obj, i) {
			return $(self.options.wrapEachWith).data(self.options.dataKey, obj).val(obj[self.options.valueOption]).append(obj[self.options.textOption])[0];
		});
	},
	
	_fetch : function () {
		var self = this;
		return $.ajax({
			url : self.options.url,
			dataType : 'json'
		})
	},
	
	_display : function () {
		var self = this;
		self.element.html(self.municipis);
	}
});