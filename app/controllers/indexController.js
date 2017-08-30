'use strict';

(function(){
var imageContainer = document.getElementById('Pictures');
var indexContainer = document.getElementById('indexContainer');
var buttonContainer = document.getElementById('buttonContainer');


function createImages(array){
	var fragment = new DocumentFragment();

	while (imageContainer.hasChildNodes()){
		imageContainer.removeChild(imageContainer.firstChild);
	}

	for (var i = 0, l = array.length - 1; l >= i; l--){

		var imageDiv = document.createElement('div');
		imageDiv.className = "imageDiv";
		imageDiv.id = array[l]._id;


		var username = document.createElement('p');
		username.className = 'username';
		username.textContent = array[l].creator.localUsername;

		var shares = document.createElement('img');
		shares.src = "/public/images/shares.png";
		shares.className = "shares";

		if (array[l].original) {
		var reshareTop = document.createElement('div');
		reshareTop.className = "reshareDiv";
		reshareTop.appendChild(shares.cloneNode());

		var newUsername = username.cloneNode();
		newUsername.textContent = array[l].originalUsername;
		reshareTop.appendChild(newUsername);
		imageDiv.appendChild(reshareTop);
		}

		imageDiv.appendChild(username);


		var image = document.createElement('img');
		image.className = "image";
		image.src = array[l].localImagePath;
		imageDiv.appendChild(image);

		var title = document.createElement('p');
		title.textContent = array[l].imageTitle;
		title.className = "imageTitle";
		imageDiv.appendChild(title);

		var likesDiv = document.createElement('div');
		likesDiv.className = "likesDiv";

		var likes = document.createElement('img');
		likes.src = "/public/images/likes.png";
		likes.className = "likes";
		likesDiv.appendChild(likes);

		var likesText = document.createElement('p');
		likesText.textContent = array[l].likes.length || 0;
		likesText.className = "likesText";
		likesDiv.appendChild(likesText);

		var sharesDiv = document.createElement('div');
		sharesDiv.className = "sharesDiv";

		sharesDiv.appendChild(shares);

		var sharesText = document.createElement('p');
		sharesText.textContent = array[l].shares;
		sharesText.className = 'sharesText';
		sharesDiv.appendChild(sharesText);

		var separator = document.createElement('div');
		separator.className = 'separator';
		separator.appendChild(likesDiv);
		separator.appendChild(sharesDiv);

		imageDiv.appendChild(separator);

		fragment.appendChild(imageDiv);
	}

	return fragment;
};

function get(urlAffix){
xhttp.request('GET', mainUrl + urlAffix, function(data){
		var data = JSON.parse(data);
		if (data.error) alert(data.error);
		imageContainer.appendChild(createImages(data));
	});
};
function usernameAppend(value) {
	get('/getUsernameImages/' + value);

					while(buttonContainer.hasChildNodes()) {
						buttonContainer.removeChild(buttonContainer.lastChild);
					}

					var usernameText = document.createElement('p');
					usernameText.textContent = value;
					usernameText.id = "Username";
					buttonContainer.appendChild(usernameText);

					var span = document.createElement('span');
					span.textContent = "'s images";
					usernameText.appendChild(span);

					var backButton = document.createElement('button');
					backButton.textContent = "Show all images";
					backButton.addEventListener('click', function(e){
					while (buttonContainer.hasChildNodes()) {
						buttonContainer.removeChild(buttonContainer.lastChild);
					}
					get('/indexImages');
					}, false)

					buttonContainer.appendChild(backButton);
}

function singleImage(target) {

	xhttp.request('GET', mainUrl + '/indexImages/' + target, function(data){
		var data = JSON.parse(data);
		if (data.error) {
			var p = document.createElement('p');
			p.textContent = data.error;
			p.className = 'absoluteErrorText';
			imageContainer.appendChild(p);
		} else {
		imageContainer.appendChild(createImages(data));
		imageContainer.children[0].className = "bigDiv";
		}
		var backButton = document.createElement('button');

	if (document.getElementById('Username')) {
		var val = document.getElementById('Username').firstChild.textContent;
		buttonContainer.removeChild(document.getElementById('Username'));
		backButton.textContent = "Back to " + val + "'s images";
		imageContainer.children[0].addEventListener('click',function(ev){
			usernameAppend(val);
		}, false);
		backButton.addEventListener('click',function(ev){
			usernameAppend(val);
		}, false);
	} else {
		backButton.textContent = 'Show all images';
		imageContainer.children[0].addEventListener('click', function(ev){
		get('/indexImages');
		buttonContainer.removeChild(backButton);
		}, false);
		backButton.addEventListener('click', function(ev){
		get('/indexImages');
		buttonContainer.removeChild(backButton);
		}, false);
	}

	buttonContainer.appendChild(backButton);
	});

};
	
	imageContainer.addEventListener('click', function(event){
		switch(event.target.className){
			case "imageDiv":

			singleImage(event.target.id)
			break;
			case "likesDiv":
				xhttp.request('POST', mainUrl + '/like/' + event.target.parentNode.parentNode.id, function(likeData){
					var likeData = JSON.parse(likeData);
					if (likeData.error) return alert(likeData.error);
					return event.target.getElementsByTagName('p')[0].textContent = likeData.likes;
				});
				break;

			case "sharesDiv":
			xhttp.request('POST', mainUrl + '/share/' + event.target.parentNode.parentNode.id, function(shareData){
				var shareData = JSON.parse(shareData);
				if (shareData.error) return alert(shareData.error);
				singleImage(shareData.newid);
				});
				break;

			case "username":
			usernameAppend(event.target.textContent);
			break;
		}

	}, false)






function ready(event){
	document.removeEventListener('DOMContentLoaded', ready);
	if (window.location.hash) {
		var image = window.location.hash.slice(1, window.location.hash.length)
		singleImage(image);
		return window.location.hash = "";
	}
	get('/indexImages');
};

document.addEventListener('DOMContentLoaded', ready);



})();