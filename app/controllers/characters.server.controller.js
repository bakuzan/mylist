'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Character = mongoose.model('Character'),
    //uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    fs = require('fs'),
	_ = require('lodash');

/**
 * Upload image.
 */
exports.postImage = function(req, res) {
    var form = new multiparty.Form();
    //console.log(req);
    form.parse(req, function(err, fields, files) {
        var file = files.file[0];
//        console.log(file);
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        
        //uuid for unique filenames.
        //var filename = uuid.v4() + extension;
        var filename = file.originalFilename;
        var destPath = 'c:/users/steven/documents/whispering-lowlands-3953/public/modules/characters/img/' + filename;
        
        //server-side file type check.
        if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
            fs.unlink(tmpPath);
            return res.status(400).send('File type not supported.');
        }
        
        fs.rename(tmpPath, destPath, function(err) {
            if (err) {
                return res.status(400).send('Image not saved.');
            }
//            console.log(destPath);
            return res.json(destPath);
        });
    });
};


/**
 * Create a Character
 */
exports.create = function(req, res) {
	var character = new Character(req.body);
	character.user = req.user;
    
//    console.log(character);
	character.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(character);
		}
	});
};

/**
 * Show the current Character
 */
exports.read = function(req, res) {
	res.jsonp(req.character);
};

/**
 * Update a Character
 */
exports.update = function(req, res) {
	var character = req.character ;

	character = _.extend(character , req.body);
    
//    console.log(character);
	character.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(character);
		}
	});
};

/**
 * Delete an Character
 */
exports.delete = function(req, res) {
	var character = req.character ;

	character.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(character);
		}
	});
};

/**
 * List of Characters
 */
exports.list = function(req, res) { 
	Character.find().sort('-created').populate('user', 'displayName').populate('anime', 'title').populate('manga', 'title').exec(function(err, characters) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(characters);
		}
	});
};

/**
 * Character middleware
 */
exports.characterByID = function(req, res, next, id) { 
	Character.findById(id).populate('user', 'displayName').populate('anime', 'title').populate('manga', 'title').exec(function(err, character) {
		if (err) return next(err);
		if (! character) return next(new Error('Failed to load Character ' + id));
		req.character = character ;
		next();
	});
};

/**
 * Character authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.character.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
