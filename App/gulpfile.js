var gulp = require('gulp');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var durandal = require('gulp-durandal');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var server = require('gulp-server-livereload');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('copy', function() {
    gulp.src('auth-complete*')
        .pipe(gulp.dest('dist'));
});

gulp.task('js-watcher', function() {
    gulp.src('./app/**/*.js')
        .pipe(connect.reload());
});

gulp.task('less-watcher', function() {
    gulp.src('./styles/**/*.less')
        .pipe(connect.reload());
});

gulp.task('html-watcher', function() {
    gulp.src('./app/**/*.html')
        .pipe(connect.reload());
});

gulp.task('watch-all', ['analyze'], function(){
    gulp.watch(['./app/**/*.html'], ['html-watcher']);
    gulp.watch(['./app/**/*.js'], ['analyze', 'js-watcher']);
    gulp.watch(['./styles/**/*.less'], ['less', 'less-watcher']);
});

gulp.task('connect', ['analyze'], function() {
    connect.server({
        livereload: true,
        port: 1056
    });
});

gulp.task('durandal', function () {
    durandal({
        almond: true,
        minify: true,
        extraModules: ['plugins/http']
    }).pipe(gulp.dest('dist'));
});

gulp.task('analyze', function () {
    return gulp.src(['app/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

var lessIncludes = path.join(__dirname, 'less', 'modules');

gulp.task('less', function () {
    return gulp.src('styles/core.less')
      .pipe(sourcemaps.init())
      .pipe(less({ paths: lessIncludes }))
      .pipe(sourcemaps.write())
      .pipe(minifyCSS())
      .pipe(concat('styles.css'))
      .pipe(gulp.dest('dist'));
});

gulp.task('default', [ 'analyze', 'less', 'connect', 'watch-all']);

gulp.task('build', ['analyze', 'less', 'durandal', 'copy']);
