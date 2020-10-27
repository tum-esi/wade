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
    // remove inputs without matching outputs
    events = events.filter(event => event.matchingOutputCombinations && event.matchingOutputCombinations.length > 0);
    propertyReads = propertyReads.filter(property => property.matchingOutputCombinations && property.matchingOutputCombinations.length > 0);
    actionReads = actionReads.filter(action => action.matchingOutputCombinations && action.matchingOutputCombinations.length > 0);

    // Calculate all possible output combinations for each input combinations and put them together
    let interactionCombinations: MAGE.InteractionInterface[][] = [];
    
    let interactionsToCombine: MAGE.InputInteractionInterface[] = []
    for(let template in templates) {
        switch(template) {
            case "use-event-template": if(templates[template]) interactionsToCombine.push(...events); break;
            case "use-read-template": if(templates[template]) interactionsToCombine.push(...propertyReads); break;
            case "use-action-template": if(templates[template]) interactionsToCombine.push(...actionReads); break;
        }
    }

    interactionCombinations.push(...getFinalCombinations(interactionsToCombine, generationForm));
    
    // if (templates["use-event-template"] && !templates["use-read-template"] && !templates["use-action-template"]) {
    //     interactionCombinations.push(...getFinalCombinations(events, generationForm));
    // } else if (templates["use-read-template"] && !templates["use-sub-template"] && !templates["use-action-template"]) {
    //     interactionCombinations.push(...getFinalCombinations(propertyReads, generationForm));
    // } else if (templates["use-event-template"] && templates["use-sub-template"] && !templates["use-action-template"]) {
    //     interactionCombinations.push(...getFinalCombinations([...events, ...propertyReads], generationForm));
    // } else if (templates["use-event-template"] && templates["use-action-template"] && !templates["use-sub-template"]) {
    //     interactionCombinations.push(...getFinalCombinations([...actionReads, ...propertyReads], generationForm));
    // } else if (templates["use-sub-template"] && !templates["use-action-template"] && !templates["use-event-template"]) {
    //     interactionCombinations.push(...getFinalCombinations([...events, ...actionReads], generationForm));
    // } else if (templates["use-sub-template"] && templates["use-action-template"] && templates["use-event-template"]) {
    //     interactionCombinations.push(...getFinalCombinations([...events, ...actionReads, ...propertyReads], generationForm));
    // }

    return interactionCombinations;
}

/** parse a TD to return all interactions that can serve as an input */
function getInputInteractions(thingDescription: ThingDescription, filters: MAGE.FiltersInterface) {
    let events: MAGE.InputInteractionInterface[] = [];
    let propertyReads: MAGE.InputInteractionInterface[] = [];
    let actionReads: MAGE.InputInteractionInterface[] = [];
    for (let prop in thingDescription.properties) {

        let propAnnotations = thingDescription.properties[prop]['@type'];
        if(!propAnnotations) propAnnotations = [];
        if(typeof propAnnotations === "string") propAnnotations = [propAnnotations];

        if (!thingDescription.properties[prop].writeOnly) {
            if(!filters.acceptedTypes.includes(thingDescription.properties[prop].type)) {
                if(thingDescription.properties[prop].type) continue;
                else if(!thingDescription.properties[prop].type && !filters.acceptedTypes.includes("null")) continue;
            }
            // filter interactions with unwanted annotations
            if(filters.forbiddenAnnotations) {
                let forbiddenFound = false;
                for(let annotation of propAnnotations) {
                    if(filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === "property-read")) {
                        forbiddenFound = true;
                        break;
                    }
                }
                if(forbiddenFound) continue;
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
    return { "events": events, "properties": propertyReads, "actions": actionReads };
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

        // filter based on accepted types
        // if (!thingDescription.actions[action].input || !filters.acceptedTypes.includes(thingDescription.actions[action].input.type)) continue
        
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

function mashupIncludesAnnotations(mashup: MAGE.InteractionInterface[],
    mustHaveAnnotations: MAGE.VueAnnotationInterface[]): boolean {
        let isIncluded: boolean = true;
        for(let mustHaveAnnotation of mustHaveAnnotations) {
            for(let [index, interaction] of mashup.entries()) {
                let interactionAnnotations = interaction.object["@type"];
                if(typeof interactionAnnotations === "undefined") interactionAnnotations = [];
                if(typeof interactionAnnotations === "string") interactionAnnotations = [interactionAnnotations];
                if(interactionAnnotations.some(a => {return mustHaveAnnotation.annotation === a &&
                    mustHaveAnnotation.type === interaction.interactionType })) break;
                if(index === mashup.length-1) isIncluded = false;
            }
        }
        return isIncluded;
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
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : read: "${interaction.name}"\n`;
        else if (interaction.interactionType === "property-write")
            seqDiagram += `${interaction.from} ->> ${interaction.to} : write: "${interaction.name}"\n`;
        else if (interaction.interactionType === "action-read")
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : invoke: "${interaction.name}"\n`;
        else if (interaction.interactionType === "event-subscribe")
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : subscribe: "${interaction.name}"\n`;
        else if(interaction.interactionType === "action-invoke")
        seqDiagram += `${interaction.from} ->> ${interaction.to} : invoke: "${interaction.name}"\n`;
        
        // determine return path
        if (interaction.interactionType === "property-read") {
            seqDiagram += `${interaction.to} -->>- ${interaction.from} : response\n`;
        } else if (interaction.interactionType === "event-subscribe") {
            seqDiagram += `${interaction.to} -->>- ${interaction.from} : event-triggered\n`;
        } else if (interaction.interactionType === "action-read") {
            seqDiagram += `${interaction.to} -->>- ${interaction.from} : output\n`;
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
    let uniqueTds:(WADE.TDElementInterface | WADE.MashupElementInterface)[] = [];
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

