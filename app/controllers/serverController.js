'use strict';

var User = require('../models/user');
var Images = require('../models/images');
var request = require('request');
var FormData = require('form-data');
var fs = require('fs');

function server (passport) {
	this
		.checkTokens = function(req, res){
			var obj = (req.user).toObject();
		if	(obj.tokens) return res.render('profile', { user: req.user });
		req.logout();
		return res.redirect('/login');
		};
    this
        .githubRoute = passport.authenticate('github');
    
    this
        .githubCallback = passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .googleRoute = passport.authenticate('google', { scope: ['profile'] });
	    
	this
	    .googleCallback = passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .twitterRoute = passport.authenticate('twitter');
	    
	this
	    .twitterCallback = passport.authenticate('twitter', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .facebookRoute = passport.authenticate('facebook');
	    
	this
	    .facebookCallback = passport.authenticate('facebook', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this.unlinkGithub = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.github = undefined;
			currentUser.save(function(err,doc){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkGoogle = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.google = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkTwitter = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.twitter = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkFacebook = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.facebook = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	this.deleteAccount = function(req, res) {
		User
			.findByIdAndRemove({'_id': req.user._id})
			.exec(function(err, doc){
				if (err) throw err;
				res.redirect('/index');
			});
	};
	this.userPage = function(req, res) {
		User
			.findOne(req.user._id)
			.exec(function(err, doc){
				if (err) throw err;
						res.json(doc)
			})
	}; 
	this.uploadPage = function(req, res){
		res.render('upload', {user: req.user})
	}

	this.uploadImage = function(req, res){

		if (req.user.images.length > 10) return res.json({'error': 'You have too many images.'});

		if (req.body.title.length > 20 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return res.json({error: 'Invalid title.'});


		fs.readFile(req.file.path, function(err, data){
			if (err) throw (err);

			var checkBody = data.toString('hex',0,4);
			var imageTypes = ['ffd8ffe0', '89504e47', '47494638','ffd8ffdb','ffd8ffe1'];

			if (imageTypes.indexOf(checkBody) === -1) return res.json({error: 'invalid file type'});

			var image = new Images({
					imageTitle: req.body.title,
					localImagePath: req.file.path,
					shares: 0,
					creator: req.user._id
				});

				image.save().then(function(doc) {
						User
						.update({'_id':req.user._id}, {$push: {'images': doc._id}})
						.exec(function(err){
							if (err) throw err;
							return res.json({title: doc.imageTitle, localImagePath: doc.localImagePath});
						});

					}).catch(function(reason){
						res.json({'error': 'error in saving image, reason: ' + reason});
				});
		});

		
	
	};
	this.convertImage = function(req, res){

		if (req.user.images.length > 10) return res.json({'error': 'You have too many images.'});

		if (req.body.title.length > 20 || /[\W]{2,2}|^\s|\s$/g.test(req.body.title)) return res.json({error: 'Invalid title.'});

		if (!/^(?=http:\/\/)|^(?=https:\/\/)/g.test(req.body.uploadHotlink)) {
			return res.json({error: 'Please enter a URL method (http or https)'});
		}

		var convert = new FormData();

		request.get(req.body.uploadHotlink, {timeout: 1500, encoding: null}, function(err, response, body){
			if (err) return res.json({error: 'Bad URL / Request or response timout from image server' + err.code});
			
			var checkBody = body.toString('hex',0,4);
			var imageTypes = ['ffd8ffe0', '89504e47', '47494638','ffd8ffdb','ffd8ffe1'];

			if (imageTypes.indexOf(checkBody) === -1){
				return res.json({error: 'invalid file type'});
			}
			
			convert.append('uploadHotlink', request(req.body.uploadHotlink));
			convert.submit('http://localhost:3000/uploadHotlink', function(err, result) {
				if (err) throw err;
				var obj = '';
				result.on('data', function(data){
					obj += data;
				});
				result.on('end',function(){
					obj = JSON.parse(obj);

					var image = new Images({
						imageTitle: req.body.title,
						localImagePath: obj.path,
						shares: 0,
						creator: req.user._id
					});

					image.save().then(function(doc) {
							User
							.update({'_id':req.user._id}, {$push: {'images': doc._id}})
							.exec(function(err){
								if (err) throw err;
								return res.json({title: doc.imageTitle, localImagePath: doc.localImagePath});
							});

						}).catch(function(reason){
							return res.json({'error': 'error in saving image, reason: ' + reason});
					});
				});
			});
		});

	};

	this.uploadHotlink = function(req, res){
		res.json(req.file);
	};

}
module.exports = server;
