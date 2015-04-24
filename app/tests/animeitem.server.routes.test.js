'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Animeitem = mongoose.model('Animeitem'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, animeitem;

/**
 * Animeitem routes tests
 */
describe('Animeitem CRUD tests', function() {
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

		// Save a user to the test db and create new Animeitem
		user.save(function() {
			animeitem = {
				name: 'Animeitem Name'
			};

			done();
		});
	});

	it('should be able to save Animeitem instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Animeitem
				agent.post('/animeitems')
					.send(animeitem)
					.expect(200)
					.end(function(animeitemSaveErr, animeitemSaveRes) {
						// Handle Animeitem save error
						if (animeitemSaveErr) done(animeitemSaveErr);

						// Get a list of Animeitems
						agent.get('/animeitems')
							.end(function(animeitemsGetErr, animeitemsGetRes) {
								// Handle Animeitem save error
								if (animeitemsGetErr) done(animeitemsGetErr);

								// Get Animeitems list
								var animeitems = animeitemsGetRes.body;

								// Set assertions
								(animeitems[0].user._id).should.equal(userId);
								(animeitems[0].name).should.match('Animeitem Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Animeitem instance if not logged in', function(done) {
		agent.post('/animeitems')
			.send(animeitem)
			.expect(401)
			.end(function(animeitemSaveErr, animeitemSaveRes) {
				// Call the assertion callback
				done(animeitemSaveErr);
			});
	});

	it('should not be able to save Animeitem instance if no name is provided', function(done) {
		// Invalidate name field
		animeitem.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Animeitem
				agent.post('/animeitems')
					.send(animeitem)
					.expect(400)
					.end(function(animeitemSaveErr, animeitemSaveRes) {
						// Set message assertion
						(animeitemSaveRes.body.message).should.match('Please fill Animeitem name');
						
						// Handle Animeitem save error
						done(animeitemSaveErr);
					});
			});
	});

	it('should be able to update Animeitem instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Animeitem
				agent.post('/animeitems')
					.send(animeitem)
					.expect(200)
					.end(function(animeitemSaveErr, animeitemSaveRes) {
						// Handle Animeitem save error
						if (animeitemSaveErr) done(animeitemSaveErr);

						// Update Animeitem name
						animeitem.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Animeitem
						agent.put('/animeitems/' + animeitemSaveRes.body._id)
							.send(animeitem)
							.expect(200)
							.end(function(animeitemUpdateErr, animeitemUpdateRes) {
								// Handle Animeitem update error
								if (animeitemUpdateErr) done(animeitemUpdateErr);

								// Set assertions
								(animeitemUpdateRes.body._id).should.equal(animeitemSaveRes.body._id);
								(animeitemUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Animeitems if not signed in', function(done) {
		// Create new Animeitem model instance
		var animeitemObj = new Animeitem(animeitem);

		// Save the Animeitem
		animeitemObj.save(function() {
			// Request Animeitems
			request(app).get('/animeitems')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Animeitem if not signed in', function(done) {
		// Create new Animeitem model instance
		var animeitemObj = new Animeitem(animeitem);

		// Save the Animeitem
		animeitemObj.save(function() {
			request(app).get('/animeitems/' + animeitemObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', animeitem.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Animeitem instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Animeitem
				agent.post('/animeitems')
					.send(animeitem)
					.expect(200)
					.end(function(animeitemSaveErr, animeitemSaveRes) {
						// Handle Animeitem save error
						if (animeitemSaveErr) done(animeitemSaveErr);

						// Delete existing Animeitem
						agent.delete('/animeitems/' + animeitemSaveRes.body._id)
							.send(animeitem)
							.expect(200)
							.end(function(animeitemDeleteErr, animeitemDeleteRes) {
								// Handle Animeitem error error
								if (animeitemDeleteErr) done(animeitemDeleteErr);

								// Set assertions
								(animeitemDeleteRes.body._id).should.equal(animeitemSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Animeitem instance if not signed in', function(done) {
		// Set Animeitem user 
		animeitem.user = user;

		// Create new Animeitem model instance
		var animeitemObj = new Animeitem(animeitem);

		// Save the Animeitem
		animeitemObj.save(function() {
			// Try deleting Animeitem
			request(app).delete('/animeitems/' + animeitemObj._id)
			.expect(401)
			.end(function(animeitemDeleteErr, animeitemDeleteRes) {
				// Set message assertion
				(animeitemDeleteRes.body.message).should.match('User is not logged in');

				// Handle Animeitem error error
				done(animeitemDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Animeitem.remove().exec();
		done();
	});
});