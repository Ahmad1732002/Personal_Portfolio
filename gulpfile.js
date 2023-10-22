//This file is needed to automatically compile sass code whenever file changes
import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';

gulp.task('sass', function() {
  return gulp.src('path/to/scss/files/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('path/to/css/files'));
});

gulp.task('watch', function() {
    gulp.watch('path/to/scss/files/**/*.scss', ['sass']);
  });