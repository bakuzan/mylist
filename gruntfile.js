'use strict';

module.exports = function(grunt) {
	// Unified Watch Object
	var watchFiles = {
		serverViews: ['app/views/**/*.*'],
		serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
		clientViews: ['public/modules/**/views/**/*.html', 'public/modules/**/templates/*.html'],
		clientJS: ['public/js/*.js', 'public/modules/**/*.js'],
		clientCSS: ['public/modules/**/*.css'],
		mochaTests: ['app/tests/**/*.js'],
		sass: ['public/modules/**/*.scss'],
		helper:  ['public/style/helper/*.scss']
	};

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			serverViews: {
				files: watchFiles.serverViews,
				options: {
					livereload: true
				}
			},
			serverJS: {
				files: watchFiles.serverJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientViews: {
				files: watchFiles.clientViews,
				options: {
					livereload: true,
				}
			},
			clientJS: {
				files: watchFiles.clientJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientCSS: {
				files: watchFiles.clientCSS,
				tasks: ['csslint'],
				options: {
					livereload: true
				}
			},
      sass: {
          files: watchFiles.sass,
          tasks: ['sass:dist'],
					options: {
						livereload: true
					}
      },
			helper: {
          files: watchFiles.helper,
          tasks: ['sass:helper'],
					options: {
						livereload: true
					}
      }
		},
		jshint: {
			all: {
				src: watchFiles.clientJS.concat(watchFiles.serverJS),
				options: {
					jshintrc: true
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc',
			},
			all: {
				src: watchFiles.clientCSS
			}
		},
		uglify: {
			production: {
				options: {
					mangle: false
				},
				files: {
					'public/dist/application.min.js': 'public/dist/application.js'
				}
			}
		},
		cssmin: {
			combine: {
				files: {
					'public/dist/application.min.css': '<%= applicationCSSFiles %>'
				}
			}
		},
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					nodeArgs: ['--harmony', '--debug'],
					ext: 'js,html',
					watch: watchFiles.serverViews.concat(watchFiles.serverJS)
				}
			}
		},
		'node-inspector': {
			custom: {
				options: {
					'web-port': 1337,
					'web-host': 'localhost',
					'debug-port': 5858,
					'save-live-edit': true,
					'no-preload': true,
					'stack-trace-limit': 50,
					'hidden': []
				}
			}
		},
		ngAnnotate: {
			production: {
				files: {
					'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
				}
			}
		},
		concurrent: {
			default: ['nodemon', 'watch'],
			debug: ['nodemon', 'watch', 'node-inspector'],
			options: {
				logConcurrentOutput: true,
				limit: 10
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			},
			secure: {
				NODE_ENV: 'secure'
			}
		},
		mochaTest: {
			src: watchFiles.mochaTests,
			options: {
				reporter: 'spec',
				require: 'server.js'
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},
		sass: {
			helper: {
				options: {
					style: 'expanded',
		      compass: false
		    },
				files: {
					'public/dist/components.css': 'public/style/components.scss',
					'public/dist/box-model.css': 'public/style/helper/box-model.scss',
					'public/dist/text.css': 'public/style/helper/text.scss',
					'public/dist/animation.css': 'public/style/helper/animation.scss',
					'public/dist/control-overrides.css': 'public/style/helper/control-overrides.scss',
					'public/dist/float-label.css': 'public/style/helper/float-label.scss',
				}
			},
		  dist: {
		    options: {
					style: 'expanded',
		      compass: false
		    },
		    files: {
					'public/dist/main-day.css': 'public/style/main-day.scss',
					'public/dist/main-night.css': 'public/style/main-night.scss'
		    }
		  }
		},
		postcss: {
	    options: {
	      map: {
	          inline: false, // save all sourcemaps as separate files...
	          annotation: 'public/dist/maps/' // ...to the specified directory
	      },
	      processors: [
	        require('pixrem')(), // add fallbacks for rem units
	        require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
	        require('cssnano')() // minify the result
	      ]
	    },
	    dist: {
	      src: 'public/dist/*.css'
	    }
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['babili']
			},
			dist: {
				files: {
					'public/dist/application.min.js': 'public/dist/application.js',
					'public/dist/templates.min.js': 'public/dist/templates.js',
				}
			}
		},
		ngtemplates: {
        mylist: {
            options: {
								base: 'public',
								prefix: '/',
								quotes: 'single',
								htmlmin: {
								  collapseBooleanAttributes:      true,
								  collapseWhitespace:             true,
								  keepClosingSlash:               false, // Only if you are using SVG in HTML
								  removeAttributeQuotes:          true,
								  removeComments:                 false, // Only if you don't use comment directives!
								  removeEmptyAttributes:          true,
								  removeRedundantAttributes:      true,
								  removeScriptTypeAttributes:     true,
								  removeStyleLinkTypeAttributes:  true
								}
            },
						cwd: 'public',
            src: 'modules/**/*.html',
            dest: 'public/dist/templates.js'
        }
    }
	});

	// Load NPM tasks
	require('load-grunt-tasks')(grunt);

	// Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	// A Task for loading the configuration object
	grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
		var init = require('./config/init')();
		var config = require('./config/config');

		grunt.config.set('applicationJavaScriptFiles', config.assets.js);
		grunt.config.set('applicationCSSFiles', config.assets.css);
	});

	// Default task(s).
	grunt.registerTask('default', ['lint', 'concurrent:default']);

	// Debug task.
	grunt.registerTask('debug', ['lint', 'concurrent:debug']);

	// Secure task(s).
	grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);

	// Lint task(s).
	grunt.registerTask('lint', ['jshint', 'csslint']);

	// Build task(s).
	grunt.registerTask('build', ['lint', 'ngtemplates', 'loadConfig', 'ngAnnotate', 'babel:dist', 'sass:helper', 'sass:dist', 'postcss:dist']);

	// Test task.
	grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
};
