module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
//    uglify: {
//      options: {
//        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//      },
        requirejs: {
            compile: {
                options: {
                    appDir: 'src',
                    optimize: 'none', /* test: 'none' / prod: 'uglify' */
                    baseUrl: 'js/declick/',
                    mainConfigFile: 'src/js/declick/main.js',
                    skipDirOptimize: true,
                    findNestedDependencies: true,
                    removeCombined: true,
                    skipModuleInsertion: true,
                    /*paths: {
                        'jquery':'empty:',
                        'quintus':'empty:',
                        'acorn':'empty:',
                        'js-interpreter':'empty:',
                        'split-pane':'empty:',
                        'ace':'empty:',
                        'ace/autocomplete':'empty:',
                        'ace/range':'empty:',
                        'ace/edit-session':'empty:',
                        'ace/undomanager':'empty:',
                        'jquery-ui/widget':'empty:',
                        'jquery-ui/core':'empty:',
                        'jquery-ui/draggable':'empty:',
                        'jquery-ui/mouse':'empty:',
                        'iframe-transport':'empty:',
                        'fileupload':'empty:',
                        'wColorPicker':'empty:',
                        'wPaint':'empty:',
                        'wPaint/plugins/main':'empty:',
                        'wPaint/plugins/text':'empty:',
                        'wPaint/plugins/shapes':'empty:',
                        'wPaint/plugins/flip':'empty:',
                        'wPaint/plugins/file':'empty:',
                        'platform-pr':'empty:',
                        'json':'empty:',
                        'babylon':'empty:'
                    },*/
                    modules: [
                        {
                            name:'main',
                            exclude: ['jquery', 'platform-pr', 'json', 'jschannel', 'jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/draggable', 'jquery-ui/mouse', 'split-pane', 'ace/ace', 'ace/autocomplete', 'ace/range', 'iframe-transport', 'fileupload', 'wColorPicker', 'wPaint', 'wPaint/plugins/main', 'wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/flip', 'wPaint/plugins/file']
                        },
                        {
                            name:'learn',
                            exclude: ['jquery', 'platform-pr', 'json', 'jschannel', 'jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/draggable', 'jquery-ui/mouse', 'split-pane', 'ace/ace', 'ace/autocomplete', 'ace/range', 'iframe-transport', 'fileupload', 'wColorPicker', 'wPaint', 'wPaint/plugins/main', 'wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/flip', 'wPaint/plugins/file'],
                            excludeShallow:['objects/teacher/Teacher', 'objects/exercise/Exercise', 'SynchronousManager', 'TObject']
                        },
                        {
                            name:'execute',
                            exclude: ['jquery', 'platform-pr', 'json', 'jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/draggable', 'jquery-ui/mouse', 'split-pane', 'ace/ace', 'ace/autocomplete', 'ace/range', 'iframe-transport', 'fileupload', 'wColorPicker', 'wPaint', 'wPaint/plugins/main', 'wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/flip', 'wPaint/plugins/file'],
                            include: ['TUI']
                        }
                    ],
                    dir: 'dist'
                }
            }
        },
        front_end_modules: {
            jquery: {
                src: ['dist/jquery.min.js'],
                dest: 'src/js/libs/jquery'
            },
            babylonjs: {
                options: {
                    dest: 'src/js/libs/babylonjs'
                }
            },
            requirejs: {
                src: ['require.js'],
                dest: 'src/js/libs/requirejs'
            },
            'intro.js': {
                src: ['minified/intro.min.js', 'minified/introjs.min.css', 'themes/*'],
                dest: 'src/js/libs/introjs'
            },
            'ace-builds': {
                src: ['src-min/ace.js', 'src-min/ext-language_tools.js', 'src-min/mode-javascript.js', 'src-min/theme-twilight.js'],
                dest: 'src/js/libs/ace'
            }
        }
//        ,
//        build: {
//            src: 'src/<%= pkg.name %>.js',
//            dest: 'build/<%= pkg.name %>.min.js'
//        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-front-end-modules');
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-jsdoc');

    // Install task
    grunt.registerTask('install_declick', ['front_end_modules']);

    // Default task
    grunt.registerTask('build_declick', ['requirejs']);
};
