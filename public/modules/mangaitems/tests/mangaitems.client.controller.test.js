'use strict';

(function() {
	// Mangaitems Controller Spec
	describe('Mangaitems Controller Tests', function() {
		// Initialize global variables
		var MangaitemsController,
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

			// Initialize the Mangaitems controller.
			MangaitemsController = $controller('MangaitemsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Mangaitem object fetched from XHR', inject(function(Mangaitems) {
			// Create sample Mangaitem using the Mangaitems service
			var sampleMangaitem = new Mangaitems({
				name: 'New Mangaitem'
			});

			// Create a sample Mangaitems array that includes the new Mangaitem
			var sampleMangaitems = [sampleMangaitem];

			// Set GET response
			$httpBackend.expectGET('mangaitems').respond(sampleMangaitems);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.mangaitems).toEqualData(sampleMangaitems);
		}));

		it('$scope.findOne() should create an array with one Mangaitem object fetched from XHR using a mangaitemId URL parameter', inject(function(Mangaitems) {
			// Define a sample Mangaitem object
			var sampleMangaitem = new Mangaitems({
				name: 'New Mangaitem'
			});

			// Set the URL parameter
			$stateParams.mangaitemId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/mangaitems\/([0-9a-fA-F]{24})$/).respond(sampleMangaitem);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.mangaitem).toEqualData(sampleMangaitem);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Mangaitems) {
			// Create a sample Mangaitem object
			var sampleMangaitemPostData = new Mangaitems({
				name: 'New Mangaitem'
			});

			// Create a sample Mangaitem response
			var sampleMangaitemResponse = new Mangaitems({
				_id: '525cf20451979dea2c000001',
				name: 'New Mangaitem'
			});

			// Fixture mock form input values
			scope.name = 'New Mangaitem';

			// Set POST response
			$httpBackend.expectPOST('mangaitems', sampleMangaitemPostData).respond(sampleMangaitemResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Mangaitem was created
			expect($location.path()).toBe('/mangaitems/' + sampleMangaitemResponse._id);
		}));

		it('$scope.update() should update a valid Mangaitem', inject(function(Mangaitems) {
			// Define a sample Mangaitem put data
			var sampleMangaitemPutData = new Mangaitems({
				_id: '525cf20451979dea2c000001',
				name: 'New Mangaitem'
			});

			// Mock Mangaitem in scope
			scope.mangaitem = sampleMangaitemPutData;

			// Set PUT response
			$httpBackend.expectPUT(/mangaitems\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/mangaitems/' + sampleMangaitemPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid mangaitemId and remove the Mangaitem from the scope', inject(function(Mangaitems) {
			// Create new Mangaitem object
			var sampleMangaitem = new Mangaitems({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Mangaitems array and include the Mangaitem
			scope.mangaitems = [sampleMangaitem];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/mangaitems\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleMangaitem);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.mangaitems.length).toBe(0);
		}));
	});
}());