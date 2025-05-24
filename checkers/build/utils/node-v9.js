const fs = require('fs')
const path = require('path')
const globule = require('globule')

/**
 * Copyright (c) 2018. Codex Project
 *
 * The license can be found in the package and online at https://codex-project.mit-license.org.
 *
 * @copyright 2018 Codex Project
 * @author Robin Radic
 * @license https://codex-project.mit-license.org MIT License
 */
let packages = [
    '@thebespokepixel/es-tinycolor',
    '@thebespokepixel/meta',
    '@thebespokepixel/n-selector',
    '@thebespokepixel/string',
    '@thebespokepixel/time',
    'trucolor',
    'truwrap',
    'verbosity',
    'sgr-composer',
    'term-ng'
]


packages.forEach(name => {
    let paths = globule.find(path.resolve('node_modules', name, '**/*', 'index-v8.js'));
    paths.forEach(path => {
        if(!fs.existsSync(path)) {
            return;
        }
        let destPath = path.replace('v8', 'v9');
        if(!fs.existsSync(destPath)) {
            console.log({path,destPath})
            fs.writeFileSync(destPath, fs.readFileSync(path, 'utf-8'), 'utf-8');
        }

    })
})






