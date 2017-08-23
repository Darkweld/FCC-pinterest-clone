'use strict';

(function() {
var form = document.getElementById('Username');
var formval = document.getElementById('usernameValue');
var yourUsername = document.getElementById('yourUsername');
var userNameContainer = document.getElementById('userNameContainer');
document.addEventListener('DOMContentLoaded', function(load){
	formval.focus();
})
form.addEventListener('submit', function(event) {
	event.preventDefault();

	xhttp.request('POST', mainUrl + '/checkUsername/' + formval.value, function(data) {
		data = JSON.parse(data);

		if (data.error) return alert(data.error);
		if (yourUsername) return yourUsername.textContent = "Your new pinterest-clone username is: " + data.success;
		
		var text = document.createElement('p');
		text.classname = 'boldText';
		text.id = "yourUsername";
		text.textContent = "Your new pinterest-clone username is: " + data.success;
		userNameContainer.insertBefore(text, form);

	});
}, false)



})();