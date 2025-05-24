/**
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */
import * as express from 'express';
// noinspection ES6UnusedImports
import * as path from 'path';

import * as webpack from 'webpack';
import { Configuration } from 'webpack';
import * as merge from 'webpack-merge';
// noinspection ES6UnusedImports
import opn from 'opn';
// noinspection ES6UnusedImports
import * as webpack_dev_middleware from 'webpack-dev-middleware';
// noinspection ES6UnusedImports
import * as webpack_hot_middleware from 'webpack-hot-middleware';
// noinspection ES6UnusedImports
import * as connect_history_api_fallback from 'connect-history-api-fallback';
import * as debug from 'debug';
import { assetsPath } from './config'
import _env from './utils/env-utils';
import { writeFileSizes, writeStatsJson } from './utils/utils';
import { ANALYZE } from './utils/plugins';

type LOG = debug.IDebugger & { [key: string]: debug.IDebugger }
let log: LOG = debug('task:serve') as LOG
log.history  = debug('task:serve:history')
log.hot      = debug('task:serve:host')

let isChanging = false

export const start = (callback?: (err: Error, stats?: webpack.Stats) => void) => {
    process.env.NODE_ENV            = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
    let env                         = _env()
    const baseConfig: Configuration = require('./webpack4.base.conf').default()
    const devConfig: Configuration  = require('./webpack4.dev.conf').default()
    const prodConfig: Configuration = require('./webpack4.prod.conf').default()
    let config: Configuration       = env.prod ? prodConfig : devConfig;

    const contentPath = (...parts) => path.resolve(baseConfig.output.path, assetsPath, ...parts)
    const app         = express(),
          port        = env.config.port,
          hostname    = 'localhost',
          uri         = `http://${hostname}:${port}`;

    config.plugins.push(
        new ANALYZE.Bundle({ analyzerMode: 'static', defaultSizes: 'gzip', generateStatsFile: true }),
        new ANALYZE.Visualizer({ filename: './bundle-size-visualizer.html' }),
        new ANALYZE.BundleSize(`./bundle-size-report-${require('moment')().format('ddd@hh:mm')}.txt`)
    )
    if ( env.config.profile ) {
        console.log('Profiling enabled')
        config = merge(config, {
            profile: true,
            plugins: [
                new ANALYZE.DuplicatePackageChecker({
                    // Also show module that is requiring each duplicate package (default: false)
                    verbose  : true,
                    // Emit errors instead of warnings (default: false)
                    emitError: true,
                    // Show help message if duplicate packages are found (default: true)
                    showHelp : true,
                    // Warn also if major versions differ (default: true)
                    strict   : true,
                    /**
                     * Exclude instances of packages from the results.
                     * If all instances of a package are excluded, or all instances except one,
                     * then the package is no longer considered duplicated and won't be emitted as a warning/error.
                     * @param {Object} instance
                     * @param {string} instance.name The name of the package
                     * @param {string} instance.version The version of the package
                     * @param {string} instance.path Absolute path to the package
                     * @param {?string} instance.issuer Absolute path to the module that requested the package
                     * @returns {boolean} true to exclude the instance, false otherwise
                     */
                    exclude(instance) {
                        return instance.name === 'fbjs';
                    }
                }),
                new ANALYZE.Stats('stats.json', <webpack.Stats.ToJsonOptions> {
                    assets         : true,
                    cached         : true,
                    cachedAssets   : true,
                    children       : true,
                    chunkModules   : true,
                    chunkOrigins   : true,
                    chunks         : true,
                    depth          : true,
                    entrypoints    : true,
                    env            : true,
                    errors         : true,
                    errorDetails   : true,
                    hash           : true,
                    modules        : true,
                    moduleTrace    : true,
                    publicPath     : true,
                    reasons        : true,
                    source         : true,
                    timings        : true,
                    version        : true,
                    warnings       : true,
                    usedExports    : true,
                    performance    : true,
                    providedExports: true
                })
            ],
            optimization: {
                namedModules:true,
                namedChunks:true,
                concatenateModules: false
            }
        })
    }

    let compiler: webpack.Compiler | webpack.MultiCompiler,
        handler: webpack.Compiler.Handler = (err, stats) => {
            if ( err ) {
                console.log(err)
                if ( callback )
                    callback(err);
                process.exit(1)
            }

            process.stdout.write(stats.toString({
                colors      : true,
                modules     : false,
                children    : false,
                chunks      : false,
                chunkModules: false,
                chunkOrigins: true
            }) + '\n')

            writeStatsJson(stats, baseConfig.output.path);
            process.stdout.write(writeFileSizes(stats, baseConfig.output.path, 'short'));

            if ( callback )
                callback(null, stats);
        }

    if ( env.prod ) {
        config.watch = env.config.watch
        compiler     = webpack(config);
    }

    if ( env.dev ) {
        compiler = webpack(config);
    }

    if ( env.config.watch ) {
        let watching = compiler.watch({}, handler)
    } else {
        compiler.run(handler)
    }
}
export default start
