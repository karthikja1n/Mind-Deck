import * as webpack from 'webpack';
import * as webpack_dev_middleware from 'webpack-dev-middleware';
// noinspection SpellCheckingInspection
import * as WPdevServer from 'webpack-dev-server';
import { NextHandleFunction } from 'connect';
import { Server } from "http";
import * as express from 'express';
import { Options } from 'webpack';
import { ErrorInfo } from 'react';
import { Chalk } from 'chalk';
import * as ts from 'typescript'


export type ServerCallbackOptions = {
    err?: Error
    stats?: webpack.Stats
    server?: Server
    app?: express.Application
    compiler?: webpack.Compiler
}
export type ProdServerCallbackOptions = ServerCallbackOptions & { devMiddlware?: webpack_dev_middleware.WebpackDevMiddleware & NextHandleFunction; }
export type ProdServerCallback = (opt: ProdServerCallbackOptions) => void;
export type DevServerCallbackOptions = ServerCallbackOptions & { devServer?: WPdevServer }
export type DevServerCallback = (opt: ServerCallbackOptions) => void;

export interface Config {
    assetsPath: string
    progressFormat: string
    historyApiFallback: any
    prod: ConfigEnv
    dev: ConfigEnv
}

export interface ConfigEnv {
    env: any
    publicPath: string
    sharedCache: boolean
    devtool: Options.Devtool
    cssSourceMap: boolean
    purifyCSS: boolean
    openBrowser: boolean
    jsSourceMap: boolean
    port: number
    clearConsoleOnRebuild: boolean
    apiMocker: boolean,
    proxyTable: any

    profile: boolean
    watch: boolean
    monitor: boolean
    async_start: boolean
}

export interface EnvUtils {
    name: string
    dev: boolean
    prod: boolean
    fileHash: any
    config: ConfigEnv

}

export interface TSLoaderOptions {
    silent: boolean;
    logLevel: any;
    logInfoToStdOut: boolean;
    instance: string;
    compiler: string;
    configFile: string;
    context: string;
    transpileOnly: boolean;
    ignoreDiagnostics: number[];
    reportFiles: string[];
    errorFormatter: (message: ErrorInfo, colors: Chalk) => string;
    onlyCompileBundledFiles: boolean;
    colors: boolean;
    compilerOptions: ts.CompilerOptions;
    appendTsSuffixTo: RegExp[];
    appendTsxSuffixTo: RegExp[];
    happyPackMode: boolean;
    getCustomTransformers?: string | (() => ts.CustomTransformers | undefined);
    experimentalWatchApi: boolean;
}
