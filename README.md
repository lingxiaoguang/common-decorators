
## 起因

最近在改一个bug，是一个按钮点击多次发了多次请求的问题，场景不是简单的debounce就能解决，是如果没有成功响应之前，只能触发一次，响应成功之后不能再次触发，响应失败之后可以再次触发。经过分析之后我决定用两个标记来做，一个表示成功之前是否触发过，另一个表示是否成功。

这样的逻辑显然是`非业务相关`的， 一切非业务相关的逻辑都不应该出现在业务代码里，都应该抽出去作为`通用的资源`。抽取的方式很明显用`装饰器模式`比较好。

## 装饰器模式

装饰器模式的特点是： 透明的给一个对象添加一些职责。比如`spring`中的`aop`，比如`express`的中间件、`redux`的中间件、`vuex`的中间件等，都是一些装饰模式的思想。

这个是一个项目中作为常态存在的东西，可以成为一种代码模式。所以我把他放在`utils`下，新建了一个文件夹叫做`decorators`。

## 设计思路

   我这次写的装饰器叫做`onceDecorator`，作用就是透明的给一个函数或者方法添加一些控制的逻辑，在成功之前只会触发一次，如果失败可以再次触发。

   这里的装饰器就是一个`高阶函数`，特点是参数是一个函数，返回值是处理过的函数。
   
   ```javascript
    decorator(func: function): function; 
   ```
   
   具体代码如下：
  ```
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
  ```

   因为装饰的可能是函数，也可能是对象的方法，所以我提供了两个工具函数 `decorateFunction` 和 `decorateMethod`，具体实现如下：

   ```javascript
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

   ```

## 使用方式：
   1. 引入装饰器

   ```javascript
    import { decorateMethod, decorateFunction, onceDecorator} from '@/utils/decorators';
   ```

   2. 装饰函数

   ```javascript
    let func = decorateFunction(func, onceDecorator);
   ```

   3. 装饰方法

   ```javascript
    mounted() {
        this.handleXxx = decorateMethod(func, onceDecorator, this);
    }
   ```

## 如何扩展：
   扩展装饰器需要两步：

   1.在`utils/decorators`下新建一个文件，如 logDecorator.js，实现装饰器的逻辑，也就是一个高阶函数，

   栗子1： 同步装饰器：`logDecorator`：

   ```javascript
    const logDecorator = (func, msg = 'log message') => {
        const thisArg = this;
        return (...args) => {
            console.log(msg);
            return func.call(thisArg, args);
        }
    }
   ```

   栗子2： 异步装饰器 `timerDecorator`：

   ```javascript
    const timerDecorator = (func) => {
        const thisArg = this;
        const startTime = Date.now();
        let endTime;
        return (...args) => {
            return new Promise((resolve, reject) => {
                return func.call(thisArg, args).then(() => {
                    endTime = Date.now();
                    console.log('resolve cost time: ' + (endTime - startTime));
                    resolve();
                }, () => {
                    endTime = Date.now();
                    console.log('reject cost time:' + (endTime - startTime));
                    reject();
                });
            });
        }
    }
   ```
    
   2.在`utils/decorators/index`中引入，

   ```javascript
    import timerDecorator from './timerDecorator';
    import logDecorator from './timerDecorator';
    
    export {
        logDecorator,
        timerDecorator
    }
   ```

这种动态给一个函数方法添加职责的模式用途有很多，应该成为一种规范，作为项目中的一部分而存在。

github链接： 
