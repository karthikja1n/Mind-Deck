import { join, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const path = (...args) => resolve(__dirname, '..', ...args)
let paths  = {
    root        : path(),
    node_modules: path('node_modules'),
    lib         : path('node_modules', 'semantic-ui-react'),
    es          : path('node_modules', 'semantic-ui-react', 'dist', 'es'),
    less        : path('node_modules', 'semantic-ui-less')
}
const read = (path) => readFileSync(resolve(path), 'utf-8')
const write = (path, content) => writeFileSync(resolve(path),content, 'utf-8')

type ComponentNameLocations = { [component: string]: string }
type ComponentLessLocations = { [component: string]: string }

function getComponentNameLocationsFromIndexJS(): ComponentNameLocations {
    let content = read(resolve(paths.es, 'index.js'));
    let expor   = content
        .split('\n')
        .filter(line => line.startsWith('export'))
        .join('\n')
        .replace(/export.*?as\s(.*?)\s\}.*?from\s'.\/(.*?)';/g, '"$1": "$2"')
        .split('\n')
        .join(',\n')

    let json = '{\n' + expor + '\n}';

    return JSON.parse(json);
}

function getComponentLessLocations(loc: ComponentNameLocations): ComponentLessLocations {
    let locs: ComponentLessLocations = {}
    Object.keys(loc).forEach(comp => {
        let [ dir, file ] = loc[ comp ].toLowerCase().split('/');
        let fileName      = file + '.less';
        locs[ comp ]      = join(dir, fileName)
    })
    return locs
}

function prefixLocations(prefix: string, locs: ComponentNameLocations | ComponentLessLocations) {
    Object.keys(locs).forEach(comp => locs[ comp ] = join(prefix, locs[ comp ]))
    return locs
}

let nameLocations = getComponentNameLocationsFromIndexJS();
let lessLocations = getComponentLessLocations(nameLocations);

// nameLocations = prefixLocations('semantic-ui-react/dist/es', nameLocations);
// lessLocations = prefixLocations('semantic-ui-less/definitions', lessLocations);

Object.keys(nameLocations).map(key => `${key}: '${nameLocations[key]}'`).join("\n")

let content = `

import { join } from 'path';

export type ComponentLocations = { [component: string]: string }

export function prefixLocations(prefix: string, locs: ComponentLocations):ComponentLocations {
    Object.keys(locs).forEach(comp => locs[ comp ] = join(prefix, locs[ comp ]))
    return locs
}

export const nameLocations:ComponentLocations = {
${Object.keys(nameLocations).map(key => `${key}: '${nameLocations[key]}'`).join(",\n")}
}
export const lessLocations:ComponentLocations = {
${Object.keys(lessLocations).map(key => `${key}: '${lessLocations[key]}'`).join(",\n")}
}
`;

write(resolve(__dirname, 'utils', 'semantic-data.ts'), content)


/*
// Addons
export { default as Confirm } from './addons/Confirm';
export { default as MountNode } from './addons/MountNode';
export { default as Pagination } from './addons/Pagination';
export { default as PaginationItem } from './addons/Pagination/PaginationItem';
export { default as Portal } from './addons/Portal';
export { default as Radio } from './addons/Radio';
export { default as Ref } from './addons/Ref';
export { default as Responsive } from './addons/Responsive';
export { default as Select } from './addons/Select';
export { default as TextArea } from './addons/TextArea';
export { default as TransitionablePortal } from './addons/TransitionablePortal';

 */
