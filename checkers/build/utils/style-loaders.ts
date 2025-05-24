// import { Configuration, Rule } from 'webpack';
//
// namespace StyleLoaders {
//     export interface Loaders {
//         'style-loader': IStyleLoadaer
//         'css-loader': ICSSLoader
//     }
//     interface Rules {
//         css: Loaders['css-loader']
//         less: CSSInterface
//         sass: CSSInterface
//         scss: CSSInterface
//         styl: CSSInterface
//         stylus: CSSInterface
//     }
//     export interface Names {
//
//     }
//
//     export interface IStyleLoadaer {
//         hmr?: boolean //	true	Enable/disable Hot Module Replacement (HMR), if disabled no HMR Code will be added (good for non local development/production)
//         base?: number //	true	Set module ID base (DLLPlugin)
//         attrs?: object //	?:  //	Add custom attrs to <style></style>
//         transform?: Function //	false	Transform/Conditionally load CSS by passing a transform/condition function
//         insertAt?: string | object //	bottom	Inserts <style></style> at the given position
//         insertInto?: string | Function //	<head>	Inserts <style></style> into the given position
//         singleton?: boolean //	undefined	Reuses a single <style></style> element, instead of adding/removing individual elements for each required module.
//         sourceMap?: boolean //	false	Enable/Disable Sourcemaps
//         convertToAbsoluteUrls?: boolean //	false	Converts relative URLs to absolute urls, when source maps are enabled
//     }
//
//     export interface ICSSLoader {
//         root?: string //}	/	Path to resolve URLs, URLs starting with / will not be translated
//         url?: boolean //}	true	Enable/Disable url() handling
//         alias?: object //}	{}	Create aliases to import certain modules more easily
//         import?: boolean //}	true	Enable/Disable @import handling
//         modules?: boolean //}	false	Enable/Disable CSS Modules
//         minimize?: boolean //|Object}	false	Enable/Disable minification
//         sourceMap?: boolean //}	false	Enable/Disable Sourcemaps
//         camelCase?: boolean //|String}	false	Export Classnames in CamelCase
//         importLoaders?: number //}	0	Number of loaders applied before CSS loader
//         localIdentName?: string //}	[hash?:base64]	Configure the generated ident
//     }
//
//     function createLoader<N extends keyof Loaders, L extends Loaders, O extends L[N]>(name: N, options: Partial<O>): O {
//
//         return
//     }
//
//     function createRule(){
//
//     }
//
//     export class RuleFactory {
//         constructor() {}
//         create(name, options): Rule { return }
//     }
// }
//
//
// // example
//
// const styles = new StyleLoaders.RuleFactory();
//
// let config:Configuration = {
//     module: {
//         rules: [
//             styles.create('css', {})
//         ]
//     }
// }
//
