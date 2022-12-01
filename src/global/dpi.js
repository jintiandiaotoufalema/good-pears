let dpi = null;

/**
 * 获取 DPI
 * @returns {number} 
 */
export default function () {
    if (dpi) return dpi
    else {
        if (window.screen.deviceXDPI != undefined) {
            dpi = window.screen.deviceXDPI;
        }
        else {
            const tmpNode = document.createElement("DIV");
            tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
            document.body.appendChild(tmpNode);
            dpi = parseInt(tmpNode.offsetWidth);
            tmpNode.parentNode.removeChild(tmpNode);
        };
    };
    return dpi;
};