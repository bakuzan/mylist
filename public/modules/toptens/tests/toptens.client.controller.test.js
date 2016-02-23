'use strict';

(function() {
	// Toptens Controller Spec
	describe('Toptens Controller Tests', function() {
		// Initialize global variables
		var ToptensController,
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

			// Initialize the Toptens controller.
			ToptensController = $controller('ToptensController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Topten object fetched from XHR', inject(function(Toptens) {
			// Create sample Topten using the Toptens service
			var sampleTopten = new Toptens({
				name: 'New Topten'
			});

			// Create a sample Toptens array that includes the new Topten
			var sampleToptens = [sampleTopten];

			// Set GET response
			$httpBackend.expectGET('toptens').respond(sampleToptens);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.toptens).toEqualData(sampleToptens);
		}));

		it('$scope.findOne() should create an array with one Topten object fetched from XHR using a toptenId URL parameter', inject(function(Toptens) {
			// Define a sample Topten object
			var sampleTopten = new Toptens({
				name: 'New Topten'
			});

			// Set the URL parameter
			$stateParams.toptenId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/toptens\/([0-9a-fA-F]{24})$/).respond(sampleTopten);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.topten).toEqualData(sampleTopten);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Toptens) {
			// Create a sample Topten object
			var sampleToptenPostData = new Toptens({
				name: 'New Topten'
			});

			// Create a sample Topten response
			var sampleToptenResponse = new Toptens({
				_id: '525cf20451979dea2c000001',
				name: 'New Topten'
			});

			// Fixture mock form input values
			scope.name = 'New Topten';

			// Set POST response
			$httpBackend.expectPOST('toptens', sampleToptenPostData).respond(sampleToptenResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Topten was created
			expect($location.path()).toBe('/toptens/' + sampleToptenResponse._id);
		}));

		it('$scope.update() should update a valid Topten', inject(function(Toptens) {
			// Define a sample Topten put data
			var sampleToptenPutData = new Toptens({
				_id: '525cf20451979dea2c000001',
				name: 'New Topten'
			});

			// Mock Topten in scope
			scope.topten = sampleToptenPutData;

			// Set PUT response
			$httpBackend.expectPUT(/toptens\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/toptens/' + sampleToptenPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid toptenId and remove the Topten from the scope', inject(function(Toptens) {
			// Create new Topten object
			var sampleTopten = new Toptens({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Toptens array and include the Topten
			scope.toptens = [sampleTopten];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/toptens\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTopten);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.toptens.length).toBe(0);
		}));
	});
}());