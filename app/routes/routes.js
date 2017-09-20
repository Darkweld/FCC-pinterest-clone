'use strict';

var path = process.cwd();
var Server = require(path + "/app/controllers/serverController.js");
var multer = require('multer');
var upload = multer({dest: './public/images/uploads', limits: {fileSize: 5242880, files: 1, parts: 2, headerPairs: 1}})
module.exports = function(app, passport) {
    
    
    function userLoggedIn (req, res, next) {
     if (req.isAuthenticated() && req.user.localUsername) return next();
     if (req.isAuthenticated()) return res.redirect('/username');
        return res.redirect('/login'); 
    }
    function userLoggedInAPI (req, res, next) {
     if (req.isAuthenticated() && req.user.localUsername) return next();
     if (req.isAuthenticated()) return res.json({error: 'You must be select a local username in to do that!'}); 
        return res.json({error: 'You must be logged in to do that!'}); 
    }
    var server = new Server(passport);
    
    app.route("/")
        .get(function(req, res) {
            res.render('index', { user: req.user });
        });
        
    app.route('/login')
        .get(function(req, res) {
            if (req.isAuthenticated()) { res.redirect('/profile'); } else { res.render('login'); }
        });
        
     app.route('/logout')
        .get(function(req, res) {
            req.logout();
            res.redirect('/');
        });
        
    app.route('/profile')
        .get(userLoggedIn, server.checkTokens);
        
    app.route('/auth/github')
        .get(server.githubRoute);
        
    app.route('/auth/github/callback')
    	.get(server.githubCallback);
	
	app.route('/auth/google')
        .get(server.googleRoute);
        
    app.route('/auth/google/callback')
    	.get(server.googleCallback);
	
	app.route('/auth/twitter')
        .get(server.twitterRoute);
        
    app.route('/auth/twitter/callback')
    	.get(server.twitterCallback);
	
	app.route('/auth/facebook')
        .get(server.facebookRoute);
        
    app.route('/auth/facebook/callback')
	    .get(server.facebookCallback);
	
	app.route('/unlink/github')
	    .get(userLoggedIn, server.unlinkGithub);
	
	app.route('/unlink/google')
	    .get(userLoggedIn, server.unlinkGoogle);
	    
	app.route('/unlink/twitter')
	    .get(userLoggedIn, server.unlinkTwitter);
	    
	app.route('/unlink/facebook')
	    .get(userLoggedIn, server.unlinkFacebook);
    
    app.route('/delete')
        .delete(userLoggedIn, server.deleteAccount);
    
    app.route('/getUser')
        .get(userLoggedIn, server.userPage);

    app.route('/upload')
    	.get(userLoggedIn, server.uploadPage);
    	.post(upload.none(),userLoggedInAPI, server.convertImage);
    
    app.route('/uploadLocal')
    	.post(upload.single('uploadLocal'), server.uploadImage);

    app.route('/makeMulterFilename')
        .post(upload.single('image'), server.makeMulterFilename);

    app.route(['/indexImages', '/indexImages/:image'])
    	.get(server.getImages);

    app.route('/like/:image')
    	.post(userLoggedInAPI, server.likeThis);

    app.route('/share/:image')
    	.post(userLoggedInAPI, server.shareThis);

    app.route(['/checkUsername', '/checkUsername/:username'])
    	.post(server.checkUsername)

    app.route('/username')
    	.get(server.renderUsername);

    app.route(['/getUsernameImages/', '/getUsernameImages/:user'])
    	.get(server.getUsernameImages);

    app.route('/deleteImage/:image')
    	.delete(userLoggedInAPI, server.deleteImage);

    app.route('/recentLikes/:image')
    	.get(server.recentLikes);

    app.route('/recentShares/:image')
    	.get(server.recentShares);
};