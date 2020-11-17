"use strict";

// import Plantuml from "plantuml-encoder";
import Combinatorics from 'js-combinatorics';
import _ from "lodash";
import Crypto from "crypto";
import * as Filters from "./filters";
import * as Utils from "./utils";
import { ThingDescription } from 'wot-typescript-definitions';

/** generate all the possible combinations of interactions for a given list of things and a given length */ 
async function generateInteractionCombinations(generationForm: MAGE.GenerationFormInterace) {
    let things = generationForm.things;
    let filters = generationForm.filters;
    let templates = generationForm.templates;

    let events:         MAGE.InputInteractionInterface[] = [];
    let propertyReads:  MAGE.InputInteractionInterface[] = [];
    let propertyObservations: MAGE.InputInteractionInterface[] = [];
    let actionReads:    MAGE.InputInteractionInterface[] = [];
    let propertyWrites: MAGE.InteractionInterface[] = [];
    let actions:        MAGE.InteractionInterface[] = [];
    
    // get and categorize all input interactions
    things.inputs.forEach( thingDescription => {
        let forbiddenAnnotationFound =  false
        if(!thingDescription.content) return;
        let parsedTd: ThingDescription = JSON.parse(thingDescription.content);
        let types: string | string[] | undefined = parsedTd["@type"];
        if(!types) types = [];
        if(typeof types === "string") types = [types];
        for(let type of types) {
            if(filters.forbiddenTdAnnotations && filters.forbiddenTdAnnotations.some(a => a.annotation === type)) 
            forbiddenAnnotationFound = true; break;
        }
        if(!forbiddenAnnotationFound) {
            let interactions = getInputInteractions(parsedTd, filters);
            events.push(...interactions.events);
            propertyReads.push(...interactions.properties);
            actionReads.push(...interactions.actions);
            propertyObservations.push(...interactions.observations);
        }
    })

    // get and categorize all output interactions
    let forbiddenAnnotationFound =  false
    things.outputs.forEach( thingDescription => {
        if(!thingDescription.content) return;
        let parsedTd: ThingDescription = JSON.parse(thingDescription.content);
        let types: string | string[] | undefined = parsedTd["@type"];
        if(!types) types = [];
        if(typeof types === "string") types = [types];
        for(let type of types) {
            if(filters.forbiddenTdAnnotations && filters.forbiddenTdAnnotations.some(a => a.annotation === type)) 
            forbiddenAnnotationFound = true; break;
        }
        if(!forbiddenAnnotationFound) {
            let interactions = getOutputInteractions(parsedTd, filters);
            actions.push(...interactions.actions);
            propertyWrites.push(...interactions.properties);
        }
    });

    let outputs: MAGE.InteractionInterface[] = []
    if(filters.acceptedOutputInteractionTypes.includes("property-write")) outputs.push(...propertyWrites);
    if(filters.acceptedOutputInteractionTypes.includes("action-invoke")) outputs.push(...actions);

    // for each input, get matching outputs based on filters
    async function getMatchingOutputCombinations(input: MAGE.InputInteractionInterface) {
        let matchingOutputs = await getMatchingOutputs(input, outputs, filters);
        let matchingOutputCombinations: MAGE.InteractionInterface[][] = [];
        for (let i = generationForm.minOutputs; i <= generationForm.maxOutputs; i++) {
            if (i > matchingOutputs.length) break;
            matchingOutputCombinations.push(...Combinatorics.bigCombination(matchingOutputs, i).toArray());
        }
        return matchingOutputCombinations;
    }

    for (let input of events) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    for (let input of propertyReads) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    for (let input of actionReads) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    for (let input of propertyObservations) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    // remove inputs without matching outputs
    events = events.filter(event => event.matchingOutputCombinations && event.matchingOutputCombinations.length > 0);
    propertyReads = propertyReads.filter(property => property.matchingOutputCombinations && property.matchingOutputCombinations.length > 0);
    actionReads = actionReads.filter(action => action.matchingOutputCombinations && action.matchingOutputCombinations.length > 0);
    propertyObservations = propertyObservations.filter(observation => observation.matchingOutputCombinations && observation.matchingOutputCombinations.length > 0);

    // Calculate all possible output combinations for each input combinations and put them together
    let interactionCombinations: MAGE.InteractionInterface[][] = [];
    
    let interactionsToCombine: MAGE.InputInteractionInterface[] = []
    for(let template in templates) {
        switch(template) {
            case "use-event-template":
                if(templates[template]) {
                    interactionsToCombine.push(...events);
                    interactionsToCombine.push(...propertyObservations);
                }
                break;
            case "use-read-template": if(templates[template]) interactionsToCombine.push(...propertyReads); break;
            case "use-action-template": if(templates[template]) interactionsToCombine.push(...actionReads); break;
        }
    }

    interactionCombinations.push(...getFinalCombinations(interactionsToCombine, generationForm));
    return interactionCombinations;
}

/** parse a TD to return all interactions that can serve as an input */
function getInputInteractions(thingDescription: ThingDescription, filters: MAGE.FiltersInterface) {
    let events: MAGE.InputInteractionInterface[] = [];
    let propertyReads: MAGE.InputInteractionInterface[] = [];
    let propertyObservations: MAGE.InputInteractionInterface[] = [];
    let actionReads: MAGE.InputInteractionInterface[] = [];
    for (let prop in thingDescription.properties) {
        let dontAddRead = false;
        let dontAddObserve = false;

        let propAnnotations = thingDescription.properties[prop]['@type'];
        if(!propAnnotations) propAnnotations = [];
        if(typeof propAnnotations === "string") propAnnotations = [propAnnotations];

        // filter based on unwanted types
        if (!thingDescription.properties[prop].writeOnly) {
            if(!filters.acceptedTypes.includes(thingDescription.properties[prop].type)) {
                if(thingDescription.properties[prop].type) continue;
                else if(!thingDescription.properties[prop].type && !filters.acceptedTypes.includes("null")) continue;
            }
            // filter interactions with unwanted annotations
            if(filters.forbiddenAnnotations) {
                let forbiddenReadFound = false;
                let forbiddenObserveFound = false;
                for(let annotation of propAnnotations) {
                    if(filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === "property-read")) {
                        forbiddenReadFound = true;
                        break;
                    }
                }
                for(let annotation of propAnnotations) {
                    if(filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === "property-observe")) {
                        forbiddenObserveFound = true;
                        break;
                    }
                }
                if(forbiddenReadFound) dontAddRead = true;
                if(forbiddenObserveFound) dontAddObserve = true;
            }
            // filter unwanted interactions
            if(filters.forbiddenInteractions) {
                if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                    inter.name === prop && inter.type === "property-read")) dontAddRead = true;
                if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                        inter.name === prop && inter.type === "property-observe")) dontAddObserve = true;
            }
            if(!dontAddRead) propertyReads.push({
                interactionType: "property-read", 
                name: prop,
                object: thingDescription.properties[prop],
                from: "Agent",
                to: thingDescription.title,
                thingId: thingDescription.id,
                id: ""
            });
            if(thingDescription.properties[prop].observable && !dontAddObserve) propertyObservations.push({
                interactionType: "property-observe", 
                name: prop,
                object: thingDescription.properties[prop],
                from: "Agent",
                to: thingDescription.title,
                thingId: thingDescription.id,
                id: ""
            });
        }
    }
    for (let event in thingDescription.events) {

        let eventAnnotations = thingDescription.events[event]['@type'];
        if(!eventAnnotations) eventAnnotations = [];
        if(typeof eventAnnotations === "string") eventAnnotations = [eventAnnotations];

        // filter based on accepted types
        if(!thingDescription.events[event].data && !filters.acceptedTypes.includes("null")) continue;
        else if (thingDescription.events[event].data && !filters.acceptedTypes.includes(thingDescription.events[event].data.type)) {
            if(thingDescription.events[event].data.type) continue;
            else if (!thingDescription.events[event].data.type && !filters.acceptedTypes.includes("null")) continue;
        }
        // filter interactions with unwanted annotations
        if(filters.forbiddenAnnotations) {
            let forbiddenFound = false;
            for(let annotation of eventAnnotations) {
                if(filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === "event-subscribe")) {
                    forbiddenFound = true;
                    break;
                }
            }
            if(forbiddenFound) continue;
        }
        // filter unwanted interactions
        if(filters.forbiddenInteractions) {
            if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                inter.name === event && inter.type === "event-subscribe")) continue;
        }
        events.push({
            interactionType: "event-subscribe",
            name: event,
            object: thingDescription.events[event],
            from: "Agent",
            to: thingDescription.title,
            thingId: thingDescription.id,
            id: ""
        });
    }
    for (let action in thingDescription.actions) {

        let actionAnnotations = thingDescription.actions[action]['@type'];
        if(!actionAnnotations) actionAnnotations = [];
        if(typeof actionAnnotations === "string") actionAnnotations = [actionAnnotations];

        if (!thingDescription.actions[action].output && !filters.acceptedTypes.includes("null")) continue
        else if(thingDescription.actions[action].output && !filters.acceptedTypes.includes(thingDescription.actions[action].output.type)) {
            if(thingDescription.actions[action].output.type) continue;
            else if(!thingDescription.actions[action].output.type && !filters.acceptedTypes.includes("null")) continue;
        }
        // filter interactions with unwanted annotations
        if(filters.forbiddenAnnotations) {
            let forbiddenFound = false;
            for(let annotation of actionAnnotations) {
                if(filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === "action-read")) {
                    forbiddenFound = true;
                    break;
                }
            }
            if(forbiddenFound) continue;
        }
        // filter unwanted interactions
        if(filters.forbiddenInteractions) {
            if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                inter.name === action && inter.type === "action-read")) continue;
        }
        actionReads.push({
            interactionType: "action-read",
            name: action,
            object: thingDescription.actions[action],
            from: "Agent",
            to: thingDescription.title,
            thingId: thingDescription.id,
            id: ""
        });
    }
    return { "events": events, "properties": propertyReads, "actions": actionReads, "observations": propertyObservations };
}

/** parse a TD to return all interactions that can serve as an output */
function getOutputInteractions(thingDescription, filters: MAGE.FiltersInterface) {
    let actions: MAGE.InteractionInterface[] = [];
    let propertyWrites: MAGE.InteractionInterface[] = [];
    for (let prop in thingDescription.properties) {

        let propAnnotations = thingDescription.properties[prop]['@type'];
        if(!propAnnotations) propAnnotations = [];
        if(typeof propAnnotations === "string") propAnnotations = [propAnnotations];

        if (!thingDescription.properties[prop].readOnly) {
            // filter based on accepted types
            if(!filters.acceptedTypes.includes(thingDescription.properties[prop].type)) {
                if(thingDescription.properties[prop].type) continue;
                else if(!thingDescription.properties[prop].type && !filters.acceptedTypes.includes("null")) continue;
            }
            // filter interactions with unwanted annotations
            if(filters.forbiddenAnnotations) {
                let forbiddenFound = false;
                for(let annotation of propAnnotations) {
                    if(filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === "property-write")) {
                        forbiddenFound = true;
                        break;
                    }
                }
                if(forbiddenFound) continue;
            }
            // filter unwanted interactions
            if(filters.forbiddenInteractions) {
                if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                    inter.name === prop && inter.type === "property-write")) continue;
            }
            propertyWrites.push({
                interactionType: "property-write",
                name: prop,
                object: thingDescription.properties[prop],
                from: "Agent",
                to: thingDescription.title,
                id: Crypto.createHash("sha1").update(thingDescription.id+prop).digest("hex"),
                thingId: thingDescription.id
            });
        }
    }
    for (let action in thingDescription.actions) {

        let actionAnnotations = thingDescription.actions[action]['@type'];
        if(!actionAnnotations) actionAnnotations = [];
        if(typeof actionAnnotations === "string") actionAnnotations = [actionAnnotations];
        
        if (!thingDescription.actions[action].input && !filters.acceptedTypes.includes("null")) continue
        else if(thingDescription.actions[action].input && !filters.acceptedTypes.includes(thingDescription.actions[action].input.type)) {
            if(thingDescription.actions[action].input.type) continue;
            else if(!thingDescription.actions[action].input.type && !filters.acceptedTypes.includes("null")) continue;
        }
        // filter interactions with unwanted annotations
        if(filters.forbiddenAnnotations) {
            let forbiddenFound = false;
            for(let annotation of actionAnnotations) {
                if(filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === "action-invoke")) {
                    forbiddenFound = true;
                    break;
                }
            }
            if(forbiddenFound) continue;
        }
        // filter unwanted interactions
        if(filters.forbiddenInteractions) {
            if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                inter.name === action && inter.type === "action-invoke")) continue;
        }
        actions.push({
            interactionType: "action-invoke",
            name: action,
            object: thingDescription.actions[action],
            from: "Agent",
            to: thingDescription.title,
            id: Crypto.createHash("sha1").update(thingDescription.id+action).digest("hex"),
            thingId: thingDescription.id
        });
    }
    return { "actions": actions, "properties": propertyWrites };
}

/** filter a list of outputs to match a given input (event or property_read) */
async function getMatchingOutputs(
    input: MAGE.InputInteractionInterface, 
    outputs: MAGE.InteractionInterface[], 
    filters: MAGE.FiltersInterface) {
        if (filters.onlySameType) {
            outputs = outputs.filter(element => Filters.sameType(input, element));
        }
        if (filters.similarityThreshold) {
            // since filter cannot by async, we have to filter manually.
            let newOutputs: MAGE.InteractionInterface[] = [];
            for (let element of outputs) {
                let filterResults = await Filters.similar(input, element, filters.similarityThreshold);
                if (filterResults) newOutputs.push(element);
            }
            return newOutputs;
        }
        if (filters.semanticMatch) {
            outputs = outputs.filter(element => Filters.sameSemantics(input, element));
        }
    return outputs;
}
/** for a list of inputs, return all possible input/output combinations */
function getFinalCombinations(inputs: MAGE.InputInteractionInterface[], form: MAGE.GenerationFormInterace) {
    let interactionCombinations: MAGE.InteractionInterface[][] = [];
    // calculate all input combinations
    let allInputCombinations: MAGE.InputInteractionInterface[][] = [];
    for (let i = form.minInputs; i <= form.maxInputs; i++) {
        if (i > inputs.length) break;
        allInputCombinations.push(...Combinatorics.bigCombination(inputs, i).toArray());
    }
    // filter input combinations that have more things than allowed
    if(form.maxThings && form.maxThings > 0) allInputCombinations = allInputCombinations.filter(inputs_c => {if(form.maxThings) return getNumberOfThings(inputs_c) <= form.maxThings});
    // filtering of mixed template inputs
    if(!form.filters.allowMixedTemplates)  allInputCombinations = allInputCombinations.filter(inputs_c => {return isMixedInputTemplate(inputs_c)});

    allInputCombinations.forEach(inputs_c => {
        let availableOutputs: MAGE.InteractionInterface[][][] = [];
        inputs_c.forEach(input => {if(input.matchingOutputCombinations) availableOutputs.push(input.matchingOutputCombinations);}) 
        Utils.modifiedCartesianProduct(...availableOutputs)
        .filter(outputs_c => (outputs_c.length <= form.maxOutputs) && (outputs_c.length >= form.minOutputs))
        .forEach(outputs_c => {
            interactionCombinations.push([...inputs_c, ...outputs_c]);
        });
    })
    // filter final combinations that have more things than allowed
    if (form.maxThings && form.maxThings > 0) interactionCombinations = interactionCombinations.filter( mashup => {if(form.maxThings) return getNumberOfThings(mashup) <= form.maxThings});
    // filter based on must-have interactions
    if (form.filters.mustHaveInteractions && form.filters.mustHaveInteractions.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if(form.filters.mustHaveInteractions) return mashupIncludesInteractions(mashup, form.filters.mustHaveInteractions)});
    }
    //filter-based on must-have annotations
    if(form.filters.mustHaveAnnotations && form.filters.mustHaveAnnotations.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if(form.filters.mustHaveAnnotations) return mashupIncludesAnnotations(mashup, form.filters.mustHaveAnnotations)});
    }
    //filter-based on must-have TD annotations
    if(form.filters.mustHaveTdAnnotations && form.filters.mustHaveTdAnnotations.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if(form.filters.mustHaveTdAnnotations) return mashupIncludesTdAnnotations(mashup, form.filters.mustHaveTdAnnotations, form)});
    }
    return interactionCombinations;
}

function mashupIncludesInteractions(mashup: MAGE.InteractionInterface[], mustHaveInteractions: MAGE.VueInteractionInterface[]): boolean {
    let isIncluded: boolean = true;
    for(let mustHaveInteraction of mustHaveInteractions) {
        for(let [index, interaction] of mashup.entries()) {
            if(interaction.thingId ===  mustHaveInteraction.thingId && interaction.name === mustHaveInteraction.name &&
                interaction.interactionType === mustHaveInteraction.type) break;
            if(index === mashup.length-1) isIncluded = false;
        }
    }
    return isIncluded;
}

function mashupIncludesTdAnnotations(mashup: MAGE.InteractionInterface[],
    mustHaveTdAnnotations: MAGE.VueAnnotationInterface[], form: MAGE.GenerationFormInterace): boolean {
        let isIncluded: boolean = true;
        for(let mustHaveTdAnnotation of mustHaveTdAnnotations) {
            innerloop:for(let [index, interaction] of mashup.entries()) {
                let resultTd: WADE.TDElementInterface | WADE.MashupElementInterface | undefined = undefined;
                let parsedTd = null;
                let types: string | string[] | undefined = undefined;
                switch(interaction.interactionType) {
                    case "property-read":
                    case "action-read":
                    case "event-subscribe":
                        resultTd = form.things.inputs.find(td => {if(td.content) return JSON.parse(td.content).id === interaction.thingId});
                        if(resultTd && resultTd.content) parsedTd = JSON.parse(resultTd.content);
                        if(parsedTd) types = parsedTd["@type"];
                        if(!types) types = [];
                        if(typeof types === "string") types = [types];
                        if(types.includes(mustHaveTdAnnotation.annotation)) break innerloop; 
                        break;

                    case "property-write":
                    case "action-invoke":
                        resultTd = form.things.outputs.find(td => {if(td.content) return JSON.parse(td.content).id === interaction.thingId});
                        if(resultTd && resultTd.content) parsedTd = JSON.parse(resultTd.content);
                        if(parsedTd) types = parsedTd["@type"];
                        if(!types) types = [];
                        if(typeof types === "string") types = [types];
                        if(types.includes(mustHaveTdAnnotation.annotation)) break innerloop;
                        break;
                }
                if(index === mashup.length-1) isIncluded = false;
            }
            if(!isIncluded) return isIncluded;
        }
        return isIncluded;
}

function mashupIncludesAnnotations(mashup: MAGE.InteractionInterface[],
    mustHaveAnnotations: MAGE.VueAnnotationInterface[]): boolean {
        let isIncluded: boolean = true;
        for(let mustHaveAnnotation of mustHaveAnnotations) {
            for(let [index, interaction] of mashup.entries()) {
                let interactionAnnotations = interaction.object["@type"];
                if(!interactionAnnotations) interactionAnnotations = [];
                if(typeof interactionAnnotations === "string") interactionAnnotations = [interactionAnnotations];
                if(interactionAnnotations.some(a => {return mustHaveAnnotation.annotation === a &&
                    mustHaveAnnotation.type === interaction.interactionType })) break;
                if(index === mashup.length-1) isIncluded = false;
            }
            if(!isIncluded) return isIncluded;
        }
        return isIncluded;
}

function isMixedInputTemplate(inputs: MAGE.InputInteractionInterface[]): boolean {
    let template: string = "";
    for(let [index, input] of inputs.entries()) {
        if(index === 0) {template = input.interactionType; continue;}
        if(input.interactionType !== template) return false;
        if(index === inputs.length - 1) return true;
    }
    return true;
}

/** Returns the number of Things that participate in a given list on interactions */
function getNumberOfThings(interactions: MAGE.InteractionInterface[]) {
    let thingIds: string[] = [];
    interactions.forEach(inter => {
        if (!thingIds.includes(inter.thingId)) thingIds.push(inter.thingId);
    })
    return thingIds.length;
}

/** Generate PlantUML textual code for a mashup
 * 
 * @param {Array} interactions - Array of interaction (ie: a mashup)
 */
function generateMermaidSeqDiagram(mashupObject: {mashupName: string, interactions: MAGE.InteractionInterface[], numberOfInputInteractions: number, numberOfOutputInteractions: number}) {
    let seqDiagram = "sequenceDiagram\n";
    let interactions = mashupObject.interactions;
    let inputsDone = 0;
    let outputsDone = 0;
    interactions.forEach( interaction => {
        // Determine interaction label and return path
        if (interaction.interactionType === "property-read") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : readProperty: "${interaction.name}"\n`;
            inputsDone++;
        } 
        else if (interaction.interactionType === "action-read") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : invokeAction: "${interaction.name}"\n`;
            inputsDone++;
        }
        else if (interaction.interactionType === "event-subscribe") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : subscribeEvent: "${interaction.name}"\n`;
            inputsDone++;          
        }
        else if (interaction.interactionType === "property-observe") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : observeProperty: "${interaction.name}"\n`;
            inputsDone++;          
        }
        else if (interaction.interactionType === "property-write") {
            if(outputsDone == 0) seqDiagram += `par\n`;
            if(outputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->> ${interaction.to} : writeProperty: "${interaction.name}"\n`;
            outputsDone++;
            if(outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        }    
        else if(interaction.interactionType === "action-invoke") {
            if(outputsDone == 0) seqDiagram += `par\n`;
            if(outputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->> ${interaction.to} : invokeAction: "${interaction.name}"\n`;
            outputsDone++;
            if(outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        }
        
        
        // determine return path
        if (interaction.interactionType === "property-read") {
            seqDiagram += `${interaction.to} -->>- ${interaction.from} : response\n`;
            if(inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === "event-subscribe" || interaction.interactionType === "property-observe") {
            seqDiagram += `${interaction.to} -->> ${interaction.from} : confirmation\n`;
            seqDiagram += `${interaction.to} ->>- ${interaction.from} : data-pushed\n`;
            if(inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === "action-read") {
            seqDiagram += `${interaction.to} -->>- ${interaction.from} : output\n`;
            if(inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        }
    });
    seqDiagram += "\n";
    return seqDiagram
}

function generatePlantUmlSeqDiagram(mashupObject: {mashupName: string, interactions: MAGE.InteractionInterface[], numberOfInputInteractions: number, numberOfOutputInteractions: number}) {
    let seqDiagram = `@startuml ${mashupObject.mashupName}\n`;
    seqDiagram+=`[->"Agent": top:${mashupObject.mashupName}()\nactivate "Agent"\n`;
    seqDiagram+="group strict\n"
    let interactions = mashupObject.interactions;
    let inputsDone = 0;
    let outputsDone = 0;
    interactions.forEach( interaction => {
        // Determine interaction label and return path
        if (interaction.interactionType === "property-read") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : readProperty: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;
        } 
        else if (interaction.interactionType === "action-read") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : invokeAction: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;
        }
        else if (interaction.interactionType === "event-subscribe") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : subscribeEvent: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;          
        }
        else if (interaction.interactionType === "property-observe") {
            if(inputsDone == 0) seqDiagram += `par\n`;
            if(inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : observeProperty: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;          
        }
        else if (interaction.interactionType === "property-write") {
            if(outputsDone == 0) seqDiagram += `par\n`;
            if(outputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : writeProperty: "${interaction.name}"\n`;
            outputsDone++;
            if(outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        }    
        else if(interaction.interactionType === "action-invoke") {
            if(outputsDone == 0) seqDiagram += `par\n`;
            if(outputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : invokeAction: "${interaction.name}"\n`;
            outputsDone++;
            if(outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        }
        
        
        // determine return path
        if (interaction.interactionType === "property-read") {
            seqDiagram += `"${interaction.to}" --> "${interaction.from}" : response\n`;
            seqDiagram += `deactivate "${interaction.to}"\n`
            if(inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === "event-subscribe" || interaction.interactionType === "property-observe") {
            seqDiagram += `"${interaction.to}" --> "${interaction.from}" : confirmation\n`;
            seqDiagram += `"${interaction.to}" ->> "${interaction.from}" : data-pushed\n`;
            if(inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === "action-read") {
            seqDiagram += `"${interaction.to}" --> "${interaction.from}" : response\n`;
            seqDiagram += `deactivate "${interaction.to}"\n`
            if(inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        }
    });
    seqDiagram+=`end\n[<-"Agent"\ndeactivate "Agent"\n`;
    seqDiagram += "@enduml\n";
    return seqDiagram
}

/** calculate size of design space ( how many mashups would be possible without any rules or filters ) */
function getDesignSpaceSize(generationForm: MAGE.GenerationFormInterace) {
    let designSpaceSize = 0;
    let n = 0;
    let things = generationForm.things;

    let tdIds: string[] = [];
    let uniqueTds: WADE.TDElementInterface[] = [];
    things.inputs.concat(things.outputs).forEach(td => {
        if (!tdIds.includes(td.id)) {
            uniqueTds.push(td);
            tdIds.push(td.id);
        }
    })

    uniqueTds.forEach(element => {
        let parsedTd: ThingDescription;
        if(!element.content) return;
        parsedTd = JSON.parse(element.content);
        if (parsedTd.properties) n += Object.keys(parsedTd.properties).length;
        if (parsedTd.actions) n += Object.keys(parsedTd.actions).length;
        if (parsedTd.events) n += Object.keys(parsedTd.events).length;
    })

    let max_k = Number(generationForm.maxInputs) + Number(generationForm.maxOutputs);
    let min_k =  Number(generationForm.minInputs) + Number(generationForm.minOutputs);
    if (max_k > n) max_k = n;
    for (let i = min_k; i <= max_k; i++) {
        designSpaceSize += (Utils.factorial(n)/(Utils.factorial(i) * Utils.factorial(n - i)));
    }

    return designSpaceSize;
}

/** Main function to generate mashups. Calls all other functions. */
export default async function generateMashups(generationForm: MAGE.GenerationFormInterace) {
    let interactionCombinations = await generateInteractionCombinations(generationForm);
    let designSpaceSize = getDesignSpaceSize(generationForm);

    let totalMashups =  interactionCombinations.length;
    console.log(`${totalMashups} mashups can be generated from given parameters. Design space size is: ${designSpaceSize}`);

    let imagesMDs: string[] = [];
    let plantUmls: string[] = [];
    for (let combi of interactionCombinations) {
        let numberOfInputInteractions = 0;
        let numberOfOutputInteractions = 0;
        for(let interaction of combi) {
            switch(interaction.interactionType) {
                case "property-read":
                case "event-subscribe":
                case "action-read":
                case "property-observe":
                    numberOfInputInteractions++; break;
                case "property-write":
                case "action-invoke":
                    numberOfOutputInteractions++; break;
            }
        }
        let combiObject = {
            mashupName: generationForm.mashupName,
            interactions: combi,
            numberOfInputInteractions: numberOfInputInteractions,
            numberOfOutputInteractions: numberOfOutputInteractions
        }
        let mermaidUml = generateMermaidSeqDiagram(combiObject);
        imagesMDs.push(mermaidUml);
        let plantUml = generatePlantUmlSeqDiagram(combiObject);
        plantUmls.push(plantUml);
     }

    let results = {
        designSpaceSize: designSpaceSize,
        mashupsGenerated: totalMashups,
        imagesMDs: imagesMDs,
        plantUmls: plantUmls,
        mashups: interactionCombinations ,
    };

    return results;
}

/**
 * Class
 */
export class GenerationForm implements MAGE.GenerationFormInterace {
    public mashupName: string;
    public things: {
        inputs: WADE.TDElementInterface[]
        outputs: WADE.TDElementInterface[]
    };
    public minInputs: number;
    public  maxInputs: number;
    public  minOutputs: number;
    public  maxOutputs: number;
    public  maxThings: number | null;
    public  templates: {
        "use-event-template": boolean;
        "use-action-template": boolean;
        "use-read-template": boolean;
    };
    public filters: {
          acceptedTypes: string[],
          allowMixedTemplates: boolean,
          acceptedOutputInteractionTypes: string[],
          onlySameType: boolean,
          onlySimilarNames: boolean,
          similarityThreshold: number | null,
          semanticMatch: boolean
    };
    public generation: {
          generateCode: boolean,
          includeFunctionSkeletons: boolean
    }
    constructor() {
        this.mashupName="";
        this.things = {
            inputs: [],
            outputs: [],
        };
        this.minInputs = 1,
        this.maxInputs = 2,
        this.minOutputs = 1,
        this.maxOutputs = 2,
        this.maxThings = null,
        this.templates = {
            "use-event-template": true,
            "use-action-template": false,
            "use-read-template": true,
        },
        this.filters = {
            acceptedTypes: [],
            acceptedOutputInteractionTypes: [],
            onlySameType: false,
            onlySimilarNames: false,
            similarityThreshold: null,
            semanticMatch: false,
            allowMixedTemplates: false,
        
        },
        this.generation = {
            generateCode: false,
            includeFunctionSkeletons: false
        }
    }
}
