import { Compiler } from 'webpack';
import * as fs from 'fs';
import { resolve } from 'path';

export class WatchFilesPlugin {
    constructor(protected options: { files: string[], log?: boolean } = { files: [], log: false }) {}

    apply(compiler: Compiler) {
        compiler.plugin('watch-run', (compilation, callback) => {

            const log = (...args) => this.options.log && console.log.apply(console, args)

            const onChange = () => {
                compiler.run((err) => {
                    if ( err ) {
                        throw err;
                    }
                });
            };

            this.options.files.forEach(file => {
                fs.watch(resolve(file), {
                    encoding: 'utf-8'
                }).on('change', (eventType, filename) => {
                    log('file change', filename)
                    onChange();
                })
            })
            callback();
            // watch.createMonitor(root, (monitor) => {
            //     this.options.files.forEach((file) => {
            //         const filePath = path.join(root, file);
            //         monitor.files[filePath];
            //     });
            //
            //     monitor.on("created", onChange);
            //     monitor.on("changed", onChange);
            //     monitor.on("removed", onChange);
            //
            //     console.log('Monitoring file changes\n');
            //     callback();
            // });
        });
    }
}
