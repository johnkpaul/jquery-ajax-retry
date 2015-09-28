/*global module:false*/
module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: ['src/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          module: true,
          jQuery: true,
          define: true,
          ok: true,
          require: true
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint','qunit', 'concat', 'uglify', 'manifest']);

  grunt.registerTask( "manifest", function() {
    var pkg = grunt.config( "pkg" );
    grunt.file.write( "ajax-retry.jquery.json", JSON.stringify({
      name: "ajax-retry",
      title: pkg.title,
      description: pkg.description,
      keywords: pkg.keywords,
      version: pkg.version,
      author: pkg.author,
      maintainers: pkg.maintainers,
      licenses: pkg.licenses.map(function( license ) {
        license.url = license.url.replace( "master", pkg.version );
        return license;
      }),
      bugs: pkg.bugs,
      homepage: pkg.homepage,
      docs: pkg.homepage,
      dependencies: {
        jquery: ">=1.5"
      }
    }, null, "  " ) );
  });

};
