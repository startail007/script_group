/*(function () {
    $.fn.extend({
        Scale: function (pValue) {
            this.css({
                scaleX: pValue,
                scaleY: pValue
            });
        },
        Size: function (pValueW, pValueH) {
            this.css({
                width: pValueW,
                height: pValueH
            });
        },
        Pos: function (pValueX, pValueY) {
            this.css({
                left: pValueX,
                top: pValueY
            });
        },
        Cover: function (pTarget, pAlign) {
            FramePlan.Cover(this, pTarget, pAlign);
        },
        CoverAdjust: function (pTarget, pAlign, options) {
            FramePlan.CoverAdjust(this, pTarget, pAlign, options);
        },
        LockX: function (pTarget, pAlign) {
            FramePlan.LockX(this, pTarget, pAlign);
        },
        LockY: function (pTarget, pAlign) {
            FramePlan.LockY(this, pTarget, pAlign);
        },
        Contain: function (pTarget, pAlign) {
            FramePlan.Contain(this, pTarget, pAlign);
        },
        ContainWH: function (pTarget, pAlign, pWidth, pHeight) {
            FramePlan.ContainWH(this, pTarget, pAlign, pWidth, pHeight);
        },
        ContainAdjust: function (pTarget, pAlign, options) {
            FramePlan.ContainAdjust(this, pTarget, pAlign, options);
        },
        ContainResize: function (pTarget, pAlign, options) {
            FramePlan.ContainResize(this, pTarget, pAlign, options);
        },

    });

})(jQuery);*/

var Point = function (pX, pY) {
    this.x = pX || 0;
    this.y = pY || 0;
    this.set = function (pX, pY) {
        this.x = pX;
        this.y = pY;
    };
    this.sub = function (pP) {
        return new Point(this.x - pP.x, this.y - pP.y);
    };
    this.add = function (pP) {
        return new Point(this.x + pP.x, this.y + pP.y);
    };
    this.mul = function (pV) {
        return new Point(this.x * pV, this.y * pV);
    };
    this.div = function (pV) {
        return new Point(this.x / pV, this.y / pV);
    };
    this.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    this.clone = function () {
        return new Point(this.x, this.y);
    };
};



var Rect = function (pX, pY, pWidth, pHeight) {
    this.x = pX | 0;
    this.y = pY | 0;
    this.width = pWidth | 0;
    this.height = pHeight | 0;
    this.clone = function () {
        return new Rect(this.x, this.y, this.width, this.height)
    }
    this.Narrow = function (pValue) {
        return new Rect(this.x + pValue, this.y + pValue, this.width - pValue * 2, this.height - pValue * 2)
    }
    this.Enlarge = function (pValue) {
        return new Rect(this.x - pValue, this.y - pValue, this.width + pValue * 2, this.height + pValue * 2)
    }

};

function getWidth(pValue) {
    return Number(pValue.style.width.replace('px', '') || pValue.offsetWidth);
}

function getHeight(pValue) {
    return Number(pValue.style.height.replace('px', '') || pValue.offsetHeight);
}

function CoverRate(pFrame, pTarget) {
    var rate0 = getWidth(pFrame) / getWidth(pTarget);
    var rate1 = getHeight(pFrame) / getHeight(pTarget);
    if (rate0 > rate1) {
        return rate0;
    } else {
        return rate1;
    }
}

function ContainRate(pFrame, pTarget) {
    var rate0 = getWidth(pFrame) / getWidth(pTarget);
    var rate1 = getHeight(pFrame) / getHeight(pTarget);
    if (rate0 < rate1) {
        return rate0;
    } else {
        return rate1;
    }
}

/*var FramePlan = new function () {
    return {
        Cover: function (pFrame, pTarget, pAlign) {
            var WRate = pFrame.width() / pTarget.width();
            var HRate = pFrame.height() / pTarget.height();
            var Bool = HRate < WRate;
            var pos = FramePlan.Pos(Bool, pFrame, pTarget, pAlign, WRate, HRate);
            pTarget.Pos(pos.x, pos.y);
            if (Bool) {
                pTarget.Scale(WRate);
            } else {
                pTarget.Scale(HRate);
            }
        },

        CoverAdjust: function (pFrame, pTarget, pAlign, options) {
            defaults = {
                width: 0,
                height: 0
            }
            var settings = $.extend(defaults, options);
            var mW, mH, mX, mY, WRate, HRate;
            mW = pTarget.width() + settings.width;
            mH = pTarget.height() + settings.height;
            mX = settings.width / 2;
            mY = settings.height / 2;
            WRate = pFrame.width() / mW;
            HRate = pFrame.height() / mH;
            var Bool = HRate < WRate;
            var pos = FramePlan.PosEX(Bool, pFrame, pTarget, pAlign, -mX, -mY, mW, mH);
            pTarget.Pos(pos.x, pos.y);
            if (Bool) {
                pTarget.Scale(WRate);
            } else {
                pTarget.Scale(HRate);
            }
        },

        LockX: function (pFrame, pTarget, pAlign) {
            var WRate = pFrame.width() / pTarget.width();
            var HRate = pFrame.height() / pTarget.height();
            var pos = FramePlan.Pos(true, pFrame, pTarget, pAlign, WRate, HRate);
            pTarget.Pos(pos.x, pos.y);
            pTarget.Scale(WRate);

        },

        LockY: function (pFrame, pTarget, pAlign) {
            var WRate = pFrame.width() / pTarget.width();
            var HRate = pFrame.height() / pTarget.height();
            var pos = FramePlan.Pos(false, pFrame, pTarget, pAlign, WRate, HRate);
            pTarget.Pos(pos.x, pos.y);
            pTarget.Scale(HRate);

        },

        Rate: function (pFrame, pTarget) {
            var WRate, HRate;
            WRate = pFrame.width() / pTarget.width();
            HRate = pFrame.height() / pTarget.height();
            var Bool = HRate > WRate;
            return Bool;
        },

        Contain: function (pFrame, pTarget, pAlign) {
            var WRate, HRate;
            WRate = pFrame.width() / pTarget.width();
            HRate = pFrame.height() / pTarget.height();
            var Bool = HRate > WRate;
            var pos = FramePlan.Pos(Bool, pFrame, pTarget, pAlign, WRate, HRate);
            pTarget.Pos(pos.x, pos.y);
            if (Bool) {
                pTarget.Scale(WRate);
            } else {
                pTarget.Scale(HRate);
            }
        },

        ContainWH: function (pFrame, pTarget, pAlign, pWidth, pHeight) {
            var WRate, HRate;
            WRate = pFrame.width() / pWidth;
            HRate = pFrame.height() / pHeight;
            var Bool = HRate > WRate;

            console.log(WRate * pWidth, WRate * pHeight)
            if (Bool) {
                pTarget.Size(WRate * pWidth, WRate * pHeight);
            } else {
                pTarget.Size(HRate * pWidth, HRate * pHeight);
            }
            var pos = FramePlan.PosWH(Bool, pFrame, pTarget, pAlign);
            pTarget.Pos(pos.x, pos.y);
        },

        ContainAdjust: function (pFrame, pTarget, pAlign, options) {
            defaults = {
                width: 0,
                height: 0
            }
            var settings = $.extend(defaults, options);
            var mW, mH, mX, mY, WRate, HRate;
            mW = pTarget.width() + settings.width;
            mH = pTarget.height() + settings.height;
            mX = settings.width / 2;
            mY = settings.height / 2;
            WRate = pFrame.width() / mW;
            HRate = pFrame.height() / mH;
            var Bool = HRate > WRate;
            var pos = FramePlan.PosEX(Bool, pFrame, pTarget, pAlign, -mX, -mY, mW, mH);
            pTarget.Pos(pos.x, pos.y);
            if (Bool) {
                pTarget.Scale(WRate);
            } else {
                pTarget.Scale(HRate);
            }
        },

        ContainResize: function (pFrame, pTarget, pAlign, options) {
            defaults = {
                width: pTarget.width(),
                height: pTarget.height()
            }
            var settings = $.extend(defaults, options);
            var mW, mH, mX, mY, WRate, HRate;
            mW = options.width;
            mH = options.height;
            mX = (pTarget.width() - options.width) / 2;
            mY = (pTarget.height() - options.height) / 2;
            WRate = pFrame.width() / mW;
            HRate = pFrame.height() / mH;
            var Bool = HRate > WRate;
            var pos = FramePlan.PosEX(Bool, pFrame, pTarget, pAlign, mX, mY, mW, mH);
            pTarget.Pos(pos.x, pos.y);
            if (Bool) {
                pTarget.Scale(WRate);
            } else {
                pTarget.Scale(HRate);
            }
        },

        PosEX: function (pBool, pFrame, pTarget, pAlign, pX, pY, pW, pH) {
            var point01;
            pAlign = pAlign || 'CC';
            var mWRate = pFrame.width() / pW;
            var mHRate = pFrame.height() / pH;
            var s0 = pAlign.charAt(0);
            var s1 = pAlign.charAt(1);
            var temp
            if (pBool) {
                if (s0 == 'T') {
                    temp = 0;
                } else if (s0 == 'B') {
                    temp = pH * mWRate - pFrame.height()
                } else {
                    temp = 0.5 * (pH * mWRate - pFrame.height())
                }
                point01 = new Point(-pX * mWRate, -pY * mWRate - temp);
            } else {
                if (s0 == 'L') {
                    temp = 0;
                } else if (s0 == 'R') {
                    temp = pW * mHRate - pFrame.width()
                } else {
                    temp = 0.5 * (pW * mHRate - pFrame.width())
                }
                point01 = new Point(-pX * mHRate - temp, -pY * mHRate);
            }
            return point01;
        },

        Pos: function (pBool, pFrame, pTarget, pAlign, pWRate, pHRate) {
            var mW, mH;
            mW = pTarget.width();
            mH = pTarget.height();
            var point01;
            pAlign = pAlign || 'CC';
            pWRate = pWRate || pFrame.width() / mW;
            pHRate = pHRate || pFrame.height() / mH;
            var s0 = pAlign.charAt(0);
            var s1 = pAlign.charAt(1);
            var temp
            if (pBool) {
                if (s0 == 'T') {
                    temp = 0;
                } else if (s0 == 'B') {
                    temp = mH * pWRate - pFrame.height()
                } else {
                    temp = 0.5 * (mH * pWRate - pFrame.height())
                }
                point01 = new Point(0, -temp);
            } else {
                if (s0 == 'L') {
                    temp = 0;
                } else if (s0 == 'R') {
                    temp = mW * pHRate - pFrame.width()
                } else {
                    temp = 0.5 * (mW * pHRate - pFrame.width())
                }
                point01 = new Point(-temp, 0);
            }
            return point01
        },

        PosWH: function (pBool, pFrame, pTarget, pAlign) {
            var mW, mH;
            mW = pTarget.width();
            mH = pTarget.height();
            var point01;
            pAlign = pAlign || 'CC';
            var s0 = pAlign.charAt(0);
            var s1 = pAlign.charAt(1);
            var temp
            if (pBool) {
                if (s0 == 'T') {
                    temp = 0;
                } else if (s0 == 'B') {
                    temp = mH - pFrame.height()
                } else {
                    temp = 0.5 * (mH - pFrame.height())
                }
                point01 = new Point(0, -temp);
            } else {
                if (s0 == 'L') {
                    temp = 0;
                } else if (s0 == 'R') {
                    temp = mW - pFrame.width()
                } else {
                    temp = 0.5 * (mW - pFrame.width())
                }
                point01 = new Point(-temp, 0);
            }
            return point01
        }

    }
};*/
