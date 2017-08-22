'use strict';

(function(){
var imageContainer = document.getElementById('Pictures');

function createImages(array){
	var fragment = new DocumentFragment();
	for (var i = 0, l = array.length; i < l; i++){

		var imageDiv = document.createElement('div');
		imageDiv.className = "imageDiv";

		var title = document.createElement('p');
		title.textContent = array[i].imageTitle;
		title.className = "imageTitle";
		imageDiv.appendChild(title);

		var image = document.createElement('img');
		image.className = "image";
		image.src = array[i].localImagePath;
		imageDiv.appendChild(image);

		var likesDiv = document.createElement('div');
		likesDiv.className = "likesDiv";

		var likes = document.createElement('img');
		likes.src = "/public/images/likes.png";
		likes.className = "likes";
		likesDiv.appendChild(likes);

		var likesText = document.createElement('p');
		likesText.textContent = array[i].likes.length || 0;
		likesText.className = "likesText";
		likesDiv.appendChild(likesText);

		var sharesDiv = document.createElement('div');
		sharesDiv.className = "sharesDiv";

		var shares = document.createElement('img');
		shares.src = "/public/images/shares.png";
		shares.className = "shares";
		sharesDiv.appendChild(shares);

		var sharesText = document.createElement('p');
		sharesText.textContent = array[i].shares;
		sharesText.className = 'sharesText';
		sharesDiv.appendChild(sharesText);

		var separator = document.createElement('div');
		separator.className = 'separator';
		separator.appendChild(likesDiv);
		separator.appendChild(sharesDiv);

		imageDiv.appendChild(separator);

		(function(shares, likes, id, shareText, likeText){
			shares.addEventListener('click', function(event){
				xhttp.request('POST', mainUrl + '/share/' + id, function(data){
					if (data.error) return alert(data.error);
				});
			}, false)
			likes.addEventListener('click', function(event){
				xhttp.request('POST', mainUrl + '/like/' + id, function(likeData){
					var likeData = JSON.parse(likeData);
					if (likeData.error) return alert(likeData.error);
					return likeText.textContent = likeData.likes;
				});
			}, false)
		})(sharesDiv, likesDiv, array[i]._id, sharesText, likesText)

		fragment.appendChild(imageDiv);
	}
	imageContainer.appendChild(fragment);
};

document.addEventListener('DOMContentLoaded', function(event){
	xhttp.request('GET', mainUrl + "/indexImages", function(data){
		var data = JSON.parse(data);
		console.log(data);
		return createImages(data);
	})
}, false)



})();