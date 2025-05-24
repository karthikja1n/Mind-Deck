/**
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
import * as _ from 'lodash';
import { resolve } from './webpack4.base.conf';
import { Clean, Copy, Html, Webapp, WriteFile } from './utils/plugins'
import * as semanticData from './utils/semantic-data'

const log = require('debug')('webpack:dev')

const tsImportFactory = require('ts-import-plugin');

export const projectRoot       = path.resolve(__dirname, '../');

export default () => {
    let env        = _env()
    let baseConfig = require('./webpack4.base.conf').default() as Configuration;
    let fileHash   = getRandomId(7)
    let outpath    = (...parts) => path.resolve(baseConfig.output.path, ...parts)
    let seed       = {
        author          : 'Robin Radic',
        description     : 'Codex provides a flat-file documentation platform',
        default_locale  : 'en',
        manifest_version: 2,
        version         : '0.1',
        icons           : { 48: 'icon.png', 96: 'icon@2x.png' }
    };


    let dev = merge(_.cloneDeep(baseConfig), <Configuration> {
        // devtool  : 'eval',
        devtool: 'cheap-module-source-map',
        entry    : [

            // We ship a few polyfills by default:
            require.resolve('babel-polyfill'),
            require.resolve('./utils/polyfills'),
            // Include an alternative client for WebpackDevServer. A client's job is to
            // connect to WebpackDevServer by a socket and get notified about changes.
            // When you save a file, the client will either apply hot updates (in case
            // of CSS changes), or refresh the page (in case of JS changes). When you
            // make a syntax error, this client will display a syntax error overlay.
            // Note: instead of the default WebpackDevServer client, we use a custom one
            // to bring better experience for Create React App users. You can replace
            // the line below with these two lines if you prefer the stock client:
            // require.resolve('webpack-dev-server/client') + '?/',
            // require.resolve('webpack/hot/dev-server'),
            'react-hot-loader/patch',
            //
            `webpack-dev-server/client?http://localhost:${env.config.port}`,
            'webpack/hot/only-dev-server',

            // require.resolve('react-dev-utils/webpackHotDevClient'),
            // Finally, this is your app's code:
            require.resolve('./utils/fix-mobx-array.ts'),
            resolve('src/entry/dev/index.tsx')
        ],
        // entry    : {
        //     'app': `./src/index.tsx`
        // },
        // output   : {
        //     filename     : 'js/[name].js',
        //     chunkFilename: 'js/[name].chunk.[chunkhash].js',
        //     publicPath   : '/'
        // },
        externals: {},
        stats: 'minimal',
        module   : {
            rules: [

                // Compile .tsx?
                {
                    test   : /\.(ts|tsx)$/,
                    include: projectRoot,
                    exclude: [/node_modules/, resolve('src/stories')],
                    use    : [
                        {
                            loader : 'babel-loader',
                            options: {
                                'presets': [
                                    // [ 'latest', { 'es2015': { 'modules': false } } ],
                                    'env',
                                    'react-app'
                                ],
                                'plugins': [
                                    'react-hot-loader/babel'
                                ]
                            }
                        },
                        {
                            loader : require.resolve('ts-loader'),
                            options: {
                                // disable type checker - we will use it in fork plugin
                                transpileOnly        : true,
                                getCustomTransformers: () => ({
                                    before: [ tsImportFactory([
                                        {
                                            // semantic: true,
                                            libraryName: 'semantic-ui-react',
                                            libraryDirectory: (importName) => {
                                                if(Object.keys(semanticData.nameLocations).includes(importName)) {
                                                    return path.join('dist/es', semanticData.nameLocations[ importName ]);
                                                } else {
                                                    return 'dist/es'
                                                }
                                            }
                                        },
                                        {
                                            libraryName     : 'antd',
                                            libraryDirectory: 'es',
                                            style           : env.prod // in dev we load the whole less file, so we can easily fiddle around with our own theme variables files
                                        }, {
                                            style                  : false,
                                            libraryName            : 'lodash',
                                            libraryDirectory       : null,
                                            camel2DashComponentName: false
                                        }
                                    ]) ]
                                }),
                                compilerOptions      : {
                                    module: 'esnext',
                                    target: 'es6'
                                }
                            }
                        }
                    ]
                },
            ]
        },
        resolve  : {
            alias: {}
        },
        plugins  : [
            new Clean([
                resolve('monitor/stats.dev.json'),
                path.resolve(baseConfig.output.path, 'assets'),
                path.resolve(baseConfig.output.path, 'js'),
                path.resolve(baseConfig.output.path, '*.hot-update.*')
            ], { root: resolve(__dirname, '..'), verbose: true }),
            new Html({
                filename: 'index.html',
                template: 'src/entry/dev/index.dev.html',
                inject  : true,
                env     : baseConfig.mode,
                chunksSortMode: 'none',
                fileHash
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
            }),
            new WriteFile({ useHashIndex: false }),
            new Copy([
                { from: resolve('src/assets'), to: outpath('assets') }
            ])
        ]
    })
    return dev;
}
