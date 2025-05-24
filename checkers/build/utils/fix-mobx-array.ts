/// mobx problem workaround
// To overcome the problem of Array.isArray(observable([])) not returning true I used a dirty workaround.
// Basically I overwrite Array.isArray native function to include observableArrays detection.
Array[ 'isArrayNative' ] = Array.isArray;
Array[ 'isArray' ]       = function isArray(arg: any[]): arg is any[] {
    return Array[ 'isArrayNative' ](arg) || require('mobx').isObservableArray(arg);
};
/// end mobx problem workaround


