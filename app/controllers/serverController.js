'use strict';

var User = require('../models/user');
var Images = require('../models/images');
var request = require('request');
var FormData = require('form-data');
var fs = require('fs');

function server(passport) {
    this
        .checkTokens = function(req, res) {
            console.log(req.user);
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

    	function userError (message) {
  		 res.json(message);
  		 console.log
  		 fs.unlink(req.file.path, function(err) {
  		 	if (err) console.error(err);
  		 });
		};

        if (req.user.images.length >= 10) return userError({'error': 'You have too many images. (Limit: 10)'})

        if (req.body.title.length > 30 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return userError({'error': 'Invalid title. (max length 30 characters, no double spacing or double special characters e.g.(!@#$%))'});


        fs.readFile(req.file.path, function(err, data) {
            if (err) return userError({'errorName': err.name, 'errorMessage': err.message});

            var checkBody = data.toString('hex', 0, 4);
            var imageTypes = ['ffd8ffe0', '89504e47', '47494638', 'ffd8ffdb', 'ffd8ffe1'];

            if (imageTypes.indexOf(checkBody) === -1) return userError({error: 'invalid file type'});

            var image = new Images({
                imageTitle: req.body.title,
                localImagePath: req.file.path,
                shares: 0,
                creator: req.user._id
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
                    .exec(function(err) {
                        if (err) throw err;
                        return res.json({
                            title: doc.imageTitle,
                            localImagePath: doc.localImagePath
                        });
                    });

            }).catch(function(reason) {
                userError({
                    'error': 'error in saving image, reason: ' + reason
                });
            });
        });



    };
    this.convertImage = function(req, res) {



        if (req.user.images.length >= 10) return res.json({
            'error': 'You have too many images.(Limit: 10)'
        });

        if (!req.body.title || req.body.title.length > 20 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return res.json({
            error: 'Invalid title.'
        });

        if (!req.body.uploadHotlink) return res.json({
            "error": 'Please submit an image.'
        });

        if (!/^(?=http:\/\/)|^(?=https:\/\/)/g.test(req.body.uploadHotlink)) {
            return res.json({
                error: 'Please enter a URL method (http or https)'
            });
        }

        var convert = new FormData();

        request.get(req.body.uploadHotlink, {
            timeout: 1500,
            encoding: null
        }, function(err, response, body) {
            if (err) return res.json({
                error: 'Bad URL / Request or response timout from image server' + err.code
            });

            var checkBody = body.toString('hex', 0, 4);
            var imageTypes = ['ffd8ffe0', '89504e47', '47494638', 'ffd8ffdb', 'ffd8ffe1'];

            if (imageTypes.indexOf(checkBody) === -1) {
                return res.json({
                    error: 'invalid file type'
                });
            }

            convert.append('uploadImage', request(req.body.uploadHotlink));
            convert.submit('http://localhost:3000/uploadImage', function(err, result) {
                if (err) console.error(error);
                var obj = '';
                result.on('data', function(data) {
                    obj += data;
                });
                result.on('end', function() {
                    obj = JSON.parse(obj);

                    var image = new Images({
                        imageTitle: req.body.title,
                        localImagePath: obj.path,
                        shares: 0,
                        creator: req.user._id
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
                            .exec(function(err) {
                                if (err) console.error(err);
                                return res.json({
                                    title: doc.imageTitle,
                                    localImagePath: doc.localImagePath
                                });
                            });

                    }).catch(function(reason) {
                        return res.json({
                            'error': 'error in saving image, reason: ' + reason
                        });
                    });
                });
            });
        });

    };

    this.uploadHotlink = function(req, res) {
        res.json(req.file);
    };

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
                    'error': 'You cannot reshare your own image!'
                });
                if (doc.reshares.indexOf(req.params.image) !== -1) return res.json({
                    'error': 'You have already reshared that image!'
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
                                var formdata = new FormData();
                                formdata.append('uploadImage', fs.createReadStream(image.localImagePath));
                                formdata.submit('http://localhost:3000/uploadImage', function(err, result) {
                                    if (err) throw err;

                                    var obj = '';
                                    result.on('data', function(data) {
                                        obj += data;
                                    });
                                    result.on('end', function() {
                                        obj = JSON.parse(obj);

                                        var newImage = new Images({
                                            imageTitle: image.imageTitle,
                                            localImagePath: obj.path,
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
                                    });
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
            .find({})
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

    	function deleteFiles(array, callback){
    		if (array.length === 0) return callback();
    		var pop = array.pop();
    		fs.unlink(pop, function(err){
    			if (err)  {
    				callback(err);
    			} else {
    			 deleteFiles(array, callback);
    			}
    		});

    	};

    	Images
    		.findOne({'_id': req.params.image})
    		.then(function(image){
    			if (!image) return res.json ({error: 'Image not found. May have alredy been deleted.'})
    				if (!image.original) {
    					Images.find({'original': image._id}, {'_id': 1, 'localImagePath': 1})
    					.then(function(shared){
    						var idArr = [];
    						var unlinkArr = [];

    						for (var i = 0, l = shared.length; i < l; i++){
    							idArr[i] = shared[i]._id;
    							unlinkArr[i] = shared[i].localImagePath;
    						}

    						unlinkArr.push(image.localImagePath);

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
    											res.status(200).json({'completed': ""});
    											
    											deleteFiles(unlinkArr, function(err){
    												if (err) return console.error(err);
    												console.log("Images Deleted.");
    											});

    										});

    									})
    								})
    						})
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
    						fs.unlink(image.localImagePath, function(err){
    							if (err) console.log('error in fs.unlink');
    							});
    						});
    					}).catch(function(reason){
    						return res.json({error: 'Error in deleting image, reason: ' + reason});
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
    		.populate('shares' , 'localUsername')
    		.exec(function(err, doc){
    			if (err) console.error(err) 
    				res.json({'shares': doc.shares})
    		});
    }


}
module.exports = server;
