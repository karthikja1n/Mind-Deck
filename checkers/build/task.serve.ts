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
import * as path from 'path';

import * as webpack from 'webpack';
import { Configuration, Stats } from 'webpack';
// noinspection ES6UnusedImports
import opn from 'opn';
import * as proxyMiddleware from 'http-proxy-middleware';
// noinspection ES6UnusedImports
import * as webpack_dev_middleware from 'webpack-dev-middleware';
import * as WPdevServer from 'webpack-dev-server';
// noinspection ES6UnusedImports
import * as webpack_hot_middleware from 'webpack-hot-middleware';
// noinspection ES6UnusedImports
import * as connect_history_api_fallback from 'connect-history-api-fallback';
import * as debug from 'debug';
import config, { assetsPath } from './config'
import _env from './utils/env-utils';
import { createApiMockerSubApp, line, out, writeStatsJson } from './utils/utils';
import * as express from 'express';

import { resolve } from './webpack4.base.conf';
import { OnDonePlugin } from './plugin/OnDonePlugin';
import { DevServerCallbackOptions, ProdServerCallbackOptions, ServerCallbackOptions } from './interfaces';

const errorOverlayMiddleware      = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
let log                           = debug('task:serve')

let isChanging = false

const start = <T extends ServerCallbackOptions | ProdServerCallbackOptions | DevServerCallbackOptions>(listenCallback?: (opts: T) => any) => {
    process.env.NODE_ENV            = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
    let env                         = _env()
    const baseConfig: Configuration = require('./webpack4.base.conf').default()
    const devConfig: Configuration  = require('./webpack4.dev.conf').default()
    const prodConfig: Configuration = require('./webpack4.prod.conf').default()

    const contentPath = (...parts) => path.resolve(baseConfig.output.path, assetsPath, ...parts)
    const app         = express(),
          port        = env.config.port,
          hostname    = 'checkers.local',
          uri         = `http://${hostname}:${port}`;

    out(`{bold}Starting server {cyan}${uri}{/cyan} for ${env.name} preview...{reset}`)
    out('{bold.orange}Using profile mode during this build. This might slow down things...{/reset}');

    if ( env.prod ) {
        let compression = require('compression')
        app.use(compression)
        // app.use(compression({filter: shouldCompress}))
        //
        // function shouldCompress (req, res) {
        //     if (req.headers['x-no-compression']) {
        //         // don't compress responses with this request header
        //         return false
        //     }
        //
        //     // fallback to standard filter function
        //     return compression.filter(req, res)
        // }
        app.use(require('morgan')('dev'))
        app.use(connect_history_api_fallback(config.historyApiFallback(log)))

        if ( env.config.apiMocker ) {

            app.use('/api/v1', createApiMockerSubApp('./api.db.json'))

            out(`{green.bold}Api Mock added into server on /api/v1{reset}`)
        } else {
            Object.keys(env.config.proxyTable).forEach(function (context) {
                let options: proxyMiddleware.Config = env.config.proxyTable[ context ];
                if ( typeof options === 'string' ) {
                    options = { target: options }
                }
                options.logLevel = 'info'
                app.use(proxyMiddleware(context, options))
            })
        }

        app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*')
        })


        let outputPath = resolve(prodConfig.output.path)
        line(`{bold}Using path {green}${outputPath}{/green} as base path`)
        // app.use('*', express.static(outputPath))
        app.use(express.static(outputPath))
        app.get('*', (req, res) => {
            res.sendFile(resolve(outputPath, 'index.html'))
        })


        prodConfig.watch    = true
        let onDonePlugin    = new OnDonePlugin()
        const waitUntilDone = onDonePlugin.createCallbackFunction();

        prodConfig.plugins.push(onDonePlugin);
        const compiler = webpack(prodConfig);


        const server = app.listen(port, (err) => {
            if ( err ) {
                return listenCallback({ err } as any);
            }
            line(`{bold}[{green}ONLINE{/green}]{/bold} Webserver is now online at {bold}${uri}{/bold}. Waiting for webpack compilation..`)
            let watching = compiler.watch({}, (err, stats) => {
                if ( err ) {
                    out(`{red.bold} Error occured: ${err.name}{reset}`)
                    out(err.message);
                    process.stdout.write(err.stack);
                }
            });

            waitUntilDone((stats: Stats) => {
                process.stdout.write(stats.toString({
                    colors     : true,
                    entrypoints: false,
                    reasons    : false,
                    children   : false
                }));

                writeStatsJson(stats, baseConfig.output.path);

                if ( env.config.openBrowser ) {
                    opn(uri)
                }

                log('in cb 3')

                out(`{bold}Server {cyan}${uri}{/cyan} {green}online{reset}`)
                if ( listenCallback ) {
                    listenCallback({
                        server,
                        app,
                        compiler,
                        err,
                        stats
                    } as any)
                }
            })
        })

    }

    if ( env.dev ) {
        if ( ! devConfig.plugins.find(plugin => plugin && plugin.constructor && plugin.constructor.name === 'HotModuleReplacementPlugin') ) {
            devConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
        }

        console.log(` Starting dev server on  ${uri} `)

        let dapp: express.Application;

        const devServerConfig: WPdevServer.Configuration = {
            hot   : true,
            inline: true,
            public: hostname,

            quiet             : false,
            noInfo            : false,
            contentBase       : contentPath(), //<any> [ contentPath('core'), contentPath('document'), contentPath('welcome') ],
            overlay           : false,
            port,
            headers           : { 'Access-Control-Allow-Origin': '*' },
            compress          : true,
            // https             : {
            //     spdy: {
            //         protocols: ["h2"]
            //     }
            // },
            stats             : {
                excludeAssets: assetName => assetName.includes('brace') || /\.(ttf|woff|png|eot|jpg|woff2)$/.test(assetName),
                colors       : true
            },
            historyApiFallback: config.historyApiFallback(log),
            before(app: express.Express) {
                dapp = app;
                app.use(require('morgan')('dev'))
                app.use(errorOverlayMiddleware())
                app.use(noopServiceWorkerMiddleware())

                if ( env.config.apiMocker ) {

                    let data = require(path.resolve(__dirname, 'api.db.json'));

                    // apiApp.use(js.defaults());
                    // apiApp.use(js.bodyParser)
                    // apiApp.use((req, res, next) => {
                    //     res.setHeader('Access-Control-Allow-Origin', '*')
                    // })
                    data.forEach(mock => {
                        app.get('/api/v1' + mock.url, (req, res) => {
                            res.json(require(mock.filePath));
                        })
                    })
                    //app.use('/api/v1', createApiMockerSubApp(path.resolve(__dirname,'api.db.json')))
                }
            }
        }

        // WPdevServer.addDevServerEntrypoints(devConfig, devServerConfig)
        const compiler  = webpack(devConfig);
        const devServer = new WPdevServer(compiler, devServerConfig)


        const server = devServer.listen(port, hostname, (err: any) => {
            if ( err ) {
                return listenCallback({ err } as any);
            }
            out(`{bold}Server {cyan}${uri}{/cyan} {green}online{reset}`)
            listenCallback({
                devServer,
                server,
                app,
                err,
                compiler
            } as any);
        })
    }
}


export default start
// //
// // console.dir(module.parent)
// // if(module.parent === null){
// //     start()
// // }
//
//     app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
//         res.setHeader('Access-Control-Allow-Origin', '*');
//         next()
//     })
//
//     // logger
//     app.use(require('morgan')('dev'))
//
//     app.use(connect_history_api_fallback({
//         disableDotRule: true,
//         index         : '/assets/core/index.html',
//         verbose       : true,
//         logger        : log.bind(log),
//         rewrites      : [
//             { from: /^.*webpack_hmr.*$/, to: (context) => context.parsedUrl.pathname },
//             { from: /^.*webpack-dev-server.*$/, to: (context) => context.parsedUrl.pathname },
//             { from: /^.*\.\w*$/, to: (context) => context.parsedUrl.pathname },
//             { from: /^.*(\/fonts\/.*\.woff)$/, to: (context) => context.parsedUrl.pathname },
//             { from: /^(?:phpdoc|documentation).*$/, to: (context) => context.parsedUrl.pathname }
//         ]
//     }))
//
//     const devMiddleware = webpack_dev_middleware(compiler, {
//         publicPath: baseConfig.output.publicPath,
//         logLevel: 'debug',
//         stats: 'minimal'
//     });
//
//     const hotMiddleware = webpack_hot_middleware(compiler, {
//         log      : log.bind(log),
//         path     : hot.path,
//         heartbeat: 2000
//     });
//
//     app.use(devMiddleware)
//     app.use(hotMiddleware)
//     app.get('*', express.static(baseConfig.output.path));
//     // serve pure static assets
//     // const staticsPath = path.posix.join(webpackConfigs[0].output.publicPath, 'statics/');
//     // app.use(staticsPath, express.static('./src/statics'))
//
//
//     //
//     // let webpackDevPath = path.resolve(__dirname, '..', 'node_modules/webpack-dev-server')
//     //
//     // app.get('/__webpack_dev_server__/live.bundle.js', (req, res) => {
//     //     res.setHeader('Content-Type', 'application/javascript');
//     //     fs.createReadStream(path.join(webpackDevPath, 'client', 'live.bundle.js')).pipe(res);
//     // });
//     //
//     // app.get('/__webpack_dev_server__/sockjs.bundle.js', (req, res) => {
//     //     res.setHeader('Content-Type', 'application/javascript');
//     //     fs.createReadStream(path.join(webpackDevPath, 'client', 'sockjs.bundle.js')).pipe(res);
//     // });
//     //
//     // app.get('/webpack-dev-server.js', (req, res) => {
//     //     res.setHeader('Content-Type', 'application/javascript');
//     //     fs.createReadStream(path.join(webpackDevPath, 'client', 'index.bundle.js')).pipe(res);
//     // });
//     //
//     // app.get('/webpack-dev-server/*', (req, res) => {
//     //     res.setHeader('Content-Type', 'text/html');
//     //     fs.createReadStream(path.join(webpackDevPath, 'client', 'live.html')).pipe(res);
//     // });
//     //
//     // app.get('/webpack-dev-server', (req, res) => {
//     //     res.setHeader('Content-Type', 'text/html');
//     //     res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>');
//     //     const outputPath = devMiddleware.getFilenameFromUrl(baseConfig.output.publicPath || '/');
//     //     const filesystem = devMiddleware.fileSystem;
//     //
//     //     function writeDirectory(baseUrl, basePath) {
//     //         const content = filesystem.readdirSync(basePath);
//     //         res.write('<ul>');
//     //         content.forEach((item) => {
//     //             const p = `${basePath}/${item}`;
//     //             if (filesystem.statSync(p).isFile()) {
//     //                 res.write('<li><a href="');
//     //                 res.write(baseUrl + item);
//     //                 res.write('">');
//     //                 res.write(item);
//     //                 res.write('</a></li>');
//     //                 if (/\.js$/.test(item)) {
//     //                     const htmlItem = item.substr(0, item.length - 3);
//     //                     res.write('<li><a href="');
//     //                     res.write(baseUrl + htmlItem);
//     //                     res.write('">');
//     //                     res.write(htmlItem);
//     //                     res.write('</a> (magic html for ');
//     //                     res.write(item);
//     //                     res.write(') (<a href="');
//     //                     res.write(baseUrl.replace(/(^(https?:\/\/[^\/]+)?\/)/, "$1webpack-dev-server/") + htmlItem); // eslint-disable-line
//     //                     res.write('">webpack-dev-server</a>)</li>');
//     //                 }
//     //             } else {
//     //                 res.write('<li>');
//     //                 res.write(item);
//     //                 res.write('<br>');
//     //                 writeDirectory(`${baseUrl + item}/`, p);
//     //                 res.write('</li>');
//     //             }
//     //         });
//     //         res.write('</ul>');
//     //     }
//     //     writeDirectory(baseConfig.output.publicPath || '/', outputPath);
//     //     res.end('</body></html>');
//     // });
//     //
//     // const sockWrite = function (sockets, type, data) {
//     //     sockets.forEach((sock) => {
//     //         sock.write(JSON.stringify({
//     //             type,
//     //             data
//     //         }));
//     //     });
//     // };
//
//     let server = app.listen(port, function (err) {
//         if ( err ) {
//             console.log(err)
//             process.exit(1)
//         }
//
//
//         //
//         // const sockServer = sockjs.createServer({
//         //     // Use provided up-to-date sockjs-client
//         //     sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
//         //     // Limit useless logs
//         //     log: (severity, line) => {
//         //         if (severity === 'error') {
//         //             this.log.error(line);
//         //         } else {
//         //             this.log.debug(line);
//         //         }
//         //     }
//         // });
//         //
//         // sockServer.on('connection', (conn) => {
//         //     if (!conn) return;
//         //     if (!this.checkHost(conn.headers)) {
//         //         this.sockWrite([conn], 'error', 'Invalid Host header');
//         //         conn.close();
//         //         return;
//         //     }
//         //     this.sockets.push(conn);
//         //
//         //     conn.on('close', () => {
//         //         const connIndex = this.sockets.indexOf(conn);
//         //         if (connIndex >= 0) {
//         //             this.sockets.splice(connIndex, 1);
//         //         }
//         //     });
//         //
//         //     sockWrite([conn], 'hot');
//         // });
//         //
//         // sockServer.installHandlers(server, {
//         //     prefix: '/sockjs-node'
//         // });
//         //
//         //
//
//         if ( config.dev.openBrowser ) {
//
//             devMiddleware.waitUntilValid(function () {
//                 opn(uri)
//                 if ( listenCallback ) listenCallback(server, app)
//             })
//         }
//     })
//
//     // const onChange = () => {
//     //     if ( isChanging ) return;
//     //     isChanging = true
//     //     console.log('config change - restarting webpack')
//     //     server.close(() => {
//     //         start(listenCallback)
//     //         isChanging = false
//     //     });
//     // }
//     // [
//     //     [ __dirname, '../config/index.ts' ],
//     //     [ __dirname, `webpack.base.conf.ts` ],
//     //     [ __dirname, `webpack.dev.conf.ts` ]
//     // ].forEach(file => fs.watch(
//     //     kindOf(file) === 'array' ? resolve.apply(resolve, file) : resolve(file as any),
//     //     { encoding: 'utf-8' }).on('change', onChange)
//     // )
//
// }
//
