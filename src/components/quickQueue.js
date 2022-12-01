/**
 * 通用 render 队列
 */
class RenderQueue {
    /**
     * @param {(this: target, resolve:Function, reject: Function)} fn 渲染处理程序
     * @param {*} [target] fn this 指向
     */
    constructor(fn, target) {
        if (!fn) throw new Error('fn undefined');

        this.#renderProcess = fn;
        this.#renderScope = target || null;
    };
    /**
     * 添加任务
     * @returns {Promise}
     */
    push() {
        return new Promise((resolve, reject) => {
            this.#renderQueue.push({
                resolve,
                reject,
            });
            this.#render();
        });
    };

    #renderProcess = null;
    #renderScope = null;
    #renderQueue = [];
    #renderStatus = false;

    async #render() {
        if (!this.#renderStatus) {
            this.#renderStatus = true;

            // 启用时延迟20ms，收集更多请求，优化性能
            await new Promise(resolve=>{
                setTimeout(() => {
                    resolve();
                }, 20);
            });

            const renderProcess = () => new Promise((resolve, reject) => {
                // TODO 实际渲染程序
                this.#renderProcess.call(this.#renderScope, resolve, reject);
            });

            while (this.#renderQueue.length) {
                const queueList = this.#renderQueue.slice(0);
                this.#renderQueue.length = 0;
                const res = await renderProcess();

                queueList.forEach(item => item.resolve(res));
            };

            this.#renderStatus = false;
        };
    };
};

export {
    RenderQueue
}