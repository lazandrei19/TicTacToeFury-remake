var 	gulp = require('gulp'),
		mainBowerFiles = require('main-bower-files'),
		del = require('del'),
		$ = require('gulp-load-plugins')();

gulp.task('sass', function() {
	return 	gulp.src(["../_assets/styles/*.sass", "../_assets/styles/*.scss"])
			.pipe($.sourcemaps.init())
			.pipe($.sass())
			.pipe($.autoprefixer({
				browsers: ['> 1%', 'last 15 versions', 'Firefox ESR', 'Opera 12.1', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'],
				remove: true
			}))
			.pipe($.cssnano())
			.pipe($.sourcemaps.write("../_sourcemaps"))
			.pipe(gulp.dest("../_site/css/"))
			.pipe($.livereload())
			.pipe($.notify("Browser reloaded"));
});

gulp.task('clean:sourcemaps', function() {
	del('../_site/_sourcemaps/*.map', {force: true});
});

gulp.task('clean:js', function() {
	del('../_site/js/*.js', {force: true});
});

gulp.task('clean:libs', function() {
	del('../_site/js/lib/*.js', {force: true});
});

gulp.task('clean:dependencies', function() {
	del('../_assets/scripts/bower/*.js', {force: true});
});

gulp.task('clean:css', function() {
	del('../_site/css/*.css', {force: true});
});

gulp.task('clean', ['clean:sourcemaps', 'clean:libs', 'clean:dependencies', 'clean:js', 'clean:css']);

gulp.task('dependencies', function() {
	return 	gulp.src(mainBowerFiles({ paths: '..' }))
			.pipe(gulp.dest("../_assets/scripts/bower"))
			.pipe($.sourcemaps.init())
			.pipe($.concat('dependencies.js'))
			.pipe($.uglify())
			.pipe($.sourcemaps.write("../../_sourcemaps"))
			.pipe(gulp.dest("../_site/js/lib"));
});

gulp.task('javascript', function() {
	return 	gulp.src('../_assets/scripts/*.js')
			.pipe($.sourcemaps.init())
			.pipe($.jshint())
			.pipe($.jshint.reporter('jshint-stylish'))
			.pipe($.jshint.reporter('gulp-jshint-file-reporter', {
				filename: '../_assets/scripts/logs/js.log'
			}))
			.pipe($.uglify())
			.pipe($.sourcemaps.write("../_sourcemaps"))
			.pipe(gulp.dest('../_site/js'))
			.pipe($.livereload())
			.pipe($.notify("Browser reloaded"));
});

gulp.task('server:start', function() {
	$.developServer.listen( { path: './server.js' } );
});

gulp.task('server:restart', function() {
	$.developServer.restart;
	setTimeout(function() {
		$.livereload.reload();
	}, 500);
});

gulp.task('watch', ['server:start'], function() {
	$.livereload.listen();
	function restart(file) {
		$.developServer.changed( function(error) {
			if(!error) $.livereload.changed(file.path);
		});
	}

	gulp.watch(["../_assets/styles/**/*.sass", "../_assets/styles/**/*.scss"], ['sass']);
	gulp.watch("../_assets/scripts/*.js", ['javascript']);
	gulp.watch(['./server.js', '../_assets/routes/*.js', '../_assets/views/*.jade']).on('change', restart);
});

gulp.task('default', [
	'sass',
	'dependencies',
	'javascript',
	'watch'
]);

//no minify
gulp.task('sass:no-minify', function() {
	return 	gulp.src(["../_assets/styles/*.sass", "../_assets/styles/*.scss"])
			.pipe($.sourcemaps.init())
			.pipe($.sass())
			.pipe($.autoprefixer({
				browsers: ['> 1%', 'last 15 versions', 'Firefox ESR', 'Opera 12.1', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'],
				remove: true
			}))
			.pipe($.sourcemaps.write("../_sourcemaps"))
			.pipe(gulp.dest("../_site/css/"))
			.pipe($.livereload())
			.pipe($.notify("Browser reloaded"));
});

gulp.task('javascript:no-minify', function() {
	return 	gulp.src('../_assets/scripts/*.js')
			.pipe($.sourcemaps.init())
			.pipe($.jshint())
			.pipe($.jshint.reporter('jshint-stylish'))
			.pipe($.jshint.reporter('gulp-jshint-file-reporter', {
				filename: '../_assets/scripts/logs/js.log'
			}))
			.pipe($.sourcemaps.write("../_sourcemaps"))
			.pipe(gulp.dest('../_site/js'))
			.pipe($.livereload())
			.pipe($.notify("Browser reloaded"));
});

gulp.task('watch:no-minify', ['server:start'], function() {
	$.livereload.listen();
	function restart(file) {
		$.developServer.changed( function(error) {
			if(!error) $.livereload.changed(file.path);
		});
	}

	gulp.watch(["../_assets/styles/**/*.sass", "../_assets/styles/**/*.scss"], ['sass:no-minify']);
	gulp.watch("../_assets/scripts/*.js", ['javascript:no-minify']);
	gulp.watch(['./server.js', '../_assets/routes/*.js', '../_assets/views/*.jade']).on('change', restart);
});

gulp.task('no-minify', [
	'sass:no-minify',
	'dependencies',
	'javascript:no-minify',
	'watch:no-minify'
]);