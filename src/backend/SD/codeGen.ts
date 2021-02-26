import { sdToTd, interactionType, structureType, loopType } from './util';
import beautify from 'js-beautify';

// import fs = require( "fs" )
// OPT: add TD-directory registration
// OPT: add ajv to check action input
// OPT: replace dataInput with dataInput23 if not set is given
// OPT: switch to promise.then() structure

/**
 * Generates the content for a mashup.ts file that contains the
 * Mashup application logic represented by the System Description
 * and the content for a index.js file that handles the WoT-Scripting-API integration.
 * To execute the generated code one needs to have node.js and npm installed,
 * install the required npm-packages e.g. `@node-wot/core`
 * and can then start the Mashup by running `node filename_index.js`
 * @param SD the System Description that will be the input for code generation
 * @param mashupLogic object representing the structure of the Mashups logic, tree-like
 * @param fName target filename (without file-extension), required for the index.js generation
 */
export default function generateTS(SD: SDSQ.sdTemplate, mashupLogic: SDSQ.mashupLogic) { // , fName: string) {

    const varPrefix = 'mavar';
    const propPrefix = 'mapro';
    let customCount = 0;
    const customDataPush = {};
    let customDataPushCount = 0;
    const base = generateIndexJS(SD);
    const filestart =  `"use strict"
                        import * as WoT from 'wot-typescript-definitions'
                        /* eslint-disable @typescript-eslint/camelcase */
                        /* eslint-disable camelcase */
                        `;

    // replace ? ? by ?? because beautifier produces this problem
    const code = beautify(filestart + generateClassWotMashup().join('\n'), {
        // eslint-disable-next-line camelcase
        indent_size: 4 // eslint-disable-line @typescript-eslint/camelcase
    }).replace(/\? \?/g, '??');

    return {code, base};

    // #############################
    // ######## Functions
    // #############################
    /**
     * generate the ts code for the class WotMashup
     * -> especially the constructor of the Mashup class is defined here
     * @returns an array of js code snippets that should be merged with "\n"
     */
    function generateClassWotMashup() {

        const jsOut: string[] = [
                                `export class WotMashup {
                                    `];


        // add known vars
        jsOut.push(`
            public thing: WoT.ExposedThing
            public WoT: WoT.WoT
            public td: any
            public sd: any

            private consumed_things
            private data_pushes
        `);

        // add vars for properties and variables
        Object.getOwnPropertyNames(SD.variables).forEach( v => {jsOut.push('private ' + varPrefix + v + '\n'); });
        Object.getOwnPropertyNames(SD.properties).forEach( v => {jsOut.push('private ' + propPrefix + v + '\n'); });

        jsOut.push(genClassConstructor());

        jsOut.push(genAddProperties());

        jsOut.push(genAddActions());

        // add helper function oneOf
        jsOut.push(`private oneOf(...inputBool:boolean[]) {
                        let hCount = 0
                        inputBool.forEach(el => {if(el){hCount++}})
                        return (hCount === 1)
                    }
        `);

        jsOut.push(genAppLogic());

        jsOut.push(genDataPushes());

        // close curly-braces of class WotMashup
        jsOut.push('}');
        return jsOut;
    }

    /**
     * generate functions that execute the logic contained in the given SD at
     * top:path, top:functions:[name]:path, top:actions:[name]:path, top:properties:[name]:path
     */
    function genAppLogic() {
        const out = [''];
        // parse path to application logic
        if (mashupLogic.root) {
            out.push(`private execMashupLogic() {
                            return new Promise<any>(async (resolve, reject) => {

                                ${parsePath(mashupLogic.root)}

                                resolve()
                            })
                        }
                        `);
        }

        // add getter functions for properties with `path` property
        Object.keys(mashupLogic.properties).forEach( prop => {
            out.push(  `private get_${prop}() {
                            return new Promise<any>(async (resolve, reject) => {
                                ${parsePath(mashupLogic.properties[prop])}
                                resolve()
                            })
                        }`
            );
        });

        // add action handlers for every action with path
        Object.keys(mashupLogic.actions).forEach( prop => {
            out.push(  `private act_${prop}() {
                            return new Promise<any>(async (resolve, reject) => {
                                ${parsePath(mashupLogic.actions[prop])}
                                resolve()
                            })
                        }`
            );
        });

        // add function handlers for every function with path
        Object.keys(mashupLogic.functions).forEach( prop => {
            out.push(  `private func_${prop}() {
                            return new Promise<any>(async (resolve, reject) => {
                                ${parsePath(mashupLogic.functions[prop])}
                                resolve()
                            })
                        }`
            );
        });

        out.push('');
        return out.join('\n\n');
    }

    /**
     * generates the constructor for the WotMashup class, the constructor:
     * - initializes some variables
     * - consumes the Things invoked in the Mashup
     * - calls all init functions (register PropertyHandler,...)
     * - exposes the Mashup as Thing
     * - calls the top-level path application logic
     */
    function genClassConstructor() {

        const out = [''];

        out.push(`  // eslint-disable-next-line no-shadow
                    constructor(WoT: WoT.WoT, tdDirectory?: string) {
                        // create WotDevice as a server
                        this.WoT = WoT
                        this.consumed_things = {}
                        this.data_pushes = {}
                        this.td = ${JSON.stringify(sdToTd(SD))}
                        this.sd = ${JSON.stringify(SD)}`
        );

        // consume things
        const consTdArray: string[] = [];
        Object.keys(SD.things).forEach( tdTitle => {
            const currentTd = SD.things[tdTitle];
            currentTd.title = currentTd.title ? currentTd.title : currentTd.$id.slice(1);
            consTdArray.push(JSON.stringify(currentTd));
        });
        out.push(`
                    const tds = [
                        ${consTdArray.join(',\n')}
                    ]

                    const consume_promises: Promise<WoT.ConsumedThing>[] = []
                    tds.forEach( td => {
                        const TdPromise = WoT.consume(td)
                        consume_promises.push(TdPromise)
                    })

                    Promise.all(consume_promises).then( myTDs => {


                        myTDs.forEach( data => {
                            this.consumed_things[data.getThingDescription().$id.slice(1)] = data
                        })`
        );

        // produce the Mashup exposed Thing, add init functions logic
        // if required add this.add_events()
        out.push(`  this.WoT.produce(
                        this.td
                    ).then( exposedThing => {
                        this.thing = exposedThing
                        this.td = exposedThing.getThingDescription()
                        ${Object.keys(SD.properties).length > 0 ? 'this.add_properties()' : ''}
                        ${Object.keys(SD.actions).some( prop => (SD.actions[prop].path !== undefined)) ? 'this.add_actions()' : ''}
                        this.add_data_pushes()
                        this.thing.expose()
                        ${(mashupLogic.root) ? 'this.execMashupLogic()' : ''}
                    })
                }, err => {
                    throw new Error("cannot consume mashup things Tds " + err)
                })
            }`
        );

        return out.join('\n\n');
    }

    /**
     * generates the property init function
     * - sets properties to given default values
     * - registers property read handlers
     */
    function genAddProperties() {
        let out = 'private add_properties(){\n// add property inits and handlers\n';
        Object.keys(SD.properties).forEach( prop => {

            if (SD.properties[prop].defaultInput !== undefined) {

                out += `this.thing.writeProperty("${prop}", ${genDefaultString(SD.properties[prop].defaultInput)})\n`;
            }

            if (SD.properties[prop].path !== undefined) {
                out += `this.thing.setPropertyReadHandler("${prop}", (async() => await this.get_${prop}()))\n`;
            } else {
                out += `this.thing.setPropertyReadHandler("${prop}", () => {
                    return new Promise<any>((resolve, reject) => {
                        resolve(${composeVarName({type: 'property', name: prop})})
                    })
                })\n`;
            }
        });

        out += '}';
        out = Object.keys(SD.properties).length > 0 ? out : '';

        return out;
    }

    /**
     * generates the action init function
     * - register the action invoke handler
     */
    function genAddActions() {
        // OPT: add check for correct input with ajv
        let out = `\n private add_actions() {\n// add action handlers`;

        Object.keys(SD.actions).forEach( prop => {
            if (SD.actions[prop].path !== undefined) {
                out += `
                    this.thing.setActionHandler("${prop}", inputData => {
                        return new Promise((resolve, reject) => {
                            if (false) {
                                reject(new Error ("Invalid input"))
                            }
                            else {
                                // forward inputData here if required
                                resolve(this.act_${prop}())
                            }
                        })
                    })`;
            }
        });
        out += `
    }\n`;

    out = Object.keys(SD.actions).some( prop => (SD.actions[prop].path !== undefined)) ? out : '';

    return out;
    }

    function genDataPushes() {
        let out = 'private add_data_pushes() {\n // add helper object for data pushes\n';
        Object.keys(customDataPush).forEach( intrctSeq => {
            out += 'this.data_pushes[' + intrctSeq + '] = {} ';
            Object.keys(customDataPush[intrctSeq]).forEach( el => {

                out += 'this.data_pushes[' + intrctSeq + '][' + el + '] = false\n';

            });
        });
        out += '}';
        return out;
    }

    function parsePath(inPath: SDSQ.structureEl[]) {

        let out = '// ### path: ###\n';
        let nextEl = inPath.shift();
        while (nextEl) {
            if (nextEl.type === structureType.interact) {

                out += parsePathAtomic(nextEl);

            } else if (nextEl.type === structureType.case) {

                out += `if (${parseIfCondition(nextEl.condition)}) {
                    ${parsePath(nextEl.content)}
                }`;
                if (nextEl.elseContent !== undefined) {
                    out += `else {
                        ${parsePath(nextEl.elseContent)}
                    }\n`;
                }

            } else if (nextEl.type === structureType.wait) {out += `setTimeout( async () => {
                    ${parsePath(inPath)}
                }, ${nextEl.waitTime})\n`;
                inPath = [];

            } else if (nextEl.type === structureType.loop) {

                // TODO: take sync option into account
                out += '// -- loop --\n';
                if (nextEl.loopOpts.type === loopType.logic ) {
                    if (nextEl.loopOpts.exCount === 'forever') {
                    out += `while(${nextEl.loopOpts.exCount === 'forever' ? 'true' : nextEl.loopOpts.exCount})`;
                    } else {
                        out += `for(let i = 0; i < ${nextEl.loopOpts.exCount}; i++)`;
                    }
                    out += `{\n${parsePath(nextEl.content)}\n}\n`;
                } else {
                    out += `
                            setInterval( async () => {
                                ${parsePath(nextEl.content)}
                            }, ${nextEl.loopOpts.period})\n`;
                }

            } else if (nextEl.type === structureType.get) {

                out += `// get
                        resolve(${composeVarName(nextEl.get)})\n`;

            } else if (nextEl.type === structureType.set) {

                out += '// set\n';
                if (nextEl.get) {
                    out += composeVarName(nextEl.set) + ' = ' + composeVarName(nextEl.get);
                    if (nextEl.defaultInput !== undefined) {out += ' ?? ' + genDefaultString(nextEl.defaultInput); }
                    out += '\n';
                } else if (nextEl.defaultInput !== undefined) {
                    out += composeVarName(nextEl.set) + ' = ' + genDefaultString(nextEl.defaultInput) + '\n';
                } else {
                    // OPT: add set without defaultInput and without get -> set to data of act_xy(data)
                }

            } else if (nextEl.type === structureType.ref) {

                // OPT: add get/set to refs?
                // OPT: allow refs to property path?
                out += '// ref\n';
                out += 'this.' + (nextEl.ref.type === 'action' ? 'act' : 'func') + '_' + nextEl.ref.name + '()\n';
            } else {
                throw new Error('unknown structure');
            }
            nextEl = inPath.shift();
        }
        out += '\n// ### end path ###';
        return out;

        // -------internal Functions---(parsePath)------

        function parsePathAtomic(inEl: SDSQ.structElAtomic) {
            const syncs: string[] = [];
            const waits: string[] = [];
            const sends: string[] = [];
            const asyncs: string[] = [];
            let dataPC = 0;
            const pre = '// -- interaction sequence --';
            const hasDataPush = inEl.receiveIntrcts.some(
                rec => (rec.type === interactionType.observeProperty || rec.type === interactionType.subscribeEvent)
            );
            if (hasDataPush) {
                customDataPush[customDataPushCount] = {};
            }

            inEl.sendIntrcts.forEach( snd => {
                const varname = 'autoGenWrite' + customCount++;
                const inname = 'autoWriteInput' + customCount++;
                let inpost;
                const fIntr = (snd.type === interactionType.writeProperty) ? 'writeProperty' : 'invokeAction';
                if (snd.get || snd.defaultInput !== undefined) {
                    inpost = (snd.get && snd.defaultInput !== undefined) ?
                            `${composeVarName(snd.get)} ?? ${genDefaultString(snd.defaultInput)}` :
                            (snd.get ? composeVarName(snd.get) : ((snd.defaultInput !== undefined) ? genDefaultString(snd.defaultInput) : ''));
                    sends.unshift(`const ${varname} = this.consumed_things["${snd.to}"].` + fIntr + `("${snd.name}", ${inname})`);
                    sends.unshift(`const ${inname} = ` + inpost);
                } else {
                    sends.unshift(`const ${varname} = this.consumed_things["${snd.to}"].` + fIntr + `("${snd.name}")`);
                }
                sends.push(`await ${varname}`);
            });

            inEl.receiveIntrcts.forEach( rec => {

                let varname;
                const fIntr = interactionType[rec.type];
                let proto = '';
                let hvar = '';
                if (rec.set) {
                    varname = composeVarName(rec.set);
                } else {
                    varname = 'autoGenReceive' + customCount++;
                    hvar = varname;
                }

                if (rec.type === interactionType.readProperty || rec.type === interactionType.invokeAction) {
                    proto += `${rec.set ? '' : 'let'} ${varname} = this.consumed_things["${rec.to}"].` + fIntr + `("${rec.name}")`;
                    waits.push(`${varname} = await ${varname}`);
                } else if (rec.type === interactionType.subscribeEvent || rec.type === interactionType.observeProperty) {
                    if (rec.set) {hvar = 'autoGenReceive' + customCount++; }
                    customDataPush[customDataPushCount][dataPC] = false;

                    proto += `this.consumed_things["${rec.to}"].` + fIntr + `("${rec.name}", async ${hvar} => {
                             ${rec.set ? (varname + ' = ' + hvar) : ''}
                             `;
                    if (inEl.breakOnDataPushed) {
                        proto += `if (Object.keys(this.data_pushes[${customDataPushCount}]).every(el => {
                                    return (this.data_pushes[${customDataPushCount}][el] === false)
                                    })) {
                                    this.data_pushes[${customDataPushCount}][${dataPC}] = true
                                    console.log("data push oneOf: " + ${hvar})
                                    ${sends.join('\n')}
                                } else {
                                    this.data_pushes[${customDataPushCount}][${dataPC}] = true
                                }
                                `;
                    } else {
                        proto +=   `this.data_pushes[${customDataPushCount}][${dataPC}] = true
                                    if (Object.keys(this.data_pushes[${customDataPushCount}]).every(el => {
                                        return (this.data_pushes[${customDataPushCount}][el] === true)
                                        })) {
                                        console.log("data push allOf: " + ${hvar})
                                        ${sends.join('\n')}
                                    }
                                    `;
                    }


                    proto += `
                                if (Object.keys(this.data_pushes[${customDataPushCount}]).every(el => {
                                    return (this.data_pushes[${customDataPushCount}][el] === true)
                                    })) {
                                    Object.keys(this.data_pushes[${customDataPushCount}]).forEach(el => {
                                        this.data_pushes[${customDataPushCount}][el] = false
                                    })
                                }
                            `;

                    proto += `})`;
                    dataPC++;
                }

                syncs.push(proto);
            });



            let outCode = '';
            let post = '';

            if (!hasDataPush) {post = sends.join('\n'); }
            post += '\n// -- end intrct seq --\n';

            if (hasDataPush) {customDataPushCount++; }

            outCode = [pre, ...syncs, ...waits, ...asyncs, post].join('\n');

            return outCode;
        }

        /**
         * generates the condition of an if-statement (the part surrounded by parentheses)
         * representing the condition given as object
         * @param cond condition as internal tree-object representation
         */
        function parseIfCondition(cond: SDSQ.comparison) {
            let cOut = '';

            if (cond.type === 'all') {
                cOut = '(' + cond.allOf.map(el => parseIfCondition(el)).join(' && ') + ')';
            } else if (cond.type === 'one') {
                cOut = 'this.oneOf(' + cond.oneOf.map(el => parseIfCondition(el)).join(', ') + ')';
            } else if (cond.type === 'any') {
                cOut = '(' + cond.anyOf.map(el => parseIfCondition(el)).join(' || ') + ')';
            } else if (cond.type === 'not') {
                cOut = '!' + parseIfCondition(cond.not) + '';
            } else if (cond.type === 'var') {
                cOut = composeVarName(cond.variable);
                if (cond.value) {
                    cOut = '(' + cOut + ' === ';
                    if (typeof cond.value === 'object') {
                        cOut += composeVarName(cond.value);
                    } else if (typeof cond.value === 'string') {
                        cOut += '"' + cond.value + '"';
                    } else if (typeof cond.value === 'number') {
                        cOut += cond.value.toFixed();
                    } else {
                        throw new Error('problems with parse if value');
                    }
                    cOut += ')';
                }
            } else {throw new Error('problems with parseIfCondition'); }

            return cOut;
        }
    }

    /**
     * Converts defaultInput to string, dependent on the value type
     * @param inDef default Input
     */
    function genDefaultString(inDef: SDSQ.typeDefaultInput) {
        let out = '';

        if (typeof inDef === 'boolean') {
            out = inDef + '';
        } else if (typeof inDef === 'string') {
            out = '"' + inDef + '"';
        } else if (typeof inDef === 'number') {
            try {
                out = inDef.toFixed();
            } catch (err) {
                console.log('defaultInput is no integer??');
                out = inDef.toPrecision();
            }
        } else if (typeof inDef === 'object') {
            out = JSON.stringify(inDef);
            // out = inDef
        } else {
            throw new Error('problems with parse defaultInput value');
        }

        return out;
    }

    /**
     * Generates the expression used to express vars/props
     * (e.g. this.mavarXY for type: variable, name: XY)
     * @param arg object that contains information about the variable type and name
     */
    function composeVarName(arg: {type: 'variable' | 'property'; name: string}) {
        return ('this.' + (arg.type === 'property' ? propPrefix : varPrefix) + arg.name);
    }

}

/**
 * Determines which protocols are used in the System Description and
 * creates and index.js file based on this information
 * @param SD the system description that is the input of the code generation
 * @param fileName name of the file containing the created WotMashup class
 * @returns the content of the index.js file to create a WotMashup class instance
 */
function generateIndexJS(SD: SDSQ.sdTemplate) { // , fileName: string) {

    // ########## config ###########
    // Protocols to expose the Mashup are configured here
    const protoServer: {[k: string]: {toServer: string; config: string}} = {
        http: {
            toServer: 'HttpServer',
            config: '{port: 8080}'
        }/* ,
        coap: {
            toServer: "CoapServer",
            config: "{port: 5683}"
        },
        mqtt: {
            toServer: "MqttBrokerServer",
            config: "\"test.mosquitto.org\""
        } */
    };

    // Protocols to consume (where their exist protocol bindings for the controller)
    const protoClient = ['http', 'coap', 'mqtt'];


    // ########### program ###########

    // Add every form included in the SD to the add List
    const toAdd: string[] = [];
    let protocol;

    Object.keys(SD.things).forEach( thingName => {
        Object.keys(SD.things[thingName].actions).forEach( elName => {
            const formAr = SD.things[thingName].actions[elName].forms;
            if (formAr === undefined) {throw new Error('missing forms array in actions'); }
            formAr.forEach( form => {
                protocol = form.href.split('://').shift();
                if ( protocol && protoClient.some(p => (p === protocol)) ) {
                    toAdd.push(protocol);
                } else {
                    throw new Error('cannot add client form actions');
                }
            });
        });
        Object.keys(SD.things[thingName].properties).forEach( elName => {
            const formAr = SD.things[thingName].properties[elName].forms;
            if (formAr === undefined) {throw new Error('missing forms array in properties'); }
            formAr.forEach( form => {
                protocol = form.href.split('://').shift();
                if ( protocol && protoClient.some(p => (p === protocol)) ) {
                    toAdd.push(protocol);
                } else {
                    throw new Error('cannot add client form properties');
                }
            });
        });
        Object.keys(SD.things[thingName].events).forEach( elName => {
            const formAr = SD.things[thingName].events[elName].forms;
            if (formAr === undefined) {throw new Error('missing forms array in events'); }
            formAr.forEach( form => {
                protocol = form.href.split('://').shift();
                if ( protocol && protoClient.some(p => (p === protocol)) ) {
                    toAdd.push(protocol);
                } else {
                    throw new Error('cannot add client form events');
                }
            });
        });
    });

    // Generate output that corresponds to the found protocols
    let bindings = '';
    let servers = '';
    let addS = '';
    let clients = '';
    let addC = '';

    Object.keys(protoServer).forEach( key => {
            servers += `const ${key}Server = new ${protoServer[key].toServer}(${protoServer[key].config})\n`;
            bindings += `${protoServer[key].toServer} = require("@node-wot/binding-${key}").${protoServer[key].toServer}\n`;
            addS += `servient.addServer(${key}Server)\n`;
    });

    const uniqToAdd = [...new Set(toAdd)];

    uniqToAdd.forEach( clientProt => {
        const capProt = clientProt.slice(0, 1).toUpperCase() + clientProt.slice(1);
        clients += `${capProt}ClientFactory = require("@node-wot/binding-${clientProt}").${capProt}ClientFactory\n`;
        addC += `servient.addClientFactory(new ${capProt}ClientFactory())\n`;
    });

    // compose the output file from the generated fragments, static code and filename
    const out: string[] = [];
    // out.push(`WotMashup = require("./${fileName}").WotMashup`);
    out.push('const TD_DIRECTORY = ""');
    out.push('Servient = require("@node-wot/core").Servient');
    out.push(bindings, clients, servers);
    out.push('const servient = new Servient()');
    out.push(addS);
    out.push(addC);
    out.push(`servient.start().then( WoT => {
    wotMashup = new WotMashup(WoT, TD_DIRECTORY) // you can change the wotDevice (wotMashup) to something that makes more sense
})`);

    return out.join('\n\n');
}

