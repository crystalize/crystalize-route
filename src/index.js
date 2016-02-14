/**
 * Copyright (c) 2016 Shawn Dellysse
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const precompileMethods = require("./precompile-methods");
const precompilePath = require("./precompile-path");

const Route = function (methods, path, handlers) {
    this._Promise = Route.Promise;

    if (!Array.isArray(this.methods)) {
        throw new Route.errors.InvalidMethodsError("methods must be an array");
    }
    for (let method of methods) {
        if (typeof method !== "string") {
            throw new Route.errors.InvalidMethodTypeError(typeof method);
        }
    }
    this.methods = methods;

    if (typeof path !== "string") {
        throw new Route.errors.InvalidPathTypeError(typeof path);
    }
    this.path = path;

    if (!Array.isArray(handlers) || handlers.length === 0) {
        throw new Route.errors.InvalidHandlersError("handlers must be a non-empty array");
    }
    for (let handler of handlers) {
        if (handler.respondsTo !== "then" && handler.respondsTo !== "catch") {
            throw new Route.errors.InvalidRespondsToError(handler.respondsTo);
        }
        if (typeof handler.callback !== "function") {
            throw new Route.errors.InvalidHandlerCallbackTypeError(typeof handler.callback);
        }
    }
    if (handlers[0].respondsTo === "catch") {
        throw new Route.errors.InvalidHandlersError("First handler cannot respondsTo 'catch'");
    }
    this.handlers = handlers;

    this.regexp = new RegExp(`^${ precompileMethods(route.methods) } ${ precompilePath(route.path) }$`);

    this._generatedRunHandlersFunction = Route.generateRunHandlersFunction(handlers);
};

Object.assign(Route, {
    errors: {
        InvalidHandlerCallbackTypeError: require("./invalid-handler-callback-type-error"),
        InvalidHandlersError: require("./invalid-handlers-error"),
        InvalidMethodsError: require("./invalid-methods-error"),
        InvalidPathTypeError: require("./invalid-path-type-error"),
        InvalidRespondsToError: require("./invalid-responds-to-error"),
    },
    Promise: require("crystalize-promise").Promise,
});

Object.assign(Route.prototype, {
    matches: function (methodPath) {
        return this.regexp.test(methodPath);
    },

    runHandlers: function (req, res) {
        return this._generatedRunHandlersFunction(handlers, this._Promise, req, res);
    },
});

module.exports = Route;
