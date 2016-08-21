function checkserAgent() {
    var userAgentInfo = navigator.userAgent;
    var flag = false;
    if (userAgentInfo.indexOf("Windows NT") == -1) {
        flag = true;
    }
    return flag;
}


function CaiMap(pMapFrame, pMapImage, pType) {
    var TypeA = ["Cover", "Contain"]
    var Type = pType ? pType : TypeA[0];
    var MapFrame = pMapFrame;
    var MapImage = pMapImage;
    var MapLockRange = MapFrame.querySelector('.MapLockRange')

    var scale = 1;
    var myEvents = new EventTarget();
    var ZoomMaxBool = false;
    var ZoomMinBool = false;
    var PWidth = Number(MapImage.style.width.replace('px', '') || MapImage.offsetWidth);
    var PHeight = Number(MapImage.style.height.replace('px', '') || MapImage.offsetHeight);
    var Bool000 = true;
    var ZoomMax = 4;
    var ZoomMin = 0.1;

    var ZoomAId
    var ScrollToAId

    var MapProp = {
        get Width() {
            return Number(MapFrame.style.width.replace('px', '') || MapFrame.offsetWidth);
        },
        get Height() {
            return Number(MapFrame.style.height.replace('px', '') || MapFrame.offsetHeight);
        },
        get PosX() {
            return Number(MapFrame.style.left.replace('px', '') || MapFrame.offsetLeft);
        },
        get PosY() {
            return Number(MapFrame.style.top.replace('px', '') || MapFrame.offsetTop);
        },
    };

    var MapLockRangeProp = {
        get Width() {
            return Number(MapLockRange.style.width.replace('px', '') || MapLockRange.offsetWidth);
        },
        get Height() {
            return Number(MapLockRange.style.height.replace('px', '') || MapLockRange.offsetHeight);
        },
        get PosX() {
            return Number(MapLockRange.style.left.replace('px', '') || MapLockRange.offsetLeft);
        },
        get PosY() {
            return Number(MapLockRange.style.top.replace('px', '') || MapLockRange.offsetTop);
        },
    };

    this.Prop = {
        get MapFrame() {
            return MapFrame;
        },
        get MapImage() {
            return MapImage;
        },
        get MapLockRange() {
            return MapLockRange;
        },
        get ZoomMaxBool() {
            return ZoomMaxBool;
        },
        get ZoomMinBool() {
            return ZoomMinBool;
        },
        get MapWidth() {
            return PWidth * scale;
        },
        get MapHeight() {
            return PHeight * scale;
        },
        get scale() {
            return scale;
        },
        get ZoomMax() {
            return ZoomMax;
        },
        get ZoomMin() {
            return ZoomMin;
        },
        get MapPosX() {
            return Number(MapImage.style.left.replace('px', '') || MapImage.offsetLeft);
        },
        get MapPosY() {
            return Number(MapImage.style.top.replace('px', '') || MapImage.offsetTop);
        },
        set ZoomMax(pValue) {
            ZoomMax = pValue;
        },
        set ZoomMin(pValue) {
            ZoomMin = pValue;
        }
    };
    var Prop = this.Prop;
    this.addEvent = function (type, fn) {
        myEvents.addEvent(type, fn);
    }
    this.Init = function () {
            if (checkserAgent()) {
                EventUtil.addHandler(MapImage, 'touchmove', TM);
                EventUtil.addHandler(MapImage, 'touchstart', TS);
                EventUtil.addHandler(MapImage, 'touchend', TE);
            } else {
                EventUtil.addHandler(window, 'mousemove', MM);
                EventUtil.addHandler(MapImage, 'mousedown', MD);
                EventUtil.addHandler(window, 'mouseup', MU);
                EventUtil.addHandler(MapImage, 'mousewheel', MW);

                MapImage.ondragstart = function () {
                    return false;
                };
            }

            //this.Resize();
        }
        /*this.Resize = function () {
            ClearA();
            unRefresh()
            var s = MapImage.css('scaleX');
            console.log(s,MapImage.style.scaleX)
            if (s != 1) {
                scale = s;
            }
            SetScale(scale);
            Refresh()
        }*/

    this.zoom = function (pScale, pX, pY, pT) {
        pT = pT || 0;
        if (pT == 0) {
            unRefresh()
            SetScale(pScale, pX, pY);
            Refresh();
        } else {
            ZoomA(pScale, pX, pY, pT);
        }

    }

    function ClearA() {
        clearInterval(ZoomAId);
        clearInterval(ScrollToAId);
    }

    this.scrollTo = function (pX, pY, pT) {
        pT = pT || 0;
        if (pT == 0) {
            SetPos(pX, pY);
        } else {
            ScrollToA(pX, pY, pT)
        }
    }

    function ZoomA(pScale, pX, pY, pT) {
        ClearA()
        var tempScale = scale;
        var step = 0;
        var len = Math.round(60 * pT / 1000);
        ZoomAId = setInterval(function () {
            step++;
            if (step >= len) {
                clearInterval(ZoomAId);
            }
            unRefresh()
            var temp = EaseQuadratic(step / len);
            SetScale(tempScale + (pScale - tempScale) * temp, pX, pY);
            Refresh()
        }, 1000 / 60);
    }

    function ScrollToA(pX, pY, pT) {
        ClearA();
        var tempX = Prop.MapPosX;
        var tempY = Prop.MapPosY;
        var step = 0;
        var len = Math.round(60 * pT / 1000);
        ScrollToAId = setInterval(function () {
            step++;
            if (step >= len) {
                clearInterval(ScrollToAId);
            }
            var temp = EaseQuadratic(step / len);
            SetPos(tempX + (pX - tempX) * temp, tempY + (pY - tempY) * temp);
        }, 1000 / 60)
    }


    function EaseQuadratic(k) {
        return k * (2 - k);
    }

    function Delta(e) {
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
    }

    function MW(e) {
        ClearA();
        unRefresh();
        ZoomA(scale + 0.25 * Delta(e), e.pageX, e.pageY, 600);
        Refresh()
    }

    var old_TP;
    var EndVelocity;
    var old_MP;
    var MDBool = false;

    function MM(e) {
        if (MDBool) {
            var TP = new Point(e.pageX, e.pageY);
            var MapPos = new Point(Prop.MapPosX, Prop.MapPosY);
            EndVelocity = TP.sub(old_TP);
            var MP = MapPos.add(EndVelocity);
            SetPos(MP.x, MP.y);
            old_MP = MP;
            old_TP = TP;
            if (EndVelocity.len() > 2) {
                e.preventDefault();
            }
        }
    }

    function MD(e) {
        ClearA();
        old_TP = new Point(e.pageX, e.pageY);
        old_MP = new Point(Prop.MapPosX, Prop.MapPosY);
        EndVelocity = new Point();
        MDBool = true;
    }

    function MU(e) {
        if (MDBool) {
            MDBool = false
            if (EndVelocity.len() > 2) {
                var MapPos = new Point(Prop.MapPosX, Prop.MapPosY);
                var tempMapPos = MapPos.add(EndVelocity.mul(20));
                ScrollToA(tempMapPos.x, tempMapPos.y, 400);
            }
        }
    }

    function TM(e) {
        var Ts = e.touches;
        var TP = TouchesPoint(Ts);

        if (Ts.length == 2) {
            if (Bool000) {
                Bool000 = false;
                sss = scale;
                unRefresh();
            }
            SetScale((scale * TP.Dis / old_TP.Dis), TP.Pos.x, TP.Pos.y)
        }
        var MapPos = new Point(Prop.MapPosX, Prop.MapPosY);
        EndVelocity = TP.Pos.sub(old_TP.Pos);
        var MP = MapPos.add(EndVelocity);

        SetPos(MP.x, MP.y);
        if (Ts.length == 2) {
            EndVelocity = new Point();
        }
        old_MP = MP;
        old_TP = TP;
        if (EndVelocity.len() > 2) {
            e.preventDefault();
        }

    }

    var sss = 1;

    function TS(e) {
        ClearA();
        old_TP = TouchesPoint(e.touches);
        old_MP = new Point(Prop.MapPosX, Prop.MapPosY);
        EndVelocity = new Point();
        MapImage.stop();
    }

    function TE(e) {
        if (EndVelocity.len() > 2) {
            var MapPos = new Point(Prop.MapPosX, Prop.MapPosY);
            var tempMapPos = MapPos.add(EndVelocity.mul(10));
            ScrollToA(tempMapPos.x, tempMapPos.y, 400);
        }
        old_TP = TouchesPoint(e.touches);
        if (!Bool000) {
            Bool000 = true
            Refresh();
        }
    }


    function unRefresh() {
        sss = scale;
    }

    function Refresh() {
        MapImage.style.scale = 1 + "px";
        MapImage.style.width = Prop.MapWidth + "px";
        MapImage.style.height = Prop.MapHeight + "px";
        sss = 1;
    }

    function SetScale(pScale, pX, pY) {
        pX -= MapProp.PosX;
        pY -= MapProp.PosY;
        var xx = pX || 0;
        var yy = pY || 0;
        var s = scale;
        var ww = Prop.MapPosX - xx;
        var hh = Prop.MapPosY - yy;

        var scale0 = pScale;

        ZoomMaxBool = scale0 >= ZoomMax;
        if (ZoomMaxBool) {
            scale0 = ZoomMax;
        }
        ZoomMinBool = scale0 <= ZoomMin;
        if (ZoomMinBool) {
            scale0 = ZoomMin;
        }
        scale = scale0;
        MapImage.style.scale = scale / sss + "px";
        SetPos((ww * scale / s) + xx, (hh * scale / s) + yy);
        myEvents.fireEvent("Zoom");
    }

    function SetPos(pX, pY) {
        if (Type == "Contain") {
            SetPosContain(pX, pY);
        } else {
            SetPosCover(pX, pY);
        }
    }

    function SetPosCover(pX, pY) {
        if (MapLockRange != null) {
            MapImage.style.left = pX.CropNumber(MapLockRangeProp.PosX + MapLockRangeProp.Width - Prop.MapWidth, MapLockRangeProp.PosX) + "px"
            MapImage.style.top = pY.CropNumber(MapLockRangeProp.PosY + MapLockRangeProp.Height - Prop.MapHeight, MapLockRangeProp.PosY) + "px"
        } else {
            MapImage.style.left = pX.CropNumber(MapProp.Width - Prop.MapWidth, 0) + "px"
            MapImage.style.top = pY.CropNumber(MapProp.Height - Prop.MapHeight, 0) + "px"
        }

    }

    function SetPosContain(pX, pY) {
        if (MapLockRange != null) {
            if (Prop.MapWidth > MapLockRangeProp.Width) {
                MapImage.style.left = pX.CropNumber(MapLockRangeProp.PosX + MapLockRangeProp.Width - Prop.MapWidth, MapLockRangeProp.PosX) + "px"
            } else {
                MapImage.style.left = pX.CropNumber(MapLockRangeProp.PosX, MapLockRangeProp.PosX + MapLockRangeProp.Width - Prop.MapWidth) + "px"
            }
            if (Prop.MapHeight > MapLockRangeProp.Height) {
                MapImage.style.top = pY.CropNumber(MapLockRangeProp.PosY + MapLockRangeProp.Height - Prop.MapHeight, MapLockRangeProp.PosY) + "px"
            } else {
                MapImage.style.top = pY.CropNumber(MapLockRangeProp.PosY, MapLockRangeProp.PosY + MapLockRangeProp.Height - Prop.MapHeight) + "px"
            }
        } else {
            if (Prop.MapWidth > MapProp.Width) {
                MapImage.style.left = pX.CropNumber(MapProp.Width - Prop.MapWidth, 0) + "px"
            } else {
                MapImage.style.left = pX.CropNumber(0, MapProp.Width - Prop.MapWidth) + "px"
            }
            if (Prop.MapHeight > MapProp.Height) {
                MapImage.style.top = pY.CropNumber(MapProp.Height - Prop.MapHeight, 0) + "px"
            } else {
                MapImage.style.top = pY.CropNumber(0, MapProp.Height - Prop.MapHeight) + "px"
            }
        }
    }

    function TouchesPoint(pTouches) {
        var p = new Array();
        var c = new Point();
        var d = 0
        if (pTouches) {
            var len = pTouches.length;
            for (var i = 0; i < len; i++) {
                p[i] = new Point(pTouches[i].pageX, pTouches[i].pageY)
                c.x += p[i].x;
                c.y += p[i].y;
            }
            c.x /= len;
            c.y /= len;
            if (len == 2) {
                d = p[1].sub(p[0]).len();
            }
        }
        return {
            Pos: c,
            Dis: d
        };
    }
    this.Init();
}
