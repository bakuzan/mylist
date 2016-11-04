'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var mal = require('../../app/controllers/mal.server.controller');

	// MAL Routes
	app.route('/malSearch/:type')
		.get(mal.search);
};
