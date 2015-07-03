'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Animeitem = mongoose.model('Animeitem'),
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
        var destPath = 'public/modules/animeitems/img/' + filename;
        
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
 * Create a Animeitem
 */
exports.create = function(req, res) {
	var animeitem = new Animeitem(req.body);
	animeitem.user = req.user;

	animeitem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(animeitem);
		}
	});
};

/**
 * Show the current Animeitem
 */
exports.read = function(req, res) {
	res.jsonp(req.animeitem);
};

/**
 * Update a Animeitem
 */
exports.update = function(req, res) {
	var animeitem = req.animeitem ;
    
	animeitem = _.extend(animeitem , req.body);
    animeitem.meta.updated = Date.now();

	animeitem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(animeitem);
		}
	});
};

/**
 * Delete an Animeitem
 */
exports.delete = function(req, res) {
	var animeitem = req.animeitem ;

	animeitem.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(animeitem);
		}
	});
};

/**
 * List of Animeitems
 */
exports.list = function(req, res) { 
	Animeitem.find().sort('-created').populate('user', 'displayName').populate('manga', 'title').exec(function(err, animeitems) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(animeitems);
		}
	});
};

/**
 * Animeitem middleware
 */
exports.animeitemByID = function(req, res, next, id) { 
	Animeitem.findById(id).populate('user', 'displayName').populate('manga', 'title').exec(function(err, animeitem) {
		if (err) return next(err);
		if (! animeitem) return next(new Error('Failed to load Animeitem ' + id));
		req.animeitem = animeitem ;
		next();
	});
};

/**
 * Animeitem authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.animeitem.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
