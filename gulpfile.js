var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    jshint      = require('gulp-jshint')
    sourcemaps  = require('gulp-sourcemaps'),
    concat      = require('gulp-concat'),
    babel       = require('gulp-babel'),
    data        = require('gulp-data'),
    stylus      = require('gulp-stylus'),
    htmlmin  = require('gulp-htmlmin');

gulp.task('default', ['build-js', 'build-stylus', 'build-views', 'watch-js', 'watch-stylus', 'watch-views']);

gulp.task('jshint', () => {
  return gulp.src('client/angular/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch-js', () => {
  gulp.watch('client/angular/**/*.js', ['build-js']);
});

gulp.task('watch-stylus', () => {
  gulp.watch('client/assets/css/*.styl', ['build-stylus']);
});

gulp.task('watch-views', () => {
  gulp.watch('client/angular/views/**/*.js', ['build-views']);
});

gulp.task('build-stylus', () => {
  return gulp.src('client/assets/css/*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css'));
});

gulp.task('build-js', () => {
  return gulp.src(['client/angular/**/*.js', '!client/angular/views/*'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/javascript'));
});

gulp.task('build-views', () => {
  return gulp.src(['client/*.html', 'client/angular/views/**/*.html'])
    .pipe(sourcemaps.init())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/html'))
});
