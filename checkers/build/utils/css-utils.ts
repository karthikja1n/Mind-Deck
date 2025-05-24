import * as autoprefixer from 'autoprefixer';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
// noinspection ES6UnusedImports

const gzipSize = require('gzip-size');
const filesize = require('filesize');

declare function _purify(content?: string | string[], css?: string | string[], options?: { output?: string, minify?: boolean, info?: boolean, rejected?: boolean }, cb?: (purifiedCSS: string) => void)
declare function _purify(content?: string | string[], css?: string | string[], cb?: (purifiedCSS: string) => void)

export const postcss = [ autoprefixer() ]


export type HandleCSSLoaderTestType = RegExp | RegExp[] | [ RegExp, RegExp ] | [ RegExp[], RegExp ] | [ RegExp, RegExp[] ] | [ RegExp[], RegExp[] ]

export class HandleCSSLoader {
    styleLoader: string
    cssLoader: string
    extractLoader: string
    postcssOptions: object | boolean
    sourceMap: boolean
    extract: boolean
    minimize: boolean
    cssModules: boolean

    /**
     * @param {Object} options
     * @param {string} [options.styleLoader='style-loader'] style-loader name or path.
     * @param {string} [options.cssLoader='css-loader'] css-loader name or path.
     * @param {string} [options.extractLoader='mini-css-extract-plugin/dist/loader'] loader path of mini-css-extract-plugin.
     * @param {Object|boolean} [options.postcss=undefined] Disable or set options for  postcss-loader.
     * @param {boolean} [options.sourceMap=undefined] Enable sourcemaps.
     * @param {boolean} [options.extract=undefined] Enable CSS extraction.
     * @param {boolean} [options.minimize=undefined] Enable CSS minimization.
     * @param {boolean} [options.cssModules=undefined]  Enable CSS modules.
     */
    constructor({
                    styleLoader = 'style-loader',
                    cssLoader = 'css-loader',
                    postcss = false,
                    sourceMap = false,
                    extract = false,
                    minimize = false,
                    cssModules = false,
                    extractLoader = 'mini-css-extract-plugin/dist/loader'
                }: {
        styleLoader?: string
        cssLoader?: string
        extractLoader?: string
        postcss?: object | boolean
        sourceMap?: boolean
        extract?: boolean
        minimize?: boolean
        cssModules?: boolean
    } = {}) {
        this.styleLoader    = styleLoader
        this.cssLoader      = cssLoader
        this.postcssOptions = postcss
        this.sourceMap      = sourceMap
        this.extract        = extract
        this.minimize       = minimize
        this.cssModules     = cssModules
        this.extractLoader  = extractLoader
        if ( extract && ! this.extractLoader ) {
            this.extractLoader = require.resolve('mini-css-extract-plugin/dist/loader')
        }
    }

    /**
     * Set value of instance option
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        this[ key ] = value
    }

    /**
     * Get the rule for specific loader
     * @param  {RegExp} [test=undefined] File matcher
     * @param  {RegExp} [loader=undefined] Loader name or path to it
     * @param  {any} [options=undefined] Options for relevant loader
     * @return {Object} {@link https://webpack.js.org/configuration/module/#rule webpack Rule}
     */
    getLoader(test?: HandleCSSLoaderTestType, loader?, options = {}, overrides: any = {}) {
        const cssLoaderOptions: any = {
            autoprefixer: false,
            sourceMap   : this.sourceMap,
            minimize    : this.minimize
        }

        if ( overrides.cssModules || (this.cssModules && (overrides.cssModules === undefined || overrides.cssModules === true)) ) {
            cssLoaderOptions.modules        = true
            cssLoaderOptions.importLoaders  = 1
            cssLoaderOptions.localIdentName = '[name]_[local]__[hash:base64:5]'
        }
        if ( overrides.cssLoaderOptions ) {
            Object.assign(cssLoaderOptions, overrides.cssLoaderOptions)
        }

        if ( loader === 'css-loader' ) {
            Object.assign(cssLoaderOptions, options)
        }

        const use = [
            {
                loader : this.cssLoader,
                options: cssLoaderOptions
            }
        ]

        if ( loader !== 'postcss-loader' && this.postcssOptions !== false ) {
            const postcssOptions: any = {
                sourceMap: this.sourceMap
            }

            if ( Array.isArray(this.postcssOptions) ) {
                postcssOptions.plugins = this.postcssOptions
            } else if ( typeof this.postcssOptions === 'object' ) {
                Object.assign(postcssOptions, this.postcssOptions)
            }

            if ( overrides.postcssOptions ) {
                Object.assign(postcssOptions, overrides.postcssOptions)
            }
            use.push({
                loader : 'postcss-loader',
                options: postcssOptions
            })
        }

        if ( loader && loader !== 'css-loader' ) {
            use.push({
                loader,
                options: {
                    ...options,
                    sourceMap: this.sourceMap
                }
            })
        }

        let styleLoaderOptions = {
            sourceMap: this.sourceMap
        }
        if ( overrides.styleLoaderOptions ) {
            Object.assign(styleLoaderOptions, overrides.styleLoaderOptions)
        }


        let [ tester, exclude ] = Array.isArray(test) ? test : [ test, [] ];


        return {
            test   : tester,
            exclude: exclude,
            use    : this.extract ?
                     [
                         {
                             loader: this.extractLoader
                         },
                         ...use
                     ] :
                     [
                         {
                             loader : this.styleLoader,
                             options: styleLoaderOptions
                         },
                         ...use
                     ]
        }
    }

    /**
     * Get the rule for css files
     * @param  {RegExp} [test=/\.css$/]    File matcher
     * @param  {any} [options=undefined] Options for css-loader
     * @return {Object} {@link https://webpack.js.org/configuration/module/#rule webpack Rule}
     */
    css(test?: HandleCSSLoaderTestType, options?) {
        test = test || /\.css$/
        return this.getLoader(test, 'css-loader', options)
    }

    /**
     * Get the rule for sass files
     * @param  {RegExp} [test=/\.sass$/] File matcher
     * @param  {any} [options=undefined] Options for sass-loader, `indentedSyntax` for sass-loader is `true` here
     * @return {Object} {@link https://webpack.js.org/configuration/module/#rule webpack Rule}
     */
    sass(test?: HandleCSSLoaderTestType, options = {}) {
        test = test || /\.sass$/
        return this.getLoader(test, 'sass-loader', {
            indentedSyntax: true,
            ...options
        })
    }

    /**
     * Get the rule for scss files
     * @param  {RegExp} [test=/\.scss$/]    File matcher
     * @param  {any} [options=undefined] Options for sass-loader
     * @return {Object} {@link https://webpack.js.org/configuration/module/#rule webpack Rule}
     */
    scss(test?: HandleCSSLoaderTestType, options?, overrides?) {
        test = test || /\.scss$/
        return this.getLoader(test, 'sass-loader', options)
    }

    /**
     * Get the rule for less files
     * @param  {RegExp} [test=/\.less$/] File matcher
     * @param  {any} [options=undefined] Options for less-loader
     * @param {any} [overrides=undefined]  overrides
     * @return {Object} [Rule] {@link https://webpack.js.org/configuration/module/#rule webpack Rule}
     */
    less(test?: HandleCSSLoaderTestType, options?, overrides?) {
        test = test || /\.less$/
        return this.getLoader(test, 'less-loader', options, overrides)
    }

    /**
     * Get the rule for stylus files
     * @param  {RegExp} [test=/\.stylus$/] File matcher
     * @param  {any} [options=undefined] Options for stylus-loader
     * @return {Object} {@link https://webpack.js.org/configuration/module/#rule webpack Rule}
     */
    stylus(test?: HandleCSSLoaderTestType, options?) {
        test = test || /\.stylus$/
        return this.getLoader(test, 'stylus-loader', options)
    }

    /**
     * Get the rule for styl files
     * @param  {RegExp} [test=/\.styl$/] File matcher
     * @param  {any} [options=undefined] Options for stylus-loader
     * @return {Object} {@link https://webpack.js.org/configuration/module/#rule webpack Rule}
     */
    styl(test?: HandleCSSLoaderTestType, options?) {
        test = test || /\.styl$/
        return this.getLoader(test, 'stylus-loader', options)
    }

    /**
     * Get the `loaders` options for vue-loader
     * @param  {any} [options={}] Options for relevant loaders
     * @return {Object}
     * @example
     * handleLoader.vue({
   *  scss: {},
   *  less: {}
   * })
     */
    vue(options = {}) {
        this.postcssOptions = false
        this.cssModules     = false
        const loaders       = {}
        for ( const lang of [ 'css', 'sass', 'scss', 'less', 'stylus', 'styl' ] ) {
            loaders[ lang ] = this[ lang ](null, options[ lang ]).use
        }
        return loaders
    }
}

export function getSize(size) {
    return (size / 1024).toFixed(2) + 'kb'
}

export const purify = function (cb) {
    const css = glob.sync(path.join(__dirname, '../dist/**/*.css'));
    const js  = glob.sync(path.join(__dirname, '../dist/**/*.js'));


    Promise.all(css.map(function (file) {
        return new Promise(function (resolve) {
            console.log('\n Purifying ' + path.relative(path.join(__dirname, '../dist'), file).bold + '...')
            _purify(js, [ file ], { minify: true }, function (purified) {
                const oldSize = fs.statSync(file).size;
                fs.writeFileSync(file, purified)
                const newSize = fs.statSync(file).size;

                console.log(
                    ` * Reduced size by ${((1 - newSize / oldSize) * 100).toFixed(2)}%
                            from : ${filesize(oldSize)} 
                              to : ${filesize(newSize)}
                              to : ${filesize(gzipSize.sync(newSize))}  (gzip)
                    `
                )
                resolve()
            })
        })
    }))
        .then(cb)
}

// export const styleLoaders = function (options) {
//     options = options || {}
//
//     function generateLoaders(loaders) {
//         if ( options.postcss ) {
//             loaders.splice(1, 0, 'postcss')
//         }
//
//         const sourceLoader = loaders.map(function (loader) {
//             let extraParamChar;
//             if ( /\?/.test(loader) ) {
//                 loader         = loader.replace(/\?/, '-loader?')
//                 extraParamChar = '&'
//             }
//             else {
//                 loader         = loader + '-loader'
//                 extraParamChar = '?'
//             }
//             return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '')
//         }).join('!');
//
//         if ( options.extract ) {
//             return ExtractTextPlugin.extract({
//                 use     : sourceLoader,
//                 fallback: 'vue-style-loader'
//             })
//         }
//         else {
//             return [ 'vue-style-loader', sourceLoader ].join('!')
//         }
//     }
//
//     return {
//         css   : generateLoaders([ 'css' ]),
//         less  : generateLoaders([ 'css', 'less' ]),
//         sass  : generateLoaders([ 'css', 'sass?indentedSyntax' ]),
//         scss  : generateLoaders([ 'css', 'sass' ]),
//         styl  : generateLoaders([ 'css', 'stylus' ]),
//         stylus: generateLoaders([ 'css', 'stylus' ])
//     }
// }
//
// export const styleRules = function (options) {
//     const output  = [];
//     const loaders = styleLoaders(options);
//     for ( let extension in loaders ) {
//         const loader = loaders[ extension ];
//         output.push({
//             test  : new RegExp('\\.' + extension + '$'),
//             loader: loader
//         })
//     }
//     return output
// }

