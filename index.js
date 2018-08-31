import onceDecorator from './onceDecorator';
/***
 * 模块描述： 函数的装饰器，增强函数功能的一些高阶函数
 */

/**
 * 装饰函数
 * @param {*} func 被装饰的函数
 * @param {*} decorator 装饰器
 */
const decorateFunction = (func, decorator) => {
    return decorator(func);
}

/**
 * 装饰方法
 * @param {*} func 被装饰的方法 
 * @param {*} decorator 装饰器
 * @param {*} context 上下文
 */
const decorateMethod = (func, decorator, context) => {
    return decorator.bind(context)(func);
}


export {
    decorateMethod,
    decorateFunction,
    onceDecorator
};