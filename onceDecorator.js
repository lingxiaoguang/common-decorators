 /**
 * @name: 访问一次装饰器
 * @desc：
 * 给一个 返回值为promise的函数 加访问控制
 * 控制逻辑为：
 *      如果promise在pending状态，函数只可以调用一次，
 *      如果promise已经resolve了，函数不可以再次调用，
 *      如果promise已经reject了，函数可以再次调用
 * @example
 *   func = onceDecorator(func);
 * @param {*} func 被包装的函数
 */
const onceDecorator = function(func) {
    if (typeof func !== 'function') {
        throw new TypeError('被装饰的必须是函数');
    }
    const thisArg = this;//函数执行的上下文
    let isPromiseResolved = false;//promise是否被resolve
    let isFuncInvoked = false;//函数是否被调用过

    const invokeFunc = (funcArgs, resolve, reject) => {
        func.call(thisArg ,funcArgs).then(()=>{
            isPromiseResolved = true;
            resolve();
        }, () => {
            isPromiseResolved = false;
            isFuncInvoked = false;
            reject();
        });
    }

    const wrappedFunc = function (...args) {
        return new Promise((resolve, reject) => {
           if(!isPromiseResolved && !isFuncInvoked) {
               invokeFunc(args, resolve, reject);
               isFuncInvoked = true;
           }
        })
    };

    return wrappedFunc;
  }


  export default onceDecorator;