const w = require('./source');

String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2);
};
String.prototype.replaceWhile = function (str1, str2, condition, ignoreCase) {
    var result = this.replaceAll(str1, str2, ignoreCase);
    var limit = 10000;
    while (condition(result) && limit--) {
        result = result.replaceAll(str1, str2, ignoreCase);
    }return result;
};
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return w.isSet(args[number]) ? args[number] : match;
    });
};
String.prototype.contains = function (value, ignoreCase) {
    if(w.isString(value)) {
        if (ignoreCase) return this.toLowerCase().indexOf(value.toLowerCase()) > -1;
        return this.indexOf(value) > -1;
    } else if(w.isRegex(value)) {
        return w.isSet(value.match(value));
    }
    return false;
};
String.prototype.whiteout = function (items) {
    var self = this;
    if (items) {
        var temp = self.slice(0);
        if (w.isArray(items)) 
            w.each(items, v => { temp = temp.replace(v, ''); });
        else if (w.isString(items)) 
            temp = temp.replace(items, '');
        return temp.trim();
    }
    return this;
};
String.prototype.capitalize = function () {
    return this.replace(/[^\s]+/g, function (word) {
        return word.replace(/^./, function (first) {
            return first.toUpperCase();
        });
    });
};
String.prototype.firstWord = function () {
    var index = this.indexOf(' ');
    if (index > -1) return this.substring(0, index);
    return this;
};
String.prototype.truncate = function(amount, ind) {
    var length = parseInt(amount || 50);
    var indicator = ind || '...';
    if(length < this.length)
        return this.substring(0, length - indicator.length) + indicator;
    else
        return this;
};

module.exports = {};
