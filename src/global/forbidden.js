/**
 * 全局禁用右键
 */
const disableRightButton = function () {
    document.body.addEventListener("contextmenu", e => e.preventDefault(), { passive: false });
}

/**
 * 全局禁用拖拽
 */
const disableDragging = function () {
    document.ondragover = function (e) {
        e.preventDefault();
    };
    document.ondrop = function (e) {
        e.preventDefault();
    };
    document.ondragstart = e=>false;
}

export {
    disableDragging,
    disableRightButton
}