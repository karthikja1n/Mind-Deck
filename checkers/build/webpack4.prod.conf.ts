/*
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */

import { assetsPath } from './config';
import { Configuration } from 'webpack';
import * as path from 'path';
import * as merge from 'webpack-merge';
import { getRandomId } from '@radic/util';
import _env from './utils/env-utils';
// noinspection ES6UnusedImports
import { HandleCSSLoader } from './utils/css-utils';
import { resolve } from './webpack4.base.conf';
// noinspection ES6UnusedImports
// noinspection ES6UnusedImports
import * as cssnano from 'cssnano';
// noinspection ES6UnusedImports
import { ANALYZE, Clean, Copy, Html, Manifest, MiniCssExtract, OptimizeCss, UglifyJs, Webapp, WriteFile } from './utils/plugins'
import webpackStats, { STATS_ALL_FALSE, STATS_EXCLUDE_FONTS_IMAGES } from './utils/stats';
import * as semanticData from './utils/semantic-data';

const tsImportFactory = require('ts-import-plugin');

export const projectRoot = path.resolve(__dirname, '../');

const log = require('debug')('webpack:prod')
export default () => {
    let env               = _env(),
        baseWebpackConfig = require('./webpack4.base.conf').default() as Configuration,
        fileHash          = getRandomId(7),
        addonCount        = 0,
        seed              = {
            author          : 'Robin Radic',
            description     : 'Codex provides a flat-file documentation platform',
            default_locale  : 'en',
            manifest_version: 2,
            version         : '0.1',
            icons           : { 48: 'icon.png', 96: 'icon@2x.png' }
        };

    let prod   = merge(baseWebpackConfig, {

        entry : [
            require.resolve('./utils/polyfills'),
            require.resolve('./utils/fix-mobx-array.ts'),
            resolve('src/entry/prod/index.tsx')
        ],
        mode  : 'production',
        module: {
            rules: [
                {
                    test   : /\.tsx?$/,
                    loader : 'ts-loader',
                    options: {
                        // disable type checker - we will use it in fork plugin
                        transpileOnly        : true,
                        getCustomTransformers: () => ({
                            before: [ tsImportFactory([
                                { libraryName: 'semantic-ui-react', libraryDirectory: (importName) => path.join('dist/es', semanticData.nameLocations[ importName ]) },
                                { libraryName: 'antd', libraryDirectory: 'es', style: true },
                                { style: false, libraryName: 'lodash', libraryDirectory: null, camel2DashComponentName: false }
                            ]) ]
                        }),
                        compilerOptions      : { module: 'esnext', target: 'es5' }
                    }
                }
            ]
        },

        plugins     : [
            new Clean([
                resolve(`monitor/stats.prod.json`),
                path.resolve(baseWebpackConfig.output.path)
            ], { root: resolve(), verbose: true }),
            new Html({
                filename      : 'index.html',
                template      : 'src/entry/prod/index.prod.html',
                inject        : 'head',
                env           : env.name,
                chunksSortMode: 'none',
                fileHash
            }),
            new WriteFile({ useHashIndex: false }),
            new ANALYZE.BundleSize('./analyze.txt'),
            // new analyze.Bundle({
            //     analyzerMode: 'static',
            //     defaultSizes: 'parsed',
            //     logLevel    : 'warn'
            // }),
            new Manifest({ writeToFileEmit: true, seed: seed }),
            new MiniCssExtract({
                filename     : assetsPath + '/css/[name]_[id].css?[hash]',
                chunkFilename: assetsPath + '/css/[name]_[id].css?[chunkhash]'
            }),
            new OptimizeCss({
                assetNameRegExp    : /\.css$/g,
                cssProcessor       : require('cssnano'),
                cssProcessorOptions: { discardComments: { removeAll: true } },
                canPrint           : true
            }),
            new Webapp({
                logo           : resolve('src/assets/img/logo.svg'),
                prefix         : assetsPath + '/img/favicon/',
                emitStats      : false,
                statsFilename  : 'iconstats-[hash].json',
                persistentCache: true,
                inject         : true,
                background     : '#fff',
                title          : 'Codex',
                icons          : {
                    android     : true,
                    appleIcon   : true,
                    appleStartup: true,
                    coast       : false,
                    favicons    : true,
                    firefox     : true,
                    opengraph   : false,
                    twitter     : true,
                    yandex      : false,
                    windows     : true
                }
            })
        ],
        optimization: {
            /**
             * Enabled in development mode. Elsewise disabled.
             * Instead of numeric ids, give modules useful names.
             */
            namedModules          : true,
            /**
             * Enabled in development mode. Elsewise disabled.
             * Instead of numeric ids, give chunks useful names.
             */
            namedChunks           : true,
            /**
             * Always enabled.
             * Empty chunks are removed. This reduces load in filesystem and results in faster builds.
             */
            removeEmptyChunks     : true,
            /**
             * Always enabled.
             * Modules are removed from chunks when they are already available in all parent chunk groups.
             * This reduces asset size. Smaller assets also result in faster builds since less code generation has to be performed.
             */
            removeAvailableModules: true,
            /**
             * Always enabled.
             * Equal chunks are merged. This results in less code generation and faster builds.
             */
            mergeDuplicateChunks  : true,
            /**
             * Enabled in production mode. Elsewise disabled.
             * Chunks which are subsets of other chunks are determined and flagged in a way that subsets don’t have to be loaded when the bigger chunk has been loaded.
             */
            flagIncludedChunks    : true,
            /**
             * Enabled in production mode. Elsewise disabled.
             * Give more often used ids smaller (shorter) values.
             */
            occurrenceOrder       : true,
            /**
             * Always enabled.
             * Determine exports for each module when possible. This information is used by other optimizations or code generation.
             * I. e. to generate more efficient code for export * from.
             */
            providedExports       : true,
            /**
             * Enabled in production mode. Elsewise disabled.
             * Determine used exports for each module. This depends on optimization.providedExports.
             * This information is used by other optimizations or code generation.
             * I. e. exports are not generated for unused exports, export names are mangled to single char identifiers when all usages are compatible.
             * DCE in minimizers will benefit from this and can remove unused exports.
             */
            usedExports           : true,
            /**
             * Enabled in production mode. Elsewise disabled.
             * Recognise the sideEffects flag in package.json or rules to eliminate modules.
             * This depends on optimization.providedExports and optimization.usedExports.
             * These dependencies have a cost, but eliminating modules has positive impact on performance because of less code generation.
             * It depends on your codebase. Try it for possible performance wins.
             */
            sideEffects           : true,
            /**
             * Enabled in production mode. Elsewise disabled.
             * Tries to find segments of the module graph which can be safely concatenated into a single module.
             * Depends on optimization.providedExports and optimization.usedExports.
             */
            concatenateModules    : true,

            /**
             * Always enabled.
             * Create a separate chunk for the webpack runtime code and chunk manifest. This chunk should be inlined into the HTML
             */
            runtimeChunk: true,

            minimize: true,

            minimizer: [
                new UglifyJs({
                    test         : /\.js($|\?)/i,
                    parallel     : true,
                    sourceMap    : env.config.jsSourceMap,
                    uglifyOptions: {
                        ecma    : 8,
                        beautify: false,
                        output  : {
                            comments: false,
                            beautify: false
                        },
                        ie8     : false
                    }
                })
            ]
        }
    })
    prod.stats = webpackStats(STATS_ALL_FALSE, STATS_EXCLUDE_FONTS_IMAGES);

    return prod;
}
