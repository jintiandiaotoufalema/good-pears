import jQuery from 'jquery';
import { eventThrottle } from './Throttle';

/**
 * 支持移动和缩放的通用万向画布<br>
 * 支持鼠标、触摸板、移动设备，
 * 非 Chrome 浏览器下会使用兼容模式，体验可能会下降
 * @example 
 * const content = new UniversalCanvas()       // 新画布
                .build(document.body)       // 构建
                .getContainer();            // 获取 content 容器
 */
class UniversalCanvas {
    constructor() {

        /**
         * @type {Element}
         */
        this.content = null;
        /**
         * 移动事件
         * @type {onmovefn}
         * @default __defaultMove
         */
        this.onmove = this.#defaultMove;
        /**
         * 缩放事件
         * @type {onzoomfn}
         * @default __defaultScale
         */
        this.onzoom = this.#defaultScale;
        /**@param */
        this.scale = 100;
        /**
         * 滚动模式<br>
         * 鼠标滚轮会从默认的缩放操作变为上下滚动操作
         * @type {Boolean}
         * @default false
         */
        this.scrollable = false;
        /**
         * 绑定的元素
         * @type {Element}
         */
        this.target = null;
        /**
         * 触摸设备支持，需要在 .build() 前设置
         * @type {Boolean}
         * @default false
         */
        this.touchAble = false;
        /**@type {Array.<x, y>} */
        this.translate = [0, 0];
        /**@param*/
        this.wheelRatio = 120;

        // this.switch = false;
        // this.focus = {
        //     viewport: {
        //         x: false,
        //         y: false,
        //         xy: false
        //     }
        // };

        this.#init();
    };

    /**
     * 预设移动操作
     * @type {onmovefn}
     */
    #defaultMove(deltaX, deltaY) {
        this.translate = [this.translate[0] + deltaX, this.translate[1] + deltaY];
    };
    /**
     * 预设放大操作
     * @type {onzoomfn}
     */
    #defaultScale(scale) {
        this.scale -= ~~scale * 2;
    };
    #init(){
        // 监听 scale 和 translate
        Object.defineProperties(this, {
            scale: {
                get:()=>{
                    return this.#scale;
                },
                set: (val) => {
                    if (typeof (val) === 'number' && val !== this.#scale) {
                        // 更新 scale
                        this.#scale = val;
                        if (this.target) {
                            this.target.firstChild.style.transform = `scale(${val / 100})`
                        };
                    }
                }
            },
            translate: {
                get:()=>{
                    return this.#translate;
                },
                set: (val) => {
                    if (Array.isArray(val) && typeof (val[0]) === 'number' && typeof (val[1]) === 'number') {
                        if (val[0] !== this.#translate[0] || val[1] !== this.#translate[1]) {
                            // 更新 trans
                            this.#translate = val;
                            if (this.target) {
                                this.target.firstChild.firstChild.style.transform = `translate(${this.#translate[0]}px,${this.#translate[1]}px)`
                            };
                        };
                    }
                }
            }
        });
    }
    #scale = 100;
    #translate = [0, 0];

    /**
     * 绑定监听目标，构建画布Dom结构<br>
     * 需要通过 {@link getContainer} 获取容器
     * @param {Element} container
     * @returns {UniversalCanvas}
     * @todo 触摸设备支持
     */
    build(container) {
        if (!(container instanceof Element)) throw new Error('[container] 不是 Element');
        if (this.target) throw new Error('请勿重复构建');
        require('../../public/css/components/universalCanvas.scss');

        const canvas = jQuery('<div>', { class: 'universal-canvas' });
        const zoom = jQuery('<div>', { class: 'universal-canvas-zoom' }).css('transfrom', `scale(${this.scale})`);
        const trans = jQuery('<div>', { class: 'universal-canvas-trans' }).css('transfrom', `translate(${this.translate[0]}px,${this.translate[1]}px)`);

        canvas.append(zoom.append(trans));

        // 事件处理
        try {
            if (this.touchAble) {
                // 触摸设备
                let bb;
                const _touches = {
                    type: false,
                    // status: true,
                    _touches: 0,
                    cross: false,
                    start: {
                        x: [0],
                        y: [0],
                        dis: 0
                    },
                    cache: [{
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 0
                    }
                    ]
                };

                canvas[0].addEventListener("touchstart", function (e) {
                    _touches._touches++;
                    aaa(e);
                });

                canvas[0].addEventListener("touchend", function (e) {
                    _touches._touches--;
                    aaa(e);
                })

                function aaa(e) {

                    try {

                        switch (_touches._touches) {
                            case 0:
                                _touches.type = false;
                                _touches.cross = false;
                                break;

                            case 1:

                                // 画布移动
                                bb = (canvas.find(".canvas_trans").css("transform").replace("matrix(", "").replace(")", "").split(","));
                                bb[4] = parseInt(bb[4]);
                                bb[5] = parseInt(bb[5]);

                                _touches.type = "move";

                                if (!e.targetTouches.length) {
                                    _touches.cross = true;
                                    _touches.start = {
                                        x: [e.changedTouches[0].pageX],
                                        y: [e.changedTouches[0].pageY]
                                    };
                                } else {
                                    _touches.cross = false;
                                    _touches.start = {
                                        x: [e.targetTouches[0].pageX],
                                        y: [e.targetTouches[0].pageY]
                                    };
                                };

                                break;

                            case 2:
                                // 画布缩放
                                _touches.type = "resize";

                                if (e.targetTouches.length == 1) {
                                    _touches.cross = true;

                                    _touches.cache[e.targetTouches[0].identifier] = {
                                        x: e.targetTouches[0].pageX,
                                        y: e.targetTouches[0].pageY
                                    };
                                    _touches.cache[e.changedTouches[0].identifier] = {
                                        x: e.changedTouches[0].pageX,
                                        y: e.changedTouches[0].pageY
                                    };

                                } else {
                                    _touches.cross = false;

                                    _touches.cache[e.targetTouches[0].identifier] = {
                                        x: e.targetTouches[0].pageX,
                                        y: e.targetTouches[0].pageY
                                    };
                                    _touches.cache[e.targetTouches[1].identifier] = {
                                        x: e.changedTouches[0].pageX,
                                        y: e.changedTouches[0].pageY
                                    };
                                };

                                _touches.start.dis = Math.sqrt(Math.pow(_touches.cache[0].y - _touches.cache[1].y, 2) + Math.pow(_touches.cache[0].x - _touches.cache[1].x, 2));

                                break;

                            default:
                                _touches.type = false;
                                break;
                        };

                    } catch (err) {
                        if (err) {
                            alert(1, err)
                        }
                    }
                }

                canvas[0].addEventListener("touchmove", function (e) {
                    e.preventDefault();

                    try {

                        switch (_touches.type) {
                            case "move":
                                (function () {
                                    api && api.padMove ? api.padMove.call(canvas[0],
                                        fid,
                                        (e.changedTouches[0].pageX - _touches.start.x[0]) / FID(fid)[0].data.scale,
                                        (e.changedTouches[0].pageY - _touches.start.y[0]) / FID(fid)[0].data.scale, {
                                        orgin: [bb[4], bb[5]]
                                    }
                                    ) : null;
                                })();
                                break;

                            case "resize":
                                (function () {
                                    jQuery(".develop").prepend(
                                        e.changedTouches[0].identifier + " / " + Math.random() + "<br>"
                                    );

                                    _touches.cache[e.changedTouches[0].identifier] = {
                                        x: e.changedTouches[0].pageX,
                                        y: e.changedTouches[0].pageY
                                    };

                                    const _newDis = Math.sqrt(Math.pow(_touches.cache[0].y - _touches.cache[1].y, 2) + Math.pow(_touches.cache[0].x - _touches.cache[1].x, 2));

                                    // 更新dis
                                    const _zoom = _newDis / _touches.start.dis;

                                    if (_zoom >= 1) {
                                        // 放大
                                        api && api.zoomIn ? api.zoomIn.call(canvas[0], fid, (1 - _zoom) * 60) : null;
                                    } else {
                                        // 缩小
                                        api && api.zoomOut ? api.zoomOut.call(canvas[0], fid, _zoom * 3) : null;
                                    };

                                    _touches.start.dis = _newDis;

                                })();
                                break;
                        }

                    } catch (err) {
                        if (err) {
                            alert(2, err)
                        }
                    }


                });
            } else {
                // 非触摸设备
                const _config = {
                    /**
                     * 将 [event.deltaY] 校正为缩放倍率
                     * @param {Number} input 
                     * @returns 
                     */
                    per: function (input) {
                        const direction = input < 0 ? -1 : 1;
                        const output = direction * Math.sqrt(input * direction);
                        return output;
                    }
                };
                let matrix;

                // 触控板二指操作
                // 鼠标滚轮缩放操作
                canvas[0].addEventListener("wheel", eventThrottle((event) => {
                    event.preventDefault()

                    const no_ctrl = !event.ctrlKey;

                    // 触控板缩放
                    // 鼠标滚轮
                    if (Math.abs(event.wheelDeltaY) % this.wheelRatio == 0) {

                        // 缩放
                        if (event.deltaY < 0) {
                            // 放大 向下滚动
                            if (this.scrollable && no_ctrl) {
                                // 滚动适配
                                this.onmove && this.onmove.call(this, 0, event.wheelDeltaY);
                            } else {
                                this.onzoom && this.onzoom.call(this, _config.per(event.deltaY));
                            }
                        };

                        if (event.deltaY > 0) {
                            // 缩小 向上滚动
                            if (this.scrollable && no_ctrl) {
                                // 滚动适配
                                this.onmove && this.onmove.call(this, 0, event.wheelDeltaY);
                            } else {
                                this.onzoom && this.onzoom.call(this, _config.per(event.deltaY));
                            }
                        }

                    }
                    // 触控板移动
                    else {
                        this.onmove && this.onmove.call(this, event.wheelDeltaX, event.wheelDeltaY);
                    };

                }));

                // 鼠标 [左键+ctrl] / [鼠标中键] 拖拽画布
                canvas.on(`mousedown`, "", eventThrottle((event) => {
                    if (((event.button == 0 && event.ctrlKey) || (event.button == 1))) {
                        // 停止默认交互
                        const id = "I" + Math.random().toString(32).slice(2);
                        const from_axis = [event.pageX, event.pageY];

                        jQuery("body").on(`mousemove.${id}`, "", (event) => {
                            this.onmove && this.onmove.call(this,
                                (event.pageX - from_axis[0]) / FID(fid)[0].data.scale,
                                (event.pageY - from_axis[1]) / FID(fid)[0].data.scale
                            );
                        }).on(`mouseup.${id}`, "", () => {
                            jQuery("body").off(`.${id}`);
                            // 启用之前关闭的交互
                        });
                    }
                }));
            };
        } catch (err) { throw err };

        // 冻结
        Object.defineProperties(this, {
            target: {
                value: canvas[0],
                writable: false
            },
            content: {
                value: trans[0],
                writable: false
            },
            touchAble: {
                value: this.touchAble,
                writable: false
            }
        });
        jQuery(container).append(canvas);

        return this;
    };
    /**
     * 获取容器
     * @returns {Element | false}
     */
    getContainer() {
        return this.content || null;
    };
    /**
     * @returns {number} 0-1
     */
    getScale() {
        return this.scale / 100;
    }
    /**
     * @callback onmovefn
     * @param {UniversalCanvas} this
     * @param {Number} deltaX
     * @param {Number} deltaY
     * @param {{orgin: Array.<Number>}} [data]
     */
    /**
     * 监听 move 事件
     * @param {onmovefn} fn 
     * @returns {UniversalCanvas}
     */
    listenMove(fn) {
        if (!(fn instanceof Function)) throw new Error('[fn] 不是 Function');

        this.onmove = fn;
        return this;
    };
    /**
    * @callback onzoomfn
    * @param {UniversalCanvas} this
    * @param {Number} scale
    */
    /**
     * @param {onzoomfn} fn
     * @returns {UniversalCanvas}
     */
    listenScale(fn) {
        if (!(fn instanceof Function)) throw new Error('[fn] 不是 Function');

        this.onzoom = fn;
        return this;
    };
};


export {
    UniversalCanvas
};

/**
 * 万向画布相关
 * @module UniversalCanvas
 * @author Iktsuarpok
 * @version 1.0
 */