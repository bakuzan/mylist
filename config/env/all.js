'use strict';

module.exports = {
	app: {
		title: 'MyList',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                'public/lib/sweetalert/dist/sweetalert.css',
                'public/lib/toastr/toastr.min.css'
			],
			js: [
                'public/lib/jquery/dist/jquery.min.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-cookies/angular-cookies.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-touch/angular-touch.js',
				'public/lib/angular-sanitize/angular-sanitize.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/angular-local-storage/dist/angular-local-storage.min.js',
                'public/lib/ng-file-upload/angular-file-upload.min.js',
                'public/lib/ng-file-upload/angular-file-upload-shim.min.js',
                'public/lib/moment/min/moment.min.js',
                'public/lib/angular-moment/angular-moment.min.js',
                'public/lib/sweetalert/dist/sweetalert.min.js',
                'public/lib/toastr/toastr.min.js'

			]
		},
		css: [
            'public/lib/components-font-awesome/css/font-awesome.min.css',
            'public/dist/components.css',
            'public/dist/box-model.css',
            'public/dist/text.css',
            'public/dist/animation.css',
            'public/dist/control-overrides.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
