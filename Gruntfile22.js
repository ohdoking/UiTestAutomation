module.exports = function(grunt) {

    var nightwatch = require('nightwatch');
    nightwatch.initGrunt(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //uglify 설정
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
        nightwatch: {
            'options': {


                // nightwatch settings
                globals: { foo: 'bar' },
                globals_path: '',
                custom_commands_path: '',
                custom_assertions_path: '',
                src_folders: ['tests'],
                output_folder: 'report',
                test_settings: {},
                selenium : {
                    start_process : true,
                    server_path : "./node_modules/selenium-server/lib/runner/selenium-server-standalone-2.53.0.jar",
                    log_path : "reports",
                    host : "127.0.0.1",
                    port : 4444,
                    cli_args : {
                      'webdriver.chrome.driver' : "./node_modules/.bin/chromedriver",
                      'webdriver.ie.driver' : "./node_modules/dalek-browser-ie/lib/bin/IEDriverServer.exe"
                    }
                }
            },

            'default' : {
              launch_url : "http://localhost",
              selenium_port  : 4444,
              selenium_host  : "localhost",
              silent: true,
              screenshots : {
                enabled : true,
                path : "reports/screenshots"
              },
              desiredCapabilities: {
                browserNam: "firefox",
                javascriptEnabled: true,
                acceptSslCerts: true
              },
              globals : {
                search: "nightwatch",
                search_result: "Night Watch",
                urls: {
                  search: "http://www.google.com"
                }
              }
            },

            'browserstack': {
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
            },
        }
    });

    // Load the plugin that provides the "uglify", "concat" tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-nightwatch');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']); //grunt 명령어로 실행할 작업

};