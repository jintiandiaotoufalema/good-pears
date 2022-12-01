import jQuery from "jquery";
import onborder from "../global/onborder";

/**
 * @typedef {Object} ContextMenuRulesSection
 * @property {string} name
 * @property {URL} ico
 * @property {Boolean|()=>Boolean} unable
 * @property {Boolean|()=>Boolean} skip
 * @property {ContextMenuRulesUnit[]} menu 下级菜单
 * @property {(api:{close:function})=>Boolean} container
 * @property {Function} fn
 */
/**
 * @typedef {Object} ContextMenuRulesUnit
 * @property {string} [auto]
 * @property {Boolean} [ico_only] 只显示图标
 * @property {Object.<string, ContextMenuRulesSection>} list
 */


/**
 * 右键菜单规则
 */
class ContextMenuRules{
    static instanceofContextMenuRules(rules){
        if(!(rules instanceof ContextMenuRules)) throw new Error('[rules] 不是 ContextMenuRules');
        return true;
    }

    /**
     * @param {ContextMenuRulesUnit[]} rules 
     * @example 
        [
            {
                list: {
                    menu_id: {
                        name: 'menu_name',
                        ico: 'ico_src',
                        unable: Function || Boolean,
                        skip: Function || Boolean,
                        menu: [],
                        container: (api)=>{},
                        fn: Function
                    }
                },
                ico_only: Boolean, // 只显示图标
            },
            {
                auto: 'list_id'
            }
        ]
     */
    constructor(rules){
        this.#init(rules);
    };

    /**@type {Element} */
    target = jQuery("<div>", {class: "PearS-contextmenu main"})[0];
    #build(menu, lastName, container) {
        menu.map(item => {

            item = item.auto ? { list: FID('document_cache')[0].data.menu[item.auto] } : item;
            const ico_only = item.ico_only;
            const section = jQuery('<section>', { class: ico_only && 'ico-only' });
            container.append(section);

            const listData = item.list || FID("document_cache")[0].data.menu[item.auto];
            for (var id in listData) {
                const itemMenu = listData[id];
                // if (!FID("document")[0].data.writeable && itemMenu.writeable) {
                //     // 跳过非编辑模式下的可写入功能菜单
                // } else 
                if ((typeof (itemMenu.skip) === 'function' && itemMenu.skip.call(cs.this)) || (typeof (itemMenu.skip) === 'boolean' && itemMenu.skip)) {
                    // skip属性跳过
                } else {
                    /**
                     * 添加菜单
                     */
                    const itemBox = jQuery('<div>', {
                        class: 'box'
                    });
                    section.append(itemBox);

                    const itemDom = jQuery('<div>', {
                        name: lastName && `${lastName}@${itemMenu.name}` || itemMenu.name,
                        class: !!(typeof (itemMenu.unable) === 'function' ? (itemMenu.unable.call(cs.this)) : itemMenu.unable) && 'una',
                    });
                    itemBox.append(itemDom);
                    let icoDom = jQuery('<img>', {
                        'menu-type': 'ico',
                        src: itemMenu.ico || ""
                    }).css('opacity', itemMenu.ico ? 1 : 0);
                    let nameDom = !!itemMenu.name && jQuery('<span>', {
                        'menu-type': 'name'
                    }).text(itemMenu.name);
                    let keyDom = !!itemMenu.key && jQuery('<span>', {
                        'menu-type': 'key'
                    }).text(itemMenu.key);
                    let nextContainerSign = jQuery('<span>', {
                        'menu-type': 'next'
                    }).text('>');
                    let nextCotainer = jQuery('<div>', {
                        class: 'PearS-contextmenu '
                    });
                    let customContainer = jQuery('<div>', {
                        class: 'PearS-contextmenu rt-click-cotainer'
                    });


                    if (itemMenu.menu) {
                        // 存在下级菜单
                        itemDom.append(icoDom).append(nameDom).append(keyDom).append(nextContainerSign);
                        itemBox.append(nextCotainer);
                        this.#build(itemMenu.menu, itemMenu.name, nextCotainer);
                    } else if (ico_only) {
                        // 只显示 ico
                        itemDom.append(icoDom)[0].onclick = function () {
                            that.cancel();
                            itemMenu.fn && itemMenu.fn.call(cs.this);
                        };
                    } else if (itemMenu.container) {
                        // 指定
                        itemDom.append(icoDom).append(nameDom).append(keyDom).append(nextContainerSign);
                        itemBox.append(customContainer.append(itemMenu.container({ close: that.cancel })));
                    } else {
                        // 标准菜单
                        console.log(itemDom);
                        itemDom.append(icoDom).append(nameDom).append(keyDom)[0].onclick = function () {
                            that.cancel();
                            itemMenu.fn && itemMenu.fn.call(cs.this);
                        };
                    };

                };
            };

            if (!section[0].childNodes.length) {
                section.remove();
            }

        })
    };
    #init(rules){
        this.#build(rules, null, jQuery(this.target));
    };
};

/**
 * 右键菜单
 */
class ContextMenu{
    /**
     * @param {ContextMenuRules} rules 
     */
    constructor(rules){
        ContextMenuRules.instanceofContextMenuRules(rules);

        this.#init(rules);
    }

    /**@type {ContextMenuRules} */
    #rules = null;
    #init(rules){
        require('../../public/css/components/contextmenu.scss');

        this.#rules = rules;
    }

    hide(){
        jQuery("body").off("mouseup.rt-click");
        jQuery(this.#rules.target).remove();
        jQuery(".PearS-layer-contextmenu").css("pointer-events", "none");
    }
    /**
     * @desc 显示
     * @param {{top:number, left: number}} axis 
     */
    show(axis){
        const newAxis = axis;

        jQuery(".PearS-layer-contextmenu").append(jQuery(this.#rules.target).css({
            top: newAxis.top + 0,
            left: newAxis.left + 10
        })).css("pointer-events", "all");

        setTimeout(() => {
            jQuery("body").off("mouseup.rt-click").on("mouseup.rt-click", "", (e)=>{
                if (!jQuery(e.target.childNodes[0]).parents('.PearS-contextmenu.rt-click').length) {
                    this.hide();
                }
            });
        }, 200);
    }
};

export {
    ContextMenu,
    ContextMenuRules
}

