'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
		errorHandler = require('./errors.server.controller'),
		mal = require('./mal.server.controller'),
		Animeitem = mongoose.model('Animeitem'),
    //uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    fs = require('fs'),
		path = require('path'),
	_ = require('lodash'),
	baseUrl = process.env.VIDEO_URL; // 'C:/Users/steven.walsh/Documents/MISC/'

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
			mal.addToMal(animeitem);
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
    var current = [false], all = [true, false],
        status = (req.query.status === '0') ? current : all;

	Animeitem.find({ $or: [ { status: {$in: status } }, { reWatching: true } ] }).sort('-created').populate('user', 'displayName').populate('manga', 'title').exec(function(err, animeitems) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(animeitems);
		}
	});
};

//Get subdirectories
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

/**
 * Watchable anime
 */
exports.watch = function(req, res) {
	var watchable = [],
			directories = getDirectories(baseUrl); //Gets video directories.
	for(var i = 0, len = directories.length; i < len; i++) {
		var array = [],
				split = directories[i].split('-');
		for(var j = 0, count = split.length; j < count; j++) {
			array.push({ title: { $regex: split[j], $options: 'i' } }); //Check attribute(title), contains value(split[j]) which is case-insensitve(options: 'i')
		}
		watchable.push({ $and: array });
	}
	/** Document must contain all values from any one of the directories.
	 * e.g (title contains 'steins' AND 'gate') OR (title contains 'sidonia' AND 'no' AND 'kishi')
	 */
	Animeitem.find({ $or: watchable }).sort('-created').populate('user', 'displayName').populate('manga', 'title').exec(function(err, animeitems) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var i = animeitems.length, seriesName = '', index = 0;
			while(i--) {
				seriesName = animeitems[i].title.toLowerCase().replace(/[^a-z0-9+]+/gi, '-').replace(/\-$/, ''); // .replace(/\(.+?\)/g, '')
				index = directories.indexOf(seriesName);
				console.log('find: ', seriesName, directories, index);
				if(index === -1) {
					animeitems.splice(i, 1);
				}
			}
			res.jsonp(animeitems);
		}
	});
};

/**
 * History list of anime
 */
exports.history = function(req, res) {
    var latest = req.params.latest;

    Animeitem.find({ latest: { $gte: latest }}).sort('-created')
        .populate('user', 'displayName')
        .populate('manga', 'title')
        .exec(function(err, animeitems) {
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
		var seriesName = animeitem.title.toLowerCase().replace(/[^a-z0-9+]+/gi, '-').replace(/\-$/, ''), // .replace(/\(.+?\)/g, '')
				location = baseUrl + seriesName;
		fs.readdir(location, function (err, files) {
			animeitem.video.location = location + '/';
			animeitem.video.files = [];
			if(files) {
				for(var i = 0, len = files.length; i < len; i++) {
					var file = files[i],
							index = file.lastIndexOf('.'),
							number = file.substring(index - 3, index),
							iStr = Number(i + 1).toString();
					if(file.indexOf('.mp4') > -1) {
						animeitem.video.files.push({
							file: file,
							number: isNaN(number) ? ('000' + iStr).substring(iStr.length) : number
						});
					}
				}
			}
			req.animeitem = animeitem ;
			next();
		});

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
