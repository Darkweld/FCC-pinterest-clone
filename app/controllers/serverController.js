'use strict';

var User = require('../models/user');
var Images = require('../models/images');
var request = require('request');
var FormData = require('form-data');
var fs = require('fs');
var AWS = require('aws-sdk');

function userError (message, path) {
         res.json(message);
         if (path) fs.unlink(path, function(err) {
            if (err) console.error(err);
         });

        };

function AWSRequest (imagePath, method, imageTitle) {


var s3 = new AWS.S3({
region: process.env.REGION,
accessKeyId: process.env.AWS_ID, 
secretAccessKey: process.env.AWS_SECRET,
});

return new Promise(function(resolve, reject){

if (method === "PUT") {
    console.log(imagePath);
     s3.putObject({
        Bucket: process.env.BUCKET_NAME,
        Key: imageTitle,
        Body: fs.createReadStream(imagePath),
}, function(err, response) {
  if (err) {
    console.log( err);
  }
  resolve('https://s3.us-east-2.amazonaws.com/freecodecamp-pinterest-clone/' + imageTitle);

});

} else {

    s3.deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: imageTitle
}, function(err, response) {
  if (err) {
    console.log( err);
  }
  resolve(response);
});
}

}).catch(function(f){
    reject(f);
});


}




function server(passport) {
    this
        .checkTokens = function(req, res) {
            var obj = (req.user).toObject();
            if (obj.tokens) return res.render('profile', {
                user: req.user
            });
            req.logout();
            return res.redirect('/login');
        };
    this
        .githubRoute = passport.authenticate('github');

    this
        .githubCallback = passport.authenticate('github', {
            successRedirect: '/profile',
            failureRedirect: '/login'
        });

    this
        .googleRoute = passport.authenticate('google', {
            scope: ['profile']
        });

    this
        .googleCallback = passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/login'
        });

    this
        .twitterRoute = passport.authenticate('twitter');

    this
        .twitterCallback = passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/login'
        });

    this
        .facebookRoute = passport.authenticate('facebook');

    this
        .facebookCallback = passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/login'
        });

    this.unlinkGithub = function(req, res) {
        var currentUser = req.user;
        currentUser.tokens.github = undefined;
        currentUser.save(function(err, doc) {
            if (err) throw err;
            res.redirect("/profile");
        });
    };

    this.unlinkGoogle = function(req, res) {
        var currentUser = req.user;
        currentUser.tokens.google = undefined;
        currentUser.save(function(err) {
            if (err) throw err;
            res.redirect("/profile");
        });
    };

    this.unlinkTwitter = function(req, res) {
        var currentUser = req.user;
        currentUser.tokens.twitter = undefined;
        currentUser.save(function(err) {
            if (err) throw err;
            res.redirect("/profile");
        });
    };

    this.unlinkFacebook = function(req, res) {
        var currentUser = req.user;
        currentUser.tokens.facebook = undefined;
        currentUser.save(function(err) {
            if (err) throw err;
            res.redirect("/profile");
        });
    };
    this.deleteAccount = function(req, res) {
        User
            .findByIdAndRemove({
                '_id': req.user._id
            })
            .exec(function(err, doc) {
                if (err) throw err;
                res.redirect('/index');
            });
    };
    this.userPage = function(req, res) {
        User
            .findOne(req.user._id)
            .populate('images')
            .exec(function(err, doc) {
                if (err) throw err;
                res.json(doc)
            })
    };
    this.uploadPage = function(req, res) {
        res.render('upload', {
            user: req.user
        })
    }

    this.uploadImage = function(req, res) {

        if (req.user.images.length >= 10) return res.json({'error': 'You have too many images. (Limit: 10)'})

        if (!req.body.title) return res.json({'error': 'please submit a title.'});

        if (req.body.title > 30 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return res.json({'error': 'Invalid title. (max length 30 characters, no double spacing or double special characters e.g.(!@#$%))'});

        var file = req.file.path;

        fs.readFile(file, function(err, data) {
            if (err) return userError({'error': err.message}, file);

            var checkBody = data.toString('hex', 0, 4);
            var imageTypes = ['ffd8ffe0', '89504e47', '47494638', 'ffd8ffdb', 'ffd8ffe1'];

            if (imageTypes.indexOf(checkBody) === -1) return userError({error: 'invalid file type'}, file);
            
            AWSRequest(file,'PUT', req.file.filename)
            .then(function(newImageUrl) {

                var image = new Images({
                imageTitle: req.body.title,
                localImagePath: newImageUrl,
                imageName: req.file.filename,
                shares: 0,
                creator: req.user._id
            });

                fs.unlink(file, function(err) {
                 if (err) console.error(err);
                 });

            image.save().then(function(doc) {
                User
                    .update({
                        '_id': req.user._id
                    }, {
                        $push: {
                            'images': doc._id
                        }
                    })
                    .exec(function(err){
                        if (err) throw err;
                        return res.status(200).json({'completed': 'image uploaded'});
                    });

            }).catch(function(reason) {
            console.log('error in saving, reason: ' + reason);
            });
            
        }).catch(function(reason) {
                return userError({
                    'error': 'error in saving image, reason: ' + reason
                }, file);
    });

            
});


    };
    this.convertImage = function(req, res) {

        if (req.user.images.length >= 10) return res.json({
            'error': 'You have too many images.(Limit: 10)'
        });

        if (!req.body.title || req.body.title.length > 30 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return res.json({
            error: 'Invalid title.'
        });

        if (!req.body.uploadHotlink) return res.json({
            "error": 'Please submit an image link.'
        });

        if (!/^(?=http:\/\/)|^(?=https:\/\/)/g.test(req.body.uploadHotlink)) {
            return res.json({
                error: 'Please enter a URL method (http or https)'
            });
        }

            var convert = new FormData();
            convert.append('image', request(req.body.uploadHotlink));
            convert.submit(process.env.APP_URL + 'makeMulterFilename', function(err, response) {
                if (err) return userError({'error': 'error in upload, reason: ' + err});
                var json = '';
                response.on('data', function(data) {
                    json += data;
                });
                response.on('end', function(){
                 json = JSON.parse(json);

            AWSRequest(json.path,'PUT', json.filename)
            .then(function(newImageUrl) {

                var image = new Images({
                imageTitle: req.body.title,
                localImagePath: newImageUrl,
                imageName: json.filename,
                shares: 0,
                creator: req.user._id
            });

                fs.unlink(json.path, function(err) {
                 if (err) console.error(err);
                 });

            image.save().then(function(doc) {

                    User
                    .update({
                        '_id': req.user._id
                    }, {
                        $push: {
                            'images': doc._id
                        }
                    })
                    .exec(function(err){
                        if (err) throw err;
                        return res.status(200).json({'completed': 'image uploaded'});
                    });

                       }).catch(function(reason){
                           return res.json({'error': 'error in saving image: '+ reason})
                       });

                 }).catch(function(reason){
                    return res.json({'error': 'error in submitting image to aws, reason: '+ reason})
                });
             });
        });

    };

    this.makeMulterFilename = function(req, res) {
        res.json(req.file);
    }


    this.likeThis = function(req, res) {
        User
            .findOne({
                '_id': req.user._id
            })
            .then(function(doc) {
                if (doc.likes.indexOf(req.params.image) !== -1) {
                    User
                        .update({
                            '_id': req.user._id
                        }, {
                            $pull: {
                                'likes': req.params.image
                            }
                        })
                        .then(function() {
                            Images
                                .findOneAndUpdate({
                                    "_id": req.params.image
                                }, {
                                    $pull: {
                                        'likes': req.user._id
                                    }
                                }, {
                                    new: true
                                })
                                .exec(function(err, doc) {
                                    if (err) throw err;
                                    return res.json({
                                        likes: doc.likes.length
                                    });
                                });
                        }).catch(function(reason) {
                            console.error("error in updating user, reason: " + reason);
                        });

                } else {

                    User
                        .update({
                            '_id': req.user._id
                        }, {
                            $push: {
                                'likes': req.params.image
                            }
                        })
                        .then(function() {
                            Images
                                .findOneAndUpdate({
                                    "_id": req.params.image
                                }, {
                                    $push: {
                                        'likes': req.user._id
                                    }
                                }, {
                                    new: true
                                })
                                .exec(function(err, doc) {
                                    if (err) throw err;
                                    return res.json({
                                        likes: doc.likes.length
                                    });
                                });
                        }).catch(function(reason) {
                            console.error("error in updating user, reason: " + reason);
                        });

                }

            }).catch(function(reason) {
                console.error("error in finding user, reason: " + reason);
            });

    };

    this.shareThis = function(req, res) {
        User
            .findOne({
                '_id': req.user._id
            })
            .then(function(doc) {
                if (doc.images.length >= 10) return res.json({
                    'error': 'You have too many images. (Limit: 10)'
                });
                if (doc.images.indexOf(req.params.image) !== -1) return res.json({
                    'error': 'You cannot repost your own image!'
                });
                if (doc.reshares.indexOf(req.params.image) !== -1) return res.json({
                    'error': 'You have already have an active repost of that image!'
                });
                Images
                    .findOne({
                        '_id': req.params.image
                    })
                    .populate('creator', 'localUsername')
                    .then(function(image) {
                        if (image.original && doc.reshares.indexOf(image.original.toString()) !== -1) return res.json({
                            'error': 'You have already reshared that image!'
                        });
                        Images
                            .update({'_id': image._id}, {$inc: {'shares': 1}, $push: {'sharedBy': doc._id}})
                            .then(function() {

                                        var newImage = new Images({
                                            imageTitle: image.imageTitle,
                                            localImagePath: image.localImagePath,
                                            shares: 0,
                                            original: image.original || image._id,
                                            originalUsername: image.creator.localUsername,
                                            creator: doc._id
                                        });

                                        newImage.save().then(function(resharedImage) {
                                            User
                                                .update({
                                                    '_id': req.user._id
                                                }, {
                                                    $push: {
                                                        'images': resharedImage._id,
                                                        'reshares': resharedImage.original
                                                    }
                                                })
                                                .exec(function(err) {
                                                    if (err) throw err;
                                                    return res.json({'newId': resharedImage._id});
                                                });

                                        }).catch(function(reason) {
                                            console.error('error in saving image, reason: ' + reason);
                                        });
                            }).catch(function(reason) {
                                console.error("error in updating image, reason: " + reason);
                            });

                    }).catch(function(reason) {
                        console.error("error in finding image, reason: " + reason);
                    });


            }).catch(function(reason) {
                console.error("error in finding user, reason: " + reason);
            });
    };

    this.getImages = function(req, res) {

    	if (req.params.image) {
    		Images
            .findOne({'_id': req.params.image})
            .populate('creator', 'localUsername')
            .exec(function(err, doc) {
            	if (!doc) return res.json({'error': "No images found with that identifier"});
                if (err) throw err;
                res.json([doc]);
            });
    	} else {

        Images
            .find({"original": {"$exists" : false }})
            .populate('creator', 'localUsername')
            .exec(function(err, doc) {
                if (err) throw err;
                res.json(doc);
            });
        }
    };
    this.checkUsername = function(req, res){
    	if (!req.isAuthenticated()) return res.json({'error': 'you must be logged in to do that.'});

    	if (!req.params.username) {
			return res.json({'error': 'please enter a username'});
		}

		if (/\W/.test(req.params.username) || req.params.username.length > 20) {
			return res.json({'error': 'please enter a valid username'})
		}

		User
		.find({'localUsername' : req.params.username})
		.then(function(doc) {
			if (doc.length) {
				return res.json({'error': 'that username is already taken'});
			}

			User
			.update({'_id': req.user._id}, {'localUsername': req.params.username})
			.exec(function(err, result) {
					if (err) throw err;
					return res.json({'success': req.params.username});

			});


		}).catch(function(reject){
			console.log('error in finding username thenable, reason: ' + reject);
		})


	};


    this.renderUsername = function(req, res){
    	if (req.isAuthenticated()) return res.render('username', {user: req.user});
    	return res.redirect('/login');
    }
    this.getUsernameImages = function(req, res){
    	if (!req.params.user) return res.json({'error': "That user does not exist"})

    	User
    		.findOne({'localUsername': req.params.user})
    		.populate({path:'images',
    			populate:{path: 'creator', select: 'localUsername'}})
    		.exec(function(err, doc){
    			if (err) throw err;
    			return res.json(doc.images);
    		});
    }

    this.deleteImage = function(req, res){

    	Images
    		.findOne({'_id': req.params.image})
    		.then(function(image){
    			if (!image) return res.json ({error: 'Image not found. May have alredy been deleted.'})
    				if (!image.original) {
    					Images.find({'original': image._id}, {'_id': 1, 'localImagePath': 1})
    					.then(function(shared){
    						var idArr = [];

    						for (var i = 0, l = shared.length; i < l; i++){
    							idArr[i] = shared[i]._id;
    						}

                            AWSRequest(null,'DELETE', image.imageName)
                                    .then(function(resolve) {

                            User
                            .updateMany({'images': {$in: idArr}}, {$pull: {'images': {$in: idArr}, 'reshares': image._id}})
                            .then(function(){
                                User
                                .update({'_id': req.user._id}, {$pull: {'images': image._id}})
                                .then(function() {
                                    Images
                                        .deleteMany({'original': image._id})
                                        .then(function() {
                                            Images
                                                .remove({'_id': image._id}, function(err){
                                                if (err) return res.json({error: 'Error in removing image'});
                                                res.status(200).json({'completed': resolve});
                                            });

                                        })
                                    })
                            })

                    }, function (reject){
                         console.log('failure to delete image. Reason:' + reject);
                    });

                }).catch(function(reason){
                return res.json({error: 'Error in deleting image, reason: ' + reason});
            });
    				} else {

    			User
    			.update({'_id': req.user._id}, {$pull: {'images': image._id, 'reshares': image.original}})
    			.then(function(){
    				Images
    					.remove({'_id': image._id}, function(err){
    						if (err) return res.json({error: 'Error in removing image'});
    						res.status(200).json({'completed': ""});
    					});
    				
    		});

        }
    }).catch(function(reason){
                return res.json({error: 'Error in deleting image, reason: ' + reason});
            });

    }

    this.recentLikes = function(req, res) {
    	Images
    		.findOne({'_id': req.params.image})
    		.populate('likes', 'localUsername')
    		.exec(function(err, doc){
    			if (err) console.error(err) 
    				res.json({'likes': doc.likes})
    		});
    }

    this.recentShares = function(req, res) {
    	Images
    		.findOne({'_id': req.params.image})
    		.populate('sharedBy', 'localUsername')
    		.exec(function(err, doc){
    			if (err) console.error(err) 
    				res.json({'shares': doc.sharedBy})
    		});
    }


}
module.exports = server;
