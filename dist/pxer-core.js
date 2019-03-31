"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!function (global) {
    "use strict";

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    var inModule = (typeof module === "undefined" ? "undefined" : _typeof(module)) === "object";
    var runtime = global.regeneratorRuntime;
    if (runtime) {
        if (inModule) {
            // If regeneratorRuntime is defined globally and we're in a module,
            // make the exports object identical to regeneratorRuntime.
            module.exports = runtime;
        }
        // Don't bother evaluating the rest of this file if the runtime was
        // already defined globally.
        return;
    }

    // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.
    runtime = global.regeneratorRuntime = inModule ? module.exports : {};

    function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []);

        // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.
        generator._invoke = makeInvokeMethod(innerFn, self, context);

        return generator;
    }
    runtime.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
        try {
            return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
            return { type: "throw", arg: err };
        }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
        return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
            prototype[method] = function (arg) {
                return this._invoke(method, arg);
            };
        });
    }

    runtime.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    runtime.mark = function (genFun) {
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
            genFun.__proto__ = GeneratorFunctionPrototype;
            if (!(toStringTagSymbol in genFun)) {
                genFun[toStringTagSymbol] = "GeneratorFunction";
            }
        }
        genFun.prototype = Object.create(Gp);
        return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    runtime.awrap = function (arg) {
        return { __await: arg };
    };

    function AsyncIterator(generator) {
        function invoke(method, arg, resolve, reject) {
            var record = tryCatch(generator[method], generator, arg);
            if (record.type === "throw") {
                reject(record.arg);
            } else {
                var result = record.arg;
                var value = result.value;
                if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && hasOwn.call(value, "__await")) {
                    return Promise.resolve(value.__await).then(function (value) {
                        invoke("next", value, resolve, reject);
                    }, function (err) {
                        invoke("throw", err, resolve, reject);
                    });
                }

                return Promise.resolve(value).then(function (unwrapped) {
                    // When a yielded Promise is resolved, its final value becomes
                    // the .value of the Promise<{value,done}> result for the
                    // current iteration.
                    result.value = unwrapped;
                    resolve(result);
                }, function (error) {
                    // If a rejected Promise was yielded, throw the rejection back
                    // into the async generator function so it can be handled there.
                    return invoke("throw", error, resolve, reject);
                });
            }
        }

        var previousPromise;

        function enqueue(method, arg) {
            function callInvokeWithMethodAndArg() {
                return new Promise(function (resolve, reject) {
                    invoke(method, arg, resolve, reject);
                });
            }

            return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }

        // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).
        this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
    };
    runtime.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    runtime.async = function (innerFn, outerFn, self, tryLocsList) {
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

        return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
            return result.done ? result.value : iter.next();
        });
    };

    function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;

        return function invoke(method, arg) {
            if (state === GenStateExecuting) {
                throw new Error("Generator is already running");
            }

            if (state === GenStateCompleted) {
                if (method === "throw") {
                    throw arg;
                }

                // Be forgiving, per 25.3.3.3.3 of the spec:
                // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
                return doneResult();
            }

            context.method = method;
            context.arg = arg;

            while (true) {
                var delegate = context.delegate;
                if (delegate) {
                    var delegateResult = maybeInvokeDelegate(delegate, context);
                    if (delegateResult) {
                        if (delegateResult === ContinueSentinel) continue;
                        return delegateResult;
                    }
                }

                if (context.method === "next") {
                    // Setting context._sent for legacy support of Babel's
                    // function.sent implementation.
                    context.sent = context._sent = context.arg;
                } else if (context.method === "throw") {
                    if (state === GenStateSuspendedStart) {
                        state = GenStateCompleted;
                        throw context.arg;
                    }

                    context.dispatchException(context.arg);
                } else if (context.method === "return") {
                    context.abrupt("return", context.arg);
                }

                state = GenStateExecuting;

                var record = tryCatch(innerFn, self, context);
                if (record.type === "normal") {
                    // If an exception is thrown from innerFn, we leave state ===
                    // GenStateExecuting and loop back for another invocation.
                    state = context.done ? GenStateCompleted : GenStateSuspendedYield;

                    if (record.arg === ContinueSentinel) {
                        continue;
                    }

                    return {
                        value: record.arg,
                        done: context.done
                    };
                } else if (record.type === "throw") {
                    state = GenStateCompleted;
                    // Dispatch the exception by looping back around to the
                    // context.dispatchException(context.arg) call above.
                    context.method = "throw";
                    context.arg = record.arg;
                }
            }
        };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (method === undefined) {
            // A .throw or .return when the delegate iterator has no .throw
            // method always terminates the yield* loop.
            context.delegate = null;

            if (context.method === "throw") {
                if (delegate.iterator.return) {
                    // If the delegate iterator has a return method, give it a
                    // chance to clean up.
                    context.method = "return";
                    context.arg = undefined;
                    maybeInvokeDelegate(delegate, context);

                    if (context.method === "throw") {
                        // If maybeInvokeDelegate(context) changed context.method from
                        // "return" to "throw", let that override the TypeError below.
                        return ContinueSentinel;
                    }
                }

                context.method = "throw";
                context.arg = new TypeError("The iterator does not provide a 'throw' method");
            }

            return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
            context.method = "throw";
            context.arg = record.arg;
            context.delegate = null;
            return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
            context.method = "throw";
            context.arg = new TypeError("iterator result is not an object");
            context.delegate = null;
            return ContinueSentinel;
        }

        if (info.done) {
            // Assign the result of the finished delegate to the temporary
            // variable specified by delegate.resultName (see delegateYield).
            context[delegate.resultName] = info.value;

            // Resume execution at the desired location (see delegateYield).
            context.next = delegate.nextLoc;

            // If context.method was "throw" but the delegate handled the
            // exception, let the outer generator proceed normally. If
            // context.method was "next", forget context.arg since it has been
            // "consumed" by the delegate iterator. If context.method was
            // "return", allow the original .return call to continue in the
            // outer generator.
            if (context.method !== "return") {
                context.method = "next";
                context.arg = undefined;
            }
        } else {
            // Re-yield the result returned by the delegate method.
            return info;
        }

        // The delegate iterator is finished, so forget it and continue with
        // the outer generator.
        context.delegate = null;
        return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function () {
        return this;
    };

    Gp.toString = function () {
        return "[object Generator]";
    };

    function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };

        if (1 in locs) {
            entry.catchLoc = locs[1];
        }

        if (2 in locs) {
            entry.finallyLoc = locs[2];
            entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
    }

    function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{ tryLoc: "root" }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
    }

    runtime.keys = function (object) {
        var keys = [];
        for (var key in object) {
            keys.push(key);
        }
        keys.reverse();

        // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.
        return function next() {
            while (keys.length) {
                var key = keys.pop();
                if (key in object) {
                    next.value = key;
                    next.done = false;
                    return next;
                }
            }

            // To avoid creating an additional object, we just hang the .value
            // and .done properties off the next function object itself. This
            // also ensures that the minifier will not anonymize the function.
            next.done = true;
            return next;
        };
    };

    function values(iterable) {
        if (iterable) {
            var iteratorMethod = iterable[iteratorSymbol];
            if (iteratorMethod) {
                return iteratorMethod.call(iterable);
            }

            if (typeof iterable.next === "function") {
                return iterable;
            }

            if (!isNaN(iterable.length)) {
                var i = -1,
                    next = function next() {
                    while (++i < iterable.length) {
                        if (hasOwn.call(iterable, i)) {
                            next.value = iterable[i];
                            next.done = false;
                            return next;
                        }
                    }

                    next.value = undefined;
                    next.done = true;

                    return next;
                };

                return next.next = next;
            }
        }

        // Return an iterator with no values.
        return { next: doneResult };
    }
    runtime.values = values;

    function doneResult() {
        return { value: undefined, done: true };
    }

    Context.prototype = {
        constructor: Context,

        reset: function reset(skipTempReset) {
            this.prev = 0;
            this.next = 0;
            // Resetting context._sent for legacy support of Babel's
            // function.sent implementation.
            this.sent = this._sent = undefined;
            this.done = false;
            this.delegate = null;

            this.method = "next";
            this.arg = undefined;

            this.tryEntries.forEach(resetTryEntry);

            if (!skipTempReset) {
                for (var name in this) {
                    // Not sure about the optimal order of these conditions:
                    if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                        this[name] = undefined;
                    }
                }
            }
        },

        stop: function stop() {
            this.done = true;

            var rootEntry = this.tryEntries[0];
            var rootRecord = rootEntry.completion;
            if (rootRecord.type === "throw") {
                throw rootRecord.arg;
            }

            return this.rval;
        },

        dispatchException: function dispatchException(exception) {
            if (this.done) {
                throw exception;
            }

            var context = this;
            function handle(loc, caught) {
                record.type = "throw";
                record.arg = exception;
                context.next = loc;

                if (caught) {
                    // If the dispatched exception was caught by a catch block,
                    // then let that catch block handle the exception normally.
                    context.method = "next";
                    context.arg = undefined;
                }

                return !!caught;
            }

            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                var record = entry.completion;

                if (entry.tryLoc === "root") {
                    // Exception thrown outside of any try block that could handle
                    // it, so set the completion value of the entire function to
                    // throw the exception.
                    return handle("end");
                }

                if (entry.tryLoc <= this.prev) {
                    var hasCatch = hasOwn.call(entry, "catchLoc");
                    var hasFinally = hasOwn.call(entry, "finallyLoc");

                    if (hasCatch && hasFinally) {
                        if (this.prev < entry.catchLoc) {
                            return handle(entry.catchLoc, true);
                        } else if (this.prev < entry.finallyLoc) {
                            return handle(entry.finallyLoc);
                        }
                    } else if (hasCatch) {
                        if (this.prev < entry.catchLoc) {
                            return handle(entry.catchLoc, true);
                        }
                    } else if (hasFinally) {
                        if (this.prev < entry.finallyLoc) {
                            return handle(entry.finallyLoc);
                        }
                    } else {
                        throw new Error("try statement without catch or finally");
                    }
                }
            }
        },

        abrupt: function abrupt(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                    var finallyEntry = entry;
                    break;
                }
            }

            if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
                // Ignore the finally entry if control is not jumping to a
                // location outside the try/catch block.
                finallyEntry = null;
            }

            var record = finallyEntry ? finallyEntry.completion : {};
            record.type = type;
            record.arg = arg;

            if (finallyEntry) {
                this.method = "next";
                this.next = finallyEntry.finallyLoc;
                return ContinueSentinel;
            }

            return this.complete(record);
        },

        complete: function complete(record, afterLoc) {
            if (record.type === "throw") {
                throw record.arg;
            }

            if (record.type === "break" || record.type === "continue") {
                this.next = record.arg;
            } else if (record.type === "return") {
                this.rval = this.arg = record.arg;
                this.method = "return";
                this.next = "end";
            } else if (record.type === "normal" && afterLoc) {
                this.next = afterLoc;
            }

            return ContinueSentinel;
        },

        finish: function finish(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                if (entry.finallyLoc === finallyLoc) {
                    this.complete(entry.completion, entry.afterLoc);
                    resetTryEntry(entry);
                    return ContinueSentinel;
                }
            }
        },

        "catch": function _catch(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                if (entry.tryLoc === tryLoc) {
                    var record = entry.completion;
                    if (record.type === "throw") {
                        var thrown = record.arg;
                        resetTryEntry(entry);
                    }
                    return thrown;
                }
            }

            // The context.catch method must only be called with a location
            // argument that corresponds to a known catch block.
            throw new Error("illegal catch attempt");
        },

        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
            this.delegate = {
                iterator: values(iterable),
                resultName: resultName,
                nextLoc: nextLoc
            };

            if (this.method === "next") {
                // Deliberately forget the last sent value so that we don't
                // accidentally pass it on to the delegate.
                this.arg = undefined;
            }

            return ContinueSentinel;
        }
    };
}(
// In sloppy mode, unbound `this` refers to the global object, fallback to
// Function constructor if we're in global strict mode. That is sadly a form
// of indirect eval which violates Content Security Policy.
function () {
    return this || (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self;
}() || Function("return this")());

'use strict';

/**
 * Pxer任务队列中的任务对象
 * @constructor
 * @abstract
 * */

var PxerRequest = function PxerRequest() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        url = _ref.url,
        html = _ref.html;

    _classCallCheck(this, PxerRequest);

    this.url = url;
    this.html = html;
    this.completed = false;
};
/**
 * 页面任务对象
 * @constructor
 * @extends {PxerRequest}
 * */


var PxerPageRequest = function (_PxerRequest) {
    _inherits(PxerPageRequest, _PxerRequest);

    function PxerPageRequest() {
        var _ref2;

        _classCallCheck(this, PxerPageRequest);

        for (var _len = arguments.length, argn = Array(_len), _key = 0; _key < _len; _key++) {
            argn[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref2 = PxerPageRequest.__proto__ || Object.getPrototypeOf(PxerPageRequest)).call.apply(_ref2, [this].concat(argn)));

        _this.type = argn[0].type;
        return _this;
    }

    return PxerPageRequest;
}(PxerRequest);
/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */


var PxerWorksRequest = function (_PxerRequest2) {
    _inherits(PxerWorksRequest, _PxerRequest2);

    function PxerWorksRequest() {
        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref3$url = _ref3.url,
            url = _ref3$url === undefined ? [] : _ref3$url,
            _ref3$html = _ref3.html,
            html = _ref3$html === undefined ? {} : _ref3$html,
            type = _ref3.type,
            isMultiple = _ref3.isMultiple,
            id = _ref3.id;

        _classCallCheck(this, PxerWorksRequest);

        var _this2 = _possibleConstructorReturn(this, (PxerWorksRequest.__proto__ || Object.getPrototypeOf(PxerWorksRequest)).call(this, { url: url, html: html }));

        _this2.type = type; //[manga|ugoira|illust]
        _this2.isMultiple = isMultiple; //[true|false]
        _this2.id = id;
        return _this2;
    }

    return PxerWorksRequest;
}(PxerRequest);

/**
 * 作品任务对象
 * @constructor
 * @extends {PxerRequest}
 * */


var PxerFailInfo = function PxerFailInfo() {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        url = _ref4.url,
        type = _ref4.type,
        task = _ref4.task;

    _classCallCheck(this, PxerFailInfo);

    this.url = url;
    this.type = type;
    this.task = task;
};

/**
 * 抓取到的作品对象
 * @constructor
 * */


var PxerWorks = function PxerWorks() {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        id = _ref5.id,
        type = _ref5.type,
        date = _ref5.date,
        domain = _ref5.domain,
        tagList = _ref5.tagList,
        viewCount = _ref5.viewCount,
        ratedCount = _ref5.ratedCount,
        fileFormat = _ref5.fileFormat;

    var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, PxerWorks);

    /**作品ID*/
    this.id = id;
    /**
     * 投稿日期，格式：Y/m/d/h/m/s
     * @type {string}
     * */
    this.date = date;
    this.type = type; //[manga|ugoira|illust]
    /**作品存放的域名*/
    this.domain = domain;
    /**
     * 作品标签列表
     * @type {Array}
     * */
    this.tagList = tagList;
    /**作品被浏览的次数*/
    this.viewCount = viewCount;
    /**作品被赞的次数*/
    this.ratedCount = ratedCount;
    /**作品的图片文件扩展名*/
    this.fileFormat = fileFormat;
};
/**
 * 抓取到的多张插画/漫画作品对象
 * @extends {PxerWorks}
 * @constructor
 * */


var PxerMultipleWorks = function (_PxerWorks) {
    _inherits(PxerMultipleWorks, _PxerWorks);

    function PxerMultipleWorks() {
        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PxerMultipleWorks);

        /**作品的图片张数*/
        var _this3 = _possibleConstructorReturn(this, (PxerMultipleWorks.__proto__ || Object.getPrototypeOf(PxerMultipleWorks)).call(this, data, false));

        _this3.multiple = data.multiple;
        return _this3;
    }

    return PxerMultipleWorks;
}(PxerWorks);

;
/**
 * 抓取到的动图作品对象
 * @extends {PxerWorks}
 * @constructor
 * */

var PxerUgoiraWorks = function (_PxerWorks2) {
    _inherits(PxerUgoiraWorks, _PxerWorks2);

    function PxerUgoiraWorks() {
        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PxerUgoiraWorks);

        var _this4 = _possibleConstructorReturn(this, (PxerUgoiraWorks.__proto__ || Object.getPrototypeOf(PxerUgoiraWorks)).call(this, data, false));

        _this4.fileFormat = 'zip';
        /**动图动画参数*/
        _this4.frames = data.frames;
        return _this4;
    }

    return PxerUgoiraWorks;
}(PxerWorks);

;

'use strict';

var PxerEvent = function () {
    function PxerEvent() {
        var eventList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var shortName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        _classCallCheck(this, PxerEvent);

        this._pe_eventList = eventList;

        this._pe_event = {};
        this._pe_oneEvent = {};

        if (!shortName || typeof Proxy === 'undefined') return this;else return new Proxy(this, {
            get: function get(target, property) {
                if (property in target) {
                    return target[property];
                } else if (target._pe_eventList.indexOf(property) !== -1) {
                    return target.dispatch.bind(target, property);
                } else {
                    return target[property];
                };
            }
        });
    }

    _createClass(PxerEvent, [{
        key: "on",
        value: function on(type, listener) {
            if (!PxerEvent.check(this, type, listener)) return false;
            if (!this._pe_event[type]) this._pe_event[type] = [];
            this._pe_event[type].push(listener);
            return true;
        }
    }, {
        key: "one",
        value: function one(type, listener) {
            if (!PxerEvent.check(this, type, listener)) return false;
            if (!this._pe_oneEvent[type]) this._pe_oneEvent[type] = [];
            this._pe_oneEvent[type].push(listener);
            return true;
        }
    }, {
        key: "dispatch",
        value: function dispatch(type) {
            for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                data[_key2 - 1] = arguments[_key2];
            }

            if (this._pe_eventList.indexOf(type) === -1) return false;
            if (this._pe_event[type]) this._pe_event[type].forEach(function (fn) {
                return fn.apply(undefined, data);
            });
            if (this._pe_oneEvent[type]) {
                this._pe_oneEvent[type].forEach(function (fn) {
                    return fn.apply(undefined, data);
                });
                delete this._pe_oneEvent[type];
            }
            if (this._pe_event['*']) this._pe_event['*'].forEach(function (fn) {
                return fn.apply(undefined, data);
            });
            if (this._pe_oneEvent['*']) {
                this._pe_oneEvent['*'].forEach(function (fn) {
                    return fn.apply(undefined, data);
                });
                delete this._pe_oneEvent['*'];
            }
            return true;
        }
    }, {
        key: "off",
        value: function off(eventType, listener) {
            if (!PxerEvent.checkEvent(this, eventType)) return false;
            if (listener && !PxerEvent.checkListener(listener)) return false;

            if (eventType === true) {
                this._pe_event = {};
                this._pe_oneEvent = {};
                return true;
            };

            if (listener === true || listener === '*') {
                delete this._pe_event[eventType];
                delete this._pe_oneEvent[eventType];
                return true;
            };

            var index1 = this._pe_event[type].lastIndexOf(listener);
            if (index1 !== -1) {
                this._pe_event[type].splice(index1, 1);
            };

            var index2 = this._pe_oneEvent[type].lastIndexOf(listener);
            if (index2 !== -1) {
                this._pe_oneEvent[type].splice(index2, 1);
            };

            return true;
        }
    }]);

    return PxerEvent;
}();

;

PxerEvent.check = function (pe, eventType, listener) {
    return PxerEvent.checkEvent(pe, eventType) && PxerEvent.checkListener(listener);
};
PxerEvent.checkEvent = function (pe, eventType) {
    if (eventType !== '*' && pe._pe_eventList.indexOf(eventType) === -1) {
        console.warn("PxerEvent : \"" + eventType + "\" is not in eventList[" + pe._pe_eventList + "]");
        return false;
    };
    return true;
};
PxerEvent.checkListener = function (listener) {
    if (!(listener instanceof Function || listener === true || listener === '*')) {
        console.warn("PxerEvent: \"" + listener + "\" is not a function");
        return false;
    };
    return true;
};

'use strict';

var PxerFilter = function () {
    /**
     * @param {Object} config - 过滤参数
     * @see PxerFilter.filterInfo
     * @see PxerFilter.filterTag
     * */
    function PxerFilter(config) {
        _classCallCheck(this, PxerFilter);

        /**
         * 每次过滤后得到的累计的作品集合
         * @type {PxerWorks[]}
         * */
        this.passWorks = [];

        /**
         * 过滤的配置信息
         * @see PxerFilter.filterInfo
         * @see PxerFilter.filterTag
         * */
        this.config = Object.assign(PxerFilter.defaultConfig(), config);
    }

    _createClass(PxerFilter, [{
        key: "filter",


        /**
         * 对作品进行过滤
         * @param {PxerWorks[]} worksList - 要过滤的作品数组
         * @return {PxerWorks[]} - 过滤后的结果
         * */
        value: function filter(worksList) {
            var _passWorks;

            var resultSet = PxerFilter.filterInfo(PxerFilter.filterTag(worksList, this.config), this.config);
            (_passWorks = this.passWorks).push.apply(_passWorks, _toConsumableArray(resultSet));
            return resultSet;
        }
    }]);

    return PxerFilter;
}();

;

/**
 * 返回PxerFilter的默认配置参数
 * @see PxerFilter.filterInfo
 * @see PxerFilter.filterTag
 * */
PxerFilter.defaultConfig = function () {
    return {
        "rated": 0, //赞的数量
        "rated_pro": 0, //点赞率
        "view": 0, //浏览数
        "has_tag_every": [],
        "has_tag_some": [],
        "no_tag_any": [],
        "no_tag_every": []
    };
};

/**
 * 根据标签作品信息过滤作品
 * @param {PxerWorks[]} worksList
 * @param {number} rated      - 作品不小于的赞的数量
 * @param {number} rated_pro  - 作品不小于的点赞率，小于0的数字
 * @param {number} view       - 作品不小于的浏览数
 * @return {PxerWorks[]}
 * */
PxerFilter.filterInfo = function (worksList, _ref6) {
    var _ref6$rated = _ref6.rated,
        rated = _ref6$rated === undefined ? 0 : _ref6$rated,
        _ref6$rated_pro = _ref6.rated_pro,
        rated_pro = _ref6$rated_pro === undefined ? 0 : _ref6$rated_pro,
        _ref6$view = _ref6.view,
        view = _ref6$view === undefined ? 0 : _ref6$view;

    return worksList.filter(function (works) {
        return works.ratedCount >= rated && works.viewCount >= view && works.ratedCount / works.viewCount >= rated_pro;
    });
};

/**
 * 根据标签过滤作品
 * @param {PxerWorks[]} worksList
 * @param {string[]} no_tag_any    - 作品中不能含有里面的任意一个标签
 * @param {string[]} no_tag_every  - 作品中不能同时含有里面的所有标签
 * @param {string[]} has_tag_some  - 作品中必须含有有里面的任意一个标签
 * @param {string[]} has_tag_every - 作品中必须同时含有里面的所有标签
 * @return {PxerWorks[]}
 * */
PxerFilter.filterTag = function (worksList, _ref7) {
    var has_tag_every = _ref7.has_tag_every,
        has_tag_some = _ref7.has_tag_some,
        no_tag_any = _ref7.no_tag_any,
        no_tag_every = _ref7.no_tag_every;

    var passWorks = worksList;

    if (has_tag_every && has_tag_every.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return has_tag_every.every(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    if (has_tag_some && has_tag_some.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return has_tag_some.some(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    if (no_tag_any && no_tag_any.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return !no_tag_any.some(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    if (no_tag_every && no_tag_every.length !== 0) {
        passWorks = passWorks.filter(function (works) {
            return !no_tag_every.every(function (tag) {
                return works.tagList.indexOf(tag) !== -1;
            });
        });
    };

    return passWorks;
};

'use strict';

var PxerHtmlParser = function PxerHtmlParser() {
    _classCallCheck(this, PxerHtmlParser);

    throw new Error('PxerHtmlParse could not construct');
};

;

/**
 * 解析页码任务对象
 * @param {PxerPageRequest} task - 抓取后的页码任务对象
 * @return {PxerWorksRequest[]|false} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parsePage = function (task) {
    if (!(task instanceof PxerPageRequest)) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task is not PxerPageRequest';
        return false;
    }
    if (!task.url || !task.html) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: task illegal';
        return false;
    }

    var parseList = function parseList(elt) {
        return JSON.parse(elt.getAttribute('data-items')).filter(function (i) {
            return !i.isAdContainer;
        }) // skip AD
        ;
    };

    var taskList = [];
    switch (task.type) {
        case "userprofile_manga":
        case "userprofile_illust":
        case "userprofile_all":
            var response = JSON.parse(task.html).body;
            if (task.type !== "userprofile_illust") {
                for (var elt in response.manga) {
                    var _tsk = new PxerWorksRequest({
                        html: {},
                        type: null,
                        isMultiple: null,
                        id: elt
                    });
                    _tsk.url = PxerHtmlParser.getUrlList(_tsk);
                    taskList.push(_tsk);
                }
            }

            if (task.type !== "userprofile_manga") {
                for (var _elt in response.illusts) {
                    var tsk = new PxerWorksRequest({
                        html: {},
                        type: null,
                        isMultiple: null,
                        id: _elt
                    });
                    tsk.url = PxerHtmlParser.getUrlList(tsk);
                    taskList.push(tsk);
                }
            }
            break;

        case "bookmark_works":
            var response = JSON.parse(task.html).body;
            for (var worki in response.works) {
                var work = response.works[worki];
                var _tsk2 = new PxerWorksRequest({
                    html: {},
                    type: this.parseIllustType(work.illustType),
                    isMultiple: work.pageCount > 1,
                    id: work.id
                });
                _tsk2.url = PxerHtmlParser.getUrlList(_tsk2);
                taskList.push(_tsk2);
            }
            break;
        case "member_works":
            var dom = PxerHtmlParser.HTMLParser(task.html);
            var elts = dom.body.querySelectorAll('a.work._work');
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = elts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _elt2 = _step.value;

                    var task = new PxerWorksRequest({
                        html: {},
                        type: function (elt) {
                            switch (true) {
                                case elt.matches('.ugoku-illust'):
                                    return "ugoira";
                                case elt.matches('.manga'):
                                    return "manga";
                                default:
                                    return "illust";
                            }
                        }(_elt2),
                        isMultiple: _elt2.matches(".multiple"),
                        id: _elt2.getAttribute('href').match(/illust_id=(\d+)/)[1]
                    });

                    task.url = PxerHtmlParser.getUrlList(task);

                    taskList.push(task);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            ;
            break;
        case "rank":
            var data = JSON.parse(task.html);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = data['contents'][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var task = _step2.value;


                    var task = new PxerWorksRequest({
                        html: {},
                        type: this.parseIllustType(task['illust_type']),
                        isMultiple: task['illust_page_count'] > 1,
                        id: task['illust_id'].toString()
                    });
                    task.url = PxerHtmlParser.getUrlList(task);

                    taskList.push(task);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            ;
            break;
        case "discovery":
            var data = JSON.parse(task.html);
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = data.recommendations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var id = _step3.value;

                    var task = new PxerWorksRequest({
                        html: {},
                        type: null,
                        isMultiple: null,
                        id: id.toString()
                    });
                    task.url = PxerHtmlParser.getUrlList(task);

                    taskList.push(task);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            ;
            break;
        case "search":
            var dom = PxerHtmlParser.HTMLParser(task.html);
            var searchData = parseList(dom.body.querySelector("input#js-mount-point-search-result-list"));
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = searchData[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var searchItem = _step4.value;

                    var task = new PxerWorksRequest({
                        html: {},
                        type: this.parseIllustType(searchItem.illustType),
                        isMultiple: searchItem.pageCount > 1,
                        id: searchItem.illustId
                    });
                    task.url = PxerHtmlParser.getUrlList(task);
                    taskList.push(task);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            ;
            break;
        case "bookmark_new":
            var dom = PxerHtmlParser.HTMLParser(task.html);
            var data = parseList(dom.body.querySelector("div#js-mount-point-latest-following"));
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var task = _step5.value;


                    var task = new PxerWorksRequest({
                        html: {},
                        type: this.parseIllustType(task.illustType),
                        isMultiple: task.pageCount > 1,
                        id: task.illustId.toString()
                    });
                    task.url = PxerHtmlParser.getUrlList(task);

                    taskList.push(task);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            ;
            break;
        default:
            throw new Error("Unknown PageWorks type " + task.type);
    };

    if (taskList.length < 1) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parsePage: result empty';
        return false;
    };

    return taskList;
};

/**
 * 解析作品任务对象
 * @param {PxerWorksRequest} task - 抓取后的页码任务对象
 * @return {PxerWorks} - 解析得到的作品任务对象
 * */
PxerHtmlParser.parseWorks = function (task) {
    if (!(task instanceof PxerWorksRequest)) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parseWorks: task is not PxerWorksRequest';
        return false;
    }
    if (!task.url.every(function (item) {
        return task.html[item];
    })) {
        window['PXER_ERROR'] = 'PxerHtmlParser.parseWorks: task illegal';
        return false;
    }

    for (var url in task.html) {
        var data = {
            dom: PxerHtmlParser.HTMLParser(task.html[url]),
            task: task
        };
        try {
            switch (true) {
                case url.indexOf('mode=medium') !== -1:
                    var pw = PxerHtmlParser.parseMediumHtml(data);
                    break;
                default:
                    throw new Error("PxerHtmlParser.parsePage: count not parse task url \"" + url + "\"");
            };
        } catch (e) {
            window['PXER_ERROR'] = task.id + ":" + e.message;
            if (window['PXER_MODE'] === 'dev') console.error(task, e);
            return false;
        }
    };
    return pw;
};

/**
 * @param {PxerWorksRequest} task
 * @return {Array}
 * */
PxerHtmlParser.getUrlList = function (task) {

    return ["https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + task.id];
};

PxerHtmlParser.parseMediumHtml = function (_ref8) {
    var task = _ref8.task,
        dom = _ref8.dom;

    var illustData = dom.head.innerHTML.match(this.REGEXP['getInitData'])[0];
    illustData = this.getKeyFromStringObjectLiteral(illustData, "preload");
    illustData = this.getKeyFromStringObjectLiteral(illustData, 'illust');
    illustData = this.getKeyFromStringObjectLiteral(illustData, task.id);
    illustData = JSON.parse(illustData);

    var pw;
    switch (true) {
        case illustData.illustType === 2:
            pw = new PxerUgoiraWorks();break;
        case illustData.pageCount > 1:
            pw = new PxerMultipleWorks();break;
        default:
            pw = new PxerWorks();break;
    }

    pw.id = task.id;
    pw.type = this.parseIllustType(illustData.illustType);
    pw.tagList = illustData.tags.tags.map(function (e) {
        return e.tag;
    });
    pw.viewCount = illustData.viewCount;
    pw.ratedCount = illustData.bookmarkCount;
    if (pw instanceof PxerMultipleWorks) {
        pw.multiple = illustData.pageCount;
    }

    if (pw.type === "ugoira") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.pixiv.net/ajax/illust/" + task.id + "/ugoira_meta", false);
        xhr.send();
        var meta = JSON.parse(xhr.responseText);
        var src = meta['body']['originalSrc'];
        var URLObj = parseURL(src);

        pw.domain = URLObj.domain;
        pw.date = src.match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.frames = {
            framedef: meta['body']['frames'],
            height: illustData.height,
            width: illustData.width
        };
    } else {
        var _src = illustData.urls.original;
        var _URLObj = parseURL(_src);

        pw.domain = _URLObj.domain;
        pw.date = _src.match(PxerHtmlParser.REGEXP['getDate'])[1];
        pw.fileFormat = _src.match(/\.(jpg|gif|png)$/)[1];
    };
    return pw;
};

PxerHtmlParser.parseIllustType = function (type) {
    switch (type.toString()) {
        case "0":
        case "illust":
            return "illust";
        case "1":
        case "manga":
            return "manga";
        case "2":
        case "ugoira":
            return "ugoira";
    }
    return null;
};

PxerHtmlParser.REGEXP = {
    'getDate': /img\/((?:\d+\/){5}\d+)/,
    'getInitData': /\{token:.*\}(?=\);)/
};

PxerHtmlParser.HTMLParser = function (aHTMLString) {
    var dom = document.implementation.createHTMLDocument('');
    dom.documentElement.innerHTML = aHTMLString;
    return dom;
};

/**@param {Element} img*/
PxerHtmlParser.getImageUrl = function (img) {
    return img.getAttribute('src') || img.getAttribute('data-src');
};

PxerHtmlParser.parseObjectLiteral = function () {
    // Javascript object literal parser
    // Splits an object literal string into a set of top-level key-value pairs
    // (c) Michael Best (https://github.com/mbest)
    // License: MIT (http://www.opensource.org/licenses/mit-license.php)
    // Version 2.1.0
    // https://github.com/mbest/js-object-literal-parse
    // This parser is inspired by json-sans-eval by Mike Samuel (http://code.google.com/p/json-sans-eval/)

    // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",

    // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
    // as a regular expression (this is handled by the parsing loop below).
    stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',

    // These characters have special meaning to the parser and must not appear in the middle of a
    // token, except as part of a string.
    specials = ',"\'{}()/:[\\]',

    // Match text (at least two characters) that does not contain any of the above special characters,
    // although some of the special characters are allowed to start it (all but the colon and comma).
    // The text can contain spaces, but leading or trailing spaces are skipped.
    everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',

    // Match any non-space character not matched already. This will match colons and commas, since they're
    // not matched by "everyThingElse", but will also match any other single character that wasn't already
    // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
    oneNotSpace = '[^\\s]',


    // Create the actual regular expression by or-ing the above strings. The order is important.
    token = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),


    // Match end of previous token to determine whether a slash is a division or regex.
    divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = { 'in': 1, 'return': 1, 'typeof': 1 };

    function trim(string) {
        return string == null ? '' : string.trim ? string.trim() : string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    }

    return function (objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = trim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

        // Split into tokens
        var result = [],
            toks = str.match(token),
            key,
            values = [],
            depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) {
                    // ","
                    if (depth <= 0) {
                        if (!key && values.length === 1) {
                            key = values.pop();
                        }
                        result.push([key, values.length ? values.join('') : undefined]);
                        key = undefined;
                        values = [];
                        depth = 0;
                        continue;
                    }
                    // Simply skip the colon that separates the name and value
                } else if (c === 58) {
                    // ":"
                    if (!depth && !key && values.length === 1) {
                        key = values.pop();
                        continue;
                    }
                    // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {
                    // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i - 1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(token);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                    // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) {
                    // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) {
                    // ')', '}', ']'
                    --depth;
                    // The key will be the first token; if it's a string, trim the quotes
                } else if (!key && !values.length && (c === 34 || c === 39)) {
                    // '"', "'"
                    tok = tok.slice(1, -1);
                }
                values.push(tok);
            }
        }
        return result;
    };
}();

PxerHtmlParser.getKeyFromStringObjectLiteral = function (s, key) {
    var resolvedpairs = this.parseObjectLiteral(s);
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = resolvedpairs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var pair = _step6.value;

            if (pair[0] === key) return pair[1];
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }

    return false;
};

var PxerPrinter = function () {
    function PxerPrinter(config) {
        _classCallCheck(this, PxerPrinter);

        /**
         * 计算得到的下载地址
         * @type {string[]} 
         * */
        this.address = [];
        /**计算得到的任务信息*/
        this.taskInfo = '';
        /**剥离的动图参数*/
        this.ugoiraFrames = {};

        /**配置信息*/
        this.config = PxerPrinter.defaultConfig();
        config && this.setConfig(config);
    }

    _createClass(PxerPrinter, [{
        key: "setConfig",


        /**
         * 设置配置信息
         * @param {string|Object} key - 要设置的key或是一个将被遍历合并的对象
         * @param {string} [value] - 要设置的value
         * */
        value: function setConfig(key, value) {
            if (arguments.length === 1 && (typeof key === "undefined" ? "undefined" : _typeof(key)) === 'object') {
                var obj = key;
                for (var objKey in obj) {
                    if (objKey in this.config) this.config[objKey] = obj[objKey];else console.warn("PxerPrinter.setConfig: skip key \"" + objKey + "\"");
                };
            } else {
                if (!(key in this.config)) throw new Error("PxerPrinter.setConfig: " + key + " is not in config");
                this.config[key] = value;
            }
            return this;
        }
    }]);

    return PxerPrinter;
}();

;

/**
 * 根据作品列表将下载地址填充到PxerPrinter#address
 * @param {PxerWorks[]} worksList
 * @return {void}
 * */
PxerPrinter.prototype['fillAddress'] = function (worksList) {
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
        for (var _iterator7 = worksList[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var _address;

            var works = _step7.value;

            var configKey = PxerPrinter.getWorksKey(works);
            if (configKey === 'ugoira_zip' && this.config['ugoira_frames'] === 'yes') {
                this.ugoiraFrames[works.id] = works.frames;
            }
            if (!(configKey in this.config)) throw new Error("PxerPrinter.fillAddress: " + configKey + " in not in config");
            if (this.config[configKey] === 'no') continue;
            (_address = this.address).push.apply(_address, _toConsumableArray(PxerPrinter.countAddress(works, this.config[configKey])));
        }
    } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
            }
        } finally {
            if (_didIteratorError7) {
                throw _iteratorError7;
            }
        }
    }
};

/**
 * 根据作品将可读的下载信息填充到PxerPrinter#taskInfo
 * @param {PxerWorks[]} worksList
 * @return {void}
 * */
PxerPrinter.prototype['fillTaskInfo'] = function (worksList) {
    var _fill = new Array(20).fill(0),
        _fill2 = _slicedToArray(_fill, 7),
        manga = _fill2[0],
        ugoira = _fill2[1],
        illust = _fill2[2],
        multiple = _fill2[3],
        single = _fill2[4],
        worksNum = _fill2[5],
        address = _fill2[6];

    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
        for (var _iterator8 = worksList[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var works = _step8.value;

            var configKey = PxerPrinter.getWorksKey(works);
            if (this.config[configKey] === 'no') continue;

            worksNum++;

            switch (works.type) {
                case 'manga':
                    manga++;
                    break;
                case 'ugoira':
                    ugoira++;
                    break;
                case 'illust':
                    illust++;
                    break;
                default:
                    console.error(works);
                    throw new Error("PxerPrinter.fillTaskInfo: works.type illegal");
                    break;
            };

            if (works instanceof PxerMultipleWorks) {
                multiple++;
                address += works.multiple;
            } else if (works instanceof PxerWorks) {
                //动图
                address++;
                single++;
            } else {
                console.error(works);
                throw new Error("PxerPrinter.fillTaskInfo: works instanceof illegal");
            };
        }
    } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
            }
        } finally {
            if (_didIteratorError8) {
                throw _iteratorError8;
            }
        }
    }

    this.taskInfo = ("\n\u5171\u8BA1" + worksNum + "\u4E2A\u4F5C\u54C1\uFF0C" + address + "\u4E2A\u4E0B\u8F7D\u5730\u5740\u3002<br />\n\u5355\u5F20\u56FE\u7247\u4F5C\u54C1\u5360 " + (single / worksNum * 100).toFixed(1) + "%<br />\n\u591A\u5F20\u56FE\u7247\u4F5C\u54C1\u5360 " + (multiple / worksNum * 100).toFixed(1) + "%<br />\n").trim();
};
/**
 * 将结果输出
 * 确保下载地址和任务信息已被填充
 * */
PxerPrinter.prototype['print'] = function () {

    /**判断输出动图参数*/
    if (this.config['ugoira_frames'] === "yes" && Object.keys(this.ugoiraFrames).length !== 0) {
        var win = window.open(document.URL, '_blank');
        if (!win) {
            alert('Pxer:\n浏览器拦截了弹出窗口，请检查浏览器提示，设置允许此站点的弹出式窗口。');
            return;
        };

        var scriptname = "";
        switch (navigator.platform) {
            case "Win32":
                scriptname = "bat批处理";break;
            default:
                scriptname = "bash";break;
        }
        var str = ['<p>/** 这个页面是自动生成的使用FFmpeg自行合成动图的' + scriptname + '脚本，详细使用教程见<a href="http://pxer.pea3nut.org/md/ugoira_concat" target="_blank" >http://pxer.pea3nut.org/md/ugoira_concat</a> */</p>', '<textarea style="height:100%; width:100%" readonly>'].concat(_toConsumableArray(this.generateUgoiraScript(this.ugoiraFrames)), ['</textarea>']);
        win.document.write(str.join('\n'));
    };

    {
        /**输出下载地址*/
        var _win = window.open(document.URL, '_blank');
        if (!_win) {
            alert('Pxer:\n浏览器拦截了弹出窗口，请检查浏览器提示，设置允许此站点的弹出式窗口。');
            return;
        };
        var _str = ['<p>', '/** 这个页面是抓取到的下载地址，你可以将它们复制到第三方下载工具如QQ旋风中下载 */<br />', this.taskInfo, '</p>', '<textarea style="height:100%; width:100%" readonly>', this.address.join('\n'), '</textarea>'];
        _win.document.write(_str.join('\n'));
    }
};

/**
 * 根据作品类型，生成配置信息的key
 * @param {PxerWorks} works
 * @return {string}
 * @see PxerPrinter.defaultConfig
 * */
PxerPrinter.getWorksKey = function (works) {
    var configKey = null;
    if (works instanceof PxerUgoiraWorks) {
        configKey = 'ugoira_zip';
    } else {
        configKey = works.type + (works instanceof PxerMultipleWorks ? '_multiple' : '_single');
    };
    return configKey;
};

/**
 * 根据动图参数，生成ffmpeg脚本
 * @param 动图参数
 * @return {String[]} 生成的脚本行
 * @see PxerPrinter.prototype['print']
 */
PxerPrinter.prototype['generateUgoiraScript'] = function (frames) {
    var lines = [];
    var resstring;
    var ffmpeg;
    var isWindows = ['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(navigator.platform) !== -1;
    switch (this.config.ugoira_zip) {
        case "max":
            resstring = "1920x1080";break;
        case "600p":
            resstring = "600x338";break;
    }
    var slashstr = "";
    if (isWindows) {
        slashstr = "^";
        ffmpeg = "ffmpeg";
        lines.push("@echo off");
        lines.push("set /p ext=请输入输出文件扩展名(mp4/gif/...):");
    } else {
        slashstr = "\\";
        ffmpeg = "$ffmpeg";
        lines.push("#!/bin/bash");
        lines.push("");
        lines.push("{ hash ffmpeg 2>/dev/null && ffmpeg=ffmpeg;} || { [ -x ./ffmpeg ] && ffmpeg=./ffmpeg;} || { echo >&2 \"Failed to locate ffmpeg executable. Aborting.\"; exit 1;}");
        lines.push("read -p '请输入输出文件扩展名(mp4/gif/...):' ext");
    }
    for (var key in frames) {
        var foldername = key + "_ugoira" + resstring;
        var confpath = foldername + "/config.txt";
        var height = frames[key].height;
        var width = frames[key].width;
        if (this.config.ugoira_zip === "600p") {
            var scale = Math.max(height, width) / 600;
            height = parseInt(height / scale);
            width = parseInt(width / scale);
        }
        lines.push(isWindows ? "del " + foldername + "\\config.txt >nul 2>nul" : "rm " + foldername + "/config.txt &> /dev/null");
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
            for (var _iterator9 = frames[key].framedef[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var frame = _step9.value;

                lines.push("echo file " + slashstr + "'" + frame['file'] + slashstr + "' >> " + confpath);
                lines.push("echo duration " + frame['delay'] / 1000 + " >> " + confpath);
            }
        } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                    _iterator9.return();
                }
            } finally {
                if (_didIteratorError9) {
                    throw _iteratorError9;
                }
            }
        }

        lines.push("echo file " + slashstr + "'" + frames[key].framedef[frames[key].framedef.length - 1]['file'] + slashstr + "' >> " + confpath);
        lines.push(isWindows ? "if %ext%==gif (" : "if [ $ext == \"gif\"]; then");
        lines.push(ffmpeg + " -f concat -i " + confpath + " -vf palettegen " + foldername + "/palette.png");
        lines.push(ffmpeg + " -f concat -i " + confpath + " -i " + foldername + "/palette.png -lavfi paletteuse -framerate 30 -vsync -1 -s " + width + "x" + height + " " + foldername + "/remux." + (isWindows ? "%ext%" : "$ext"));
        lines.push(isWindows ? ") else (" : "else");
        lines.push(ffmpeg + " -f concat -i " + confpath + " -framerate 30 -vsync -1 -s " + width + "x" + height + " " + foldername + "/remux." + (isWindows ? "%ext%" : "$ext"));
        lines.push(isWindows ? ")" : "fi");
    }
    if (isWindows) {
        lines.push("echo 完成 & pause");
    } else {
        lines.push("read  -n 1 -p \"完成，按任意键退出\" m && echo");
    }
    return lines;
};

/**返回默认的配置对象*/
PxerPrinter.defaultConfig = function () {
    return {
        "manga_single": "max", //[max|600p|no]
        "manga_multiple": "max", //[max|1200p|cover_600p|no]
        "illust_single": "max", //[max|600p|no]
        "illust_multiple": "max", //[max|1200p|cover_600p|no]
        "ugoira_zip": "no", //[max|600p|no]
        "ugoira_frames": "no" //[yes|no]
    };
};
/**作品页跳过过滤 */
PxerPrinter.printAllConfig = function () {
    return {
        "manga_single": "max", //[max|600p|no]
        "manga_multiple": "max", //[max|1200p|cover_600p|no]
        "illust_single": "max", //[max|600p|no]
        "illust_multiple": "max", //[max|1200p|cover_600p|no]
        "ugoira_zip": "max", //[max|600p|no]
        "ugoira_frames": "yes" //[yes|no]
    };
};

/**
 * 拼装动图原始地址
 * @param {PxerUgoiraWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getUgoira = function (works) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'max';

    var tpl = {
        "max": "https://#domain#/img-zip-ugoira/img/#date#/#id#_ugoira1920x1080.zip",
        "600p": "https://#domain#/img-zip-ugoira/img/#date#/#id#_ugoira600x600.zip"
    };

    var address = tpl[type];
    if (!address) throw new Error("PxerPrint.getUgoira: unknown type \"" + type + "\"");

    for (var key in works) {
        address = address.replace("#" + key + "#", works[key]);
    };

    return [address];
};
/**
 * 拼装多副原始地址
 * @param {PxerMultipleWorks} works - 作品
 * @param {string} [type] - 拼装类型 [max|1200p|cover_600p]
 * @return {Array}
 * */
PxerPrinter.getMultiple = function (works) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'max';

    var tpl = {
        "max": "https://#domain#/img-original/img/#date#/#id#_p#index#.#fileFormat#",
        "1200p": "https://#domain#/c/1200x1200/img-master/img/#date#/#id#_p#index#_master1200.jpg",
        "cover_600p": "https://#domain#/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg"
    };

    var address = tpl[type];
    if (!address) throw new Error("PxerPrint.getMultiple: unknown type \"" + type + "\"");

    for (var key in works) {
        address = address.replace("#" + key + "#", works[key]);
    };

    //渲染多张
    var addressList = [];
    for (var i = 0; i < works.multiple; i++) {
        addressList.push(address.replace('#index#', i));
    };

    return addressList;
};
/**
 * 拼装单副原始地址
 * @param {PxerWorks} works - 作品
 * @param {string=max} [type] - 拼装类型 [max|600p]
 * @return {Array}
 * */
PxerPrinter.getWorks = function (works) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'max';

    var tpl = {
        "max": "https://#domain#/img-original/img/#date#/#id#_p0.#fileFormat#",
        "600p": "https://#domain#/c/600x600/img-master/img/#date#/#id#_p0_master1200.jpg"
    };

    var address = tpl[type];
    if (!address) throw new Error("PxerPrint.getWorks: unknown type \"" + type + "\"");

    for (var key in works) {
        address = address.replace("#" + key + "#", works[key]);
    }

    return [address];
};
/**
 * 智能拼装原始地址，对上述的简单封装
 * @param {PxerWorks} [works]
 * @param {...arguments} [argn]
 * @return {Array}
 * */
PxerPrinter.countAddress = function (works, argn) {
    switch (true) {
        case works instanceof PxerUgoiraWorks:
            return PxerPrinter.getUgoira.apply(PxerPrinter, arguments);
        case works instanceof PxerMultipleWorks:
            return PxerPrinter.getMultiple.apply(PxerPrinter, arguments);
        case works instanceof PxerWorks:
            return PxerPrinter.getWorks.apply(PxerPrinter, arguments);
        default:
            throw new Error('PxerPrinter.countAddress: unknown works');
    };
};

var PxerThread = function (_PxerEvent) {
    _inherits(PxerThread, _PxerEvent);

    /**
     * @param id {string} 线程的ID，便于调试
     * @param {Object} config 线程的配置信息
     * */
    function PxerThread() {
        var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            id = _ref9.id,
            config = _ref9.config;

        _classCallCheck(this, PxerThread);

        /**当前线程的ID*/
        var _this5 = _possibleConstructorReturn(this, (PxerThread.__proto__ || Object.getPrototypeOf(PxerThread)).call(this, ['load', 'error', 'fail']));

        _this5.id = id;
        /**
         * 当前线程的状态
         * - free
         * - ready
         * - error
         * - fail
         * - running
         * */
        _this5.state = 'free';
        /**线程执行的任务*/
        _this5.task = null;

        /**
         *
         * */
        _this5.config = config || {
            /**ajax超时重试时间*/
            timeout: 8000,
            /**最多重试次数*/
            retry: 5
        };

        /**运行时参数*/
        _this5.runtime = {};

        /**使用的xhr对象*/
        _this5.xhr = null;

        return _this5;
    }

    return PxerThread;
}(PxerEvent);

;

/**
 * 对抓取到的URL和HTML进行校验
 * @param {string} url
 * @param {string} html
 * @return {string|true} 返回字符串表示失败
 * */
PxerThread.checkRequest = function (url, html) {
    if (!html) return 'empty';
    if (html.indexOf("_no-item _error") !== -1) {
        if (html.indexOf("sprites-r-18g-badge") !== -1) return 'r-18g';
        if (html.indexOf("sprites-r-18-badge") !== -1) return 'r-18';
    };
    if (html.indexOf("sprites-mypixiv-badge") !== -1) return 'mypixiv';
    return true;
};

/**终止线程的执行*/
PxerThread.prototype['stop'] = function () {
    this.xhr.abort();
};

/**
 * 初始化线程
 * @param {PxerRequest} task
 * */
PxerThread.prototype['init'] = function (task) {
    this.task = task;

    this.runtime = {};
    this.state = 'ready';

    // 必要的检查
    if (Number.isNaN(+this.config.timeout) || Number.isNaN(+this.config.retry)) {
        throw new Error("PxerThread#init: " + this.id + " config illegal");
    }

    //判断行为，读取要请求的URL
    if (this.task instanceof PxerWorksRequest) {
        this.runtime.urlList = this.task.url.slice();
    } else if (this.task instanceof PxerPageRequest) {
        this.runtime.urlList = [this.task.url];
    } else {
        this.dispatch('error', "PxerThread#" + this.id + ".init: unknown task");
        return false;
    };
};

/**
 * 使用PxerThread#xhr发送请求
 * @param {string} url
 * */
PxerThread.prototype['sendRequest'] = function (url) {
    this.state = 'running';
    this.xhr.open('GET', url, true);
    // 单副漫画请求需要更改Referer头信息
    if (this.task instanceof PxerWorksRequest && this.task.type === 'manga' && this.task.isMultiple === false && /mode=big/.test(url)) {
        var referer = this.task.url.find(function (item) {
            return item.indexOf('mode=medium') !== -1;
        });
        var origin = document.URL;
        if (!referer) {
            this.dispatch('error', 'PxerThread.sendRequest: cannot find referer');
        };
        history.replaceState({}, null, referer);
        this.xhr.send();
        history.replaceState({}, null, origin);
    } else {
        this.xhr.send();
    };
};
/**运行线程*/
PxerThread.prototype['run'] = function _self() {
    var _this6 = this;

    var URL = this.runtime.urlList.shift();
    if (!URL) {
        this.state = 'free';
        this.task.completed = true;
        this.dispatch("load", this.task);
        return true;
    }

    var XHR = new XMLHttpRequest();

    this.xhr = XHR;
    XHR.timeout = this.config.timeout;
    XHR.responseType = 'text';

    var retry = 0;
    XHR.addEventListener('timeout', function () {
        if (++retry > _this6.config.retry) {
            _this6.state = 'fail';
            _this6.dispatch('fail', new PxerFailInfo({
                task: _this6.task,
                url: URL,
                type: 'timeout',
                xhr: XHR
            }));
            return false;
        } else {
            _this6.sendRequest(URL);
        }
    });
    XHR.addEventListener("load", function () {
        if (XHR.status.toString()[0] !== '2' && XHR.status !== 304) {
            _this6.state = 'fail';
            _this6.dispatch('fail', new PxerFailInfo({
                task: _this6.task,
                url: URL,
                type: 'http:' + XHR.status
            }));
            return false;
        };
        // 判断是否真的请求成功
        var msg = PxerThread.checkRequest(URL, XHR.responseText);
        if (msg !== true) {
            _this6.state = 'fail';
            _this6.dispatch('fail', {
                task: _this6.task,
                url: URL,
                type: msg
            });
            return false;
        };

        // 执行成功回调
        if (_this6.task instanceof PxerWorksRequest) {
            _this6.task.html[URL] = XHR.responseText;
        } else {
            _this6.task.html = XHR.responseText;
        };
        _self.call(_this6); //递归
        return true;
    });
    XHR.addEventListener("error", function () {
        _this6.state = 'error';
        _this6.dispatch('error', {
            task: _this6.task,
            url: URL
        });
    });

    this.sendRequest(URL);
};

var PxerThreadManager = function (_PxerEvent2) {
    _inherits(PxerThreadManager, _PxerEvent2);

    /**
     * @param {number} timeout - 超时时间
     * @param {number} retry   - 重试次数
     * @param {number} thread  - 线程数
     * */
    function PxerThreadManager() {
        var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref10$timeout = _ref10.timeout,
            timeout = _ref10$timeout === undefined ? 5000 : _ref10$timeout,
            _ref10$retry = _ref10.retry,
            retry = _ref10$retry === undefined ? 3 : _ref10$retry,
            _ref10$thread = _ref10.thread,
            thread = _ref10$thread === undefined ? 8 : _ref10$thread;

        _classCallCheck(this, PxerThreadManager);

        var _this7 = _possibleConstructorReturn(this, (PxerThreadManager.__proto__ || Object.getPrototypeOf(PxerThreadManager)).call(this, ['load', 'error', 'fail', 'warn']));

        _this7.config = { timeout: timeout, retry: retry, thread: thread };

        /**
         * 任务列表
         * @type {PxerRequest[]}
         * */
        _this7.taskList = [];
        /**执行的任务列表的指针，指派了下一条要执行的任务*/
        _this7.pointer = 0;
        /**
         * 存放的线程对象
         * @type {PxerThread[]}
         * */
        _this7.threads = [];
        /**
         * 每当执行任务开始前调用的中间件
         * @type {Function[]} 返回true继续执行，false终止执行
         * */
        _this7.middleware = [function (task) {
            return !!task;
        }];

        /**运行时用到的变量*/
        _this7.runtime = {};

        return _this7;
    }

    return PxerThreadManager;
}(PxerEvent);

;

/**
 * 停止线程的执行，实际上假装任务都执行完了
 * 停止后还会触发load事件，需要一段时间
 * */
PxerThreadManager.prototype['stop'] = function () {
    this.pointer = this.taskList.length + 1;
};

/**
 * 初始化线程管理器
 * @param {PxerRequest[]} taskList
 * */
PxerThreadManager.prototype['init'] = function (taskList) {
    if (!this.taskList.every(function (request) {
        return request instanceof PxerRequest;
    })) {
        this.dispatch('error', 'PxerThreadManager.init: taskList is illegal');
        return false;
    }

    // 初始任务与结果
    this.taskList = taskList;
    this.runtime = {};
    this.pointer = 0;

    // 建立线程对象
    this.threads = [];
    for (var i = 0; i < this.config.thread; i++) {
        this.threads.push(new PxerThread({
            id: i,
            config: {
                timeout: this.config.timeout,
                retry: this.config.retry
            }
        }));
    };

    return this;
};
/**
 * 运行线程管理器
 * */
PxerThreadManager.prototype['run'] = function () {
    var _this8 = this;

    if (this.taskList.length === 0) {
        this.dispatch('warn', 'PxerApp#run: taskList.length is 0');
        this.dispatch('load', []);
        return false;
    };

    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
        var _loop = function _loop() {
            var thread = _step10.value;


            thread.on('load', function (data) {
                next(_this8, thread);
            });
            thread.on('fail', function (pfi) {
                _this8.dispatch('fail', pfi);
                next(_this8, thread);
            });
            thread.on('error', _this8.dispatch.bind(_this8, 'error'));

            next(_this8, thread);
        };

        for (var _iterator10 = this.threads[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            _loop();
        }
    } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
            }
        } finally {
            if (_didIteratorError10) {
                throw _iteratorError10;
            }
        }
    }

    ;

    function next(ptm, thread) {
        if (ptm.middleware.every(function (fn) {
            return fn(ptm.taskList[ptm.pointer]);
        })) {
            thread.init(ptm.taskList[ptm.pointer++]);
            thread.run();
        } else if (ptm.threads.every(function (thread) {
            return ['free', 'fail', 'error'].indexOf(thread.state) !== -1;
        })) {
            ptm.dispatch('load', ptm.taskList);
        };
    }
};

'use strict';

/**
 * Pxer主程序对象，与所有模块都是强耦合关系
 * 若你想阅读源码，建议不要从这个类开始
 * @class
 * */

var PxerApp = function (_PxerEvent3) {
    _inherits(PxerApp, _PxerEvent3);

    function PxerApp() {
        _classCallCheck(this, PxerApp);

        /**
         * 当前页面类型。可能的值
         * @type {string}
         * */
        var _this9 = _possibleConstructorReturn(this, (PxerApp.__proto__ || Object.getPrototypeOf(PxerApp)).call(this, ['executeWroksTask', 'executePageTask', 'finishWorksTask', 'finishPageTask', 'error', 'stop']));
        /**
         * 可能被触发的事件
         * - stop 被终止时
         * - error 出错时
         * - executeWroksTask 执行作品抓取时
         * - finishWorksTask  完成作品抓取时
         * - executePageTask  执行页码抓取时
         * - finishPageTask   完成页码抓取时
         * - finishTask 完成所有任务
         * */


        _this9.pageType = getPageType();
        /**
         * 页面的作品数量
         * @type {number|null}
         * @see PxerApp.init
         * */
        _this9.worksNum = null;

        /**
         * 任务队列
         * @type {PxerRequest[]}
         * */
        _this9.taskList = [];
        /**
         * 失败的任务信息
         * @type {PxerFailInfo[]}
         * */
        _this9.failList = [];
        /**
         * 抓取到的结果集
         * @type {PxerWorks[]}
         * */
        _this9.resultSet = [];
        /**
         * 过滤得到的结果集
         * @type {PxerWorks[]}
         * */
        _this9.filterResult = [];

        /**
         * 任务配置选项，用来指派任务执行过程中的一些逻辑
         * 必须在PxerApp#initPageTask调用前配置
         * */
        _this9.taskOption = {
            /**仅抓取前几副作品*/
            limit: null,
            /**遇到id为x的作品停止后续，不包括本id*/
            stopId: null
        };

        // 其他对象的配置参数
        _this9.ptmConfig = { //PxerThreadManager
            timeout: 5000,
            retry: 3,
            thread: 8
        };
        _this9.ppConfig = _this9.pageType.startsWith("works_") ? PxerPrinter.printAllConfig() : PxerPrinter.defaultConfig(); //PxerPrinter
        _this9.pfConfig = PxerFilter.defaultConfig(); //PxerFilter

        // 使用的PxerThreadManager实例
        _this9.ptm = null;

        if (window['PXER_MODE'] === 'dev') window['PXER_APP'] = _this9;

        return _this9;
    }

    _createClass(PxerApp, [{
        key: "init",


        /**
         * 初始化时的耗时任务
         */
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return PxerApp.getWorksNum(document);

                            case 2:
                                this.worksNum = _context.sent;

                            case 3:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function init() {
                return _ref11.apply(this, arguments);
            }

            return init;
        }()

        /**
         * 停止执行当前任务
         * 调用后仍会触发对应的finish*事件
         * */

    }, {
        key: "stop",
        value: function stop() {
            this.dispatch('stop');
            this.ptm.stop();
        }
    }, {
        key: "initPageTask",


        /**初始化批量任务*/
        value: function initPageTask() {
            if (typeof this.pageType !== 'string' || typeof this.worksNum !== 'number') {
                this.dispatch('error', 'PxerApp.initPageTask: pageType or number illegal');
                return false;
            };

            var onePageWorksNumber = getOnePageWorkCount(this.pageType);

            var pageNum = Math.ceil(this.taskOption.limit ? this.taskOption.limit : this.worksNum) / onePageWorksNumber;

            if (this.pageType === "discovery") {
                var mode;
                switch (true) {
                    case document.URL.match(/mode=(r18|safe|all)/) === null:
                        mode = "all";break;
                    default:
                        mode = document.URL.match(/mode=(r18|safe|all)/)[1];break;
                }
                var recomCount = this.taskOption.limit ? this.taskOption.limit : this.worksNum;
                this.taskList.push(new PxerPageRequest({
                    url: "https://www.pixiv.net/rpc/recommender.php?type=illust&sample_illusts=auto&num_recommendations=" + recomCount + "&page=discovery&mode=" + mode + "&tt=" + pixiv.context.token,
                    type: this.pageType
                }));
            } else if (this.pageType === "member_works_new") {
                var uid = getIDfromURL();
                var type = document.URL.match(/type=(\w+)/) ? document.URL.match(/type=(\w+)/)[1] : "all";
                this.taskList.push(new PxerPageRequest({
                    url: "https://www.pixiv.net/ajax/user/" + uid + "/profile/all",
                    type: type ? "userprofile_" + type : "userprofile_all"
                }));
            } else if (this.pageType === "bookmark_works") {
                for (var offset = 0; offset < 48 * pageNum; offset += 48) {
                    var id = getIDfromURL() || getIDfromURL("id", document.querySelector("a.user-name").getAttribute("href")); // old bookmark page
                    this.taskList.push(new PxerPageRequest({
                        type: this.pageType,
                        url: "https://www.pixiv.net/ajax/user/" + id + "/illusts/bookmarks?tag=&offset=" + offset + "&limit=48&rest=show"
                    }));
                }
            } else {
                var separator = document.URL.includes("?") ? "&" : "?";
                var extraparam = this.pageType === 'rank' ? "&format=json" : "";
                for (var i = 0; i < pageNum; i++) {
                    this.taskList.push(new PxerPageRequest({
                        type: this.pageType,
                        url: document.URL + separator + "p=" + (i + 1) + extraparam
                    }));
                };
            };
        }
    }, {
        key: "executePageTask",

        /**抓取页码*/
        value: function executePageTask() {
            var _this10 = this;

            if (this.taskList.length === 0) {
                this.dispatch('error', 'PxerApp.executePageTask: taskList is empty');
                return false;
            };
            if (!this.taskList.every(function (request) {
                return request instanceof PxerPageRequest;
            })) {
                this.dispatch('error', 'PxerApp.executePageTask: taskList is illegal');
                return false;
            };

            this.dispatch('executePageTask');

            var ptm = this.ptm = new PxerThreadManager(this.ptmConfig);
            ptm.on('error', function () {
                for (var _len3 = arguments.length, argn = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    argn[_key3] = arguments[_key3];
                }

                return _this10.dispatch('error', argn);
            });
            ptm.on('warn', function () {
                for (var _len4 = arguments.length, argn = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    argn[_key4] = arguments[_key4];
                }

                return _this10.dispatch('error', argn);
            });
            ptm.on('load', function () {
                var parseResult = [];
                var _iteratorNormalCompletion11 = true;
                var _didIteratorError11 = false;
                var _iteratorError11 = undefined;

                try {
                    for (var _iterator11 = _this10.taskList[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                        var result = _step11.value;

                        result = PxerHtmlParser.parsePage(result);
                        if (!result) {
                            _this10.dispatch('error', window['PXER_ERROR']);
                            continue;
                        }
                        parseResult.push.apply(parseResult, _toConsumableArray(result));
                    }
                } catch (err) {
                    _didIteratorError11 = true;
                    _iteratorError11 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                        }
                    } finally {
                        if (_didIteratorError11) {
                            throw _iteratorError11;
                        }
                    }
                }

                ;
                _this10.resultSet = parseResult;
                _this10.dispatch('finishPageTask', parseResult);
            });
            ptm.on('fail', function (pfi) {
                ptm.pointer--; //失败就不停的尝试
            });
            ptm.init(this.taskList);
            ptm.run();
        }
    }, {
        key: "executeWroksTask",

        /**
         * 抓取作品
         * @param {PxerWorksRequest[]} tasks - 要执行的作品请求数组
         * */
        value: function executeWroksTask() {
            var _this11 = this;

            var tasks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.taskList;

            if (tasks.length === 0) {
                this.dispatch('error', 'PxerApp.executeWroksTask: taskList is empty');
                return false;
            };
            if (!tasks.every(function (request) {
                return request instanceof PxerWorksRequest;
            })) {
                this.dispatch('error', 'PxerApp.executeWroksTask: taskList is illegal');
                return false;
            };

            // 任务按ID降序排列(#133)
            tasks.sort(function (a, b) {
                return Number(b.id) - Number(a.id);
            });

            this.dispatch('executeWroksTask');

            var ptm = this.ptm = new PxerThreadManager(this.ptmConfig);
            ptm.on('error', function () {
                for (var _len5 = arguments.length, argn = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                    argn[_key5] = arguments[_key5];
                }

                return _this11.dispatch('error', argn);
            });
            ptm.on('warn', function () {
                for (var _len6 = arguments.length, argn = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    argn[_key6] = arguments[_key6];
                }

                return _this11.dispatch('error', argn);
            });
            // 根据taskOption添加ptm中间件
            if (this.taskOption.limit) {
                ptm.middleware.push(function (task) {
                    return ptm.pointer < _this11.taskOption.limit;
                });
            }
            if (this.taskOption.stopId) {
                ptm.middleware.push(function (task) {
                    if (task.id == _this11.taskOption.stopId) {
                        ptm.stop();
                        return false;
                    }
                    return true;
                });
            }

            ptm.on('load', function () {
                _this11.resultSet = [];
                var tl = _this11.taskList.slice( //限制结果集条数
                0, _this11.taskOption.limit ? _this11.taskOption.limit : undefined);
                var _iteratorNormalCompletion12 = true;
                var _didIteratorError12 = false;
                var _iteratorError12 = undefined;

                try {
                    for (var _iterator12 = tl[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        var pwr = _step12.value;

                        if (!pwr.completed) continue; //跳过未完成的任务
                        var pw = PxerHtmlParser.parseWorks(pwr);
                        if (!pw) {
                            pwr.completed = false;
                            ptm.dispatch('fail', new PxerFailInfo({
                                type: 'parse',
                                task: pwr,
                                url: pwr.url[0]
                            }));
                            _this11.dispatch('error', window['PXER_ERROR']);
                            continue;
                        }
                        _this11.resultSet.push(pw);
                    }
                } catch (err) {
                    _didIteratorError12 = true;
                    _iteratorError12 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }
                    } finally {
                        if (_didIteratorError12) {
                            throw _iteratorError12;
                        }
                    }
                }

                _this11.dispatch('finishWorksTask', _this11.resultSet);
            });
            ptm.on('fail', function (pfi) {
                _this11.failList.push(pfi);
            });
            ptm.init(tasks);
            ptm.run();

            return true;
        }
    }, {
        key: "executeFailWroks",

        /**对失败的作品进行再抓取*/
        value: function executeFailWroks() {
            var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.failList;

            // 把重试的任务从失败列表中减去
            this.failList = this.failList.filter(function (pfi) {
                return list.indexOf(pfi) === -1;
            });
            // 执行抓取
            this.executeWroksTask(list.map(function (pfi) {
                return pfi.task;
            }));
        }
    }, {
        key: "switchPage2Works",

        /**抓取页码完成后，初始化，准备抓取作品*/
        value: function switchPage2Works() {
            var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.resultSet.length;

            this.taskList = this.resultSet.slice(0, len);
            this.resultSet = [];
        }
    }, {
        key: "getWorksInfo",

        /**
         * 获取当前抓取到的可读的任务信息
         * @return {string}
         * */
        value: function getWorksInfo() {
            var pp = new PxerPrinter(this.ppConfig);
            var pf = new PxerFilter(this.pfConfig);
            pp.fillTaskInfo(pf.filter(this.resultSet));
            return pp.taskInfo;
        }
    }, {
        key: "printWorks",

        /**
         * 输出抓取到的作品
         * */
        value: function printWorks() {
            var pp = new PxerPrinter(this.ppConfig);
            var pf = new PxerFilter(this.pfConfig);
            var works = pf.filter(this.resultSet);
            pp.fillTaskInfo(works);
            pp.fillAddress(works);
            pp.print();
        }
    }]);

    return PxerApp;
}(PxerEvent);

;

/**直接抓取本页面的作品*/
PxerApp.prototype['getThis'] = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var _this12 = this;

    var initdata, id, type, pageCount, pwr;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    // 生成任务对象
                    initdata = document.head.innerHTML.match(PxerHtmlParser.REGEXP['getInitData'])[0];
                    id = getIDfromURL("illust_id");


                    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, "preload");
                    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, 'illust');
                    initdata = PxerHtmlParser.getKeyFromStringObjectLiteral(initdata, id);

                    if (!initdata) {
                        _context2.next = 9;
                        break;
                    }

                    initdata = JSON.parse(initdata);
                    _context2.next = 14;
                    break;

                case 9:
                    _context2.next = 11;
                    return fetch("https://www.pixiv.net/ajax/illust/" + id, { credentials: 'include' });

                case 11:
                    _context2.next = 13;
                    return _context2.sent.json();

                case 13:
                    initdata = _context2.sent['body'];

                case 14:
                    ;

                    type = initdata.illustType;
                    pageCount = initdata.pageCount;
                    pwr = new PxerWorksRequest({
                        isMultiple: pageCount > 1,
                        id: id
                    }); //[manga|ugoira|illust]

                    _context2.t0 = type;
                    _context2.next = _context2.t0 === 2 ? 21 : _context2.t0 === 1 ? 23 : _context2.t0 === 0 ? 25 : 27;
                    break;

                case 21:
                    pwr.type = 'ugoira';return _context2.abrupt("break", 28);

                case 23:
                    pwr.type = 'illust';return _context2.abrupt("break", 28);

                case 25:
                    pwr.type = 'manga';return _context2.abrupt("break", 28);

                case 27:
                    throw new Error("Unknown work type. id:" + id);

                case 28:
                    pwr.url = PxerHtmlParser.getUrlList(pwr);
                    // 添加执行
                    this.taskList = [pwr];
                    this.one('finishWorksTask', function () {
                        return _this12.printWorks();
                    });
                    this.executeWroksTask();
                    return _context2.abrupt("return", true);

                case 33:
                case "end":
                    return _context2.stop();
            }
        }
    }, _callee2, this);
}));

/**
 * 获取当前页面的总作品数
 * @param {Document=document} dom - 页面的document对象
 * @return {number} - 作品数
 * */
PxerApp.getWorksNum = function () {
    var _this13 = this;

    var dom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

    return new Promise(function (resolve, reject) {
        if (getPageType() === "rank") {
            var queryurl = dom.URL + "&format=json";
            var xhr = new XMLHttpRequest();
            xhr.open("GET", queryurl);
            xhr.onload = function (e) {
                return resolve(JSON.parse(xhr.responseText)['rank_total']);
            };
            xhr.send();
        } else if (getPageType() === "bookmark_new") {
            // 关注的新作品页数最多100页
            // 因为一般用户关注的用户数作品都足够填满100页，所以从100开始尝试页数
            // 如果没有100页进行一次二分查找
            var currpage = parseInt(dom.querySelector("ul.page-list>li.current").innerHTML);
            _this13.getFollowingBookmarkWorksNum(currpage, 100, 100).then(function (res) {
                return resolve(res);
            });
        } else if (getPageType() === "discovery") {
            resolve(3000);
        } else if (getPageType() === "bookmark_works") {
            var id = getIDfromURL("id", dom.URL) || getIDfromURL("id", dom.querySelector("a.user-name").getAttribute("href")); // old bookmark page
            var _queryurl = "https://www.pixiv.net/ajax/user/" + id + "/illusts/bookmarks?tag=&offset=0&limit=48&rest=show";
            var _xhr = new XMLHttpRequest();
            _xhr.open("GET", _queryurl);
            _xhr.onload = function (e) {
                resolve(JSON.parse(_xhr.responseText).body.total);
            };
            _xhr.send();
        } else if (getPageType() === "member_works_new") {
            var _queryurl2 = "https://www.pixiv.net/ajax/user/" + getIDfromURL() + "/profile/all";
            var _xhr2 = new XMLHttpRequest();
            _xhr2.open("GET", _queryurl2);
            _xhr2.onload = function (e) {
                var resp = JSON.parse(_xhr2.responseText).body;
                var type = dom.URL.match(/type=(manga|illust)/);
                var getKeyCount = function getKeyCount(obj) {
                    return Object.keys(obj).length;
                };
                if (!type) {
                    resolve(getKeyCount(resp.illusts) + getKeyCount(resp.manga));
                } else if (type[1] === "illust") {
                    resolve(getKeyCount(resp.illusts));
                } else {
                    resolve(getKeyCount(resp.manga));
                }
            };
            _xhr2.send();
        } else {
            var elt = dom.querySelector(".count-badge");
            if (!elt) resolve(null);
            resolve(parseInt(elt.innerHTML));
        }
    });
};

/**
 * 获取关注的新作品页的总作品数
 * @param {number} min - 最小页数
 * @param {number} max - 最大页数
 * @param {number} cur - 当前页数
 * @return {number} - 作品数
 */
PxerApp.getFollowingBookmarkWorksNum = function (min, max, cur) {
    var _this14 = this;

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.pixiv.net/bookmark_new_illust.php?p=" + cur);
        xhr.onload = function (e) {
            var html = xhr.response;
            var el = document.createElement("div");
            el.innerHTML = html;
            if (min === max) {
                var lastworkcount = JSON.parse(el.querySelector("div#js-mount-point-latest-following").getAttribute("data-items")).length;
                resolve((min - 1) * 20 + lastworkcount);
            } else {
                if (!!el.querySelector("div._no-item")) {
                    _this14.getFollowingBookmarkWorksNum(min, cur - 1, parseInt((min + cur) / 2)).then(function (res) {
                        return resolve(res);
                    });
                } else {
                    _this14.getFollowingBookmarkWorksNum(cur, max, parseInt((cur + max + 1) / 2)).then(function (res) {
                        return resolve(res);
                    });
                }
            }
        };
        xhr.send();
    });
};