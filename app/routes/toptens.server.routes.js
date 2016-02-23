'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var toptens = require('../../app/controllers/toptens.server.controller');

	// Toptens Routes
	app.route('/toptens')
		.get(toptens.list)
		.post(users.requiresLogin, toptens.create);

	app.route('/toptens/:toptenId')
		.get(toptens.read)
		.put(users.requiresLogin, toptens.hasAuthorization, toptens.update)
		.delete(users.requiresLogin, toptens.hasAuthorization, toptens.delete);

	// Finish by binding the Topten middleware
	app.param('toptenId', toptens.toptenByID);
};
