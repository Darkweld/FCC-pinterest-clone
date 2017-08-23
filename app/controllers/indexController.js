'use strict';

(function(){
var imageContainer = document.getElementById('Pictures');

var reappend;

function createImages(array, imageUsername){
	var fragment = new DocumentFragment();
	for (var i = 0, l = array.length - 1; l >= i; l--){

		var imageDiv = document.createElement('div');
		imageDiv.className = "imageDiv";
		imageDiv.id = array[l]._id;


		var username = document.createElement('p');
		username.className = 'username';
		username.textContent = array[l].creator.localUsername || imageUsername;

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

function addEvents (parent) {
	
	parent.addEventListener('click', function(event){
		console.log(event.target);
		switch(event.target.className){
			case "imageDiv":
			console.log(event.target.id);
			break;
			case "imageTitle":
			case "image":
			console.log(event.target.parentNode.id);
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
					imageContainer.insertBefore(createImages(shareData.newImage, shareData.username), imageContainer.firstChild);
					return event.target.getElementsByTagName('p')[0].textContent = shareData.shares;
				});
				break;

			case "username":
			xhttp.request('GET', mainUrl + '/getUsernameImages/' + event.target.textContent, function(getImages){
				var getImages = JSON.parse(getImages);
					if (getImages.error) return alert(getImages.error);
					while (imageContainer.hasChildNodes()) {
						imageContainer.removeChild(imageContainer.firstChild);
					}
					imageContainer.appendChild(createImages(getImages))
				});
				break;
		}

	}, false)

}

document.addEventListener('DOMContentLoaded', function(event){
	xhttp.request('GET', mainUrl + "/indexImages", function(data){
		var data = JSON.parse(data);
		console.log(data);
		addEvents(imageContainer);
		imageContainer.appendChild(createImages(data));

	})
}, false)



})();