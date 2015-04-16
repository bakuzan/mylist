'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Mangaitem = mongoose.model('Mangaitem'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, mangaitem;

/**
 * Mangaitem routes tests
 */
describe('Mangaitem CRUD tests', function() {
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

		// Save a user to the test db and create new Mangaitem
		user.save(function() {
			mangaitem = {
				name: 'Mangaitem Name'
			};

			done();
		});
	});

	it('should be able to save Mangaitem instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mangaitem
				agent.post('/mangaitems')
					.send(mangaitem)
					.expect(200)
					.end(function(mangaitemSaveErr, mangaitemSaveRes) {
						// Handle Mangaitem save error
						if (mangaitemSaveErr) done(mangaitemSaveErr);

						// Get a list of Mangaitems
						agent.get('/mangaitems')
							.end(function(mangaitemsGetErr, mangaitemsGetRes) {
								// Handle Mangaitem save error
								if (mangaitemsGetErr) done(mangaitemsGetErr);

								// Get Mangaitems list
								var mangaitems = mangaitemsGetRes.body;

								// Set assertions
								(mangaitems[0].user._id).should.equal(userId);
								(mangaitems[0].name).should.match('Mangaitem Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Mangaitem instance if not logged in', function(done) {
		agent.post('/mangaitems')
			.send(mangaitem)
			.expect(401)
			.end(function(mangaitemSaveErr, mangaitemSaveRes) {
				// Call the assertion callback
				done(mangaitemSaveErr);
			});
	});

	it('should not be able to save Mangaitem instance if no name is provided', function(done) {
		// Invalidate name field
		mangaitem.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mangaitem
				agent.post('/mangaitems')
					.send(mangaitem)
					.expect(400)
					.end(function(mangaitemSaveErr, mangaitemSaveRes) {
						// Set message assertion
						(mangaitemSaveRes.body.message).should.match('Please fill Mangaitem name');
						
						// Handle Mangaitem save error
						done(mangaitemSaveErr);
					});
			});
	});

	it('should be able to update Mangaitem instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mangaitem
				agent.post('/mangaitems')
					.send(mangaitem)
					.expect(200)
					.end(function(mangaitemSaveErr, mangaitemSaveRes) {
						// Handle Mangaitem save error
						if (mangaitemSaveErr) done(mangaitemSaveErr);

						// Update Mangaitem name
						mangaitem.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Mangaitem
						agent.put('/mangaitems/' + mangaitemSaveRes.body._id)
							.send(mangaitem)
							.expect(200)
							.end(function(mangaitemUpdateErr, mangaitemUpdateRes) {
								// Handle Mangaitem update error
								if (mangaitemUpdateErr) done(mangaitemUpdateErr);

								// Set assertions
								(mangaitemUpdateRes.body._id).should.equal(mangaitemSaveRes.body._id);
								(mangaitemUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Mangaitems if not signed in', function(done) {
		// Create new Mangaitem model instance
		var mangaitemObj = new Mangaitem(mangaitem);

		// Save the Mangaitem
		mangaitemObj.save(function() {
			// Request Mangaitems
			request(app).get('/mangaitems')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Mangaitem if not signed in', function(done) {
		// Create new Mangaitem model instance
		var mangaitemObj = new Mangaitem(mangaitem);

		// Save the Mangaitem
		mangaitemObj.save(function() {
			request(app).get('/mangaitems/' + mangaitemObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', mangaitem.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Mangaitem instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mangaitem
				agent.post('/mangaitems')
					.send(mangaitem)
					.expect(200)
					.end(function(mangaitemSaveErr, mangaitemSaveRes) {
						// Handle Mangaitem save error
						if (mangaitemSaveErr) done(mangaitemSaveErr);

						// Delete existing Mangaitem
						agent.delete('/mangaitems/' + mangaitemSaveRes.body._id)
							.send(mangaitem)
							.expect(200)
							.end(function(mangaitemDeleteErr, mangaitemDeleteRes) {
								// Handle Mangaitem error error
								if (mangaitemDeleteErr) done(mangaitemDeleteErr);

								// Set assertions
								(mangaitemDeleteRes.body._id).should.equal(mangaitemSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Mangaitem instance if not signed in', function(done) {
		// Set Mangaitem user 
		mangaitem.user = user;

		// Create new Mangaitem model instance
		var mangaitemObj = new Mangaitem(mangaitem);

		// Save the Mangaitem
		mangaitemObj.save(function() {
			// Try deleting Mangaitem
			request(app).delete('/mangaitems/' + mangaitemObj._id)
			.expect(401)
			.end(function(mangaitemDeleteErr, mangaitemDeleteRes) {
				// Set message assertion
				(mangaitemDeleteRes.body.message).should.match('User is not logged in');

				// Handle Mangaitem error error
				done(mangaitemDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Mangaitem.remove().exec();
		done();
	});
});