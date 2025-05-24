import { Parser } from '@radic/console-colors'
import { merge } from 'lodash';
import { Config } from './interfaces';

var path = require('path')


const parser = new Parser()
const base   = {
    publicPath           : '/',
    sharedCache          : false,
    devtool              : false,
    cssSourceMap         : false,
    purifyCSS            : false,
    openBrowser          : false,
    jsSourceMap          : false,
    port                 : null,
    clearConsoleOnRebuild: false,
    apiMocker            : true,
    // enables analyzer plugins
    profile              : process.env.WEBPACK_PROFILE !== undefined || process.env.npm_config_profile === 'true',
    // enables watch for build tasks
    watch                : process.env.WEBPACK_WATCH !== undefined || process.env.npm_config_watch === 'true',
    // enables webpack monitor
    monitor              : process.env.WEBPACK_MONITOR !== undefined || process.env.npm_config_monitor === 'true',
    // enables async startup (10kb javascript to place in the <head>, will load the other scripts)
    async_start          : process.env.WEBPACK_ASYNC_STARTUP !== undefined || process.env.npm_config_async === 'true',
    proxyTable           : {
        // '/api': {
        //     target      : 'http://codex.local/api',
        //     changeOrigin: true,
        //     pathRewrite : {
        //         '^/api': ''
        //     }
        // }
        // '/api': {
        //     target      : 'http://localhost:34564/api', // port / host described in ./task.api.ts
        //     changeOrigin: true,
        //     pathRewrite : {
        //         '^/api': ''
        //     }
        // }
    }
}

const defaults: Config = {
    assetsPath        : 'assets',
    progressFormat    : parser.parse(`(:current/:total) [{bold}:bar{/bold}] {limegreen}:percent{/limegreen} {bold}:msg{/bold}`),
    historyApiFallback: (log: typeof console.log, overrides: object = {}) => (merge({
        disableDotRule: true,
        index         : 'index.html',
        verbose       : true,
        logger        : log.bind(log),
        rewrites      : [
            { from: /^.*hot\/hot-update.js$/, to: '/assets/core/hot/hot-update.js' },
            { from: /^.*hot\/hot-update.json$/, to: '/assets/core/hot/hot-update.json' },
            { from: /^.*webpack_hmr.*$/, to: (context) => context.parsedUrl.pathname },
            { from: /^.*webpack-dev-server.*$/, to: (context) => context.parsedUrl.pathname },
            { from: /^.*\.\w*$/, to: (context) => context.parsedUrl.pathname },
            { from: /^.*(\/fonts\/.*\.woff)$/, to: (context) => context.parsedUrl.pathname },
            { from: /^.*api\/v1/, to: (context) => context.parsedUrl.pathname }
        ]
    }, overrides)),

    prod: {
        env      : {
            NODE_ENV: '"production"'
        },
        ...base,
        port     : 9393,
        purifyCSS: true,
        devtool  : false,
        async_start: false
    },
    dev : {
        env         : {
            NODE_ENV: '"development"'
        },
        ...base,
        cssSourceMap: true,
        port        : 8387,
        devtool     : 'eval-source-map',
        sharedCache : true
    }
}

export default defaults
const assetsPath = defaults.assetsPath
export { assetsPath }
