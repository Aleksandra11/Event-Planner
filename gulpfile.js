var gulp = require('gulp');
//var sass = require('gulp-sass');
//var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var	reload = browserSync.reload;
//var eslint = require('gulp-eslint');
//var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var mincss = require('gulp-cssmin');
var del = require('del');

gulp.task('default', ['scripts', 'html', 'style', 'serve', 'watch']);

gulp.task('scripts', function() {
	gulp.src(['app/scripts/**/*.js', '!app/scripts/**/*.min.js'])
	.pipe(plumber())
	.pipe(rename({suffix: '.min'}))
	.pipe(uglify())
	.pipe(gulp.dest('app/scripts'))
	.pipe(reload({stream:true}));
});

//gulp.task('script-gh', function() {
//	gulp.src(['public/**/*.js', '!public/**/*.min.js'])
//	.pipe(plumber())
//	.pipe(rename({suffix: '.min'}))
//	.pipe(uglify())
//	.pipe(gulp.dest('public'))
//	.pipe(reload({stream:true}));
//});

gulp.task('html', function() {
	gulp.src('app/**/*.html')
	.pipe(reload({stream:true}));
});

gulp.task('style', function() {
	gulp.src(['app/styles/**/*.css', '!app/styles/**/*.min.css'])
	.pipe(rename({suffix: '.min'}))
	.pipe(mincss())
	.pipe(gulp.dest('app/styles'))
	.pipe(reload({stream:true}));
});

///////////////////////////////////////
// Build Tasks
///////////////////////////////////////
gulp.task('build:cleanfolder', function() {
	del([
		'dist/**'
		]);
});

gulp.task('build:copy', ['build:cleanfolder'], function() {
	return gulp.src('app/**/*/')
	.pipe(gulp.dest('dist/'));
});

//task to remove unwanted build files
gulp.task('build:remove', ['build:copy'], function() {
	del([
		'dist/styles/!(*.min.css)',
		'dist/scripts/!(*.min.js)'
	]);
});

gulp.task('build', ['build:copy', 'build:remove']);

//to run build server for testing final app
gulp.task('serve:dist', function(){
	browserSync({
		server:{
			baseDir: "./dist/"
		}
	});
});

///////////////////////////////////////
// Serve (browser-sync) Tasks
///////////////////////////////////////
gulp.task('serve', function(){
	browserSync({
		server:{
			baseDir: "./app/"
		}
	});
});

gulp.task('watch', function(){
	gulp.watch('app/scripts/**/*.js', ['scripts']);
	gulp.watch('app/**/*.html', ['html']);
	gulp.watch('app/styles/**/*.css', ['style']);
});
/////////////////////////////////////////////

