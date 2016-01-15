'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Topten = mongoose.model('Topten'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, topten;

/**
 * Topten routes tests
 */
describe('Topten CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Topten
		user.save(function() {
			topten = {
				name: 'Topten Name'
			};

			done();
		});
	});

	it('should be able to save Topten instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Topten
				agent.post('/toptens')
					.send(topten)
					.expect(200)
					.end(function(toptenSaveErr, toptenSaveRes) {
						// Handle Topten save error
						if (toptenSaveErr) done(toptenSaveErr);

						// Get a list of Toptens
						agent.get('/toptens')
							.end(function(toptensGetErr, toptensGetRes) {
								// Handle Topten save error
								if (toptensGetErr) done(toptensGetErr);

								// Get Toptens list
								var toptens = toptensGetRes.body;

								// Set assertions
								(toptens[0].user._id).should.equal(userId);
								(toptens[0].name).should.match('Topten Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Topten instance if not logged in', function(done) {
		agent.post('/toptens')
			.send(topten)
			.expect(401)
			.end(function(toptenSaveErr, toptenSaveRes) {
				// Call the assertion callback
				done(toptenSaveErr);
			});
	});

	it('should not be able to save Topten instance if no name is provided', function(done) {
		// Invalidate name field
		topten.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Topten
				agent.post('/toptens')
					.send(topten)
					.expect(400)
					.end(function(toptenSaveErr, toptenSaveRes) {
						// Set message assertion
						(toptenSaveRes.body.message).should.match('Please fill Topten name');
						
						// Handle Topten save error
						done(toptenSaveErr);
					});
			});
	});

	it('should be able to update Topten instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Topten
				agent.post('/toptens')
					.send(topten)
					.expect(200)
					.end(function(toptenSaveErr, toptenSaveRes) {
						// Handle Topten save error
						if (toptenSaveErr) done(toptenSaveErr);

						// Update Topten name
						topten.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Topten
						agent.put('/toptens/' + toptenSaveRes.body._id)
							.send(topten)
							.expect(200)
							.end(function(toptenUpdateErr, toptenUpdateRes) {
								// Handle Topten update error
								if (toptenUpdateErr) done(toptenUpdateErr);

								// Set assertions
								(toptenUpdateRes.body._id).should.equal(toptenSaveRes.body._id);
								(toptenUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Toptens if not signed in', function(done) {
		// Create new Topten model instance
		var toptenObj = new Topten(topten);

		// Save the Topten
		toptenObj.save(function() {
			// Request Toptens
			request(app).get('/toptens')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Topten if not signed in', function(done) {
		// Create new Topten model instance
		var toptenObj = new Topten(topten);

		// Save the Topten
		toptenObj.save(function() {
			request(app).get('/toptens/' + toptenObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', topten.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Topten instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Topten
				agent.post('/toptens')
					.send(topten)
					.expect(200)
					.end(function(toptenSaveErr, toptenSaveRes) {
						// Handle Topten save error
						if (toptenSaveErr) done(toptenSaveErr);

						// Delete existing Topten
						agent.delete('/toptens/' + toptenSaveRes.body._id)
							.send(topten)
							.expect(200)
							.end(function(toptenDeleteErr, toptenDeleteRes) {
								// Handle Topten error error
								if (toptenDeleteErr) done(toptenDeleteErr);

								// Set assertions
								(toptenDeleteRes.body._id).should.equal(toptenSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Topten instance if not signed in', function(done) {
		// Set Topten user 
		topten.user = user;

		// Create new Topten model instance
		var toptenObj = new Topten(topten);

		// Save the Topten
		toptenObj.save(function() {
			// Try deleting Topten
			request(app).delete('/toptens/' + toptenObj._id)
			.expect(401)
			.end(function(toptenDeleteErr, toptenDeleteRes) {
				// Set message assertion
				(toptenDeleteRes.body.message).should.match('User is not logged in');

				// Handle Topten error error
				done(toptenDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Topten.remove().exec();
		done();
	});
});