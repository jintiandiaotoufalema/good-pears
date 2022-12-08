import jQuery from "jquery";
import { eventThrottle } from "./Throttle";

/**
 * @typedef {object} FrameSelectorRulesUnit
 * @property {Element|import("./mouse").CssExp} target
 * @property {FrameSelectorRulesUnit[]} children
 */

/**
 * 框选器规则
 */
class FrameSelectorRules{
    static instanceofFrameSelectorRules(rules){
        if(!(rules instanceof FrameSelectorRules)) throw new Error('[rules] 不是 FrameSelectorRules');
    };

    /**
     * 
     * @param {object} rules
     * @param {Element} rules.container
     * @param {FrameSelectorRulesUnit[]} rules.children
     * @param {(this: FrameSelector, elements: Element[])=>} rules.onselect 新增选择
     * @param {(this: FrameSelector, elements: Element[])=>} rules.ondeselect 取消选择
     */
    constructor(rules){
        if(!rules) throw new Error('[rules] undefined');

        /**
         * @type {Element}
         */
        this.container = rules.container;
        /**
         * @type {FrameSelectorRulesUnit[]}
         */
        this.children = rules.children;
        /**
         * @type {(this: FrameSelector, elements: Element[])=>}
         */
        this.onselect = rules.onselect;
        /**
         * @type {(this: FrameSelector, elements: Element[])=>}
         */
        this.ondeselect = rules.ondeselect;
    };

    collect(){
        /**
         * @type {Map.<Element, DOMRect>}
         */
        const list = new Map();

        /**
         * @param {FrameSelectorRulesUnit[]} children 
         * @param {Element[]} parents
         */
        const deep = (children, parents)=>{
            const elements = [];
            children.forEach(unit=>{
                if(typeof(unit.target) === 'string'){
                    jQuery(parents||this.container).find(unit.target).each((i, ele)=>{
                        list.set(ele, ele.getBoundingClientRect());
                    })
                }else{

                    list.set(unit.target, unit.target.getBoundingClientRect());
                };
                parents = null;

                if(unit.children && unit.children.length) deep(unit.children, elements);
            })
        };

        deep(this.children, this.container);

        return list;
    }
};

/**
 * 框选器
 */
class FrameSelector{
    /**
     * @param {FrameSelectorRules} rules 
     */
    constructor(rules){
        if(!rules) throw new Error('[rules] undefined');
        rules && FrameSelectorRules.instanceofFrameSelectorRules(rules);
        this.#init(rules);
    };

    #id = Math.random().toString(16).slice(2);
    #rect = jQuery('<div>', {
        id: this.#id,
        class: 'PearS-frameSelector'
    })[0];
    /**
     * @type {FrameSelectorRules}
     */
    #rules = null;
    /**
     * @type {Map.<Element>}
     */
    #selected = new Map();
    /**
     * @type {Element}
     */
    #target = jQuery('.PearS-layer-frameSelector')[0];
    /**
     * @param {FrameSelectorRules} rules 
     */
    #init(rules){
        if(!this.#target) throw new Error('[.PearS-layer-frameSelector] undefined');
        require('../../public/css/components/FrameSelector.scss');

        this.#rules = rules;
        this.#build();
    };
    #build(){
        jQuery(this.#rules.container).on(`mousedown.${this.#id}`, '', e=>{
            // 定义四角
            let x1 = e.pageX;
            let y1 = e.pageY;
            let x2 = e.pageX;
            let y2 = e.pageY;
            let height = 0;
            let width = 0;
            let top = y1;
            let left = x1;
            const elements = this.#rules.collect();

            this.#selected.clear();
            // 绘制矩形
            jQuery(this.#rect).css({top,left,height,width});
            this.#target.append(this.#rect);            
            jQuery(this.#rules.container).on(`mousemove.${this.#id}`, '', e=>{
                x2 = e.pageX;
                y2 = e.pageY;
                height = Math.abs(y2 - y1);
                width = Math.abs(x2 - x1);
                left = Math.min(x1, x2);
                top = Math.min(y1, y2);
                jQuery(this.#rect).css({top,left,height,width});
                // 节流
                // 遍历检查
                eventThrottle(()=>{
                    let added = [];
                    let deleted = [];
                    elements.forEach((rect, ele)=>{
                        if(rect.top>=top && rect.left>=left && rect.right<=Math.max(x1,x2) && rect.bottom<=Math.max(y1, y2)){
                            // 再范围内
                            if(!this.#selected.has(ele)){
                                this.#selected.set(ele);
                                added.push(ele);
                            }
                        }else{
                            if(this.#selected.has(ele)){
                                this.#selected.delete(ele);
                                deleted.push(ele);
                            }
                        }
                    });
                    // hooks
                    added.length && this.#rules.onselect.call(this, [...added]) && (added = null);
                    deleted.length && this.#rules.ondeselect.call(this, [...deleted]) && (deleted = null);
                });
            });
            jQuery(document.body).on(`mouseup.${this.#id}`, '', ()=>{
                jQuery(document.body).off(`mouseup.${this.#id}`);
                jQuery(this.#rules.container).off(`mousemove.${this.#id}`);
                jQuery(this.#rect).remove();
            })
        })
    };
    getSelected(){
        return [...this.#selected.keys()]
    }
};


export {
    FrameSelectorRules,
    FrameSelector
}