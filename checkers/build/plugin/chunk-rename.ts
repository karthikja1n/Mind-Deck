/**
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */

import { Compiler } from 'webpack';
import { join, resolve } from 'path';

type ITapable = { hooks: { [key: string]: any } }
type ICompiler = Compiler & ITapable


export type ChunkRenamePluginOptions = Array<ChunkRenameOptions>

export interface ChunkRenameOptions {
    test: string | RegExp | ((propVal: any) => boolean)
    on?: string
    to: string | ((chunk: any) => string)
}

let instanceCounter = 0;

export class ChunkRenamePlugin {
    instanceId: string

    constructor(protected options: ChunkRenamePluginOptions = []) {
        this.instanceId = `crwp-${instanceCounter ++}`;
    }

    apply(compiler: ICompiler) {
        let self = this;
        compiler.hooks.compilation.tap('ChunkRenamePlugin', (compilation: ITapable) => {
            compilation.hooks.optimizeChunks.tap('ChunkRenamePlugin', (chunks, groups) => {
                if ( self.preventMultiOp(compilation) ) return;
                self.remapChunks(chunks);
            })
            compilation.hooks.optimizeExtractedChunks.tap('ChunkRenamePlugin', (chunks) => {
                if ( self.preventMultiOp(compilation) ) return;
                self.remapChunks(chunks);
            })
        });
    }

    preventMultiOp(compilation) {
        if ( compilation[ this.instanceId ] ) {
            return true;
        }
        compilation[ this.instanceId ] = true;
        return false;
    }

    remapChunks(chunks) {
        chunks.forEach((chunk: any) => this.options.forEach((r) => {
            if ( r.on === undefined ) {
                r.on = 'name'
            }
            let pass = false;
            if ( typeof r.test === 'function' ) {
                pass = r.test(chunk[ r.on ]) === true;
            } else if ( r.test as any instanceof RegExp ) {
                pass = (new RegExp(r.test)).test(chunk[ r.on ]) === true;
            } else if ( r.test[ 'toString' ] !== undefined ) {
                pass = chunk[ r.on ] === r[ 'test' ].toString()
            }
            if ( pass === true ) {
                let name: string;
                if ( typeof r.to === 'function' ) {
                    name = r.to(chunk).toString()
                } else {
                    name = r.to.toString()
                }
                chunk.filenameTemplate = name;
            }
        }))
        // chunks.forEach((chunk) => {
        // Object
        //     .keys(this.options)
        //     .forEach((chunkName) => {
        //         if (chunkName === chunk.name) {
        //             chunk.filenameTemplate = this.options[chunkName];
        //         }
        //     });
        // });
    }
};
