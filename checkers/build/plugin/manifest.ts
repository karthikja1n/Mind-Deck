/**
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */


import { compilation, Compiler } from 'webpack';
import { Hook, Tap } from 'tapable';

export type Compilation = compilation.Compilation & Tap & {
    hooks: compilation.CompilationHooks & {
        htmlWebpackPluginAlterAssetTags: Hook
        htmlWebpackPluginAlterChunks: Hook
    }
}

export class HtmlWebpackMultiCompilerPlugin {
    constructor(protected options: { shared: { compilations?: {} }, skipCompilers: string[] }) {
        if ( ! options.shared ) options.shared = {};
        if ( ! options.shared.compilations ) options.shared.compilations = {};
        if ( ! options.skipCompilers ) options.skipCompilers = [];
    }

    apply(compiler: Compiler) {
        const self: HtmlWebpackMultiCompilerPlugin = this;
        let options                                = this.options;

        compiler.hooks.compilation.tap('HtmlWebpackMultiCompilerPlugin', function (compilation: Compilation) {
            self.options.shared.compilations[ compiler.name ] = compilation;
            if ( compilation.hooks.htmlWebpackPluginAlterAssetTags ) {
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('HtmlWebpackMultiCompilerPlugin', function (htmlPluginData, callback) {
                    if ( options.skipCompilers.includes(compiler.name) ) {
                        console.log('Skipping compiler ', compiler.name)
                    }
                    const htmlPlugin      = htmlPluginData.plugin;
                    const chunkOnlyConfig = {
                        assets      : false,
                        cached      : false,
                        children    : false,
                        chunks      : true,
                        chunkModules: false,
                        chunkOrigins: false,
                        errorDetails: false,
                        hash        : false,
                        modules     : false,
                        reasons     : false,
                        source      : false,
                        timings     : false,
                        version     : false
                    };
                    let compilations      = self.options.shared.compilations;
                    Object.keys(compilations).forEach(name => {
                        if ( name === compilation.name ) {
                            return;
                        }
                        const allChunks = compilations[ name ].getStats().toJson(chunkOnlyConfig).chunks;
                        let chunks      = htmlPlugin.filterChunks(allChunks, htmlPlugin.options.chunks, htmlPlugin.options.excludeChunks);
                        chunks          = htmlPlugin.sortChunks(chunks, htmlPlugin.options.chunksSortMode, compilations[ name ].chunkGroups);
                        if ( compilation.hooks ) {
                            chunks = compilation.hooks.htmlWebpackPluginAlterChunks.call(chunks, { plugin: self });
                        }
                        const assets = htmlPlugin.htmlWebpackPluginAssets(compilations[ name ], chunks);

                        // assets.js  = assets.js.map(scriptPath => (scriptPath.startsWith('/') ? '/' : '') + join('assets', name, scriptPath))
                        // assets.css = assets.css.map(scriptPath => (scriptPath.startsWith('/') ? '/' : '') + join('assets', name, scriptPath))

                        const assetTags = htmlPlugin.generateAssetTags(assets)

                        assetTags.head.forEach(tag => htmlPluginData.head.push(tag))
                        assetTags.body.forEach(tag => htmlPluginData.body.push(tag))
                    })
                    callback();
                });
            }
        })
    }
}
