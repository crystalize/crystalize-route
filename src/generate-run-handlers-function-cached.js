const generateRunHandlersFunction = require("./generate-run-handlers-function");

const cache = {};

const generateRunHandlersFunctionCached = function (handlers) {
    const cacheKey = handlers.map(h => h.respondsTo[0]).join("");
    const name = `generatedRunHandlersFunction_${ cacheKey }`;

    if (!cache[cacheKey]) {
        cache[cacheKey] = generateRunHandlersFunction(name, handlers);
    }

    return cache[cacheKey];
};

module.exports = generateRunHandlersFunctionCached;
