import jQuery from "jquery";
import { EventScope, EventScopeRules } from "./EventScope";
import { MouseCapture, MouseCaptureRules } from "./Mouse";
/**
 * @typedef {object} TranslateConfig
 * @property
 */

/**
 * @desc 形变器
 * @tutorial Translate
 */
class Translate {
    /**
     * @param {Element} idxLayer 添加的 .PearS-idx-layer
     * @param {TranslateConfig} [config]
     */
    constructor(idxLayer, config) {

        /**
         * @type {Boolean}
         */
        this.status = false;

        this.#init(idxLayer, config);
    }

    /**
     * @type {Element}
     */
    #layer = null;
    /**
     * @type {Element}
     */
    #leftTop = null;
    /**
     * @type {Element}
     */
    #left = null;
    /**
     * @type {Element}
     */
    #leftBottom = null;
    /**
     * @type {Element}
     */
    #rightTop = null;
    /**
     * @type {Element}
     */
    #right = null;
    /**
     * @type {Element}
     */
    #rightBottom = null;
    /**
     * @type {Element}
     */
    #top = null;
    /**
     * @type {Element}
     */
    #bottom = null;

    #scope = new EventScope();
    #scopeRules = {
        layer_downLeft: new EventScopeRules({
            /**
             * @type {ready}
             */
            ready: (data, e) => {
                data.startAxis = { x: e.pageX, y: e.pageY };
                data.hooks.beforeTranslate && data.hooks.beforeTranslate();
                this.#scope.switch('startMove', data);
            }
        }),
        target_downLeft: new EventScopeRules({
            /**
             * @type {ready}
             */
            ready: (data, e, target) => {
                data.startAxis = { x: e.pageX, y: e.pageY };
                data.type = target.id;
                data.hooks.beforeTranslate && data.hooks.beforeTranslate();
                this.#scope.switch('startScale', data);
            }
        }),
        body_move: new EventScopeRules({
            /**
             * @type {startMove}
             */
            startMove: (data, e) => {
                /**@type {DOMRect} */
                const rect = {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 0,
                    width: 0
                };
                rect.top = e.pageY - data.startAxis.y;
                rect.left = e.pageX - data.startAxis.x;
                data.cb && data.cb(rect);
            },
            /**
             * @type {startScale}
             */
            startScale: (data, e) => {
                /**@type {DOMRect} */
                const rect = {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 0,
                    width: 0
                };
                switch (data.type) {
                    case 'top':
                        rect.top = rect.y = e.pageY - data.startAxis.y;
                        rect.height = data.startAxis.y - e.pageY;
                        break;
                    case 'bottom':
                        rect.bottom = rect.height = e.pageY - data.startAxis.y;
                        break;
                    case 'left':
                        rect.left = rect.x = e.pageX - data.startAxis.x;
                        rect.width = data.startAxis.x - e.pageX;
                        break;
                    case 'right':
                        rect.right = rect.width = e.pageX - data.startAxis.x;
                        break;
                    case 'leftTop':
                        rect.left = rect.x = e.pageX - data.startAxis.x;
                        rect.width = data.startAxis.x - e.pageX;
                        rect.top = rect.y = e.pageY - data.startAxis.y;
                        rect.height = data.startAxis.y - e.pageY;
                        break;
                    case 'leftBottom':
                        rect.left = rect.x = e.pageX - data.startAxis.x;
                        rect.width = data.startAxis.x - e.pageX;
                        rect.bottom = rect.height = e.pageY - data.startAxis.y;
                        break;
                    case 'rightTop':
                        rect.right = rect.width = e.pageX - data.startAxis.x;
                        rect.top = rect.y = e.pageY - data.startAxis.y;
                        rect.height = data.startAxis.y - e.pageY;
                        break;
                    case 'rightBottom':
                        rect.right = rect.width = e.pageX - data.startAxis.x;
                        rect.bottom = rect.height = e.pageY - data.startAxis.y;
                        break;
                }
                data.cb && data.cb(rect);
            }
        }),
        body_upLeft: new EventScopeRules({
            /**
             * @type {startMove}
             */
            startMove: (data) => {
                delete data.startAxis;
                data.hooks.afterTranslate && data.hooks.afterTranslate();
                this.#scope.switch('ready', data);
            },
            /**
             * @type {startScale}
             */
            startScale: (data) => {
                delete data.startAxis;
                data.hooks.afterTranslate && data.hooks.afterTranslate();
                this.#scope.switch('ready', data);
            }
        })
    };
    /**
     * @type {MouseCapture}
     */
    #mouseEvent = null;
    /**
     * @type {MouseCaptureRules}
     */
    #mouseCaptureRules = null;

    /**
     * @param {Element} idxLayer
     * @param {TranslateConfig} [config]
     */
    #init(idxLayer, config) {
        if (!(idxLayer instanceof Element) && !idxLayer.classList.contains('PearS-idx-layer')) throw new Error('[idxLayer] 不是 [.PearS-idx-layer] Element');
        require('../../public/css/components/Translate.scss');
        require('../../public/css/global/PearS-idx-ico.scss');

        const frag = document.createDocumentFragment();
        const getIco = (dir, id) => {
            return jQuery('<div>', {
                class: 'PearS-idx-ico',
                type: "resize",
                dir: dir,
                id: id
            })[0]
        };

        frag.append(this.#leftTop = getIco('nwse', 'leftTop'));
        frag.append(this.#rightBottom = getIco('nwse', 'rightBottom'));
        frag.append(this.#top = getIco('ns', 'top'));
        frag.append(this.#bottom = getIco('ns', 'bottom'));
        frag.append(this.#left = getIco('ew', 'left'));
        frag.append(this.#right = getIco('ew', 'right'));
        frag.append(this.#rightTop = getIco('nesw', 'rightTop'));
        frag.append(this.#leftBottom = getIco('nesw', 'leftBottom'));

        this.#layer = idxLayer;
        this.#layer.setAttribute('type', 'translate');
        this.#layer.append(frag);
    }

    /**
     * @typedef {object} TranslateExtraConfig
     * @property {string} [scopeName]
     */
    /**
     * @desc 启用
     * @param {dataPipe} dataPipe
     * @param {TranslateHooks} hooks
     * @param {TranslateExtraConfig} config
     */
    start(dataPipe, hooks, config) {
        config = config || {};
        hooks = hooks || {};

        this.status = true;
        this.#layer.classList.add('available');
        // 部署操作
        this.#mouseCaptureRules = this.#mouseCaptureRules || new MouseCaptureRules({
            downLeft: [
                {
                    target: this.#layer,
                    fn: this.#scope.bindRules(this.#scopeRules.layer_downLeft),
                    children: [
                        {
                            target: this.#leftTop,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }, {
                            target: this.#left,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }, {
                            target: this.#leftBottom,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }, {
                            target: this.#top,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }, {
                            target: this.#rightTop,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }, {
                            target: this.#right,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }, {
                            target: this.#rightBottom,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }, {
                            target: this.#bottom,
                            fn: this.#scope.bindRules(this.#scopeRules.target_downLeft)
                        }
                    ]
                }
            ],
            move: [
                {
                    target: document.body,
                    fn: this.#scope.bindRules(this.#scopeRules.body_move)
                }
            ],
            upLeft: [
                {
                    target: document.body,
                    fn: this.#scope.bindRules(this.#scopeRules.body_upLeft)
                }
            ]
        });
        this.#mouseEvent = this.#mouseEvent || new MouseCapture(this.#mouseCaptureRules, this.#layer);
        this.#scope.switch(config.scopeName || 'ready', Object.assign(config, {cb: dataPipe , hooks}));
    }
    stop() {
        this.#scope.switch();
        this.#layer.classList.remove('available');
        this.#mouseEvent && this.#mouseEvent.destroy();
        this.#mouseEvent = null;
        this.status = false;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * @callback dataPipe
 * @param {DOMRect} data
 */
/**
 * @typedef {object} TranslateHooks
 * @property {(this: Translate)} beforeTranslate
 * @property {(this: Translate)} afterTranslate
 */
/**
 * @callback ready 初始状态
 * @param {readyData} data
 * @param {MouseEvent} event
 * @param {Element} target
 * @typedef {Object} readyData
 * @property {dataPipe} cb
 * @property {TranslateHooks} hooks
 */
/**
 * @callback startMove
 * @param {startMoveData} data
 * @param {MouseEvent} event,
 * @typedef {Object} startMoveData
 * @property {dataPipe} cb
 * @property {TranslateHooks} hooks
 * @property {{x: number, y: number}} startAxis
 */
/**
 * @callback startScale
 * @param {startScaleData} data
 * @param {MouseEvent} event,
 * @typedef {Object} startScaleData
 * @property {dataPipe} cb
 * @property {TranslateHooks} hooks
 * @property {{x: number, y: number}} startAxis
 * @property {('leftTop'|'left'|'leftBottom'|'top'|'bottom'|'rightTop'|'right'|'rightBottom')} type
 */

export {
    Translate
}