import * as React from 'react';
import withStyles from 'react-typestyle-preset';
import hoistNonReactStatics from 'hoist-non-react-statics';
import ReactCSSModules from 'react-css-modules';
import { guid } from 'inversify';
import { DndOptions, DragDropContext, DragSource, DragSourceCollector, DragSourceSpec, DropTarget, DropTargetCollector, DropTargetSpec, Identifier } from 'react-dnd';
import FormClass, { FormCreateOption } from 'antd/es/form';


const log = require('debug')('decorators')


export function CSSModules(style) {
    return (target) => {
        // log('@CSSModules', {style,target})
        let decorator = ReactCSSModules(style, { allowMultiple: true, handleNotFoundStyleName: 'log' })
        return hoistNonReactStatics(decorator(target), target) as any;
    }
}

export declare module CSSModules {
    export interface InjectedCSSModuleProps<T=any> {
        styles?: T;
    }
}

export function form(FormObj: typeof FormClass, opts: FormCreateOption<any> = {}) {
    return (target) => {
        return FormObj.create(opts)(target) as any
    }
}

export function WithStyles() {
    return (target) => {
        return withStyles(target) as any
    }
}

export function Hot<T>(module: any) {
    return (source) => {
        if ( DEV ) {
            let decorator = require('react-hot-loader').hot(module);
            let wrapped = decorator(source);
            // let hoisted = hoistNonReactStatics(source, decorator(source))
            // log('@Hot',module.id, {wrapped, module,source})
            return wrapped;
        }
        return source;
    }
}

export function DNDTarget<P>(types: Identifier | Identifier[] | ((props: P) => Identifier | Identifier[]),
                             spec: DropTargetSpec<P>,
                             collect: DropTargetCollector,
                             options?: DndOptions<P>) {
    return target => {
        return DropTarget(types, spec, collect, options)(target as any) as any
        // return target;
    }
}

export function DNDSource<P>(type: Identifier | ((props: P) => Identifier),
                             spec: DragSourceSpec<P>,
                             collect: DragSourceCollector,
                             options?: DndOptions<P>) {
    return target => {
        return DragSource(type, spec, collect, options)(target as any) as any
        // return target;
    }
}

export function DNDContext(backend) {
    return (target) => {
        return DragDropContext(backend)(target as any) as any
        // return target;
    }
}

export function GUID(name: string = 'GUID') {
    return function decorator<T extends any>(source: T) {
        source.prototype.constructor.prototype[ name ] = guid();
        return source as T;
    }
}

function AddGUID(target: any) {
    // save a reference to the original constructor
    var original = target;

    // the new constructor behaviour
    var f: any = function (...args) {
        console.log('New: ' + original.name);
        return original.apply(this, args)
    }

    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;

    // return new constructor (will override original)
    return f;
}
