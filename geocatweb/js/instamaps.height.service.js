;(function(global, $)
{

    var HeightService = function() {
        
        this.url = '/terrain/' 

	}

    HeightService.prototype = {
        
        fetch: function(data) {

            var self = this;

            return $.ajax({
                type: 'POST',
                url: self.url,
                contentType:"application/json; charset=utf-8",
                data: JSON.stringify(data)
            });

        }

    };
    
    global.HeightService = new HeightService();

}(window, jQuery));
