/**
 * 边界监测
 * @param {object} a 容器
 * @param {number} a.top
 * @param {number} a.right
 * @param {number} a.bottom
 * @param {number} a.left
 * @param {object} b target
 * @param {number} b.top
 * @param {number} b.right
 * @param {number} b.bottom
 * @param {number} b.left
 */
export default function (a, b) {

    ['top', 'right', 'bottom', 'left'].map(item => {
        if (a[item] === NaN) {
            throw new Error(`容器的 ${item} 值不可为 NaN`);
        } else if (b[item] === NaN) {
            throw new Error(`目标的 ${item} 值不可为 NaN`);
        }
    });

    /**
     * @param {object} cs
     * @param {number} [cs.border] 边距
     * @param {boolean} [cs.value] 传值
     * @returns cs.value?修复后的值 [Object]this._out: 是否超过边界 [Boolean]
     */
    this.check = function (cs) {
        this._out = {};
        let _return = true;
        cs ? null : cs = {};
        cs.border ? (typeof (cs.border) == "number" ? cs.border = {
            top: cs.border,
            right: cs.border,
            bottom: cs.border,
            left: cs.border
        } : cs.border = {
            top: cs.border.top || 0,
            right: cs.border.right || 0,
            bottom: cs.border.bottom || 0,
            left: cs.border.left || 0
        }) : cs.border = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        cs = {
            border: cs.border || 0,
            value: cs.value || false
        }
        // 检查right
        this._out.right = b.right > (a.right - cs.border.right) ? (a.right - cs.border.right) : b.right;
        // 修正b
        b.left = b.left - (b.right - this._out.right);

        // 检查bottom 
        // this._out.bottom = b.bottom > (a.bottom - cs.border) ? (a.bottom - cs.border) - 60 : b.bottom - 60;
        this._out.bottom = b.bottom > (a.bottom - cs.border.bottom) ? (a.bottom - cs.border.bottom) : b.bottom;
        // 修正 b
        b.top = b.top - (b.bottom - this._out.bottom);

        // 检查left
        this._out.left = b.left < (a.left + cs.border.left) ? (a.left + cs.border.left) : b.left;
        // 检测top
        this._out.top = b.top < (a.top + cs.border.top) ? (a.top + cs.border.top) : b.top;

        for (var id in this._out) {
            if (this._out[id] != b[id]) {
                // 超出范围
                _return = false;
                break;
            }
        };

        if (cs.value) {
            return this;
        } else {
            return _return;
        };
    };

    /**
     * @param {object} c $target[0]
     * @param {object} cs
     * @param {number} cs.border 边界
     */
    this.reset = function (c, cs) {
        const aa = this.check({
            border: cs && cs.border ? cs.border : 0,
            value: true
        });

        $(c).css({
            top: aa.top,
            left: aa.left
        });

        return this;
    };

    return this;
};