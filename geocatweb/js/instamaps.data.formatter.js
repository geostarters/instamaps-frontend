;(function(global, $) {

	var DataFormatter = function(options) {

		return new DataFormatter.init(options);

	}

	DataFormatter.prototype = {

		options: {
			decimalSeparator : ',',
			thousandsSeparator : '.'
		},

		createOptions: function(name,selectVal,isFeatProp, columnIndex) {

			var selectedT='';
			selectVal=='t'?selectedT=' selected':selectedT='';	
			var selectedEuro='';
			selectVal=='euro'?selectedEuro=' selected':selectedEuro='';	
			var selectedDolar='';
			selectVal=='dolar'?selectedDolar=' selected':selectedDolar='';	
			var selectedN='';
			selectVal=='n'?selectedN=' selected':selectedN='';	
			
			var html="";
			var propEnabled="enabled";
			if (!isFeatProp) {
				html += "<select class='dataTableSelect' data-column-idx='" + columnIndex + 
					"' data-column='" + name + "'>" + 
					"	<option value='t'"+selectedT+">Text</option>" +
					"	<option value='euro'"+selectedEuro+">Número (€)</option>" +
					"	<option value='dolar'"+selectedDolar+">Número ($)</option>" +
					"	<option value='n'"+selectedN+">Número</option>" +
					"</select>";
			}
			else {
				html += "<select class='dataTableSelect' data-column-idx='" + columnIndex + 
				"' data-column='" + name + "' disabled>" + 
				"	<option value='t'"+selectedT+">Text</option>" +
				"	<option value='euro'"+selectedEuro+">Número (€)</option>" +
				"	<option value='dolar'"+selectedDolar+">Número ($)</option>" +
				"	<option value='n'"+selectedN+" selected>Número</option>" +
				"</select>";
			}
			
			
			return html;
			
		},

		formatValue: function(inValue, format, addErrorSpan, errors) {

			var self = this;
			var shouldAddErrorSpan = addErrorSpan || false;
			var mightHaveError = true;

			var value = inValue;
			if(undefined === inValue)
				value = '-';
			else if("t" === format) {
				value = self.formatToText(value);
				mightHaveError = false;
			}
			else if("euro" === format) {
				value = self.formatToEuro(value);
			}
			else if("dolar" === format) {
				value = self.formatToDollar(value);
			}
			else if("n" === format) {
				value = self.formatToNumber(value);
			}

			if(mightHaveError && (value === "e"))
			{

				if(!shouldAddErrorSpan)
					value = inValue;
				else
					value = "<span style='color:red'>" + inValue + "</span>";

				if(errors)
					errors.num++;

			}
						
			return value;

		},

		formatToText: function(inValue) {
			var self = this;
			return self.removeDecorators(inValue);

		},

		isEuro: function(value) {

			/*
				Pre: Assumes the euro character is the last character of the 
				value string. With that in mind we can just check the last 
				character instead of searching for it
			*/
			return (value.slice(-1) === '€');

		},

		isDollar: function(value) {

			/*
				Pre: Assumes the dollar character is the last character of the 
				value string. With that in mind we can just check the last 
				character instead of searching for it
			*/
			return (value.slice(-1) === '$')

		},

		isNumber: function(value) {

			return (0 < (value.match(/^(\d+|\d{1,3}([\.]\d{3})*)([,]\d+)?$/) || []).length);

		},

		removeDecorators: function(inValue) {

			var self = this;

			var value = inValue.trim();
			if(self.isEuro(inValue) || self.isDollar(inValue))
				value = value.substring(0, value.length -1);

			return value;

		},

		formatToEuro: function(inValue) {

			var self = this;

			var value = self.removeDecorators(inValue);
			if(self.isNumber(value)) {
				value =  self.formatToNumber(value) + ' €';
			}
			else value="e";
			
			return value;

		},

		formatToDollar: function(inValue) {

			var self = this;

			var value = self.removeDecorators(inValue);
			if(self.isNumber(value)) {
				value = self.formatToNumber(value) + ' $';
			}
			else value="e";

			return value;

		},

		formatToNumber: function(inValue) {

			//Formats to 1.234,2556677
			var self = this;
			
			var value =  self.removeDecorators(inValue);
			if(self.isNumber(value))
			{

				var thousands = value.split(self.options.thousandsSeparator);
				var decimals = value.split(self.options.decimalSeparator);
				var hasDecimalSeparator = (1 < decimals.length);
				var hasThousandsSeparator = (1 < thousands.length);
				var integerPart = decimals[0].split(self.options.thousandsSeparator);
				var decimalPart = hasDecimalSeparator ? decimals[1] : [];

				if(!hasThousandsSeparator)
				{

					//Split in groups of 3 from the end
					integerPart = integerPart.join('');
					var i = integerPart.length % 3;
					var integerPartArray = i ? [ integerPart.substr( 0, i ) ] : [];
					for(var len=integerPart.length ; i < len ; i += 3 ) {

						integerPartArray.push( integerPart.substr( i, 3 ) );

					}
					
					integerPart = integerPartArray;

				}

				value = integerPart.join(self.options.thousandsSeparator) + (hasDecimalSeparator ? self.options.decimalSeparator + decimalPart : '');

			}
			else return "e";

			return value;
		},
		
		removeErrorSpan: function(inValue){
			var val = inValue;
			if (inValue.indexOf("")>-1){
				val = val.replace("<span style='color:red'>","");
				val = val.replace("</span>","");
			}
			return val;
		}

	};

	DataFormatter.init = function(inOptions){
		var self = this;
		self = $.extend(self, self.options, inOptions);
	}

	DataFormatter.init.prototype = DataFormatter.prototype;

	global.DataFormatter = DataFormatter;

}(window, jQuery));