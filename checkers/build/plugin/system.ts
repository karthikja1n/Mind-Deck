/*
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */

import { Compiler } from 'webpack';
import * as path from 'path'
import * as fs from 'fs';

import { camelcase as toCamelCase } from 'varname';
import { ConcatSource } from 'webpack-sources';

const ParserHelpers = require('webpack/lib/ParserHelpers.js');

class SystemPlugin {
    constructor(protected options) {
    }

    apply(compiler) {
        compiler.plugin("compilation", (compilation, params) => {
            params.normalModuleFactory.plugin("parser", (parser, parserOptions) => {

                if(typeof parserOptions.system !== "undefined" && !parserOptions.system)
                    return;

                function setNotSupported(name) {
                    parser.plugin("evaluate typeof " + name, ParserHelpers.evaluateToString("undefined"));
                    parser.plugin("expression " + name,
                        ParserHelpers.expressionIsUnsupported(name + " is not supported by webpack.")
                    );
                }

                parser.plugin("typeof System.import", ParserHelpers.toConstantDependency(JSON.stringify("function")));
                parser.plugin("evaluate typeof System.import", ParserHelpers.evaluateToString("function"));
                parser.plugin("typeof System", ParserHelpers.toConstantDependency(JSON.stringify("object")));
                parser.plugin("evaluate typeof System", ParserHelpers.evaluateToString("object"));

                setNotSupported("System.set");
                setNotSupported("System.get");
                setNotSupported("System.register");
                parser.plugin("expression System", function() {
                    const systemPolyfillRequire = ParserHelpers.requireFileAsExpression(
                        this.state.module.context, require.resolve("../../buildin/system.js"));
                    return ParserHelpers.addParsedVariableToModule(this, "System", systemPolyfillRequire);
                });
            });
        });
    }
}

export interface SystemPluginOptions {
    systemjsDeps?:any[],
    registerName?:string
    publicPath?: {
        useSystemJSLocateDir?: boolean
    }
}
export class System {
    constructor(protected options: SystemPluginOptions = {}) {
        options.systemjsDeps = [
            /^lodash/,
            /^quasar-framework/
        ]
        options.registerName = 'vendor'
        options.publicPath = {
            useSystemJSLocateDir: false
        }
    }

    apply(compiler: Compiler) {
        let systemPlugin = new SystemPlugin({})
        systemPlugin.apply(compiler);

        let self = this;

        const externalModuleFiles = [];
        const externalModules = [];

        if (!compiler.options.resolve) {
            compiler.options.resolve = {}
        }

        if (!compiler.options.resolve.alias) {
            compiler.options.resolve.alias = {};
        }

        compiler.plugin('normal-module-factory', (nmf) => {
            nmf.plugin('before-resolve', (result, callback) => {
                if ( ! result ) {
                    return callback();
                }
                if (this.options.systemjsDeps.find(dep => dep.test(result.request))) {
                    const filename = `node_modules/__${toJsVarName(result.request)}`;
                    if (externalModuleFiles.indexOf(filename) < 0) {
                        externalModuleFiles.push(filename)
                        fs.writeFile(filename, `module.exports = ${toJsVarName(result.request)};`, err => {
                            if (err) {
                                console.error(err);
                                throw err;
                            }

                            externalModules.push({
                                depFullPath: result.request,
                                depVarName: toJsVarName(result.request),
                            });
                            result.request = path.resolve(process.cwd(), filename);

                            callback(null, result);
                        });
                    } else {
                        result.request = path.resolve(process.cwd(), filename);
                        callback(null, result);
                    }
                } else {
                    callback(null, result)
                }
            })

            nmf.plugin('after-resolve', (result, callback) => {
                if (!result) {
                    return callback();
                }

                if (this.options.systemjsDeps.find(dep => dep.test(result.request))) {
                    result.resource = path.resolve(process.cwd(), `__${toJsVarName(result.request)}`);
                }

                callback(null, result);
            });
        })


        compiler.plugin("compilation", compilation => {

            // http://stackoverflow.com/questions/35092183/webpack-plugin-how-can-i-modify-and-re-parse-a-module-after-compilation
            compilation.plugin('seal', () => {
                compilation.modules.forEach(module => {
                    let isEntry = module.entryModule;
                    let entries = (compiler.options.entry || {});
                    let isHarmonyModule = module.meta && module.meta.harmonyModule;
                    let exportsArgument = 'exports';

                    if (isHarmonyModule) {
                        exportsArgument = '__webpack_exports__';
                    }
                    if (typeof entries === 'string') {
                        entries = {main: entries};
                    }
                    for (let entryName in entries) {
                        isEntry = module.rawRequest === entries[entryName];
                    }
                    if (isEntry && module._source) {
                        module._source._value += `\n$__register__main__exports(${exportsArgument});`;
                    }
                });
            });

            // Based on https://github.com/webpack/webpack/blob/ded70aef28af38d1deb2ac8ce1d4c7550779963f/lib/WebpackSystemRegister.js
            compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
                chunks.forEach(chunk => {
                    if (chunk.isInitial ? !chunk.isInitial() : !chunk.initial) {
                        return;
                    }

                    chunk.files.forEach(file => {
                        if(file.endsWith('.js')) {
                            compilation.assets[ file ] = new ConcatSource(sysRegisterStart(this.options, externalModules), compilation.assets[ file ], sysRegisterEnd(this.options));
                        }
                    });
                });
                callback();
            });
        });
    }
}

function sysRegisterStart(opts, externalModules) {
 let external = externalModules.length > 0 ? `var ${externalModules.map(toDepVarName).map(toCommaSeparatedList).reduce(toString, '')};` : ``;
 let setters = externalModules.map(toDepVarName).map(toSetters.bind(null, opts)).reduce(toString, '')
    let result = `
System.register(${registerName()}${depsList()}, function($__export) {
    ${external}
    
    function $__register__main__exports(exports) {
        for (var exportName in exports) {
            $__export(exportName, exports[exportName]);
        }
    }
    
    function $__wsr__interop(m) {
        return m.__useDefault ? m.default : m;
    }
    
    return {
        setters: [${setters}
        ],
        execute: function() {
    `
    return opts.minify ? minify(result) : result;

    function registerName() {
        return opts.registerName ? `'${opts.registerName}', ` : '';
    }

    function depsList() {
        return `[${externalModules.map(toDepFullPath).map(toStringLiteral).map(toCommaSeparatedList).reduce(toString, '')}]`;
    }

    function toCommaSeparatedList(name, i) {
        return `${i > 0 ? ', ' : ''}${name}`;
    }

    function toSetters(opts, name, i) {
        // webpack needs the __esModule flag to know how to do it's interop require default func
        const result = `${i > 0 ? ',' : ''}
      function(m) {
        ${name} = $__wsr__interop(m);
      }`;

        return opts.minify ? minify(result) : result;
    }

    function toStringLiteral(str) {
        return `'${str}'`;
    }

    function toString(prev, next) {
        return prev + next;
    }
}

function sysRegisterEnd(opts) {
    const result =
              `
    }
  }
});
`
    return opts.minify ? minify(result) : result;
}


function toJsVarName(systemJsImportName) {
    return toCamelCase(removeSlashes(moduleName(systemJsImportName)));
}

function moduleName(systemJsImportName) {
    return systemJsImportName.includes('!') ? systemJsImportName.slice(0, systemJsImportName.indexOf('!')) : systemJsImportName;
}

function removeSlashes(systemJsImportName) {
    return systemJsImportName.replace('/', '');
}

function toDepVarName(externalModule) {
    return externalModule.depVarName;
}

function toDepFullPath(externalModule) {
    return externalModule.depFullPath;
}

function minify(string) {
    return string.replace(/\n/g, '');
}
