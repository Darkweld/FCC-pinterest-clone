'use strict';


(function() {
	var bookContainer = document.getElementById('profileBookContainer');
    
	function profilePage(data) {


        for (var i in data.tokens) {
            var capital = i.substr(0,1).toUpperCase() + i.substr(1, i.length);
            document.getElementById(i).href = mainUrl + "/unlink/" + i;
            document.getElementById(i + "-text").innerHTML = "Unlink " + capital;
        }
         
         
}



	var recieveprofileUrl = mainUrl + "/getUser";
	xhttp.request("GET", recieveprofileUrl, function(data){
			var data = JSON.parse(data);
			profilePage(data);
	});















    
    
    
    
    
    
    
    
    
    
    
})();