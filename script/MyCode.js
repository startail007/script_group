var Point = function(pX, pY) {
    this.x = pX || 0;
    this.y = pY || 0;    
    this.set = function(pX, pY) {
        this.x = pX;
        this.y = pY;
    };
    /*this.additional = function(pP) {
        this.x += pP.x;
        this.y += pP.y;
        return this;
    };
    this.subtract = function(pP) {
        this.x -= pP.x;
        this.y -= pP.y;
        return this;
    };
    this.multiply = function(pV) {
        this.x *= pV;
        this.y *= pV;
        return this;
    };
    this.divide = function(pV) {
        this.x /= pV;
        this.y /= pV;
        return this;
    };*/
    this.add = function(pP) {
        return new Point(this.x + pP.x, this.y + pP.y);
    };
    this.sub = function(pP) {
        return new Point(this.x - pP.x, this.y - pP.y);
    };
    this.mul = function(pV) {
        return new Point(this.x * pV, this.y * pV);
    };
    this.div = function(pV) {
        return new Point(this.x / pV, this.y / pV);
    };
    this.len = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    this.clone = function() {
        return new Point(this.x, this.y);
    };
};
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
};

var Drag = function() {
    var mObj = null
    this.list = new EventTarget();
    var MPoint = new Point();
    var OldMPoint = new Point();
    var MoveBool = false;
    var timeID;
    var OriginalBool = false;
    this.Bind = function(pObj) {
        mObj = pObj;
        EventUtil.addHandler(mObj, 'mousedown', MD.bind(this));
        EventUtil.addHandler(window, 'mousemove', MM.bind(this));
        EventUtil.addHandler(window, 'mouseup', MU.bind(this));
    }
    this.unBind = function() {
        if (mObj != null) {
            EventUtil.removeHandler(mObj, 'mousedown', MD);
            EventUtil.removeHandler(window, 'mousemove', MM);
            EventUtil.removeHandler(window, 'mouseup', MU);
            mObj = null;
        }
    }

    function Original() {
        OriginalBool = true;
    }
    var MD = function(e) {
        OriginalBool = false
        clearTimeout(timeID);
        timeID = setTimeout(Original, 60);
        MoveBool = true;
        MPoint.set(e.clientX, e.clientY);
        this.list.fireEvent('Begin', {
            Point: MPoint,
            OldPoint: OldMPoint
        });
        e.preventDefault();
    }
    var MM = function(e) {
        if (MoveBool) {
            OriginalBool = false
            clearTimeout(timeID);
            timeID = setTimeout(Original, 60);
            OldMPoint.set(MPoint.x, MPoint.y);
            MPoint.set(e.clientX, e.clientY);
            this.list.fireEvent('Process', {
                Point: MPoint,
                OldPoint: OldMPoint
            });
            e.preventDefault();
        }
    }
    var MU = function(e) {
        if (MoveBool) {
            MoveBool = false;
            if (OriginalBool) {
                OldMPoint.set(MPoint.x, MPoint.y);
            }
            this.list.fireEvent('End', {
                Point: MPoint,
                OldPoint: OldMPoint
            });
            e.preventDefault();
        }
    }
};
var Style = function(pElement) {
    return {
        get left() {
            return Number(pElement.style.left.replace('px', '') || pElement.offsetLeft);
        },
        set left(pValue) {
            pElement.style.left = pValue + 'px';
        },
        get top() {
            return Number(pElement.style.top.replace('px', '') || pElement.offsetTop);
        },
        set top(pValue) {
            pElement.style.top = pValue + 'px';
        },
        get width() {
            return Number(pElement.style.width.replace('px', '') || pElement.offsetWidth);
        },
        set width(pValue) {
            pElement.style.width = pValue + 'px';
        },
        get height() {
            return Number(pElement.style.height.replace('px', '') || pElement.offsetHeight);
        },
        set height(pValue) {
            pElement.style.height = pValue + 'px';
        },
    };
}

var getPosition = function(el) {
    var Rect = el.getBoundingClientRect();
    return new Point(Rect.left + window.scrollX, Rect.top + window.scrollY);
}

var DrawGradientLine = function(pCanvas, pBeginPoint, pEndPoint, pBeginColor, pEndColor, pThickness) {
    var ctx = pCanvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = pThickness || 1;
    var lingrad = ctx.createLinearGradient(pBeginPoint.x, pBeginPoint.y, pEndPoint.x, pEndPoint.y);
    lingrad.addColorStop(0, pBeginColor);
    lingrad.addColorStop(1, pEndColor);
    ctx.beginPath();
    ctx.strokeStyle = lingrad;
    ctx.moveTo(pBeginPoint.x, pBeginPoint.y);
    ctx.lineTo(pEndPoint.x, pEndPoint.y);
    ctx.stroke();
}

var DrawLine = function(pCanvas, pBeginPoint, pEndPoint, pColor, pThickness) {
    var ctx = pCanvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = pThickness || 1;
    ctx.beginPath();
    ctx.strokeStyle = pColor;
    ctx.moveTo(pBeginPoint.x, pBeginPoint.y);
    ctx.lineTo(pEndPoint.x, pEndPoint.y);
    ctx.stroke();
}

var Change16 = function(pValue) {
    var r = (pValue >> 16) & 0xff;
    var g = (pValue >> 8) & 0xff;
    var b = pValue & 0xff;
    return '#' + (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (b < 16 ? '0' : '') + b.toString(16);
}
var Ease = {
    Quadratic: function(k) {
        return k * (2 - k);
    }
}
var TweenPlayProp = function(pDelay, pDuration, pEase) {
    this.delay = pDelay || 0;
    this.duration = pDuration || 0;
    this.ease = pEase || null;
}
var Tween = function() {
    var mObj = null;
    //var mObjStyle = null;
    var StyleList = new Array();
    var PlayPropList = new Array();
    var DurationId;
    var DelayId;
    var mLoop = false;
    this.list = new EventTarget();
    this.Bind = function(pObj) {
        mObj = pObj;
    }
    this.unBind = function() {
        if (mObj != null) {
            mObj = null;
        }
    }
    this.Push = function(pStyle, pPlayProp) {
        StyleList.push(pStyle);
        var TweenPlayProp01
        if (pPlayProp) {
            TweenPlayProp01 = new TweenPlayProp(pPlayProp.delay, pPlayProp.duration, pPlayProp.ease);
        } else {
            TweenPlayProp01 = new TweenPlayProp();
        }
        PlayPropList.push(TweenPlayProp01);
        return this;
    }
    this.Play = function(pLoop) {
        if (StyleList.length) {
            ClearPlay();
            mLoop = pLoop || false;
            DelayPlay.call(this, 0, true);
        }
    }
    this.Stop = function() {
        ClearPlay();
    }
    var ClearPlay = function() {
        clearTimeout(DelayId);
        clearInterval(DurationId);
    }
    this.Clear = function() {
        clearTimeout(DelayId);
        clearInterval(DurationId);
        for (var temp in StyleList) {
            delete StyleList[temp]
            StyleList[temp] = null;
        }
        StyleList = new Array();
        for (var temp in PlayPropList) {
            delete PlayPropList[temp]
            PlayPropList[temp] = null;
        }
        PlayPropList = new Array();
    }

    var DelayPlay = function(pIndex, pNextBool) {
        clearTimeout(DelayId);
        DelayId = setTimeout(function() {
            DurationPlay.call(this, pIndex, pNextBool)
        }.bind(this), PlayPropList[pIndex].delay * 1000)

    }
    var DurationPlay = function(pIndex, pNextBool) {
        pIndex = pIndex || 0;
        pNextBool = pNextBool || false;
        var Begin = {};
        var End = {};
        for (var Prop in StyleList[pIndex]) {
            var temp = mObj[Prop]
            if (temp != undefined) {
                Begin[Prop] = temp;
                End[Prop] = StyleList[pIndex][Prop];
            }
        }
        var duration = PlayPropList[pIndex].duration;
        var current = 0;
        var ease = PlayPropList[pIndex].ease;
        clearInterval(DurationId);
        DurationId = setInterval(function() {
            current += 1 / 60;
            var Progress = Math.min(current / duration, 1);
            if (ease != null) {
                Progress = ease(Progress);
            }
            this.list.fireEvent('Process', {
                Progress: Progress
            });
            if (Progress >= 1) {
                clearInterval(DurationId);
                if (pNextBool && pIndex + 1 < StyleList.length) {
                    DelayPlay.call(this, pIndex + 1, pNextBool);
                } else {
                    this.list.fireEvent('Complete');
                    if (mLoop) {
                        DelayPlay.call(this, 0, pNextBool);
                    }
                }
            }
            for (var Prop in Begin) {
                mObj[Prop] = End[Prop] * Progress + Begin[Prop] * (1 - Progress);
            }
        }.bind(this), 1000 / 60)
    }
};

var Slide = function() {
    var mObj = null;
    var mRectObj = null;
    var mX = 0;
    var mY = 0;
    var mLock = true;
    var mLeft = 0;
    var mRight = 0;
    var mTop = 0;
    var mBottom = 0;
    var Process = {
        get width() {
            return mRight - mObj.width - mLeft;
        },
        get height() {
            return mBottom - mObj.height - mTop;
        },
        get x() {
            var temp = Process.width;
            temp = temp == 0 ? 0 : 1 / temp;
            return (Position.x - mLeft) * temp;
        },
        set x(pValue) {
            Position.x = mLeft + pValue * Process.width;
        },
        get y() {
            var temp = Process.height;
            temp = temp == 0 ? 0 : 1 / temp;
            return (Position.y - mTop) * temp;
        },
        set y(pValue) {
            Position.y = mTop + pValue * Process.height;
        },
    }
    var Position = {
        get x() {
            return mX;
        },
        set x(pValue) {
            var temp = mRight - mObj.width;
            if (temp < mLeft) {
                mX = mLock ? Math.min(Math.max(pValue, temp), mLeft) : pValue;
            } else {
                mX = mLock ? Math.min(Math.max(pValue, mLeft), temp) : pValue;
            }
            if (mObj != null && mRectObj != null) {
                mObj.left = mX;
            }
        },
        get y() {
            return mY;
        },
        set y(pValue) {
            var temp = mBottom - mObj.height;
            if (temp < mTop) {
                mY = mLock ? Math.min(Math.max(pValue, temp), mTop) : pValue;
            } else {
                mY = mLock ? Math.min(Math.max(pValue, mTop), temp) : pValue;
            }
            if (mObj != null && mRectObj != null) {
                mObj.top = mY;
            }
        },
        set lock(pValue) {
            mLock = pValue;
            Position.x = mX;
            Position.y = mY;
        },
        get lock() {
            return mLock;
        }
    }
    var Range = {
        get left() {
            return mLeft;
        },
        set left(pValue) {
            mLeft = pValue;
            Position.x = mX;
            Position.y = mY;
        },
        get top() {
            return mTop;
        },
        set top(pValue) {
            mTop = pValue;
            Position.x = mX;
            Position.y = mY;
        },
        get right() {
            return mRight;
        },
        set right(pValue) {
            mRight = pValue;
            Position.x = mX;
            Position.y = mY;
        },
        get bottom() {
            return mBottom;
        },
        set bottom(pValue) {
            mBottom = pValue;
            Position.x = mX;
            Position.y = mY;
        }
    }

    this.Range = Range;
    this.Position = Position;
    this.Process = Process;
    this.list = new EventTarget();
    this.Bind = function(pObj) {
        mObj = pObj;
        Position.x = mX;
        Position.y = mY;
    }
    this.unBind = function() {
        if (mObj != null) {
            mObj = null;
        }
    }
    this.BindRect = function(pObj) {
        mRectObj = pObj;
        Range.right = mRectObj.width;
        Range.bottom = mRectObj.height;
        Position.x = mX;
        Position.y = mY;
    }
    this.unBindRect = function() {
        if (mRectObj != null) {
            mRectObj = null;
        }
    }
};