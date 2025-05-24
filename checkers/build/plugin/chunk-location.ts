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
import { Compiler,compilation } from 'webpack';
import { join, resolve } from 'path';
import { Compilation } from './manifest';

const TAP='ChunkLocationPlugin'
export class ChunkLocationPlugin {
    constructor(protected options: any={}) {
    }

    apply(compiler: Compiler) {
        let self = this;
        Object.keys(compiler.hooks).forEach(key => {
            compiler.hooks[key].tap(TAP, (compilation, ...args) => {
                console.log('compiler hook ', key);
                if(args.length > 0){
                    console.log('compiler hook ', key, 'args length > 0', {args});
                }
            })
        })
        compiler.hooks.compilation.tap('ChunkLocationPlugin', (compilation) => {
            compilation.hooks.optimizeExtractedChunks.tap('ChunkLocationPlugin', (chunks) => {
                console.log('optimizeExtractedChunks') //chunks);
            })
            compilation.hooks.afterOptimizeChunkAssets.tap('ChunkLocationPlugin', (chunks) => {
                let o = chunks.map(c => c.hash + c.files.map(f => f.toString()).join(',')).join("\n")
                console.log('afterOptimizeChunkAssets', o);
            })
            compilation.hooks.optimizeChunks.tap('ChunkLocationPlugin', (chunks, groups) => {
                let o = chunks.map(c => c.name || c.hash || 'UNKNOWN').join(',')
                console.log('optimizeChunks', o) //, {chunks,groups);
            })
            compilation.hooks.optimizeExtractedChunks.tap('ChunkLocationPlugin', (chunks, groups) => {
                console.log('optimizeExtractedChunks') //, {chunks,groups});
            })
        });
    }

};
