import { Compiler } from 'webpack';

export class ChunkName {
    constructor(protected options: { alter: (chunk: any) => void }) {}

    apply(compiler: Compiler) {
        let self = this;
        compiler.plugin('make', (compilation, callback) => {

            compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
                console.log('ChunkName optimize-chunk-assets')
                chunks.forEach((chunk, iChunk) => {
                    self.options.alter(chunk)
                })
                callback();
            });
            callback()
        })
    }
}
