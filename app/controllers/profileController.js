'use strict';


(function() {
    var profileImageText = document.getElementById('profileImageText');
    var main = document.getElementById('imageContainer');
	function profilePage(data) {


        for (var i in data.tokens) {
            var capital = i.substr(0,1).toUpperCase() + i.substr(1, i.length);
            document.getElementById(i).href = mainUrl + "/unlink/" + i;
            document.getElementById(i + "-text").innerHTML = "Unlink " + capital;
        }
         
         
}

function createImages(array){
	var fragment = new DocumentFragment();
	var pagination = document.createElement('div');
	pagination.className = "pagination";

	for (var i = 0, l = array.length; i < l; i++){

		var imageDiv = document.createElement('div');
		imageDiv.className = "profileImageDiv";
		imageDiv.id = array[i]._id;


		var username = document.createElement('p');
		username.className = 'username';
		username.textContent = array[i].creator.localUsername;

		var shares = document.createElement('img');
		shares.src = "/public/images/shares.png";
		shares.className = "shares";

		if (array[i].original) {
		var reshareTop = document.createElement('div');
		reshareTop.className = "reshareDiv";
		reshareTop.appendChild(shares.cloneNode());

		var newUsername = username.cloneNode();
		newUsername.textContent = array[i].originalUsername;
		reshareTop.appendChild(newUsername);
		imageDiv.appendChild(reshareTop);
		}

		imageDiv.appendChild(username);


		var image = document.createElement('img');
		image.className = "image";
		image.src = array[i].localImagePath;
		imageDiv.appendChild(image);

		var title = document.createElement('p');
		title.textContent = array[i].imageTitle;
		title.className = "imageTitle";
		imageDiv.appendChild(title);

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


		fragment.appendChild(imageDiv);
		if (i === 4 || i === (l - 1)) {
			var link = document.createElement("p");
			link.className = "paginationLink";
			var profileImageContainer = document.createElement('div');
			profileImageContainer.className = 'profileImageContainer';
			profileImageContainer.id = "profileImageContainer";
			profileImageContainer.appendChild(fragment);
			(function(link, div){
				link.addEventListener('click', function(event){
					if (document.getElementById('profileImageContainer')) main.removeChild(document.getElementById('profileImageContainer'));
					main.appendChild(div);

				}, false);
			})(link, profileImageContainer)
			pagination.appendChild(link);
			link.textContent = pagination.childNodes.length;
		}

	}
	profileImageText.textContent = "Your Images";
	main.appendChild(pagination);
}





	var recieveprofileUrl = mainUrl + "/getUser";
	xhttp.request("GET", recieveprofileUrl, function(data){
			var data = JSON.parse(data);
			profilePage(data);
			if (data.images) return createImages(data.images);
			return profileImageText.textContent = "You do not have any images";
	});















    
    
    
    
    
    
    
    
    
    
    
})();