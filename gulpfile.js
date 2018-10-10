"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var run = require("run-sequence");
var htmlmin = require("gulp-htmlmin");
var minifyjs = require("gulp-js-minify");
var server = require("browser-sync").create();

var paths = {
  build: "./build/",
  js: "./source/js/"
};

gulp.task("style", function() {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/js/**/*.js", ["scripts"]);
  gulp.watch("source/*.html", ["html"]).on("change", server.reload);
});

gulp.task("scripts", function() {
  gulp.src([paths.js + "**/*.js", paths.js + "**/*.css"])
    .pipe(gulp.dest(paths.build + "js"))
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
      ]))
      .pipe(gulp.dest("build/img"));
});


gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
     }))
      .pipe(rename("sprite.svg"))
      .pipe(gulp.dest("build/img"));
});

gulp.task("clean", function () {
 return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/css/**/*.css"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "style",
    "scripts",
    "images",
    "sprite",
    "html",
    done
  );
});
