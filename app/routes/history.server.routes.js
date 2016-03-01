'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller'),
        animeitems = require('../../app/controllers/animeitems.server.controller'),
        mangaitems = require('../../app/controllers/mangaitems.server.controller');

	app.route('/history/anime/:latest')
		.get(animeitems.history);
    
    app.route('/history/manga/:latest')
		.get(mangaitems.history);
};
