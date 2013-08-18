module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'pulldown.js', 'lib/*.js', 'test/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          console: true,
          module: true,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['test']);

};
