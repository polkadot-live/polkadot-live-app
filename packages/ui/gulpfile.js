// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import gulp from 'gulp';
import ts from 'gulp-typescript';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import clean from 'gulp-clean';
import rename from 'gulp-rename';

const { series } = gulp;
const sass = gulpSass(dartSass);

// Create a project outside of the task.
const tsProject = ts.createProject({
  declaration: true,
  module: 'esnext',
  target: 'esnext',
});

// Paths.
const paths = {
  src: 'src/**/*.ts',
  dist: 'dist',
};

// Clean dist directory.
function cleanDist() {
  return gulp.src(paths.dist, { read: false, allowEmpty: true }).pipe(clean());
}

// Build .ts as .js ESM modules.
function buildEsmTs() {
  return gulp
    .src(paths.src)
    .pipe(tsProject('tsconfig.json'))
    .pipe(gulp.dest('dist/mjs'));
}

// Build .tsx as .jsx ESM modules.
function buildEsmTsx() {
  return gulp
    .src('src/**/*.tsx')
    .pipe(tsProject('tsconfig.json'))
    .pipe(
      rename(function (path) {
        if (!path.basename.endsWith('.d')) {
          path.extname = '.jsx';
        }
      })
    )
    .pipe(gulp.dest('dist/mjs'));
}

// Copy raw components.
function copyFiles() {
  return gulp
    .src('src/**/*.svg')
    .pipe(gulp.src('src/**/*.scss'))
    .pipe(gulp.dest('dist/mjs'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildStyles() {
  return gulp
    .src('src/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('dist/mjs'));
}

export default series(cleanDist, buildEsmTs, buildEsmTsx, copyFiles);
