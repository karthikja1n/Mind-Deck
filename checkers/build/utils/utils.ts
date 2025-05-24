import * as path from 'path';
import { Stats } from 'webpack';
import * as css from './css-utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { objectSet } from '@radic/util';
import * as CliTable2 from 'cli-table2';
import * as yargs from 'yargs';
import { Parser } from '@radic/console-colors';
import * as checkRequiredFiles from 'react-dev-utils/checkRequiredFiles'
import * as clearConsole from 'react-dev-utils/clearConsole'
// import * as crossSpawn from 'react-dev-utils/crossSpawn'
// import * as errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware'
// import * as eslintFormatter from 'react-dev-utils/eslintFormatter'
import * as FileSizeReporter from 'react-dev-utils/FileSizeReporter'
import * as formatWebpackMessages from 'react-dev-utils/formatWebpackMessages'
import * as getProcessForPort from 'react-dev-utils/getProcessForPort'
import * as ignoredFiles from 'react-dev-utils/ignoredFiles'
// import * as launchEditor from 'react-dev-utils/launchEditor'
// import * as launchEditorEndpoint from 'react-dev-utils/launchEditorEndpoint'
// import * as noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware'
import * as openBrowser from 'react-dev-utils/openBrowser'
import * as printBuildError from 'react-dev-utils/printBuildError'
import * as printHostingInstructions from 'react-dev-utils/printHostingInstructions'
// import * as WebpackDevServerUtils from 'react-dev-utils/WebpackDevServerUtils'
// import * as webpackHotDevClient from 'react-dev-utils/webpackHotDevClient'
import * as js from 'json-server'
import * as express from 'express';
import { getPortPromise } from 'portfinder';

export declare function checkRequiredFiles(files: string[]): boolean;

export {
    checkRequiredFiles,
    clearConsole,
    // crossSpawn,
    // errorOverlayMiddleware,
    // eslintFormatter,
    FileSizeReporter,
    formatWebpackMessages,
    getProcessForPort,
    ignoredFiles,
    // launchEditor,
    // launchEditorEndpoint,
    // noopServiceWorkerMiddleware,
    openBrowser,
    printBuildError,
    printHostingInstructions
    // WebpackDevServerUtils,
    // webpackHotDevClient
}


export function getPort(port: number, host?: string) : Promise<number> {
    return getPortPromise({ port, host })
}

export function createApiMockerSubApp(apiDbJsonFilePath: string): express.Express {
    const apiApp = express()
    let data     = require(apiDbJsonFilePath);


    apiApp.use(require('compression'))
    apiApp.use(require('morgan')('dev'))
    apiApp.use(js.defaults());
    apiApp.use(js.bodyParser)
    apiApp.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
    })
    data.forEach(mock => {
        apiApp.get(mock.url, (req, res) => {
            res.json(require(mock.filePath));
        })
    })
    return apiApp;
}


export const createNotifierCallback = () => {
    const notifier = require('node-notifier')

    return (severity, errors) => {
        if ( severity !== 'error' ) return

        const error    = errors[ 0 ]
        const filename = error.file && error.file.split('!').pop()

        notifier.notify({
            // title   : packageConfig.name,
            message : severity + ': ' + error.name,
            subtitle: filename || '',
            icon    : path.join(__dirname, 'logo.png')
        })
    }
}

const parser: Parser = new Parser()
export const out     = (...args) => args.map(arg => {
    if ( typeof arg !== 'string' ) return arg;
    return parser.parse(arg);
})

export const line = (...args) => process.stdout.write(out(...args) + '\n')

//
// export const createWebpackWaitUntilDone = (compiler:Compiler) => {
//     let stats;
//     compiler.hooks.done.tap('createWebpackWaitUntilDone', (_stats, ...args) => {
//         stats = _stats;
//     })
//     return cb => {
//         line('{bold.cyan} Webpack compilation done. Server is now accessible{reset}')
//         cb(stats);
//     }
// }


export function strEnsureLeft(str: string, left: string): string {
    if ( false === str.startsWith(left) ) {
        return left + str;
    }
    return str;
}

export function strEnsureRight(str: string, right: string): string {
    if ( false === str.endsWith(right) ) {
        return right + str;
    }
    return str;
}

export function strStripLeft(str: string, left: string): string {
    if ( str.startsWith(left) ) {
        return str.substr(left.length);
    }
    return str;
}

export function strStripRight(str: string, right: string): string {
    if ( str.endsWith(right) ) {
        return str.substr(0, str.length - right.length);
    }
    return str;
}

let npmKeys                       = Object.keys(process.env).filter((key: string) => key.startsWith('npm_'))
export const isNPMRunEnv: boolean = npmKeys.length > 0

let npm: any;

export function getNPMRunEnv() {
    if ( npm !== undefined ) return npm;
    npm = {}
    Object
        .keys(process.env)
        .filter((key: string) => key.startsWith('npm_'))
        .forEach((key: string) => {
            let npmKey = key
                .replace('npm_', '')
                .replace(/(\w)_/g, '$1\.')

            objectSet(npm, npmKey, process.env[ key ])
        })

    return npm;
}

export type WrapFunction = (input: string, columns: number, options?: WrapOptions) => string;

export interface WrapOptions {
    /**
     * By default the wrap is soft, meaning long words may extend past the column width. Setting this to true will make it hard wrap at the column width.
     * default: false
     */
    hard?: boolean
    /**
     * By default, an attempt is made to split words at spaces, ensuring that they don't extend past the configured columns.
     * If wordWrap is false, each column will instead be completely filled splitting words as necessary.
     * default: true
     */
    wordWrap?: boolean
    /**
     * Whitespace on all lines is removed by default. Set this option to false if you don't want to trim.
     * default: true
     */
    trim?: boolean
}


const gzipSize = require('gzip-size');
const filesize = require('filesize');

export function writeStatsJson(stats: Stats, targetPath: string) {
    let sfc = stats.toJson({ assets: true, publicPath: true, source: false })
    let sfn = 'stats-' + require('moment')().format('ddd@hh:mm') + '.json';
    writeFileSync(path.resolve(targetPath, sfn), JSON.stringify(sfc, null, 4), 'utf-8');
}

export function writeFileSizes(stats: Stats, targetPath: string, type: 'default' | 'short' | 'table' = 'default') {

    let data              = typeof stats[ 'toJson' ] === 'function' ? stats[ 'toJson' ]({ assets: true, publicPath: true, source: false, reasons: false }) : stats;
    let text: string      = '',
        total: number     = 0,
        totalGzip: number = 0;

    let head          = [ 'name', 'size', 'size (gzip)' ];
    let cols: number  = yargs.terminalWidth() || 100;
    let colWidths     = [];
    const addColWidth = (val: number | string) => {
        if ( typeof val === 'string' && val.endsWith('%') )
            colWidths.push(val);
        cols = cols - parseInt(val as string);
    }
    colWidths.push(cols = cols - 10)
    colWidths.push(cols = cols - 10)
    colWidths.push(cols = (cols / 100) * 90)
    if ( data.children && data.children.length > 0 ) {
        head.unshift('prefix');
        colWidths.push(cols)
    }
    let table = new CliTable2({
        colWidths: colWidths.reverse(),
        wordWrap : true,
        style    : { compact: true },
        head
    })


    const processAssets = (assets, child?) => {
        let prefix = ''
        let tpath  = targetPath
        if ( child !== undefined ) {
            prefix = `[${child.name}] `;
            tpath  = child.outputPath

        }

        assets.filter(asset => asset.name.endsWith('.js') || asset.name.endsWith('.css')).forEach(asset => {
            total += asset.size
            let filePath = path.resolve(tpath, asset.name);
            if ( ! existsSync(filePath) ) {
                text += `warn: could not find ${prefix} ${filePath} \n`
                return;
            }
            asset.gzip     = gzipSize.sync(readFileSync(filePath));
            totalGzip += asset.gzip
            asset.gzipSize = filesize(asset.gzip)
            asset.size     = filesize(asset.size)
            if ( type === 'table' || type === 'short' ) {
                if ( asset.chunkNames.length === 0 ) return;
                let row = [ asset.chunkNames.join('|'), asset.size, asset.gzipSize ];
                if ( child !== undefined ) {
                    row.unshift(child.name)
                }
                (table[ 'push' ] as any)(row as any)
                text += `${asset.chunkNames.join(' | ')}        :: ${asset.size}  /  ${asset.gzipSize}\n`
                return
            }
            text += `
${prefix}${asset.chunkNames.join(' | ')}  :: ${asset.name}
         size:   ${asset.size}
    gzip size:   ${asset.gzipSize}
`;

        })
    }


    if ( data.children && data.children.length > 0 ) {
        data.children.forEach(child => {
            processAssets(child.assets, child);
        })
    } else {
        processAssets(data.assets)
    }

    total      = filesize(total)
    totalGzip  = filesize(totalGzip)
    let footer = `
-----------------------------------------
         total:  ${total}
    total gzip:  ${totalGzip}
`;
    if ( type === 'default' || type === 'short' ) {
        text += footer
    } else {
        text = table.toString() + footer;
    }

    let sfn = 'filesizes-' + require('moment')().format('ddd@hh:mm') + '.txt';
    writeFileSync(path.resolve(targetPath, sfn), text, 'utf-8');
    return text;
}
