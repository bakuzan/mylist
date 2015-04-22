'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var mangaitems = require('../../app/controllers/mangaitems.server.controller');

	// Mangaitems Routes
	app.route('/mangaitems')
		.get(mangaitems.list)
		.post(users.requiresLogin, mangaitems.create);

	app.route('/mangaitems/:mangaitemId')
		.get(mangaitems.read)
		.put(users.requiresLogin, mangaitems.hasAuthorization, mangaitems.update)
		.delete(users.requiresLogin, mangaitems.hasAuthorization, mangaitems.delete);

	// Finish by binding the Mangaitem middleware
	app.param('mangaitemId', mangaitems.mangaitemByID);
    
    //image upload route
    app.route('/fileUpload')
        .post(mangaitems.postImage);
};
