;(function(global, $) {

	var DataFormatter = function(options) {

		return new DataFormatter.init(options);

	}

	DataFormatter.prototype = {

		options: {
			decimalSeparator : ',',
			thousandsSeparator : '.'
		},

		createOptions: function(name,selectVal) {
			var selectedT='';
			selectVal=='t'?selectedT='selected':selectedT='';	
			var selectedEuro='';
			selectVal=='€'?selectedEuro='selected':selectedEuro='';	
			var selectedDolar='';
			selectVal=='$'?selectedDolar='selected':selectedDolar='';	
			var selectedN='';
			selectVal=='n'?selectedN='selected':selectedN='';	
			
			return '<select class="dataTableSelect" data-column="' + name + '">' + 
			'	<option value="t"'+selectedT+'>Text</option>' +
			'	<option value="€"'+selectedEuro+'>Número (€)</option>' +
			'	<option value="$"'+selectedDolar+'>Número ($)</option>' +
			'	<option value="n"'+selectedN+'>Número</option>' +
			'</select>';/*+
			'<span id="privacitat_'+name+ '" class="glyphicon glyphicon-eye-open" style="float:right"></span>';*/
		},

		formatValue: function(inValue, format) {

			var self = this;

			var value = inValue;
			if(undefined === inValue)
				value = '-';

			if("t" == format)
				value = self.formatToText(value);
			else if("€" == format)
				value = self.formatToEuro(value);
			else if("$" == format)
				value = self.formatToDollar(value);
			else if("n" == format)
				value = self.formatToNumber(value);

			return value;

		},

		formatToText: function(inValue) {
			var self = this;
			return self.removeDecorators(inValue);

		},

		isEuro: function(value) {

			return (value.indexOf('€') != -1)

		},

		isDollar: function(value) {

			return (value.indexOf('$') != -1)

		},

		isNumber: function(value) {

			return (0 < (value.match(/^(\d+|\d{1,3}([,\.]\d{3})*)([\.,]\d+)?$/) || []).length);

		},

		removeDecorators: function(inValue) {

			var self = this;

			var value = inValue;
			if(self.isEuro(inValue) || self.isDollar(inValue)) {

				value = value.slice(0, -1);

			}

			return value;

		},

		formatToEuro: function(inValue) {

			var self = this;

			var value = self.removeDecorators(inValue);
			if(self.isNumber(value))
				value = value + '€';

			return value;

		},

		formatToDollar: function(inValue) {

			var self = this;

			var value = self.removeDecorators(inValue);
			if(self.isNumber(value))
				value = value + '$';

			return value;

		},

		formatToNumber: function(inValue) {

			//Formats to 1.234,2556677
			var self = this;
			
			var value = self.removeDecorators(inValue);
			if(self.isNumber(value))
			{

				var thousands = value.split(self.options.thousandsSeparator);
				var decimals = value.split(self.options.decimalSeparator);
				var numThousands = thousands.length;
				var numDecimals = decimals.length;
				var hasThousandsSeparator = (1 < numThousands);
				var hasMultipleThousands = (2 < numThousands);
				var hasDecimalSeparator = (1 < numDecimals);
				var hasMultipleDecimal = (2 < numDecimals);
				var integerPart = hasMultipleThousands ? decimals[0].split(self.options.thousandsSeparator) : thousands[0].split(self.options.decimalSeparator);
				var decimalPart = hasMultipleThousands ? decimals[1] : thousands[1];

				//check if the integer part is grouped in groups of length 3 except the first one
				var isLength3 = true;
				for(var i=1, len=integerPart.length; i<len && isLength3; ++i) {

					isLength3 = isLength3 && (3 == integerPart[i].length);

				}

				if(!isLength3) {

					//Error. A valid number has an integer part grouped in groups of length 3 except 
					//the first one
					return "error";
				}
				else {

					if(hasThousandsSeparator && hasDecimalSeparator) {

						if(hasMultipleThousands && hasMultipleDecimal) {
							//Error. A valid number can only have multiple occurrences of a separator, not both
							return "error";
						}
						else if((hasMultipleThousands && !hasMultipleDecimal) || (!hasMultipleThousands && hasMultipleDecimal)) {   

							if(hasMultipleThousands) {
								//It's already a good formatted number
							}
							else {

								//Inverted separators 1,300,500.278
								//integerPart is (1, 300 and 500)
								//decimalPart is (278)
								value = integerPart.join(self.options.thousandsSeparator) + self.options.decimalSeparator + decimalPart;

							}

						}
						else {

							//Just a separator of both types. Find which one comes first
							var commaPos = value.indexOf(self.options.decimalSeparator);
							var pointPos = value.indexOf(self.options.thousandsSeparator);
							if(pointPos < commaPos)	{
								//It's already a good formatted number
							}
							else {

								//Inverted separators 1,300.2789
								value = integerPart.join(self.options.thousandsSeparator) + self.options.decimalSeparator + decimalPart;

							}

						}

					}
					else if(hasThousandsSeparator) {
					//Can't really know if it's a greater-than-999 number or a decimal one
					//so we leave it as it is. Take for example 1.578 (is it 1 thousand 5 hundred 78 or 
					//1 point 5 hundred 78?)
						return "error";
					}
					else if(hasDecimalSeparator) {
					//Can't really know if it's a greater-than-999 number or a decimal one
					//so we leave it as it is. Take for example 1,578 (is it 1 thousand 5 hundred 78 or 
					//1 point 5 hundred 78?)
						return "error";
					}
					else {

						//Split string into groups of 3 starting from the back
						var i = value.length % 3;
						var integerPart = i ? [ value.substr( 0, i ) ] : [];
						for(var len=value.length ; i < len ; i += 3 ) {

							integerPart.push( value.substr( i, 3 ) );

						}
						value = integerPart.join(self.options.thousandsSeparator);

					}

				}
			}

			return value;
		}

	};

	DataFormatter.init = function(inOptions){
		var self = this;
		self = $.extend(self, self.options, inOptions);
	}

	DataFormatter.init.prototype = DataFormatter.prototype;

	global.DataFormatter = DataFormatter;

}(window, jQuery));