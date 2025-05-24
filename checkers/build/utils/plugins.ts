import * as WriteFile from 'write-file-webpack-plugin';
import * as Webapp from 'webapp-webpack-plugin';
import * as Clean from 'clean-webpack-plugin';
import * as Copy from 'copy-webpack-plugin';
import * as Html from 'html-webpack-plugin';
import * as ExtractText from 'extract-text-webpack-plugin';
import * as Notifier from 'webpack-notifier'
import * as TsconfigPaths from 'tsconfig-paths-webpack-plugin';
import * as ForkTsChecker from 'fork-ts-checker-webpack-plugin';
import * as MiniCssExtract from 'mini-css-extract-plugin'

import * as ModuleScope from 'react-dev-utils/ModuleScopePlugin';
import * as WatchMissingNodeModules from 'react-dev-utils/WatchMissingNodeModulesPlugin';
import * as InterpolateHtml from 'react-dev-utils/InterpolateHtmlPlugin';
// analyzer plugins
import * as Profiling from 'webpack/lib/debug/ProfilingPlugin'
import * as Visualizer from 'webpack-visualizer-plugin';
import * as Stats from 'stats-webpack-plugin';
import * as DuplicatePackageChecker from 'duplicate-package-checker-webpack-plugin';
import * as Monitor from 'webpack-monitor';
import * as bundleSize from 'webpack-bundle-size-analyzer'
import { BundleAnalyzerPlugin as Bundle } from 'webpack-bundle-analyzer'
import { CheckerPlugin as Checker } from 'awesome-typescript-loader';

import * as Manifest from 'webpack-manifest-plugin';
// import { HtmlWebpackMultiCompilerPlugin } from './plugin/manifest';
import * as UglifyJs from 'uglifyjs-webpack-plugin'
import * as OptimizeCss from 'optimize-css-assets-webpack-plugin';

import TSImportFactory from 'ts-import-plugin';
import * as ReactDocgenTS from 'react-docgen-typescript-webpack-plugin'
import * as StorybookDefault from '@storybook/react/dist/server/config/defaults/webpack.config.js'
import * as TSConfigPaths from 'tsconfig-paths-webpack-plugin';

const HELPER = {
    TSImportFactory,
    TSConfigPaths
}

const CONFIG = {
    StorybookDefault
}

const ANALYZE = {
    Profiling,
    Visualizer,
    Stats,
    DuplicatePackageChecker,
    Monitor,
    Bundle,
    BundleSize: bundleSize.WebpackBundleSizeAnalyzerPlugin
}

export {
    ANALYZE,
    CONFIG,
    HELPER,
    WriteFile,
    Webapp,
    Clean,
    Copy,
    Html,
    ExtractText,
    Notifier,
    Manifest,
    UglifyJs,
    OptimizeCss,
    TsconfigPaths,
    ForkTsChecker,
    ModuleScope,
    WatchMissingNodeModules,
    InterpolateHtml,
    MiniCssExtract,
    Checker,
    ReactDocgenTS
}
