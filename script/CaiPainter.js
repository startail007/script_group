function CheckserWindows() {
    var userAgentInfo = navigator.userAgent;
    var flag = true;
    if (userAgentInfo.indexOf("Windows NT") == -1) {
        flag = false;
    }
    return flag;
}

/*var EventUtil = {
    addHandler: function (element, type, handler, bool) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, bool | false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    removeHandler: function (element, type, handler, bool) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, bool | false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = undefined;
        }
    }
};*/





function ObjMul(pObject, pValue) {
    var Obj = {};
    for (var temp in pObject) {
        Obj[temp] = pObject[temp]
        Obj[temp] *= pValue;
    }
    return Obj;
}

function ObjToObjSub(pObject0, pObject1) {
    var Obj = {};
    for (var temp in pObject0) {
        var temp00 = pObject1[temp] || 0;
        Obj[temp] = pObject0[temp] - temp00;
    }
    return Obj;
}

function ObjToObjAdd(pObject0, pObject1) {
    var Obj = {};
    for (var temp in pObject0) {
        var temp00 = pObject1[temp] || 0;
        Obj[temp] = pObject0[temp] + temp00;
    }
    return Obj;
}



var TouchesPoint = function(pTouches) {
    var p = new Array();
    var c = new Point();
    var d = 0
    if (pTouches) {
        var len = pTouches.length;
        var i
        for (i = 0; i < len; i++) {
            p[i] = new Point(pTouches[i].clientX, pTouches[i].clientY)
            c.x += p[i].x;
            c.y += p[i].y;
        }
        c.x /= len;
        c.y /= len;
        for (i = 0; i < len; i++) {
            d += p[i].sub(c).len();
        }
    }
    return {
        Pos: c,
        Dis: d
    };
};

var Delta = function(e) {
    if (e.deltaY) {
        return -e.deltaY / Math.abs(e.deltaY);
    } else if (e.wheelDeltaY) {
        return e.wheelDeltaY / Math.abs(e.wheelDeltaY);
    } else if (e.wheelDelta) {
        return e.wheelDelta / Math.abs(e.wheelDelta);
    } else if (e.detail) {
        return -e.detail / Math.abs(e.detail);
    }
    return 0;
};

function CaiPainter(pCanvas, pBrushes) {
    var Canvas = pCanvas;
    var Brushes = pBrushes;
    var Thickness = 3;
    var MinThickness = 1;
    var MaxThickness = 50;
    var WinBool = true;
    var ctx = Canvas.getContext("2d");

    var CanvasProp = {
        get Width() {
            return Number(Canvas.style.width.replace('px', '') || Canvas.offsetWidth);
        },
        get Height() {
            return Number(Canvas.style.height.replace('px', '') || Canvas.offsetHeight);
        },
        get PosX() {
            return Number(Canvas.style.left.replace('px', '') || Canvas.offsetLeft);
        },
        get PosY() {
            return Number(Canvas.style.top.replace('px', '') || Canvas.offsetTop);
        },
    };

    this.Init = function() {
        Brushes.style.position = 'absolute';
        Brushes.style.display = 'block';
        Brushes.style.pointerEvents = 'none';
        //Brushes.style.opacity = 0;
        SetThickness(Thickness, old_colorMove);
        WinBool = CheckserWindows();
        if (WinBool) {
            EventUtil.addHandler(Canvas, 'mousedown', MD);
            EventUtil.addHandler(window, 'mousemove', MM);
            EventUtil.addHandler(window, 'mouseup', MU);
            EventUtil.addHandler(Canvas, 'mousewheel', MW);
        } else {
            EventUtil.addHandler(Canvas, 'touchmove', TM);
            EventUtil.addHandler(Canvas, 'touchstart', TS);
            EventUtil.addHandler(Canvas, 'touchend', TE);
        }
    }
    this.Clear = function() {
        ctx.clearRect(0, 0, CanvasProp.Width, CanvasProp.Height);
    }
    this.Destroy = function() {
        if (WinBool) {
            EventUtil.removeHandler(Canvas, 'mousedown', MD);
            EventUtil.removeHandler(window, 'mousemove', MM);
            EventUtil.removeHandler(window, 'mouseup', MU);
            EventUtil.removeHandler(Canvas, 'mousewheel', MW);
        } else {
            EventUtil.removeHandler(Canvas, 'touchmove', TM);
            EventUtil.removeHandler(Canvas, 'touchstart', TS);
            EventUtil.removeHandler(Canvas, 'touchend', TE);
        }
    }
    var ID;
    var SetThickness = function(pValue, pColor) {
        Thickness = Math.min(Math.max(pValue, MinThickness), MaxThickness)
        //$(Brushes).velocity('stop');

        Brushes.style.left = mPos.x + 'px';
        Brushes.style.top = mPos.y + 'px';
        Brushes.style.backgroundColor = pColor;
        Brushes.style.width = Thickness + 'px';
        Brushes.style.height = Thickness + 'px';
        Brushes.style.borderRadius = Thickness + 'px';
        Brushes.style.marginLeft = -Thickness * 0.5 + 'px';
        Brushes.style.marginTop = -Thickness * 0.5 + 'px';
        /*Brushes.style.opacity = 1;*/
        Brushes.classList.remove('Hide');
        clearTimeout(ID);
        setTimeout(function() {
            Brushes.classList.add('Hide');
            clearTimeout(ID);
        }, 1000)

        /*$(Brushes).velocity({
            opacity: 0
        }, {
            duration: 1000,
            delay: 300,
            easing: "easeOutSine"
        });*/
        Brushes.querySelector('.GraffitiBrushesText01').innerHTML = Math.round(10 * Thickness) / 10;


    }
    var MoveBool = false; //移動使用開關
    var old_pos = new Point();
    var new_pos = new Point();
    var old_color = 0xff0000;
    var new_color = 0x00ff00;
    var count = 0;
    var countMax = 400;
    var old_colorMove = Change16(old_color);
    var mPos = new Point(); //前一個控制點的紀錄
    var OldHSL = rgbToHslEx(old_color);
    var NewHSL = rgbToHslEx(new_color);

    var BPaint = function(pX, pY) {

        ctx.beginPath();
        ctx.arc(pX, pY, Thickness * 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = old_colorMove;
        ctx.fill();
        old_pos.x = pX;
        old_pos.y = pY;
        ctx.lineCap = "round";
        ctx.lineWidth = Thickness;

    }
    var PPaint = function(pX, pY) {
        //ctx.strokeStyle = old_colorMove;
        new_pos.set(pX, pY);
        var CHSL = ObjToObjAdd(OldHSL, ObjMul(ObjToObjSub(NewHSL, OldHSL), count / countMax));
        var CRGB = hslToRgb(CHSL.h, CHSL.s, CHSL.l)
        var color = Change16(rgbto(CRGB.r, CRGB.g, CRGB.b));
        DrawLine(old_pos, new_pos, old_colorMove, color);
        old_colorMove = color;
        count += new_pos.sub(old_pos).len();
        if (count > countMax) {
            old_color = new_color;
            OldHSL = NewHSL;
            new_color = Math.round(0xffffff * Math.random());
            NewHSL = rgbToHslEx(new_color);
            count -= countMax;
        }
        old_pos.x = new_pos.x;
        old_pos.y = new_pos.y;
    }
    var DrawLine = function(pPoint0, pPoint1, pColor0, pColor1) {
        var lingrad = ctx.createLinearGradient(pPoint0.x, pPoint0.y, pPoint1.x, pPoint1.y);
        lingrad.addColorStop(0, pColor0);
        lingrad.addColorStop(1, pColor1);
        ctx.beginPath();
        //ctx.globalAlpha=0.9;
        ctx.strokeStyle = lingrad;
        ctx.moveTo(pPoint0.x, pPoint0.y);
        ctx.lineTo(pPoint1.x, pPoint1.y);
        ctx.stroke();
    }
    var FPaint = function() {

    }
    var MD = function(e) {
        MoveBool = true;
        /*mPos.set(e.pageX, e.pageY);*/
        BPaint(e.offsetX, e.offsetY);
        e.preventDefault();
    }

    var MM = function(e) {
        if (MoveBool) {
            PPaint(e.offsetX, e.offsetY);
        }
        mPos.set(e.offsetX, e.offsetY);
    }

    var MU = function(e) {
        if (MoveBool) {
            MoveBool = false;
        }
    }



    var MW = function(e) {
        /*Thickness += 1 * Delta(e);
        Thickness = Math.min(Math.max(Thickness, MinThickness), MaxThickness)*/
        SetThickness(Thickness + Delta(e), old_colorMove);
    }
    var obj
    var mThickness;
    var TS = function(e) {
        var Touches = e.touches
        if (Touches.length == 1) {
            BPaint(Touches[0].clientX - CanvasProp.PosX, Touches[0].clientY - CanvasProp.PosY);
        } else {
            mThickness = Thickness;
            obj = TouchesPoint(Touches);
        }
        e.preventDefault();
    }

    var TM = function(e) {
        var Touches = e.touches
        if (Touches.length == 1) {
            console.log(Touches[0])
            PPaint(Touches[0].clientX - CanvasProp.PosX, Touches[0].clientY - CanvasProp.PosY);
        } else {
            var temp = TouchesPoint(Touches);
            mPos.set(temp.Pos.x, temp.Pos.y);
            SetThickness(mThickness * temp.Dis / obj.Dis);
        }
    }

    var TE = function(e) {
        var Touches = e.touches
        if (Touches.length == 1) {
            BPaint(Touches[0].clientX - CanvasProp.PosX, Touches[0].clientY - CanvasProp.PosY);
        } else {
            mThickness = Thickness;
            obj = TouchesPoint(Touches);
        }
    }


    this.Init();

}