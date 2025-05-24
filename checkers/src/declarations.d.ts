declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.svg';
declare module '*.css';
declare module '*.styl';
declare module '*.scss';
declare module 'director';

declare module 'query-string';

// set by webpack
declare const process: {
    env: 'development' | 'production'
}
declare const DEV: boolean
declare const PROD: boolean
declare const ASYNC_START: boolean
declare const ASSETSPATH: boolean



//
// declare global {
//     declare namespace React {
//
//     }
// }
