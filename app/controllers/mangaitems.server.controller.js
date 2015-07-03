'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Mangaitem = mongoose.model('Mangaitem'),
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
        var destPath = 'public/modules/mangaitems/img/' + filename;
        
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
 * Create a Mangaitem
 */
exports.create = function(req, res) {
	var mangaitem = new Mangaitem(req.body);
	mangaitem.user = req.user;

	mangaitem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitem);
		}
	});
};

/**
 * Show the current Mangaitem
 */
exports.read = function(req, res) {
	res.jsonp(req.mangaitem);
};

/**
 * Update a Mangaitem
 */
exports.update = function(req, res) {
	var mangaitem = req.mangaitem ;

	mangaitem = _.extend(mangaitem , req.body);
    mangaitem.meta.updated = Date.now();

	mangaitem.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitem);
		}
	});
};

/**
 * Delete an Mangaitem
 */
exports.delete = function(req, res) {
	var mangaitem = req.mangaitem ;

	mangaitem.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitem);
		}
	});
};

/**
 * List of Mangaitems
 */
exports.list = function(req, res) { 
	Mangaitem.find().sort('-created').populate('user', 'displayName').populate('anime', 'title').exec(function(err, mangaitems) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mangaitems);
		}
	});
};

/**
 * Mangaitem middleware
 */
exports.mangaitemByID = function(req, res, next, id) { 
	Mangaitem.findById(id).populate('user', 'displayName').populate('anime', 'title').exec(function(err, mangaitem) {
		if (err) return next(err);
		if (! mangaitem) return next(new Error('Failed to load Mangaitem ' + id));
		req.mangaitem = mangaitem ;
		next();
	});
};

/**
 * Mangaitem authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.mangaitem.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
