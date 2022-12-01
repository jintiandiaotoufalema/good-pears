import dpi from "./dpi";

function cm2pt(value){
    return parseFloat((value/2.54*72).toFixed(6));
};

function pt2cm(value){
    return parseFloat((value/72*2.54).toFixed(6));
};

function mm2pt(value){
    return parseFloat((value/25.4*72).toFixed(6));
};

function pt2mm(value){
    return parseFloat((value/72*25.4).toFixed(6));
};

function pt2px(value){
    return value * dpi() / 72
}

function px2pt(value){
    return value * 72 / dpi();
}

function px2mm(value){
    return pt2mm(px2pt(value));
}

// TODO 保留了小数位优化计算，会存在多次转换产生误差的可能
export {
    cm2pt,
    mm2pt,
    pt2cm,
    pt2mm,
    pt2px,
    px2mm,
    px2pt
};