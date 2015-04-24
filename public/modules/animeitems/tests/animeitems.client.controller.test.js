'use strict';

(function() {
	// Animeitems Controller Spec
	describe('Animeitems Controller Tests', function() {
		// Initialize global variables
		var AnimeitemsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Animeitems controller.
			AnimeitemsController = $controller('AnimeitemsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Animeitem object fetched from XHR', inject(function(Animeitems) {
			// Create sample Animeitem using the Animeitems service
			var sampleAnimeitem = new Animeitems({
				name: 'New Animeitem'
			});

			// Create a sample Animeitems array that includes the new Animeitem
			var sampleAnimeitems = [sampleAnimeitem];

			// Set GET response
			$httpBackend.expectGET('animeitems').respond(sampleAnimeitems);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.animeitems).toEqualData(sampleAnimeitems);
		}));

		it('$scope.findOne() should create an array with one Animeitem object fetched from XHR using a animeitemId URL parameter', inject(function(Animeitems) {
			// Define a sample Animeitem object
			var sampleAnimeitem = new Animeitems({
				name: 'New Animeitem'
			});

			// Set the URL parameter
			$stateParams.animeitemId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/animeitems\/([0-9a-fA-F]{24})$/).respond(sampleAnimeitem);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.animeitem).toEqualData(sampleAnimeitem);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Animeitems) {
			// Create a sample Animeitem object
			var sampleAnimeitemPostData = new Animeitems({
				name: 'New Animeitem'
			});

			// Create a sample Animeitem response
			var sampleAnimeitemResponse = new Animeitems({
				_id: '525cf20451979dea2c000001',
				name: 'New Animeitem'
			});

			// Fixture mock form input values
			scope.name = 'New Animeitem';

			// Set POST response
			$httpBackend.expectPOST('animeitems', sampleAnimeitemPostData).respond(sampleAnimeitemResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Animeitem was created
			expect($location.path()).toBe('/animeitems/' + sampleAnimeitemResponse._id);
		}));

		it('$scope.update() should update a valid Animeitem', inject(function(Animeitems) {
			// Define a sample Animeitem put data
			var sampleAnimeitemPutData = new Animeitems({
				_id: '525cf20451979dea2c000001',
				name: 'New Animeitem'
			});

			// Mock Animeitem in scope
			scope.animeitem = sampleAnimeitemPutData;

			// Set PUT response
			$httpBackend.expectPUT(/animeitems\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/animeitems/' + sampleAnimeitemPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid animeitemId and remove the Animeitem from the scope', inject(function(Animeitems) {
			// Create new Animeitem object
			var sampleAnimeitem = new Animeitems({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Animeitems array and include the Animeitem
			scope.animeitems = [sampleAnimeitem];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/animeitems\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleAnimeitem);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.animeitems.length).toBe(0);
		}));
	});
}());