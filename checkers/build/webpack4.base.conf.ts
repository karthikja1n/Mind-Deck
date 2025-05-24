/*
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */
import * as ts from 'typescript'
import * as path from 'path';

import * as webpack from 'webpack';
import { Configuration } from 'webpack';
import { assetsPath } from './config';
import _env from './utils/env-utils';
import 'colors'
import * as stylus from 'stylus';
import { HandleCSSLoader } from './utils/css-utils';
import * as merge from 'webpack-merge'
import { ANALYZE, ForkTsChecker } from './utils/plugins'
import { readFileSync } from 'fs';

const tsImportFactory = require('ts-import-plugin');

export const projectRoot = path.resolve(__dirname, '../');

export function resolve(...p) {
    return path.resolve(__dirname, '..', ...p)
}

export default (): Configuration => {
    let env                 = _env()
    let SharedCache         = {};
    let base: Configuration = <Configuration> {}
    const handleLoader      = new HandleCSSLoader({
        styleLoader: 'style-loader',
        sourceMap  : env.config.cssSourceMap,
        postcss    : {
            plugins: [
                // require('precss'),
                require('autoprefixer'),
                require('cssnext'),
                require('postcss-nested') // nesting like scss
                // require('postcss-nesting') // nesting like [CSS Nesting] specification
                //https://github.com/css-modules/postcss-modules
                //https://github.com/css-modules/postcss-modules-resolve-imports
            ]
        },
        cssLoader  : 'css-loader?importLoaders=1',
        cssModules : true,
        minimize   : env.prod,
        extract    : env.prod
    })

    const styleModuleLoaders = new HandleCSSLoader({
        styleLoader: 'style-loader',
        sourceMap  : env.config.cssSourceMap,
        postcss    : {
            plugins: [
                // require('precss'),
                require('autoprefixer'),
                require('cssnext'),
                require('postcss-nested') // nesting like scss
                // require('postcss-nesting') // nesting like [CSS Nesting] specification
                //https://github.com/css-modules/postcss-modules
                //https://github.com/css-modules/postcss-modules-resolve-imports
            ]
        },
        cssLoader  : 'css-loader?importLoaders=1',
        cssModules : true,
        minimize   : env.prod,
        extract    : env.prod
    });
    const styleLoaders       = new HandleCSSLoader({
        styleLoader: 'style-loader',
        sourceMap  : env.config.cssSourceMap,
        postcss    : {
            plugins: [
                // require('precss'),
                require('autoprefixer'),
                require('cssnext'),
                require('postcss-nested') // nesting like scss
                // require('postcss-nesting') // nesting like [CSS Nesting] specification
                //https://github.com/css-modules/postcss-modules
                //https://github.com/css-modules/postcss-modules-resolve-imports
            ]
        },
        cssLoader  : 'css-loader?importLoaders=1',
        cssModules : false,
        minimize   : env.prod,
        extract    : env.prod
    });

    const lessToJs       = require('less-vars-to-js');
    const themeVariables = lessToJs(readFileSync(resolve('src/.less/antd.variables.less'), 'utf8'));

    process[ 'noDeprecation' ] = true

    base = merge(base, {
        mode         : env.prod ? 'production' : 'development',
        cache        : env.config.sharedCache ? SharedCache : true,
        // context      : resolve('src'),
        devtool      : env.config.devtool,
        performance  : { hints: false },
        entry        : {},
        module       : {
            rules: [
                // handleLoader.css(),
                // handleLoader.less(/\.less$/, {
                //     javascriptEnabled: true,
                //     modifyVars       : env.prod ? themeVariables : {}
                // }, {
                //     cssModules: false
                // }),
                // handleLoader.sass(),
                // handleLoader.scss(),
                // handleLoader.styl(),
                // handleLoader.stylus(),

                styleLoaders.css([ /\.css$/, /\.module\.css$/ ]),
                styleLoaders.less([ /\.less$/, /\.module\.less$/ ], {
                    javascriptEnabled: true,
                    modifyVars       : env.prod ? themeVariables : {}
                }),
                styleLoaders.sass([ /\.sass$/, /\.module\.sass$/ ]),
                styleLoaders.scss([ /\.scss$/, /\.module\.scss$/ ]),
                styleLoaders.styl([ /\.styl$/, /\.module\.styl$/ ]),
                styleLoaders.stylus([ /\.stylus$/, /\.module\.stylus$/ ]),

                styleModuleLoaders.css(/\.module\.css$/),
                styleModuleLoaders.less(/\.module\.less$/),
                styleModuleLoaders.sass(/\.module\.sass$/),
                styleModuleLoaders.scss(/\.module\.scss$/),
                styleModuleLoaders.styl(/\.module\.styl$/),
                styleModuleLoaders.stylus(/\.module\.stylus$/)
            ]
        },
        output       : {
            path          : resolve(env.prod ? 'dist' : 'dev'),
            pathinfo      : true,
            publicPath    : env.config.publicPath,
            filename      : assetsPath + '/js/[name].js',
            chunkFilename : assetsPath + '/js/chunk.[name].js?[chunkhash]',
            library       : '[name]',
            umdNamedDefine: true,
            libraryTarget : 'window'
        },
        resolve      : {
            extensions: [ '.js', '.vue', '.json', '.ts', '.tsx', '.styl' ],
            modules   : [
                resolve('src'),
                resolve('node_modules')
            ],
            alias     : {
                src: resolve('src'),
                '@': resolve('src/components'),

                // '#': resolve('src/logic'),
                '#/game': resolve('src/logic/game/index.ts'),
                '#/ioc': resolve('src/logic/ioc/index.ts'),
                '#/router': resolve('src/logic/router/index.tsx'),
                '#/stores': resolve('src/logic/stores/index.ts'),
                '#/api': resolve('src/logic/api/index.ts'),

                // decorators: resolve('src/decorators.tsx'),
                // interfaces: resolve('src/interfaces.ts'),
                // utils     : resolve('src/utils'),

                // layouts: resolve('src/layouts'),
                // assets : resolve('src/assets'),
                // views  : resolve('src/views'),

                '../../theme.config$': resolve('src/semantic/theme.config')
                // interfaces: resolve('src/core/interfaces.ts'),
                // decorators: resolve('src/core/scripts/decorators.ts'),
                //
                // variables: resolve('src/themes/quasar.variables.styl'),
                //
                // codex         : resolve('src/core'),
                // 'vue$'       : 'vue/dist/vue.esm.js',
                // 'vuex$'      : 'vuex/dist/vuex.esm.js',
                // 'vue-router$': 'vue-router/dist/vue-router.esm.js'
            }
        },
        resolveLoader: {
            modules: [ resolve('node_modules'), resolve('src') ],
            alias  : {
                'scss-vars': 'sass-vars-to-js-loader'
            }
            // alias  : {
            //     'codex-pug-loader'               : resolve('build/loaders/codex-pug-loader'),
            //     'codex-awesome-typescript-loader': resolve('build/loaders/awesome-typescript-loader'),
            //     'ts-imports-loader'              : resolve('build/loaders/ts-imports-loader'),
            //     'codex-hot-vue-ts-loader'        : resolve('build/loaders/codex-hot-vue-ts-loader')
            // }
        },
        externals    : {
            // 'codex'     : 'codex_core',
            // 'codex_core': 'codex_core'
        },
        plugins      : [
            // new Checker(),
            // new Notifier({}),
            new webpack.DefinePlugin({
                'process.env': env.config.env,
                'DEV'        : env.dev,
                'PROD'       : env.prod,
                'ASYNC_START': env.config.async_start,
                'ASSETSPATH' : assetsPath
            }),
            new webpack.LoaderOptionsPlugin({
                options: {
                    context: resolve('src')
                },
                stylus : {
                    preferPathResolver: 'webpack',
                    default           : {
                        preferPathResolver: 'webpack',
                        use               : [ require('nib')() ],
                        define            : {
                            url: stylus.url({
                                paths: [
                                    resolve('src')
                                ]
                            })
                        }
                    }
                }
            })

        ],
        node         : { setImmediate: false, dgram: 'empty', fs: 'empty', net: 'empty', tls: 'empty', child_process: 'empty' }
    });

    if ( env.config.profile ) {
        base = merge(base, {
            profile    : true,
            performance: { hints: 'warning' },
            plugins    : [
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
                new ANALYZE.Stats('stats.json', {
                    chunkModules: true,
                    exclude     : [ /node_modules[\\\/]react/ ]
                }),
                new ANALYZE.Visualizer({ filename: './bundle-size-visualizer.html' })
            ]
        });
    }

    base = merge(base, {
        target : 'web',
        resolve: {
            // Fix webpack's default behavior to not load packages with jsnext:main module
            // (jsnext:main directs not usually distributable es6 format, but es6 sources)
            mainFields: [ 'module', 'browser', 'main' ],
            extensions: [
                '.mjs',
                '.web.ts',
                '.ts',
                '.web.tsx',
                '.tsx',
                '.web.js',
                '.js',
                '.json',
                '.web.jsx',
                '.jsx'
            ],
            alias     : {

                // Support React Native Web
                // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
                'react-native': 'react-native-web'
            }
        },
        plugins: [
            new ForkTsChecker({
                async   : false,
                watch   : projectRoot,
                tsconfig: resolve('tsconfig.json'),
                tslint  : false
            })
        ],
        module : {
            strictExportPresence: true,
            rules               : [
                {
                    test   : /\.(js|jsx|mjs)$/,
                    loader : require.resolve('source-map-loader'),
                    exclude: /node_modules/,
                    enforce: 'pre',
                    include: projectRoot
                },
                {
                    test   : /\.bundle\.js$/,
                    loader : 'bundle-loader',
                    options: { lazy: true }
                },
                {
                    test   : /\.(js|jsx|mjs)$/,
                    include: projectRoot,
                    loader : require.resolve('babel-loader'),
                    options: {

                        compact: true
                    }
                },

                {
                    test: /\.md$/,
                    use : [
                        { loader: 'html-loader' },
                        { loader: 'markdown-loader', options: { pedantic: true, renderer: require('marked').Renderer } }
                    ]
                },
                {
                    test   : /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loader : 'file-loader',
                    options: {
                        name      : '[name].[ext]',
                        outputPath: assetsPath + '/img/',
                        publicPath: '/' + assetsPath + '/img/'
                    }
                    // options: {
                    //     context   : resolve('src'),
                    //     name      : '[path][name].[ext]',
                    //     // outputPath: (url: string) => {
                    //     //     return url.replace('src/', '');
                    //     // },
                    //     publicPath: '/'
                    // }
                },
                {
                    test   : /\.(woff2?|woff|eot|ttf|otf)(\?.*)?$/,
                    loader : 'file-loader',
                    options: {
                        name      : '[name].[ext]',
                        outputPath: assetsPath + '/fonts/',
                        publicPath: '/' + assetsPath + '/fonts/'
                    }
                }
            ]
        }

    });


    return base
}
