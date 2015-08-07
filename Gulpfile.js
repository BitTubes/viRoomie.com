/* jshint node:true */
"use strict";
/**
 * Created by Meki on 2015.02.25..
 */

/* Get dependencies */
var gulp = require('gulp'),
    // sass = require('gulp-ruby-sass'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache');
var run = require('gulp-run');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
// var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
    // del = require('del');

/* Set paths */

var paths = {
    /* Source paths */
    styles: ['assets/sass/main.scss'],
    scripts: [
        'assets/bower_components/jquery/dist/jquery.js',
        'assets/bower_components/jquery.easing/js/jquery.easing.js',
        'assets/bower_components/bootstrap/dist/js/bootstrap.js',
        'assets/js/grayscale.js'
    ],
    images: ['assets/images/**/*'],
    fonts: [
        'assets/bower_components/bootstrap/fonts/*',
        'assets/bower_components/font-awesome/fonts/*'
    ],

    /* Output paths */
    stylesOutput: 'styles',
    scriptsOutput: 'js',
    imagesOutput: 'images',
    fontsOutput: 'fonts'
};

/* Tasks */
gulp.task('styles-debug', function() {
    return gulp.src(paths.styles)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('./maps'))
        // .pipe(sourcemaps.write())
    // return sass(paths.styles,{ sourcemap:true })
    //     .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.stylesOutput))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.stylesOutput))
        .pipe(livereload())
        .pipe(notify({ message: 'Styles Debug task complete' }));
});
gulp.task('scripts-debug', function() {
    return gulp.src(paths.scripts)
        // .pipe(jshint('.jshintrc'))
        // .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.scriptsOutput))
        .pipe(livereload())
        .pipe(notify({ message: 'Scripts-debug task complete' }));
});
// var tinylr;
// gulp.task('livereload', function() {
//   tinylr = require('tiny-lr')();
//   tinylr.listen(35729);
// });
gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(express.static(__dirname));
  app.listen(3000);
});
// function notifyLiveReload(event) {
//   var fileName = require('path').relative(__dirname, event.path);

//   tinylr.changed({
//     body: {
//       files: [fileName]
//     }
//   });
// }
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('assets/js/**/*.js', ['scripts-debug']);
    gulp.watch('assets/sass/**/*.scss', ['styles-debug']);
    // gulp.watch('*.html', notifyLiveReload);
    // gulp.watch('styles/*.css', notifyLiveReload);
    // gulp.watch('js/*.js', notifyLiveReload);
});


gulp.task('styles', function() {
    return gulp.src(paths.styles)
        .pipe(sass().on('error', sass.logError))
    // return sass(paths.styles,{ style: 'expanded' })
        .pipe(gulp.dest(paths.stylesOutput))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.stylesOutput))
        .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        // .pipe(jshint('.jshintrc'))
        // .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.scriptsOutput))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(paths.scriptsOutput))
        .pipe(notify({ message: 'Scripts task complete' }));
});


gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest(paths.imagesOutput))
        .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('fonts', function() {
    return gulp.src(paths.fonts)
    .pipe(gulp.dest(paths.fontsOutput))
    .pipe(notify({ message: 'Fonts task complete', onLast: true }));
});

gulp.task('clean', function(cb) {
    // del([paths.stylesOutput, paths.scriptsOutput, paths.imagesOutput, paths.fontsOutput], cb);
});

gulp.task('deploy', function() {
    gulp.src('./fonts/**/*')
        .pipe(gulp.dest('./public/fonts'));
    gulp.src('./images/**/*')
        .pipe(gulp.dest('./public/images'));
    gulp.src('./js/main.min.js')
        .pipe(gulp.dest('./public/js'));
    gulp.src('./styles/main.min.css')
        .pipe(gulp.dest('./public/styles'));
    gulp.src('./error.html')
        .pipe(gulp.dest('./public'));
    gulp.src('./index.html')
        .pipe(usemin({
            css: [minifycss(), 'concat'],
            html: [minifyHtml({empty: true})],
            js: [uglify(), rev()]
        }))
        .pipe(gulp.dest('./public'));
        // .pipe(gulp.dest('build/'));
    gulp.src('./favicon.ico')
        .pipe(gulp.dest('./public'));
    run('aws s3 sync public/ s3://viroomie.com').exec();
});

// gulp.task('default', ['clean'], function() {
gulp.task('default', function() {
    gulp.start('styles', 'scripts', 'images', 'fonts');
});

// gulp.task('debug', ['styles-debug', 'scripts-debug', 'fonts', 'images', 'express', 'livereload', 'watch'], function() {
gulp.task('debug', ['express', 'watch'], function() {

});