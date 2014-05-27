module.exports = function (grunt) {

    // Tasks
    grunt.registerTask('build', ['clean', 'build-js', 'less', 'jinja']);
    grunt.registerTask('build-js', ['concat:main', 'uglify:all']);
    grunt.registerTask('default', ['build', 'watch']);
    grunt.registerTask('lint', ['jslint']);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // cleans up the compiled JS file
        clean: {
            all: [
                './assets/script/dist',
                './assets/script/build'
            ]
        },

        less: {
            dev: {
                options: {
                    paths: ["/assets/styles"],
                    rootpath: "",
                    compress: true,
                    cleancss: true
                },
                files: {
                    "./assets/style/dist/main.css": "./assets/style/main.less",
                    "./custom-select.css": "./custom-select.less",
                }
            }
        },

        jslint: {
            dev: {
                failOnError: false,
                src: [
                    'Gruntfile.js',
                    './assets/script/**/*.js'
                ],
                exclude: [
                    './assets/script/vendor/**/*.js'
                ],
                directives: {
                    browser: true,
                    predef: [
                        'jQuery',
                        '$'
                    ]
                }
            }
        },

        concat: {
            main: {
                src: [
                    './assets/script/vendor/jquery-1.11.0.js',
                    //'./assets/script/vendor/bootstrap.js',
                    //'./assets/script/vendor/owl.carousel.js',
	                //'./assets/script/vendor/rrssb.js',
                    './assets/script/main.js'
                ],
                dest: './assets/script/build/main.js',
                nonull: true
            }
        },

        uglify: {
            all: {
                options: {
                    preserveComments: 'some',
                    mangle: {
                        except: ['jQuery']
                    }
                },
                files: {
                    './assets/script/dist/main.min.js': [
                        './assets/script/build/main.js'
                    ]
                }
            }
        },

        jinja: {
            dist: {
                options: {
                    // templateDirs: ['src/templates']
                },
                files: [{
                    expand: true,
                    dest: '',
                    cwd: 'templates/',
                    src: ['**/!(_)*.html']
                }]
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            templates: {
                files: ['templates/*.html'],
                tasks: ['jinja'],
            },
            css: {
                files: ['assets/style/*.less'],
                tasks: ['less'],
            },
            js: {
                files: ['assets/script/*/*.js'],
                tasks: ['concat', 'uglify'],
            }
        },

        shell : {
        }

    });

    // Includes
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-jinja');
    grunt.loadNpmTasks('grunt-contrib-watch');

};
