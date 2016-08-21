var EventUtil = {
    addHandler: function(element, type, handler, bool) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, bool | false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    removeHandler: function(element, type, handler, bool) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, bool | false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = undefined;
        }
    }
};

var EventTarget = function() {
    this._listener = {};
};

EventTarget.prototype = {
    constructor: this,
    addEvent: function(type, fn) {
        if (typeof type === "string" && typeof fn === "function") {
            if (typeof this._listener[type] === "undefined") {
                this._listener[type] = [fn];
            } else {
                this._listener[type].push(fn);
            }
        }
        return this;
    },
    /*addEvents: function(obj) {
        obj = typeof obj === "object" ? obj : {};
        var type;
        for (type in obj) {
            if (type && typeof obj[type] === "function") {
                this.addEvent(type, obj[type]);
            }
        }
        return this;
    },*/
    fireEvent: function(type, data) {
        if (type && this._listener[type]) {
            var events = {
                type: type,
                target: this,
                data: data
            };

            for (var length = this._listener[type].length, start = 0; start < length; start += 1) {
                this._listener[type][start].call(this, events);
            }
        }
        return this;
    },
    /*fireEvents: function(array) {
        if (array instanceof Array) {
            for (var i = 0, length = array.length; i < length; i += 1) {
                this.fireEvent(array[i]);
            }
        }
        return this;
    },*/
    removeEvent: function(type, key) {
        var listeners = this._listener[type];
        if (listeners instanceof Array) {
            if (typeof key === "function") {
                for (var i = 0, length = listeners.length; i < length; i += 1) {
                    if (listeners[i] === key) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            } else if (key instanceof Array) {
                for (var lis = 0, lenkey = key.length; lis < lenkey; lis += 1) {
                    this.removeEvent(type, key[lenkey]);
                }
            } else {
                delete this._listener[type];
            }
        }
        return this;
    },
    /*removeEvents: function(params) {
        if (params instanceof Array) {
            for (var i = 0, length = params.length; i < length; i += 1) {
                this.removeEvent(params[i]);
            }
        } else if (typeof params === "object") {
            for (var type in params) {
                this.removeEvent(type, params[type]);
            }
        }
        return this;
    }*/
};