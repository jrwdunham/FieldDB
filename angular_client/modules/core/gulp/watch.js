'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

function isOnlyChange(event) {
  return event.type === 'changed';
}

module.exports = function(options) {
  gulp.task('watch', ['inject'], function() {

    gulp.watch([options.src + '/*.html', 'bower.json'], ['inject']);

    gulp.watch(options.src + '/{app,components}/**/*.css', function(event) {
      if (isOnlyChange(event)) {
        browserSync.reload(event.path);
      } else {
        gulp.start('inject');
      }
    });

    gulp.watch([
      options.src + '/{app,components}/**/*.js',
      'bower_components/fielddb/fielddb.js'
    ], function(event) {
      if (isOnlyChange(event)) {
        gulp.start('build');
      } else {
        gulp.start('inject');
      }
    });

    gulp.watch(options.src + '/{app,components}/**/*.html', function(event) {
      browserSync.reload(event.path);
    });
  });
};
