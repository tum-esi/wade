"use strict";

// import Plantuml from "plantuml-encoder";
import Combinatorics from 'js-combinatorics';
import _ from "lodash";
const Request = require('request').defaults({ encoding: null })
import Crypto from "crypto";
import * as Filters from "./filters";
import * as Utils from "./utils";
import { ThingDescription } from 'wot-typescript-definitions';

/** generate all the possible combinations of interactions for a given list of things and a given length */ 
async function generateInteractionCombinations(generationForm: MAGE.GenerationFormInterace) {
    let things = generationForm.things;
    let filters = generationForm.filters;
    let templates = generationForm.templates;

    let events:         MAGE.InputInteractionInterface[] = []
    let propertyReads:  MAGE.InputInteractionInterface[] = []
    let actionReads:    MAGE.InputInteractionInterface[] = []
    let propertyWrites: MAGE.InteractionInterface[] = []
    let actions:        MAGE.InteractionInterface[] = []
    
    // get and categorize all input interactions
    things.inputs.forEach( thingDescription => {
        if(!thingDescription.content) return;
        let parsedTd: ThingDescription = JSON.parse(thingDescription.content);
        let interactions = getInputInteractions(parsedTd, filters);
        events.push(...interactions.events);
        propertyReads.push(...interactions.properties);
        actionReads.push(...interactions.actions);
    })

    // get and categorize all output interactions
    things.outputs.forEach( thingDescription => {
        if(!thingDescription.content) return;
        let parsedTd: ThingDescription = JSON.parse(thingDescription.content);
        let interactions = getOutputInteractions(parsedTd, filters);
        actions.push(...interactions.actions);
        propertyWrites.push(...interactions.properties);
    });
    // TODO: add possibility to only select actions or property writes
    let outputs = [...propertyWrites, ...actions];

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
    // remove inputs without matching outputs
    events = events.filter(event => event.matchingOutputCombinations && event.matchingOutputCombinations.length > 0);
    propertyReads = propertyReads.filter(property => property.matchingOutputCombinations && property.matchingOutputCombinations.length > 0);
    actionReads = actionReads.filter(action => action.matchingOutputCombinations && action.matchingOutputCombinations.length > 0);

    // Calculate all possible output combinations for each input combinations and put them together
    let interactionCombinations: MAGE.InteractionInterface[][] = [];
    
    if (templates["use-sub-template"] && !templates["use-event-template"] && !templates["use-action-template"]) {
        interactionCombinations.push(...getFinalCombinations(events, generationForm));
    } else if (templates["use-event-template"] && !templates["use-sub-template"] && !templates["use-action-template"]) {
        interactionCombinations.push(...getFinalCombinations(propertyReads, generationForm));
    } else if (templates["use-event-template"] && templates["use-sub-template"] && !templates["use-action-template"]) {
        interactionCombinations.push(...getFinalCombinations([...events, ...propertyReads], generationForm));
    } else if (templates["use-event-template"] && templates["use-action-template"] && !templates["use-sub-template"]) {
        interactionCombinations.push(...getFinalCombinations([...actionReads, ...propertyReads], generationForm));
    } else if (templates["use-sub-template"] && !templates["use-action-template"] && !templates["use-event-template"]) {
        interactionCombinations.push(...getFinalCombinations([...events, ...actionReads], generationForm));
    } else if (templates["use-sub-template"] && templates["use-action-template"] && templates["use-event-template"]) {
        interactionCombinations.push(...getFinalCombinations([...events, ...actionReads, ...propertyReads], generationForm));
    }

    return interactionCombinations;
}

/** parse a TD to return all interactions that can serve as an input */
function getInputInteractions(thingDescription: ThingDescription, filters: MAGE.FiltersInterface) {
    let events: MAGE.InputInteractionInterface[] = [];
    let propertyReads: MAGE.InputInteractionInterface[] = [];
    let actionReads: MAGE.InputInteractionInterface[] = [];
    for (let prop in thingDescription.properties) {
        if (!thingDescription.properties[prop].writeOnly) {
            // filter based on accepted types
            if (filters.acceptedTypes) {
                if (!filters.acceptedTypes.includes(thingDescription.properties[prop].type)) continue;
            }
            // filter unwanted interactions
            if(filters.forbiddenInteractions) {
                if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                    inter.name === prop && inter.type === "property-read")) continue;
            } 
            propertyReads.push({
                interactionType: "property-read", 
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
        // filter based on accepted types
        if (filters.acceptedTypes) {
            if (!thingDescription.events[event].data || !filters.acceptedTypes.includes(thingDescription.events[event].data.type)) continue;
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
        if (!thingDescription.actions[action].output) continue
        if (filters.acceptedTypes) {
            if (!filters.acceptedTypes.includes(thingDescription.actions[action].output.type)) continue
        }
        // filter unwanted interactions
        if(filters.forbiddenInteractions) {
            if(filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id && 
                inter.name === action && inter.type === "action-invoke")) continue;
        }
        actionReads.push({
            interactionType: "action-invoke",
            name: action,
            object: thingDescription.actions[action],
            from: "Agent",
            to: thingDescription.title,
            thingId: thingDescription.id,
            id: ""
        });
    }
    return { "events": events, "properties": propertyReads, "actions": actionReads };
}

/** parse a TD to return all interactions that can serve as an output */
function getOutputInteractions(thingDescription, filters: MAGE.FiltersInterface) {
    let actions: MAGE.InteractionInterface[] = [];
    let propertyWrites: MAGE.InteractionInterface[] = [];
    for (let prop in thingDescription.properties) {
        if (!thingDescription.properties[prop].readOnly) {
            // filter based on accepted types
            if (filters.acceptedTypes) {
                if (!filters.acceptedTypes.includes(thingDescription.properties[prop].type)) continue;
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
        // filter based on accepted types
        if (filters.acceptedTypes) {
            if (!thingDescription.actions[action].input || !filters.acceptedTypes.includes(thingDescription.actions[action].input.type)) continue
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
    if(form.maxThings) allInputCombinations = allInputCombinations.filter(inputs_c => {if(form.maxThings) getNumberOfThings(inputs_c) <= form.maxThings});
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
    if (form.maxThings) interactionCombinations = interactionCombinations.filter(ios_c => {if(form.maxThings) getNumberOfThings(ios_c) <= form.maxThings});
    return interactionCombinations;
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
function generateMermaidSeqDiagram(interactions: MAGE.InteractionInterface[]) {
    let seqDiagram = "sequenceDiagram\n";
    interactions.forEach( interaction => {
        // Determine interaction label and return path
        if (interaction.interactionType === "property-read")
            seqDiagram += `${interaction.from} ->> ${interaction.to} : read: "${interaction.name}"\n`;
        else if (interaction.interactionType === "property-write")
            seqDiagram += `${interaction.from} ->> ${interaction.to} : write: "${interaction.name}"\n`;
        else if (interaction.interactionType === "action-invoke")
            seqDiagram += `${interaction.from} ->> ${interaction.to} : invoke: "${interaction.name}"\n`;
        else if (interaction.interactionType === "event-subscribe")
            seqDiagram += `${interaction.from} ->> ${interaction.to} : subscribe: "${interaction.name}"\n`;
        
        // determine return path
        if (interaction.interactionType === "property-read") {
            seqDiagram += `activate ${interaction.to}\n`;
            seqDiagram += `${interaction.to} -->> ${interaction.from} : response\n`;
            seqDiagram += `deactivate ${interaction.to}\n`;
        } else if (interaction.interactionType === "event-subscribe") {
            seqDiagram += `activate ${interaction.to}\n`;
            seqDiagram += `${interaction.to} -->> ${interaction.from} : event-triggered\n`;
            seqDiagram += `deactivate ${interaction.to}\n`;
        }
    });
    seqDiagram += "\n";
    return seqDiagram
}

/** calculate size of design space ( how many mashups would be possible without any rules or filters ) */
function getDesignSpaceSize(generationForm: MAGE.GenerationFormInterace) {
    let designSpaceSize = 0;
    let n = 0;
    let things = generationForm.things;

    let tdIds: string[] = [];
    let uniqueTds:( WADE.TDElementInterface | WADE.MashupElementInterface)[] = [];
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
    console.log(interactionCombinations);
    let designSpaceSize = getDesignSpaceSize(generationForm);

    let totalMashups =  interactionCombinations.length;
    console.log(`${totalMashups} mashups can be generated from given parameters. Design space size is: ${designSpaceSize}`);

    let imagesMDs: string[] = [];
    for (let combi of interactionCombinations) {
       let uml = generateMermaidSeqDiagram(combi);
       imagesMDs.push(uml);
     }

    let results = {
        designSpaceSize: designSpaceSize,
        mashupsGenerated: totalMashups,
        imagesMDs: imagesMDs,
        mashups: interactionCombinations ,
    };

    return results;
}

