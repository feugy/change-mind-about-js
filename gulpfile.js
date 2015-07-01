// for gulp-mocha to compile es6 test on the fly
require('babel-core/register');

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var rm = require('rimraf');

var paths = {
  in: 'src/**/*.js',
  out: 'build',
  test: 'test/**/*.js'
};

var test = function() {
  return gulp.src(paths.test, {read: false})
    .pipe(mocha({reporter: 'spec'}))
    .on('error', gutil.log);
};

var build = function () {
  return gulp.src(paths.in)
    .pipe(sourcemaps.init())
    .pipe(babel({highlightCode: false, optional: ['runtime']}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.out))
    .on('error', gutil.log);
};

gulp.task('clean', function(done) {
  rm(paths.out, done);
});
gulp.task('watch', function() {
  return gulp.watch(paths.in, build);
});
gulp.task('watch-test', function() {
  return gulp.watch([paths.in, paths.test], test);
});
gulp.task('test', ['default'], test);
gulp.task('default', ['clean'], build);
