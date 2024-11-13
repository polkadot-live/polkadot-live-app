// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import gulp from 'gulp';
import { createProject } from 'gulp-typescript';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';

const { series } = gulp;
const sass = gulpSass(dartSass);

/** Create a project outside of the task. */
const tsProject = createProject({
  declaration: true,
});

/** Build typescript as ESM modules. */
function buildEsm() {
  return gulp
    .src('src/**/*.ts?(x)')
    .pipe(
      tsProject('tsconfig.json', {
        module: 'esnext',
        target: 'esnext',
        removeComments: true,
      })
    )
    .pipe(gulp.dest('dist/mjs'));
}

/** Build typescript as CJS modules. */
function buildCjs() {
  return gulp
    .src('src/**/*.ts?(x)')
    .pipe(
      tsProject('tsconfig.json', {
        module: 'commonjs',
        target: 'es2015',
        removeComments: true,
      })
    )
    .pipe(gulp.dest('dist/cjs'));
}

/** Copy SCSS and SVGs as raw components. */
function copyFiles() {
  return gulp
    .src('src/**/*.svg')
    .pipe(gulp.src('src/**/*.scss'))
    .pipe(gulp.dest('dist/mjs'))
    .pipe(gulp.dest('dist/cjs'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildStyles() {
  return gulp
    .src('src/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('dist/mjs'))
    .pipe(gulp.dest('dist/cjs'));
}

export default series(buildEsm, buildCjs, copyFiles);
