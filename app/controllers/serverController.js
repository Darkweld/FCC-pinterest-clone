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

        if (req.user.images.length > 10) return res.json({
            'error': 'You have too many images.'
        });

        if (req.body.title.length > 20 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return res.json({
            error: 'Invalid title.'
        });


        fs.readFile(req.file.path, function(err, data) {
            if (err) throw (err);

            var checkBody = data.toString('hex', 0, 4);
            var imageTypes = ['ffd8ffe0', '89504e47', '47494638', 'ffd8ffdb', 'ffd8ffe1'];

            if (imageTypes.indexOf(checkBody) === -1) return res.json({
                error: 'invalid file type'
            });

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
                res.json({
                    'error': 'error in saving image, reason: ' + reason
                });
            });
        });



    };
    this.convertImage = function(req, res) {



        if (req.user.images.length > 10) return res.json({
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
                if (err) throw err;
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
                                if (err) throw err;
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
                if (doc.images.length > 10) return res.json({
                    'error': 'You have too many images. (Limit: 10)'
                });
                //if (doc.images.indexOf(req.params.image) !== -1) return res.json({
                  //  'error': 'You cannot reshare your own image!'
              //  });
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
                            .update({
                                '_id': image._id
                            }, {
                                $inc: {
                                    'shares': 1
                                }
                            })
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
                                            creator: req.user._id
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
                                                    return res.json({newImage: [newImage], username: doc.localUsername, shares: (image.shares + 1)});
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
        Images
            .find({})
            .populate('creator', 'localUsername')
            .exec(function(err, doc) {
                if (err) throw err;
                res.json(doc);
            });
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

}
module.exports = server;
