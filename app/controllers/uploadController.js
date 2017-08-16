'use strict';


(function(){
var form = document.getElementById('uploadForm');

form.addEventListener('submit', function(event){
	event.preventDefault();
	var formdata = new FormData(form);
	
	xhttp.upload('POST', mainUrl + '/upload', formdata, function(data){
		console.log(data);
	});




}, false);











})();