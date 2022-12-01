/**
 * 错误处理
 */
export default function () {
    /**
     * 语法错误 | 运行时错误
     * @param {String} message 错误信息
     * @param {String} source 脚本URL
     * @param {Number} lineno 行号
     * @param {Number} colno 列号
     * @param {Error} error 
     */
    window.onerror = function (message, source, lineno, colno, error) {
        throw error;
    };

    window.addEventListener('error', function (event) {
        throw event.error;
    });


    window.addEventListener("unhandledrejection", function (event) {
        throw event.reason;
    });
};