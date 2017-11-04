
const BaseSet = require('./base-set.js');
const Types = require('./types.js');

class Config {
    constructor(options) {
        this.update(options);
    }

    clear() {
        var self = this;
        w.each(self, (value, key) => {
            delete self[key];
        });
        return self;
    }

    update(obj, options = { deep: true }) {
        w.fuse(this, obj, options);
        return this;
    }
}

class Chunk {
    constructor(payload) {
        this.payload = payload;
    }
}

const liteConfig = (obj1, obj2) => {
    if(!obj2)
        return obj1;
    for(var key in obj2) {
        obj1[key] = obj2[key];
    }
    return obj1;
};

var w = {
    all: (obj, func) => {
        var flag = true,
            condition = w.isFunction(func) ? func : x => x == func;
        w.each(obj, (value, key, event) => {
            if(!condition(value, key, event)) {
                flag = false;
                event.stop = true;
            }
        });
        return flag;
    },
    any: (obj, func) => {
        var flag = false,
            condition = w.isFunction(func) ? func : x => x == func;
        w.each(obj, (value, key, event) => {
            if(condition(value, key, event)) {
                flag = true;
                event.stop = true;
            }
        });
        return flag;
    },
    contains: (obj, func) => w.isString(obj) ? obj.contains(w.isFunction(func) ? func(obj) : func) : w.isSet(w.search(obj, func)),
    clone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    copy: (obj) => {
        var base = w.isArray(obj) ? [] : {};
        return w.fuse(base, obj, { deep: true });
    },
    count: (obj, func) => {
        var count = 0,
            key = w.isFunction(func) ? func : x => w.isSet(x) ? 1 : 0;

        var result;
        w.each(obj, (x, y, z) => {
            result = key(x, y, z);
            if(!z.skip)
                count += result;
        });
        return count;
    },
    distinct: (obj, func) => {
        var index = [],
            key = w.isFunction(func) ? func : x => x;
        
        return w.map(obj, (x, y, z) => {
            var item = key(x, y);
            if(index.indexOf(item) == -1) {
                index.push(item);
                return x;
            } else
                z.skip = true;
        });
    },
    each: (obj, func, options) => {
        var event = liteConfig({
            deepTypes: [ Types.array, Types.obj ],
            stop: false,
            deep: false, 
            all: false
        }, options);

        if(w.isArray(obj)) {
            for(var i = 0, il = obj.length; i < il; i++) {
                func(obj[i], i, event);
                if(event.deep && event.deepTypes.indexOf(w.typeOf(obj[i])) > -1)
                    w.each(obj[i], func, event);
                if(event.stop) 
                    break;
            }
        } else if(w.isNumber(obj)) {
            var count = 0,
                target = Math.abs(obj);
            while(count < target) {
                count++;
                func(count, target, event);
                if(event.stop) 
                    break;
            }
        } else {
            for(var key in obj) {
                if(event.all || obj.hasOwnProperty(key)) {
                    func(obj[key], key, event);
                    if(event.deep && event.deepTypes.indexOf(w.typeOf(obj[key])) > -1)
                        w.each(obj[key], func, event);
                }
                if(event.stop) 
                    break;
            }
        }
    },
    filter: (obj, func) => {
        var isArray = w.isArray(obj),
            retval = isArray ? [] : {},
            flag = true,
            add = (item, key) => {
                if(isArray)
                    retval.push(item);
                else
                    retval[key] = item;
            },
            condition = w.isFunction(func) ? func : (value, key) => {
                flag = true;
                w.each(func, (x, y) => {
                    if(value[y] != x)
                        flag = false;
                });
                return flag;
            };
            
        w.each(obj, (x, y, z) => {
            if(condition(x, y, z))
                add(x, y);
        });
        return retval;
    },
    first: (obj, options) => {
        var event = liteConfig({
            handler: (x, y) => x,
            take: 1
        }, options);
        
        var item = [];
        w.each(obj, (x, y, z) => {
            item.push(event.handler(x, y));
            z.stop = (item.length >= event.take);
        });
        return event.take == 1 ? item[0] : item;
    },
    fuse: (obj1, obj2, options) => {
        var event = liteConfig({
            deepTypes: [ Types.array, Types.obj ],
            stop: false,
            deep: false, 
            all: false,
            handler: null
        }, options);
        
        var target;
        w.each(obj2, (value, key, e) => {
            target = value;
            if(event.handler && w.isFunction(event.handler))
                event.handler({ obj1: obj1, obj2: obj2, value: value, key: key }, event, e);
            if(e.stop || e.skip)
                return;

            if(w.isObject(target) && w.prop(obj1[key]) instanceof Config)
                obj1[key].update(target, true);
            else if(w.isObject(target) && target instanceof Chunk)
                obj1[key] = target.payload;
            else {
                if(event.deep && (w.isArray(target) || w.isObject(target))) {
                    if(!w.isSet(obj1[key]))
                        obj1[key] = w.isArray(target) ? [] : {};
                    w.fuse(obj1[key], target, event);
                } else
                    obj1[key] = target;
            }
        }, event);
    },
    group: (obj, func) => {
        var key = w.isFunction(func) ? func : (w.isString(func) ? x => w.prop(x, func) : x => x),
            map = {},
            value = null;
        
        w.each(obj, (x, y, z) => {
            value = key(x, y);
            if(w.isString(value) || w.isNumber(value)) {
                if(w.isSet(map[value]))
                    map[value].push(x);
                else
                    map[value] = [x]
            }
        });

        return w.map(map, (x, y) => ({ group: y, items: x }));
    },
    index: (obj, key, value) => {
        key = w.isFunction(key) ? key : (x, y) => y;
        value = w.isFunction(value) ? value : x => x;
        return w.map(obj, (x, y) => ({ key: key(x, y), value: value(x, y) }), { build: {} });
    },
    intersect: (obj1, obj2, options) => {
        var event = liteConfig({
            build: [],
            add: (x1, x2, y) => event.build.push({ key: y, item1: x1, item2: x2 }),
            key: (x, y) => x,
            value: (x, y) => x
        }, options);

        var index1 = w.index(obj1, event.key, event.value),
            index2 = w.index(obj2, event.key, event.value);

        w.each(index1, (x, y) => {
            if(index2[y] != undefined)
                event.add(x, index2[y], y);
        });

        return event.build;
    },
    isArguments: (obj) => w.typeOf(obj) == Types.args,
    isArray: (obj) => w.typeOf(obj) == Types.array,
    isBool: (obj) => w.typeOf(obj) == Types.bool,
    isDate: (obj) => w.typeOf(obj) == Types.date,
    isDefined: function() {
        return w.all(arguments, arg => BaseSet.defaultConditions(arg));
    },
    isFunction: (obj) => w.typeOf(obj) == Types.function,
    isNumber: (obj) => w.typeOf(obj) == Types.integer && !isNaN(obj),
    isNull: (obj) => w.typeOf(obj) == Types.null,
    isNaN: (obj) => w.typeOf(obj) == Types.integer && isNaN(obj),
    isObject: (obj) => w.typeOf(obj) == Types.obj,
    isSameType: (obj1, obj2) => w.typeOf(obj1) == w.typeOf(obj2),
    isSet: function() {
        return w.all(arguments, arg => BaseSet.setConditions(arg));
    },
    isString: (obj) => w.typeOf(obj) == Types.string,
    isRegex: (obj) => w.typeOf(obj) == Types.regex,
    isUndefined: (obj) => w.typeOf(obj) == Types.undefined,
    last: (obj, options) => {
        var event = liteConfig({
            handler: (x, y) => x,
            take: 1
        }, options);

        var keys = w.map(obj, (x, y) => y).reverse();
        
        var item = [];
        w.each(keys, (x, y, z) => {
            item.push(event.handler(obj[x], x));
            z.stop = (item.length >= event.take);
        });
        return event.take == 1 ? item[0] : item;
    },
    map: (obj, func, options) => {
        var value = null,
            key = w.isFunction(func) ? func : v => v;

        var event = liteConfig({
            stop: false,
            skip: false,
            many: false,
            build: [],
            add: x => {
                if(isArray)
                    event.build.push(x);
                else
                    event.build[x.key] = x.value;
            }
        }, options);
        var isArray = w.isArray(event.build);

        w.each(obj, (x, y, z) => {
            value = key(x, y, event);
            z.skip = event.skip;
            z.stop = event.stop;
            if(event.skip)
                event.skip = false;
            else {
                if(event.many) {
                    w.each(value, v => event.add(v));
                    event.many = false;
                } else
                    event.add(value);
            }
        });
        return event.build;
    },
    match: (obj1, obj2, options) => {
        var flag = true,
            event = liteConfig({
                checkType: false, 
                recursive: true, 
                explicit: false
            }, options);

        if(event.checkType)
            if(!w.isSameType(obj1, obj2))
                return false;
        if((!w.isSet(obj1) && w.isSet(obj2)) || (w.isSet(obj1) && !w.isSet(obj2)))
            return false;

        w.each(obj1, (x, y, z) => {
            if(event.recursive && (w.isObject(x) || w.isArray(x))) {
                if(!w.match(x, obj2[y], event)) {
                    z.stop = true;
                    flag = false;
                }
            } else if(event.explicit ? obj2[y] !== x : obj2[y] != x) {
                z.stop = true;
                flag = false;
            }
        });
        if(flag) {
            w.each(obj2, (x, y, z) => {
                if(event.recursive && (w.isObject(x) || w.isArray(x))) {
                    if(!w.match(x, obj1[y], event)) {
                        z.stop = true;
                        flag = false;
                    }
                } else if(event.explicit ? obj1[y] !== x : obj1[y] != x) {
                    z.stop = true;
                    flag = false;
                }
            });
        }
        return flag;
    },
    move: (obj, key1, key2) => {
        if(key1 != key2) {
            if (w.isArray(obj)) 
                obj.splice(key2, 0, obj.splice(key1, 1)[0]);
            else {
                obj[key2] = obj[key1];
                delete obj[key1];
            }
        }
        return obj;
    },
    prop: (obj, path, value) => {
        if(w.isSet(obj, path) && path != '') {
            var current = obj,
                paths = path.split('.');
            if(w.isSet(value)) {
                current = paths.pop();
                w.each(paths, p => {
                    if(!w.isSet(obj[p]))
                        obj[p] = {};
                    obj = obj[p];
                });
                obj[current] = value;
            } else {
                w.each(paths, (p, i, e) => {
                    current = current[p];
                    if(!w.isSet(current))
                        e.stop = true;
                });
                return current;
            }
        } else
            return obj;
    },
    remove: (obj, target) => {
        if(w.isArray(obj)) {
            var idx = obj.indexOf(target);
            if(idx > -1)
                obj.splice(idx, 1);
        } else if(w.isObject(obj)) {
            var key = me.search(obj, target, { getKey: true });
            delete obj[key];
        }
        return obj;
    },
    removeAt: (obj, key) => {
        if (w.isArray(obj)) {
            if (key > -1) 
                obj.splice(key, 1);
        } else if (w.isObject(obj))
            delete obj[key];
        return obj;
    },
    search: (obj, func, options) => {
        var event = liteConfig({
            return: null,
            default: null,
            getKey: false,
            state: false,
            handler: w.isFunction(func) ? func : x => x == func
        }, options);

        if(w.isSet(obj)) {
            if(w.isArray(obj) && !w.isFunction(func))
                event.return = obj[obj.indexOf(func)];
            else {
                w.each(obj, (value, key, e) => {
                    event.state = event.handler(value, key, e);
                    if(event.state) {
                        event.return = event.getKey ? key : value;
                        e.stop = true;
                    }
                }, event);
            }
        }
        return w.isSet(event.return) ? event.return : event.default;
    },
    sort: (array, options) => {
        if(!options)
            options = { dir: 'asc', key: x => x };
        if(!w.isArray(options))
            options = [options];
        var o = w.map(options, x => liteConfig({ dir: 'asc', key: v => v }, x));
        var rev, result, A, B;
        return array.slice().sort((a, b) => {
            w.each(o, (x, y, z) => {
                rev = Boolean(x.dir == 'asc');
                result = 0;
                A = x.key(a);
                B = x.key(b);

                result = (A < B ? -1 : A > B ? 1 : 0) * [-1, 1][+!!rev];

                if(result != 0)
                    z.stop = true;
            });
            return result;
        });
    },
    switch: (value, hash, def) => {
        var retval = hash[value];
        if(!w.isSet(retval))
            retval = def;
        if (w.isFunction(retval)) 
            retval = retval(value, hash, def);
        return retval;
    },
    typeOf: (obj) => BaseSet.obj.toString.call(obj).match(/\s([a-zA-Z]+)/)[1]
};

w.Config = Config;
w.Chunk = Chunk;

module.exports = w;
