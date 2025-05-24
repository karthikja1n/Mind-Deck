// noinspection ES6UnusedImports
import * as gulp from 'gulp'
import { GulpTasks } from '@radic/build-tools/gulp';
import { output } from '@radic/build-tools/output';
import { Gulpclass, Task } from 'gulpclass';
import build from './build/task.build'
import serve from './build/task.serve'
import _env from './build/utils/env-utils'
import { ConfigEnv, DevServerCallbackOptions, EnvUtils } from './build/interfaces';
import * as browserSync from 'browser-sync';
import * as compression from 'compression';
import { getPort } from './build/utils';
import * as yargs from 'yargs';
const globule= require('globule')
import { join, resolve } from 'path';
import { copyFileSync } from 'fs';
import * as Mocha from 'mocha'

let argv = yargs.parse(process.argv.slice(2));

interface MochaConstructorOptions {
    grep?: RegExp;
    ui?: string;
    reporter?: string | ReporterConstructor;
    timeout?: number;
    reporterOptions?: any;
    slow?: number;
    bail?: boolean;
}

@Gulpclass(gulp)
class AppTasks extends GulpTasks {
    protected options = [ 'async_start', 'profile', 'monitor' ];

    @Task('test') test() {
        let d     = this.defer();
        let mocha = new Mocha(<MochaConstructorOptions> {
            ui: 'mocha-typescript'
        })
        globule.find(resolve(__dirname, 'test', '**/*.test.ts')).forEach(filePath => mocha.addFile(filePath))
        mocha.reporter(Mocha.reporters.Spec, {})
        mocha.reporter(Mocha.reporters.Progress, {})
        mocha.run((fails) => {
            d.resolve();
        })
        return d.promise;
    }

    @Task('semantic:types') semanticTypes() {
        const basePath = resolve(__dirname, 'node_modules/semantic-ui-react/dist')
        const p        = (...s) => resolve(basePath, 'commonjs', ...s);
        let paths      = globule.find([ p('*.d.ts'), p('**/*.d.ts') ]);
        paths.forEach(srcPath => {
            let destPath = srcPath.replace(join(basePath, 'commonjs'), join(basePath, 'es'));
            copyFileSync(srcPath, destPath);
            output.line(`{bold}FROM:{/bold} ${srcPath.replace(basePath, '')} {bold}TO:{/bold} ${destPath.replace(basePath, '')}`)

        })
    }

    @Task('build:dev') buildDev() {
        let d = this.dev().defer();
        build((err, stat) => {
            if ( err ) return d.reject(err);
            d.resolve();
        })
        return d.promise;
    }

    @Task('build:dev:serve', [ 'build:dev' ])
    async buildDevServe() {
        let port = await getPort(this.config.port)
        browserSync.init({
            port  : port,
            server: {
                baseDir   : './dev',
                middleware: [ compression() ]
            }
        })
        return this.resolve()
    }

    @Task('serve:dev') serveDev() {
        let d = this.dev().defer();
        serve<DevServerCallbackOptions>((opts) => {
            if ( opts.err ) return d.reject(opts.err);
        })
        return d.promise;
    }

    @Task('build:prod') buildProd() {
        let d = this.prod().defer();
        build((err, stat) => {
            if ( err ) return d.reject(err);
            d.resolve();
        })
        return d.promise;
    }

    @Task('build:prod:serve', [ 'build:prod' ])
    async buildProdServe() {
        let port = await getPort(this.config.port)
        browserSync.init({
            port  : port,
            server: {
                baseDir   : './dist',
                middleware: [ compression() ]
            }
        })
        return this.resolve()
    }

    @Task('serve:prod') serveProd() {
        let d = this.prod().defer();
        serve<DevServerCallbackOptions>((opts) => {
            if ( opts.err ) return d.reject(opts.err);
        })
        return d.promise;
    }

    @Task('serve:pre') servePreProd() {
        throw new Error('Not yet implemented')
    }

    protected dev(): this {
        process.env.NODE_ENV = 'development'
        return this.processArgv()
    }

    protected prod(): this {
        process.env.NODE_ENV = 'production'
        return this.processArgv()
    }

    protected processArgv(): this {
        this.options.forEach(option => {
            if ( argv && argv[ option ] !== undefined ) {
                this.env[ option ] = argv[ option ]
            }
        })
        return this;
    }

    protected resolve(arg?: any) { return Promise.resolve(arg)}

    protected reject(arg?: any) { return Promise.reject(arg)}

    protected get env(): EnvUtils { return _env() }

    protected get config(): ConfigEnv { return this.env.config }

}
