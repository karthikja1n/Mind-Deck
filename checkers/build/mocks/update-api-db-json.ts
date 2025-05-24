import { resolve } from 'path';
import * as globule from 'globule';
import { writeFileSync } from 'fs';

const prefix = 'http://codex.loval/api/v1/'

let files = globule.find(resolve(__dirname, 'api.*.json'));

const data = files.map(filePath => {
    let data = require(filePath);
    let url  = filePath
        .replace(__dirname, '')
        .replace(/\./g, '/')
        .replace('/json', '')
        .replace(/^\/index/, '?fetch=app,project,layout');

    return { url, filePath } // data
})


let filePath = resolve(__dirname, 'api.v1.json');
let root = {
    url : '/', filePath,
    // data: require(filePath)
}
data.push(root)


writeFileSync(resolve(__dirname, '..', 'api.db.json'), JSON.stringify(data, null, 4), 'utf-8')

// console.dir(data, {colors:true, depth:2})