let noInputString = "success";
let noInputBoolean = true;
let noInputInteger = 1;

let noInputDelayString = "success";
let noInputDelayBoolean = true;
let noInputDelayInteger = 1;

let inputString = "";
let inputBoolean = false
let inputInteger = 1;

let inputDelayString = "";
let inputDelayBoolean = false
let inputDelayInteger = 1;

WoT.produce({
    title: "virtual-test-thing-2",
    description: "node-wot servient for virtual test #2 including delayed actions",
    "@context": ["https://www.w3.org/2019/wot/td/v1", {"iot": "http://example.org/iot"}],
    actions: {
        noInputString: {
            output: {
                type: "string"
            }
        },
        noInputBoolean: {
            output: {
                type: "boolean"
            }
        },
        noInputInteger: {
            output: {
                type: "integer"
            }
        },
        noInputDelayString: {
            output: {
                type: "string"
            }
        },
        noInputDelayBoolean: {
            output: {
                type: "boolean"
            }
        },
        noInputDelayInteger: {
            output: {
                type: "integer"
            }
        },
        inputString: {
            input: {
                type: "string"
            },
            output: {
                type: "string"
            }
        },
        inputBoolean: {
            input: {
                type: "boolean"
            },
            output: {
                type: "boolean"
            }
        },
        inputInteger: {
            input: {
                type: "integer"
            },
            output: {
                type: "integer"
            }
        },
        inputDelayString: {
            input: {
                type: "string"
            },
            output: {
                type: "string"
            }
        },
        inputDelayBoolean: {
            input: {
                type: "boolean"
            },
            output: {
                type: "boolean"
            }
        },
        inputDelayInteger: {
            input: {
                type: "integer"
            },
            output: {
                type: "integer"
            }
        }

// Send a action requests that takes no input and returns a string.
// Send a action requests that takes no input and returns an integer.
// Send a action requests that takes no input and returns a boolean.
// Send a action requests that takes a string input and returns a string.
// Send a action requests that takes a integer input and returns a integer.
// Send a action requests that takes a boolean input and returns a boolean.
// Send a action request that takes no input, waits one sec and returns a string.
// Send a action request that takes no input, waits one sec and returns an integer.
// Send a action request that takes no input, waits one sec and returns a boolean.
// Send a action request that takes a string input, waits one sec and returns a string.
// Send a action request that takes an integer input, waits one sec and returns an integer.
// Send a action request that takes a boolean input, waits one sec and returns a boolean.

    }
})
.then((thing) => {
    console.info(`Produced ${thing.title}.`);

    // No delay, no input
    thing.setActionHandler("noInputString", () => {
        return noInputString;
    });
    thing.setActionHandler("noInputBoolean", () => {
        return noInputBoolean;
    });
    thing.setActionHandler("noInputInteger", () => {
        return noInputInteger;
    });

    // No delay, input
    thing.setActionHandler("inputString", (params, options) => {
        console.log('Params: ', params);
        inputString = params;
        return inputString;
    });
    thing.setActionHandler("inputBoolean", (params, options) => {
        console.log('Params: ', params);
        inputBoolean = params;
        return inputBoolean;
    });
    thing.setActionHandler("inputInteger", (params, options) => {
        console.log('Params: ', params);
        inputInteger = params;
        return inputInteger;
    });

    // Delay, no input
    thing.setActionHandler("noInputDelayString", () => {
        let start = new Date().getTime();
        let expire = start + 1000;
        while (new Date().getTime() < expire) { }
        return noInputString;
    });
    thing.setActionHandler("noInputDelayBoolean", () => {
        let start = new Date().getTime();
        let expire = start + 1000;
        while (new Date().getTime() < expire) { }
        return noInputBoolean;
    });
    thing.setActionHandler("noInputDelayInteger", () => {
        let start = new Date().getTime();
        let expire = start + 1000;
        while (new Date().getTime() < expire) { }
        return noInputInteger;
    });

    // Delay input
    thing.setActionHandler("inputDelayString", (params, options) => {
        console.log('Params: ', params);
        inputString = params;
        let start = new Date().getTime();
        let expire = start + 1000;
        while (new Date().getTime() < expire) { }
        return inputString;
    });
    thing.setActionHandler("inputDelayBoolean", (params, options) => {
        console.log('Params: ', params);
        inputBoolean = params;
        let start = new Date().getTime();
        let expire = start + 1000;
        while (new Date().getTime() < expire) { }
        return inputBoolean;
    });
    thing.setActionHandler("inputDelayInteger", (params, options) => {
        console.log('Params: ', params);
        inputInteger = params;
        let start = new Date().getTime();
        let expire = start + 1000;
        while (new Date().getTime() < expire) { }
        return inputInteger;
    });



    thing.expose()
    .then(() => {
        console.info(`${thing.title} is ready`);
    })
    .catch((err) => {
        console.info(`Could not expose ${thing.title} due to error: ${err}`);
    })
})
.catch((error) => {
    console.log(error);
});