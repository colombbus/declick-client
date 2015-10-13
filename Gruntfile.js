module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
//    uglify: {
//      options: {
//        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//      },

        jshint: {
            all: ['Gruntfile.js', 'js/tangara/**/*.js']
        },
        
        jsdoc : {
            dist : {
                src: ['js/tangara/**/*.js'],
                options: {
                    destination: 'doc/api'
                }
            }
        }
//        ,
//        build: {
//            src: 'src/<%= pkg.name %>.js',
//            dest: 'build/<%= pkg.name %>.min.js'
//        }
    });

    // Load the plugin that provides the "uglify" task.
//    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');
    
    // Default task(s).
//    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('default', ['jshint']);

};
