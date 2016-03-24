var _ = require('lodash');

// by default, use Sauce Labs
// if you don't want Sauce, use SAUCE=false
if (process.env.SAUCE === undefined) {
  process.env.SAUCE = false;
}

var desireds = require('./tests/functional/helpers/caps');

var gruntConfig = {
  // pkg: grunt.file.readJSON('package.json'),
  //uglify 설정
  env: {
  },
  uglify: {
      options: {
          banner: '/* <%= grunt.template.today("yyyy-mm-dd") %> / ' //파일의 맨처음 붙는 banner 설정
      },
      build: {
          src: 'public/build/result.js', //uglify할 대상 설정
          dest: 'public/build/result.min.js' //uglify 결과 파일 설정
      }
  },
  //concat 설정
  concat:{
      basic: {
          src: ['public/js/common/util.js', 'public/js/app.js', 'public/js/lib/.js', 'public/js/ctrl/.js'], //concat 타겟 설정(앞에서부터 순서대로 합쳐진다.)
          dest: 'public/build/result.js' //concat 결과 파일
      }
  },
  simplemocha: {
    android: {
      options: {
        timeout: 120000,
        reporter: 'spec'
      },
      src: ['tests/functional/android/web-specs.js']
    }
  },
  concurrent: {
    // dynamically filled
    'test-ios': [],
    'test-android': [],
    'test-all': [],
  },
  nightwatch: {
      options: {
        src_folders: ['./tests'],
        output_folder: './reports',
        custom_assertions_path: '',
        globals_path: '',
        live_output: true,

        selenium: {
          start_process: true,
          server_path: './node_modules/selenium-server/lib/runner/selenium-server-standalone-2.53.0.jar',
          log_path: './results',
          host: '127.0.0.1',
          port: 4444,
          cli_args: {
            'webdriver.chrome.driver': './node_modules/chromedriver/lib/chromedriver/chromedriver.exe',
            'webdriver.ie.driver': './node_modules/dalek-browser-ie/lib/bin/IEDriverServer.exe'
          }
        },

        test_settings: {
          default: {
            launch_url: 'http://localhost',
            selenium_host: '127.0.0.1',
            selenium_port: 4444,
            silent: true,
            disable_colors: false,
            screenshots: {
              enabled: true,
              path: './reports/screenshots'
            },
            desiredCapabilities: {
              browserName: 'firefox',
              javascriptEnabled: true,
              acceptSslCerts: true
            }
          },

          chrome: {
            desiredCapabilities: {
              browserName: 'chrome',
              javascriptEnabled: true
            }
          },

          ie: {
            desiredCapabilities: {
              browserName: 'internet explorer',
              javascriptEnabled: true
            }
          },

          phantom: {
            desiredCapabilities: {
              browserName: 'phantomjs',
              'phantomjs.binary.path': require('phantomjs').path,
              javascriptEnabled: true
            }
          }
        }
      }

      /*'default' : {
          launch_url: 'http://localhost',
            selenium_host: '127.0.0.1',
            selenium_port: 4444,
            silent: true,
            disable_colors: false,
            screenshots: {
              enabled: true,
              path: './reports/screenshots'
            },
            desiredCapabilities: {
              browserName: 'firefox',
              javascriptEnabled: true,
              acceptSslCerts: true
            }
      },

      browserstack: {
        argv: {
          env: 'browserstack'
        },
        settings: {
          silent: true
        }
      },

      'all' : {
        argv: {
          env: 'default,browserstack'
        }
      }*/
  }

};

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig(gruntConfig);

    // Load the plugin that provides the "uglify", "concat" tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-nightwatch');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-concurrent');

    var tests = [];
    _.each(['android'], function (system) {
      var systemTests = [];
      _(desireds[system]).each(function(desired, key) {
        // put together environments for each test
        gruntConfig.env[key] = {
          DESIRED: JSON.stringify(desired)
        };

        var name = 'test:' + system + ':' + key;

        // establish the list of tasks for the system's concurrent task
        gruntConfig.concurrent['test-' + system].push('test:' + system + ':' + key);
        // establish the list of tasks for all concurrent tasks
        gruntConfig.concurrent['test-all'].push(name);

        // make a task for this particular cap (e.g., grunt test:ios:7.1)
        grunt.registerTask(name, ['env:' + key, 'simplemocha:' + system]);

        // add to the list of tests for this particular system
        systemTests.push(name);

        // add to the list of tests that will be performed as 'all'
        tests.push(name);
      });
      // make a task for a particular system (e.g., grunt test:ios)
      grunt.registerTask('test:' + system, systemTests);
    });

    grunt.registerTask('test:android:parallel', ['concurrent:test-android']);

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']); //grunt 명령어로 실행할 작업
    grunt.registerTask('test:android:parallel', ['concurrent:test-android']);

};