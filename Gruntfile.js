// Generated on 2015-10-23 using generator-socketio 0.0.3
'use strict';
var moment = require('moment');

var LIVERELOAD_PORT = 35729;
var RUNNING_PORT = 1337; // <- if you change this, you need to change in client/public/js/app.js and recompile
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    cssmin: {
      combine: {
        files: {
          'client/public/css/core.css': 'client/public/bower_components/bootstrap.css/css/bootstrap.css'
        }
      }
    },

    less: {
      options: {
        //report:'gzip'
      },
      production: {
        options: {
          cleancss: true
        },
        files: {
          "client/public/css/core.css": "client/public/bower_components/bootstrap/less/bootstrap.less"
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'client/public/css/core.css': 'client/public/bower_components/sass-bootstrap/lib/bootstrap.scss',
        }
      }
    },

    stylus: {
      compile: {
        options: {
          compress:true
        },
        files: {
          'client/public/css/core.css': 'client/public/bower_components/bootstrap-stylus/stylus/bootstrap.styl'
        }
      }
    },

    concat: {
      options: {
        separator: ';',
        stripBanners:true
      },
      dist: {
        src: [
          'client/public/js/index.js',
          'client/public/js/animator.js',
          'client/public/js/socket.js',
          'client/public/js/app.js'],
        dest: 'client/public/js/concat.js',
      },
    },

    //this is currently turned off, since jquery KILLS it
    jshint: {
      options: {
        curly: true,
        eqeqeq: false,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      files:{
        src:['client/public/js/concat.js']
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'client/public/js/app.min.js': ['client/public/js/concat.js']
        }
      }
    },

    // Watch Config
    watch: {
        files: ['views/**/*'],
        options: {
            livereload: true
        },
        scripts: {
            files: [
                'client/public/js/**/*.js'
            ],
            tasks:['build']
        },
        css: {
            files: [
                'client/public/css/**/*.css',
            ],
        },
        less: {
            files: ['client/public/bower_components/bootstrap/less/**/*.less'],
            tasks: ['build']
        },
        express: {
            files:  [ 'app.js', '!**/node_modules/**', '!Gruntfile.js' ],
            tasks:  [ 'watch' ],
            options: {
                nospawn: true // Without this option specified express won't be reloaded
            }
        },
    },

    connect: {
      options: {
        port: RUNNING_PORT,//variable at top of this file
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.')
            ];
          }
        }
      }
    },

    nodemon:{
      dev: {
        options: {
          file: 'app.js',
          //args: ['dev'],
          //nodeArgs: ['--debug'],
          ignoredFiles: ['node_modules/**'],
          //watchedExtensions: ['js'],
          watchedFolders: ['views', 'routes'],
          //delayTime: 1,
          legacyWatch: true,
          env: {
            PORT: RUNNING_PORT
          },
          cwd: __dirname
        }
      }
    },

    // run 'watch' and 'nodemon' indefinitely, together
    // 'launch' will just kick it off, and won't stay running
    concurrent: {
        target: {
            tasks: ['nodemon', 'watch', 'launch'],
            options: {
                logConcurrentOutput: true
            }
        }
    },

    wait:{
      options: {
          delay: 1000
      },
      pause:{
        options:{
          before:function(options){
            console.log('pausing %dms before launching page', options.delay);
          },
          after : function() {
              console.log('pause end, heading to page (using default browser)');
          }
        }
      }
    },

    open: {
      server: {
        path: 'http://localhost:' + RUNNING_PORT
      }
    }

  });

  //grunt.registerTask('server', ['build', 'connect:livereload', 'open', 'watch']);

  grunt.registerTask('build', ['less', 'concat', 'uglify']);

  grunt.registerTask('launch', ['wait', 'open']);

  grunt.registerTask('default', ['build', 'concurrent']);

};
