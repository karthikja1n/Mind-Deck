/**
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */


// noinspection ES6UnusedImports
import { compilation, Compiler, Stats } from 'webpack';
import { join, resolve } from 'path';
import { line } from '../utils/utils';

export interface OnDonePluginOptions {
    logCompilerHooks?:boolean
}
const defaultOptions:OnDonePluginOptions = {
    logCompilerHooks: false
}

const TAP = 'OnDonePlugin'

export class OnDonePlugin {
    protected onApplyCallbacks = [];
    public createCallbackFunction: () => (cb: (stats: Stats) => void) => void

    constructor(protected options: OnDonePluginOptions = {}) {
        this.options = {
            ...defaultOptions,
            ...options
        }
        this.createCallbackFunction = this.createDoneCallbackFunctionFactory();
    }

    protected logHook(...args){
        if(this.options.logCompilerHooks) {
            console.log(...args);
        }
    }

    protected onApply(cb: (plugin: this, compiler: Compiler) => void) {
        this.onApplyCallbacks.push(cb);
    }

    public applyFileSize(compiler: Compiler, raport: boolean, collect: boolean) {
        compiler.hooks.done.tap(TAP, compilation => {
            this.logHook(TAP)
        })
    }

    public createDoneCallbackFunctionFactory() {
        let plugin:OnDonePlugin = this;

        return () => {
            let compiler: Compiler;
            plugin.onApply((_plugin, _compiler) => {
                plugin   = _plugin;
                compiler = _compiler;
            })
            return cb => {
                compiler.hooks.done.tap(TAP, (stats, ...args) => {
                    cb(stats);
                })
            }
        }
    }

    apply(compiler: Compiler) {
        let self = this;

        this.onApplyCallbacks.forEach(cb => cb(this, compiler))

        compiler.hooks.watchRun.callAsync(compiler, err => {
            if ( err ) return compiler
            let a;
        })


        compiler.hooks.done.tap(TAP, compilation => {
            self.logHook(TAP)
        })
        Object.keys(compiler.hooks).forEach(key => {
            compiler.hooks[ key ].tap(TAP, (compilation, ...args) => {
                self.logHook('compiler hook ', key);
                if ( args.length > 0 ) {
                    self.logHook('compiler hook ', key, 'args length > 0', { args });
                }
            })
        })
        compiler.hooks.compilation.tap(TAP, (compilation) => {
            compilation.hooks.optimizeExtractedChunks.tap(TAP, (chunks) => {
                self.logHook('optimizeExtractedChunks') //chunks);
            })
            compilation.hooks.afterOptimizeChunkAssets.tap(TAP, (chunks) => {
                let o = chunks.map(c => c.hash + c.files.map(f => f.toString()).join(',')).join('\n')
                self.logHook('afterOptimizeChunkAssets', o);
            })
            compilation.hooks.optimizeChunks.tap(TAP, (chunks, groups) => {
                let o = chunks.map(c => c.name || c.hash || 'UNKNOWN').join(',')
                self.logHook('optimizeChunks', o) //, {chunks,groups);
            })
            compilation.hooks.optimizeExtractedChunks.tap(TAP, (chunks, groups) => {
                self.logHook('optimizeExtractedChunks') //, {chunks,groups});
            })
        });
    }
};
