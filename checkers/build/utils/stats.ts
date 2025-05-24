import { Stats} from 'webpack';
import * as merge from 'webpack-merge'

export type IWebpackStat = Stats.ToStringOptions & {
    all?: any
    builtAt?: boolean
}

export function webpackStats(...stats:IWebpackStat[]):any{
    return merge(...stats as any)
}

export default webpackStats


export const STATS_ALL_DEFAULT:IWebpackStat = {
    // fallback value for stats options when an option is not defined (has precedence over local webpack defaults)
    all            : undefined,
    // Add asset Information
    assets         : true,
    // Sort assets by a field
    // You can reverse the sort with `!field`.
    assetsSort     : 'field',
    // Add build date and time information
    builtAt        : true,
    // Add information about cached (not built) modules
    cached         : true,
    // Show cached assets (setting this to `false` only shows emitted files)
    cachedAssets   : true,
    // Add children information
    children       : true,
    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks         : true,
    // Add built modules information to chunk information
    chunkModules   : true,
    // Add the origins of chunks and chunk merging info
    chunkOrigins   : true,
    // Sort the chunks by a field
    // You can reverse the sort with `!field`. Default is `id`.
    chunksSort     : 'field',
    // Context directory for request shortening
    context        : '../src/',
    // `webpack --colors` equivalent
    colors         : false,
    // Display the distance from the entry point for each module
    depth          : false,
    // Display the entry points with the corresponding bundles
    entrypoints    : false,
    // Add --env information
    env            : false,
    // Add errors
    errors         : true,
    // Add details to errors (like resolving log)
    errorDetails   : true,
    // Exclude assets from being displayed in stats
    // This can be done with a String, a RegExp, a Function getting the assets name
    // and returning a boolean or an Array of the above.
    // excludeAssets: "filter" | /filter/ | (assetName) => ... return true|false |
    // ["filter"] | [/filter/] | [(assetName) => ... return true|false],
    // Exclude modules from being displayed in stats
    // This can be done with a String, a RegExp, a Function getting the modules source
    // and returning a boolean or an Array of the above.
    // excludeModules: "filter" | /filter/ | (moduleSource) => ... return true|false |
    //     ["filter"] | [/filter/] | [(moduleSource) => ... return true|false],
    // See excludeModules
    // exclude: "filter" | /filter/ | (moduleSource) => ... return true|false |
    //     ["filter"] | [/filter/] | [(moduleSource) => ... return true|false],
    // Add the hash of the compilation
    hash           : true,
    // Set the maximum number of modules to be shown
    maxModules     : 15,
    // Add built modules information
    modules        : true,
    // Sort the modules by a field
    // You can reverse the sort with `!field`. Default is `id`.
    modulesSort    : 'field',
    // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
    moduleTrace    : true,
    // Show performance hint when file size exceeds `performance.maxAssetSize`
    performance    : true,
    // Show the exports of the modules
    providedExports: false,
    // Add public path information
    publicPath     : true,
    // Add information about the reasons why modules are included
    reasons        : true,
    // Add the source code of modules
    source         : true,
    // Add timing information
    timings        : true,
    // Show which exports of a module are used
    usedExports    : false,
    // Add webpack version information
    version        : true,
    // Add warnings
    warnings       : true
    // Filter warnings to be shown (since webpack 2.4.0),
    // can be a String, Regexp, a function getting the warning and returning a boolean
    // or an Array of a combination of the above. First match wins.
    // warningsFilter: "filter" | /filter/ | ["filter", /filter/] | (warning) => ... return true|false
}

export const STATS_ALL_FALSE:IWebpackStat = {
    assets         : false,
    cached         : false,
    cachedAssets   : false,
    children       : false,
    chunkModules   : false,
    chunkOrigins   : false,
    chunks         : false,
    depth          : false,
    entrypoints    : false,
    env            : false,
    errors         : false,
    errorDetails   : false,
    hash           : false,
    modules        : false,
    moduleTrace    : false,
    publicPath     : false,
    reasons        : false,
    source         : false,
    timings        : false,
    version        : false,
    warnings       : false,
    usedExports    : false,
    performance    : false,
    providedExports: false
}

export const STATS_ALL_TRUE:IWebpackStat = {
    assets         : true,
    cached         : true,
    cachedAssets   : true,
    children       : true,
    chunkModules   : true,
    chunkOrigins   : true,
    chunks         : true,
    depth          : true,
    entrypoints    : true,
    env            : true,
    errors         : true,
    errorDetails   : true,
    hash           : true,
    modules        : true,
    moduleTrace    : true,
    publicPath     : true,
    reasons        : true,
    source         : true,
    timings        : true,
    version        : true,
    warnings       : true,
    usedExports    : true,
    performance    : true,
    providedExports: true
}

export const STATS_EXCLUDE_FONTS_IMAGES:IWebpackStat = {
    excludeAssets: assetName => assetName.includes('brace') || /.*\.(ttf|woff|png|eot|jpg|woff2|svg)$/.test(assetName),
    exclude: name => /.*\.(ttf|woff|png|eot|jpg|woff2|svg)$/.test(name)
}