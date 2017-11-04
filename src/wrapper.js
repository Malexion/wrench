
var w = require('./source.js');
var Conditional = require('./classes/conditional.js');

class Wrench {
    
    constructor(obj, parent) {
        this.content = obj;
        this.parent = parent;
    }

    all(func) {
        this.content = w.all(this.content, func);
        return this;
    }

    any(func) {
        this.content = w.any(this.content, func);
        return this;
    }

    branch() {
        return new Wrench(this.content, this);
    }

    contains(func) {
        this.content = w.contains(this.content, func);
        return this;
    }

    clone() {
        this.content = w.clone(this.content);
        return this;
    }
    
    copy() {
        this.content = w.copy(this.content);
        return this;
    }

    count(func) {
        this.content = w.count(this.content, func);
        return this;
    }

    distinct(func) {
        this.content = w.distinct(this.content, func);
        return this;
    }

    do(func) {
        if(w.isFunction(func))
            func(this);
        return this;
    }

    each(func, options) {
        w.each(this.content, func, options);
        return this;
    }

    filter(func) {
        this.content = w.filter(this.content, func);
        return this;
    }

    first(options) {
        this.content = w.first(this.content, options);
        return this;
    }

    fuse(obj, options) {
        this.content = w.fuse(this.content, obj, options);
        return this;
    }

    group(func) {
        this.content = w.group(this.content, func);
        return this;
    }

    if(condition) {
        return new Conditional((accept, reject) => {
            var result = Boolean(condition);
            if(w.isFunction(condition))
                result = condition(this.branch());

            if(result instanceof Wrench)
                result = result.content;

            result ? accept(this) : reject(this);
        });
    }

    index(key, value) {
        this.content = w.index(this.content, key, value);
        return this;
    }

    intersect(obj, func1, func2) {
        this.content = w.intersect(this.content, obj, func1, func2);
        return this;
    }

    isArguments() {
        this.content = w.isArguments(this.content);
        return this;
    }

    isArray() {
        this.content = w.isArray(this.content);
        return this;
    }

    isBool() {
        this.content = w.isBool(this.content);
        return this;
    }

    isDate() {
        this.content = w.isDate(this.content);
        return this;
    }

    isDefined() {
        this.content = w.isDefined(this.content);
        return this;
    }

    isFunction() {
        this.content = w.isFunction(this.content);
        return this;
    }

    isNumber() {
        this.content = w.isNumber(this.content);
        return this;
    }

    isNull() {
        this.content = w.isNull(this.content);
        return this;
    }

    isNaN() {
        this.content = w.isNaN(this.content);
        return this;
    }

    isObject() {
        this.content = w.isObject(this.content);
        return this;
    }

    isSameType(obj) {
        this.content = w.isSameType(this.content, obj);
        return this;
    }

    isSet() {
        this.content = w.isSet(this.content);
        return this;
    }

    isString() {
        this.content = w.isString(this.content);
        return this;
    }

    isRegex() {
        this.content = w.isRegex(this.content);
        return this;
    }

    isUndefined() {
        this.content = w.isUndefined(this.content);
        return this;
    }

    last(options) {
        this.content = w.last(this.content, options);
        return this;
    }

    map(func, options) {
        this.content = w.map(this.content, func, options);
        return this;
    }

    matches(obj, options) {
        this.content = w.match(this.content, obj, options);
        return this;
    }

    merge() {
        if(this.parent) {
            this.parent.content = this.content;
            return this.parent;
        }
        return this;
    }

    move(key1, key2) {
        this.content = w.move(this.content, key1, key2);
        return this;
    }

    prop(path, value) {
        this.content = w.prop(this.content, path, value);
        return this;
    }

    remove(target) {
        var key = null;
        if(w.isArray(this.content))
            key = this.content.indexOf(target);
        else if(w.isObject(this.content))
            key = me.search(this.content, target, { getKey: true });
        return this.removeAt(key);
    }

    removeAt(key) {
        if (w.isArray(this.content)) {
            if (key > -1) 
                this.content.splice(key, 1);
        } else if (w.isObject(this.content))
            delete this.content[key];
        return this;
    }

    search(func, options) {
        this.content = w.search(this.content, func, options);
        return this;
    }

    sort(options) {
        this.content = w.sort(this.content, options);
        return this;
    }

    source(value) {
        this.content = value instanceof Wrench ? value.content : value;
        return this;
    }

    switch(hash, def) {
        this.content = w.switch(this.content, hash, def);
        return this;
    }

    typeOf() {
        this.content = w.typeOf(this.content);
        return this;
    }

    value(def) {
        if(!w.isSet(this.content) && def != undefined)
            return def;
        return this.content;
    }

}

module.exports = function(obj) {
    return new Wrench(obj);
};
