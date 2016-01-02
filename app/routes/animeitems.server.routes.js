'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var animeitems = require('../../app/controllers/animeitems.server.controller');

	// Animeitems Routes
	app.route('/animeitems')
		.get(animeitems.list)
		.post(users.requiresLogin, animeitems.create);
    
//    app.route('/animeitems/list/:status')
//		.get(animeitems.list);

	app.route('/animeitems/:animeitemId')
		.get(animeitems.read)
		.put(users.requiresLogin, animeitems.hasAuthorization, animeitems.update)
		.delete(users.requiresLogin, animeitems.hasAuthorization, animeitems.delete);

	// Finish by binding the Animeitem middleware
	app.param('animeitemId', animeitems.animeitemByID);
    
        //image upload route
    app.route('/fileUploadAnime')
        .post(animeitems.postImage);
};
