"use strict";

import stripIndent from 'strip-indent';

export default function generateCode(mashup, tds): string {

    // add tds to script
    let script =
     `
    "use strict";
    /* global WoT */
    let tds=[`
    tds.forEach(td => { script += `${td},` })
    script = script.slice(0, -1) // remove "," after last td
    script += `];\n`

    // consume all tds and store consumed-things in id:obj map
    script += `
    let consumePromises = [];
    tds.forEach( (td) => {
        const TdPromise = WoT.consume(td);
        consumePromises.push(TdPromise);
    });

    Promise.all(consumePromises).then( (myTDs) => {
        let consumedThings = {};

        myTDs.forEach( (data) => {
            consumedThings[data.id] = data;
        });

        let readPromises = [];\n
`

    mashup.forEach(interaction => {
        if (interaction.interactionType === "event") {
            script +=
             `
                readPromises.push( new Promise( (resolve) => {
                    consumedThings["${interaction.thingId}"].subscribeEvent("${interaction.name}", 
                        (data) => {
                            resolve(data); 
                            resolve = () => {};
                        } 
                    );
                }));\n`
        } else if (interaction.interactionType === "property-read") {
            script += `
                readPromises.push(consumedThings["${interaction.thingId}"].readProperty("${interaction.name}"));\n`
        } else if (interaction.interactionType === "action-read") {
            script += `
                readPromises.push(consumedThings["${interaction.thingId}"].invokeAction("${interaction.name}", 
                    // PLEASE PROVIDE AN INPUT HERE IF NECESSARY 
                ));\n`
        }
    })

    let outputs = ``
    mashup.forEach(interaction => {
        if (interaction.interactionType === "property-write") {
            outputs += `
                    consumedThings["${interaction.thingId}"].writeProperty("${interaction.name}" /*, values*/ );  // SELECT DATA TO WRITE\n`
        } else if (interaction.interactionType === "action") {
            outputs += `
                    consumedThings["${interaction.thingId}"].invokeAction("${interaction.name}" /*, values */ );  // SELECT DATA TO WRITE\n`
        }
    })

    script += `
                Promise.all(readPromises).then( (values) => {

                    // PLEASE DO ANY DATA TRANSFORMATION NECESSARY HERE
                    
                    ${outputs}
                });
            });\n`

    return stripIndent(script)
}