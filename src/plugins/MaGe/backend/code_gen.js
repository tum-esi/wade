"use strict";

import * as stripIndent from 'strip-indent';

export function generate_code(mashup, tds) {

    // add tds to script
    let script = `            "use strict";
            /* global WoT */
            let tds=[`
    tds.forEach(td => { script += `${JSON.stringify(td)},` })
    script = script.slice(0, -1) // remove "," after last td
    script += `];\n`

    // consume all tds and store consumed-things in id:obj map
    script += `
            let consume_promises = [];
            tds.forEach( (td) => {
                const TdPromise = WoT.consume(td);
                consume_promises.push(TdPromise);
            });

            Promise.all(consume_promises).then( (myTDs) => {

                let consumed_things = {};

                myTDs.forEach( (data) => {
                    consumed_things[data.id] = data;
                });

                let read_promises = [];\n
`

    mashup.forEach(interaction => {
        if (interaction.interaction_type === "event") {
            script += `
                read_promises.push( new Promise( (resolve) => {
                    consumed_things["${interaction.thing_id}"].subscribeEvent("${interaction.name}", 
                        (data) => {
                            resolve(data); 
                            resolve = () => {};
                        } 
                    );
                }));\n`
        } else if (interaction.interaction_type === "property-read") {
            script += `
                read_promises.push(consumed_things["${interaction.thing_id}"].readProperty("${interaction.name}"));\n`
        } else if (interaction.interaction_type === "action-read") {
            script += `
                read_promises.push(consumed_things["${interaction.thing_id}"].invokeAction("${interaction.name}", 
                    // PLEASE PROVIDE AN INPUT HERE IF NECESSARY 
                ));\n`
        }
    })

    let outputs = ``
    mashup.forEach(interaction => {
        if (interaction.interaction_type === "property-write") {
            outputs += `
                    consumed_things["${interaction.thing_id}"].writeProperty("${interaction.name}" /*, values*/ );  // SELECT DATA TO WRITE\n`
        } else if (interaction.interaction_type === "action") {
            outputs += `
                    consumed_things["${interaction.thing_id}"].invokeAction("${interaction.name}" /*, values */ );  // SELECT DATA TO WRITE\n`
        }
    })

    script += `
                Promise.all(read_promises).then( (values) => {

                    // PLEASE DO ANY DATA TRANSFORMATION NECESSARY HERE
                    
                    ${outputs}
                });
            });\n`

    return stripIndent(script)
}