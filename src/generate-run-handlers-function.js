// Yes, the ever-rare appropriate use of `eval`. To keep runtime costs down,
// we generate the function using eval the be as if it was custom written.

const generateRunHandlersFunction = function (name, handlers) {
    // We can rely on the fact that the first handler is always a "then"
    // function. For debugging purposes save the cache name in the function
    // name.
    let codeString = `
        (function ${ name } (handlers, Promise, req, res) {
            return Promise.resolve(handlers[0].callback(req, res))
            %%CODE%%
        });
    `;

    if (handlers.length > 1) {
        for (let i = 1, l = handlers.length; i < l; i++) {
            const handler = handlers[i];

            switch (handler.respondsTo) {
                case "then":
                    codeString = codeString.replace("%%CODE%%", `
                        .then(function () {
                            return handlers[${ i }].callback(req, res);
                        })
                        %%CODE%%
                    `);
                break;

                case "catch":
                    codeString = codeString.replace("%%CODE%%", `
                        .catch(function (error) {
                            return handlers[${ i }].callback(error, req, res);
                        })
                        %%CODE%%
                    `);
                break;
            }
        }
    }

    codeString = codeString.replace("%%CODE%%", `
        ;
    `);

    return eval(codeString);
};

module.exports = generateRunHandlersFunction;
