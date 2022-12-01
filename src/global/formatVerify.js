/**
 *  数值格式验证
 * @param {*} input 
 * @param {('number')} type 
 * @param {*} typeDef 
 * @returns 
 */
export default function(input, type, typeDef){
    const err = new Error(`输入内容格式不是[${type||typeDef}]`);

    return true;
};