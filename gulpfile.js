var gulp = require('gulp');
//var sass = require('gulp-sass');
//var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var	reload = browserSync.reload;
//var eslint = require('gulp-eslint');
//var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
	console.log('Hello, Gulp!');
});

gulp.task('default', ['scripts', 'html', 'style', 'browser-sync', 'watch']);

gulp.task('scripts', function() {
	gulp.src(['app/scripts/**/*.js', '!app/scripts/**/*.min.js'])
	.pipe(rename({suffix: '.min'}))
	.pipe(uglify())
	.pipe(gulp.dest('app/scripts'))
	.pipe(reload({stream:true}));
});
gulp.task('html', function() {
	gulp.src('./**/*.html')
	.pipe(reload({stream:true}));
});

gulp.task('style', function() {
	gulp.src('app/styles/**/*.css')
	.pipe(reload({stream:true}));
});

gulp.task('browser-sync', function(){
	browserSync({
		server:{
			baseDir: "./"
		}
	});
});

gulp.task('watch', function(){
	gulp.watch('app/scripts/**/*.js', ['scripts']);
	gulp.watch('**/*.html', ['html']);
	gulp.watch('app/styles/**/*.css', ['style']);
});
/////////////////////////////////////////////

