const { reload } = require('browser-sync');
const {src, dest, series} = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const del = require('del');
const prefix = require('gulp-autoprefixer');
const clean =require('gulp-clean-css');
const terser =require('gulp-terser');
const minify = require('gulp-htmlmin');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');

// compile scss into css
function cssComp(){
    return src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(prefix('last 2 versions'))
    .pipe(clean())
    .pipe(dest('dist/css/'))
     //stream changes to all browser
    .pipe(browserSync.stream());
}

function watch(){
    browserSync.init({
        server: {
            baseDir: './'
        }
    })
    gulp.watch('./scss/**/*.scss', cssComp);
    gulp.watch('./*.html',htmlminify).on(browserSync,reload);
    gulp.watch('./css/**/*.css',clean).on(browserSync,reload);
    gulp.watch('./js/**/*.js',jsminify).on(browserSync,reload);
    gulp.watch('./img/**/*.{jpg,png,gif}',imgMin).on(browserSync,reload);
}
//delete dist folder
async function deleteFolder(){
    return del.sync['dist'];
}
//copy fonts

function copyFonts(){
   return src('./node_modules/font-awesome/fonts/**/*.{ttf,svg,eot,woff,woff2,}')
    .pipe(dest("./dist/fonts"));
}
//building dist folder
//minifying and compressing imgs
 function imgMin(){
   return src('img/*.{png,jpg,gif}')
		.pipe(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]))
		.pipe(dest('dist/img'));
 }
 //minifying js files
function jsminify(){
  return src('./js/*.js')
    .pipe(terser({
      keep_fnames: true,
      mangle: false
    }
    ))
    .pipe(dest('dist/js'));
}

function htmlminify(){
    return src('./*.html')
    .pipe(minify({ collapseWhitespace: true }))
    .pipe(dest('dist/'))
}
function usereference(){
     return src('./*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', terser()))
        .pipe(gulpif('*.css', clean()))
        .pipe(gulpif('*.html',minify({collapseWhitespace: true})))
        .pipe(dest('dist'));
}


 exports.cssComp =cssComp;
 exports.watch= watch;
 exports.deleteFolder= deleteFolder
 exports.copyFonts= copyFonts;
 exports.imgMin = imgMin
 exports.jsminify =jsminify
 exports.htmlminify = htmlminify
 exports.usereference = usereference
exports.build = series(deleteFolder,copyFonts,imgMin,usereference,watch);