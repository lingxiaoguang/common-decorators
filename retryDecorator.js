
/**
 * 重试装饰器，在失败的时候会重新调用
 */
const retryDecorator = (func, {retryCount = 1 }) => {
    if (typeof func !== 'function') {
        throw new TypeError('被装饰的必须是函数');
    }    
    
    const thisArg = this;
    let toRetryCount = retryCount;// 剩余重试次数

    const invokeFunc = (args, resolve, reject) => {
        toRetryCount --;
        func.call(thisArg, args).then(() => {
            resolve();
        }, () => {
            if (toRetryCount > 0){
                invokeFunc(args, resolve, reject);
            } else {
                reject();
            }
        });
    }

    const wrappedFunc = (...args) => {
        return new Promise((resolve, reject) => {
            invokeFunc(args, resolve, reject);     
        });
    } 

    return wrappedFunc;
}

export default retryDecorator;