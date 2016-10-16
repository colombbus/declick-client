module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    appDir: 'src',
                    optimize: 'uglify', /* test: 'none' / prod: 'uglify' */
                    baseUrl: 'js/declick/',
                    mainConfigFile: 'src/js/declick/main.js',
                    skipDirOptimize: true,
                    findNestedDependencies: true,
                    removeCombined: true,
                    skipModuleInsertion: true,
                    modules: [
                        {
                            name:'objects',
                            exclude: ['jquery', 'babylon', 'TUI', 'TEnvironment', 'TRuntime', 'TUtils', 'TLink', 'TError'],
                            include: '<%= objectsList %>'
                        },
                        {
                            name:'main',
                            exclude: ['jquery', 'platform-pr', 'json', 'jschannel', 'jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/draggable', 'jquery-ui/mouse', 'split-pane', 'ace/ace', 'ace/autocomplete', 'ace/range', 'iframe-transport', 'fileupload', 'wColorPicker', 'wPaint', 'wPaint/plugins/main', 'wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/flip', 'wPaint/plugins/file', 'prism', 'babylon', 'objects', 'introjs']
                        },
                        {
                            name:'learn',
                            exclude: ['jquery', 'platform-pr', 'json', 'jschannel', 'jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/draggable', 'jquery-ui/mouse', 'split-pane', 'ace/ace', 'ace/autocomplete', 'ace/range', 'iframe-transport', 'fileupload', 'wColorPicker', 'wPaint', 'wPaint/plugins/main', 'wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/flip', 'wPaint/plugins/file', 'prism', 'babylon', 'objects', 'introjs']
                        },
                        {
                            name:'execute',
                            exclude: ['jquery', 'platform-pr', 'json', 'jquery-ui/core', 'jquery-ui/widget', 'jquery-ui/draggable', 'jquery-ui/mouse', 'split-pane', 'ace/ace', 'ace/autocomplete', 'ace/range', 'iframe-transport', 'fileupload', 'wColorPicker', 'wPaint', 'wPaint/plugins/main', 'wPaint/plugins/text', 'wPaint/plugins/shapes', 'wPaint/plugins/flip', 'wPaint/plugins/file', 'babylon', 'objects', 'introjs'],
                            include: ['TUI']
                        }
                    ],
                    dir: 'dist'
                }
            }
        },
        front_end_modules: {
            jquery: {
                src: ['dist/jquery.min.js', 'dist/jquery.min.map'],
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
                src: ['src-min/ace.js', 'src-min/worker-javascript.js','src-min/ext-language_tools.js', 'src-min/mode-javascript.js', 'src-min/theme-twilight.js', 'src-min/ext-searchbox.js'],
                dest: 'src/js/libs/ace'
            }
        },
        cleanempty: {
            options: {
                files:false,
                folders:true
            },
            src: ['dist/js/declick/objects/**/*']
        },
        htmlbuild: {
            dist: {
                src:'dist/*.html',
                options: {
                    replace:true,
                    beautify:true,
                    keepTags:false,
                    scripts: {
                    }
                }
            }
        }
//        ,
//        build: {
//            src: 'src/<%= pkg.name %>.js',
//            dest: 'build/<%= pkg.name %>.min.js'
//        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-front-end-modules');
    grunt.loadNpmTasks('grunt-cleanempty');
    grunt.loadNpmTasks('grunt-html-build');    
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-jsdoc');

    // Utility tasks
    grunt.registerTask('set_dist_config', function() {
        var declickConfig = grunt.file.readJSON("dist/resources/config.json");
        declickConfig.optimized = true;
        declickConfig["cache-version"] = grunt.config("cacheVersion");
        if (declickConfig["analytics"] !== 'false') {
            grunt.config("htmlbuild.dist.options.scripts.analytics", declickConfig["analytics"]);
        }
        grunt.file.write("dist/resources/config.json",JSON.stringify(declickConfig));
    });

    grunt.registerTask('get_objects_list', function() {
        var structure = grunt.file.readJSON("src/js/declick/objects/objects.json");
        var objectsList = [];
        for (var entry in structure) {
            objectsList.push("objects/"+structure[entry].path+"/"+entry);
        }
        grunt.config('objectsList',objectsList);
        var objectsListTUI = objectsList.push('TUI');
        grunt.config('objectsListTUI',objectsListTUI);
    });

    grunt.registerTask('merge_files', function() {
        var structure = grunt.file.readJSON("src/js/declick/objects/objects.json");
        structure.TObject = {path:'tobject'};
        structure.TGraphicalObject = {path:'tgraphicalobject'};
        structure.TObject3D = {path:'tobject3d'};
        var messages = {};
        var i18n = {};
        for (var entry in structure) {
            var path = "dist/js/declick/objects/"+structure[entry].path+"/resources/";
            messages[entry] = grunt.file.readJSON(path+"messages.json");
            i18n[entry] = grunt.file.readJSON(path+"i18n.json");
            // delete files
            grunt.file.delete(path+"messages.json");
            grunt.file.delete(path+"i18n.json");
        }
        grunt.file.write("dist/js/declick/objects/messages.json", JSON.stringify(messages));
        grunt.file.write("dist/js/declick/objects/i18n.json", JSON.stringify(i18n));
    });

    grunt.registerTask('set_cache_version', function() {
        var configPath = "dist/resources/config.json";
        if (grunt.file.exists(configPath)) {
            var declickConfig = grunt.file.readJSON("dist/resources/config.json");
            grunt.config('cacheVersion', declickConfig["cache-version"]+1);
        } else {
            grunt.config('cacheVersion', 0);
        }
    });


    // Install task
    grunt.registerTask('install_declick', ['front_end_modules']);

    // Build task
    grunt.registerTask('build_declick', ['get_objects_list', 'set_cache_version', 'requirejs', 'set_dist_config', 'htmlbuild']);
    //TODO: see if we merge i18n and message files for objects
    //grunt.registerTask('build_declick', ['get_objects_list', 'requirejs', 'merge_files', 'set_optimized', 'cleanempty']);
    grunt.registerTask('default', ['build_declick']);

};
