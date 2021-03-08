'use strict';
import Combinatorics from 'js-combinatorics';
import _ from 'lodash';
import Crypto from 'crypto';
import * as Filters from './filters';
import * as Utils from './utils';
import { hrtime } from 'process';

/**
 * Generate all the possible combinations of interactions for a given list of things and a given length
 * @param {MAGE.GenerationFormInterface} generationForm an object that contains all required parameters.
 * @returns {MAGE.InteractionInterface[][]} a 2-dimensional array containing all input-output interaction combinations
 */
async function generateInteractionCombinations(generationForm: MAGE.GenerationFormInterface): Promise<MAGE.InteractionInterface[][]> {
    const things = generationForm.things;
    const filters = generationForm.filters;
    const templates = generationForm.templates;

    let events: MAGE.InputInteractionInterface[] = [];
    let propertyReads: MAGE.InputInteractionInterface[] = [];
    let propertyObservations: MAGE.InputInteractionInterface[] = [];
    let actionReads: MAGE.InputInteractionInterface[] = [];
    const propertyWrites: MAGE.InteractionInterface[] = [];
    const actions: MAGE.InteractionInterface[] = [];

    // get and categorize all input interactions
    things.inputs.forEach( thingDescription => {
        let forbiddenAnnotationFound =  false;
        if (!thingDescription.content) return;
        const parsedTd: any = JSON.parse(thingDescription.content);
        let types: string | string[] | undefined = parsedTd['@type'];
        if (!types) types = [];
        if (typeof types === 'string') types = [types];
        // check if the TD is annotated using a forbidden annotation
        for (const type of types) {
            if (filters.forbiddenTdAnnotations && filters.forbiddenTdAnnotations.some(a => a.annotation === type))
            forbiddenAnnotationFound = true; break;
        }
        // add interactions of TD if TD is not annotated with forbidden annotations
        if (!forbiddenAnnotationFound) {
            const interactions = getInputInteractions(parsedTd, filters);
            events.push(...interactions.events);
            propertyReads.push(...interactions.properties);
            actionReads.push(...interactions.actions);
            propertyObservations.push(...interactions.observations);
        }
    });

    // get and categorize all output interactions
    let forbiddenAnnotationFound =  false;
    things.outputs.forEach( thingDescription => {
        if (!thingDescription.content) return;
        const parsedTd: any = JSON.parse(thingDescription.content);
        let types: string | string[] | undefined = parsedTd['@type'];
        if (!types) types = [];
        if (typeof types === 'string') types = [types];
        // check if the TD is annotated using a forbidden annotation
        for (const type of types) {
            if (filters.forbiddenTdAnnotations && filters.forbiddenTdAnnotations.some(a => a.annotation === type))
            forbiddenAnnotationFound = true; break;
        }
        // add interactions of TD if TD is not annotated with forbidden annotations
        if (!forbiddenAnnotationFound) {
            const interactions = getOutputInteractions(parsedTd, filters);
            actions.push(...interactions.actions);
            propertyWrites.push(...interactions.properties);
        }
    });

    // filter output interactions based on their types (propertyWrites and/or actionInvokes)
    const outputs: MAGE.InteractionInterface[] = [];
    if (filters.acceptedOutputInteractionTypes.includes('property-write')) outputs.push(...propertyWrites);
    if (filters.acceptedOutputInteractionTypes.includes('action-invoke')) outputs.push(...actions);

    // for each input, get matching outputs based on filters
    async function getMatchingOutputCombinations(input: MAGE.InputInteractionInterface) {
        const matchingOutputs = await getMatchingOutputs(input, outputs, filters);
        const matchingOutputCombinations: MAGE.InteractionInterface[][] = [];
        for (let i = generationForm.minOutputs; i <= generationForm.maxOutputs; i++) {
            if (i > matchingOutputs.length) break;
            matchingOutputCombinations.push(...Combinatorics.bigCombination(matchingOutputs, i).toArray());
        }
        return matchingOutputCombinations;
    }

    for (const input of events) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    for (const input of propertyReads) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    for (const input of actionReads) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    for (const input of propertyObservations) {
        input.matchingOutputCombinations = await getMatchingOutputCombinations(input);
    }
    // remove inputs without matching outputs
    events = events.filter(event => event.matchingOutputCombinations && event.matchingOutputCombinations.length > 0);
    propertyReads = propertyReads.filter(property => property.matchingOutputCombinations && property.matchingOutputCombinations.length > 0);
    actionReads = actionReads.filter(action => action.matchingOutputCombinations && action.matchingOutputCombinations.length > 0);
    propertyObservations = propertyObservations.filter(observation => observation.matchingOutputCombinations && observation.matchingOutputCombinations.length > 0);

    // Calculate all possible output combinations for each input combinations and put them together
    const interactionCombinations: MAGE.InteractionInterface[][] = [];

    const interactionsToCombine: MAGE.InputInteractionInterface[] = [];
    for (const template in templates) {
        switch (template) {
            case 'use-event-template':
                if (templates[template]) {
                    interactionsToCombine.push(...events);
                    interactionsToCombine.push(...propertyObservations);
                }
                break;
            case 'use-read-template': if (templates[template]) interactionsToCombine.push(...propertyReads); break;
            case 'use-action-template': if (templates[template]) interactionsToCombine.push(...actionReads); break;
        }
    }

    interactionCombinations.push(...getFinalCombinations(interactionsToCombine, generationForm));
    return interactionCombinations;
}

/** Parses a TD to return all interactions that can serve as an input
 * 
 * @param  thingDescription a parsed JSON object representing the TD
 * @param {MAGE.FiltersInterface} filters an object containing the filters and constraints which were defined in the generation form
 * @returns {{ events: MAGE.InputInteractionInterface[], properties: MAGE.InputInteractionInterface[], actions: MAGE.InputInteractionInterface[], observations: MAGE.InputInteractionInterface[] }} an object containing four arrays of all input interaction found in the TD that conform to the specified constraints
 */
function getInputInteractions(thingDescription: any, filters: MAGE.FiltersInterface): { events: MAGE.InputInteractionInterface[]; properties: MAGE.InputInteractionInterface[]; actions: MAGE.InputInteractionInterface[]; observations: MAGE.InputInteractionInterface[]; } {
    const events: MAGE.InputInteractionInterface[] = [];
    const propertyReads: MAGE.InputInteractionInterface[] = [];
    const propertyObservations: MAGE.InputInteractionInterface[] = [];
    const actionReads: MAGE.InputInteractionInterface[] = [];
    // check property interaction affordances
    for (const prop in thingDescription.properties) {
        let dontAddRead = false;
        let dontAddObserve = false;

        // extract annotations
        let propAnnotations = thingDescription.properties[prop]['@type'];
        if (!propAnnotations) propAnnotations = [];
        if (typeof propAnnotations === 'string') propAnnotations = [propAnnotations];

        // filter based on accepted types
        if (!thingDescription.properties[prop].writeOnly) {
            if (!filters.acceptedTypes.includes(thingDescription.properties[prop].type)) {
                if (thingDescription.properties[prop].type) continue;
                else if (!thingDescription.properties[prop].type && !filters.acceptedTypes.includes('null')) continue;
            }
            // filter interactions with unwanted annotations
            if (filters.forbiddenAnnotations) {
                let forbiddenReadFound = false;
                let forbiddenObserveFound = false;
                for (const annotation of propAnnotations) {
                    if (filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === 'property-read')) {
                        forbiddenReadFound = true;
                        break;
                    }
                }
                for (const annotation of propAnnotations) {
                    if (filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === 'property-observe')) {
                        forbiddenObserveFound = true;
                        break;
                    }
                }
                if (forbiddenReadFound) dontAddRead = true;
                if (forbiddenObserveFound) dontAddObserve = true;
            }
            // filter unwanted interactions
            if (filters.forbiddenInteractions) {
                if (filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id &&
                    inter.name === prop && inter.type === 'property-read')) dontAddRead = true;
                if (filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id &&
                        inter.name === prop && inter.type === 'property-observe')) dontAddObserve = true;
            }
            if (!dontAddRead) propertyReads.push({
                interactionType: 'property-read',
                name: prop,
                object: thingDescription.properties[prop],
                from: 'Agent',
                to: thingDescription.title,
                thingId: thingDescription.id,
                id: ''
            });
            if (thingDescription.properties[prop].observable && !dontAddObserve) propertyObservations.push({
                interactionType: 'property-observe',
                name: prop,
                object: thingDescription.properties[prop],
                from: 'Agent',
                to: thingDescription.title,
                thingId: thingDescription.id,
                id: ''
            });
        }
    }
    // check event interaction affordances
    for (const event in thingDescription.events) {

        // extract annotations
        let eventAnnotations = thingDescription.events[event]['@type'];
        if (!eventAnnotations) eventAnnotations = [];
        if (typeof eventAnnotations === 'string') eventAnnotations = [eventAnnotations];

        // filter based on accepted types
        if (!thingDescription.events[event].data && !filters.acceptedTypes.includes('null')) continue;
        else if (thingDescription.events[event].data && !filters.acceptedTypes.includes(thingDescription.events[event].data.type)) {
            if (thingDescription.events[event].data.type) continue;
            else if (!thingDescription.events[event].data.type && !filters.acceptedTypes.includes('null')) continue;
        }
        // filter interactions with unwanted annotations
        if (filters.forbiddenAnnotations) {
            let forbiddenFound = false;
            for (const annotation of eventAnnotations) {
                if (filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === 'event-subscribe')) {
                    forbiddenFound = true;
                    break;
                }
            }
            if (forbiddenFound) continue;
        }
        // filter unwanted interactions
        if (filters.forbiddenInteractions) {
            if (filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id &&
                inter.name === event && inter.type === 'event-subscribe')) continue;
        }
        events.push({
            interactionType: 'event-subscribe',
            name: event,
            object: thingDescription.events[event],
            from: 'Agent',
            to: thingDescription.title,
            thingId: thingDescription.id,
            id: ''
        });
    }
    // check action interaction affordances
    for (const action in thingDescription.actions) {

        // extract annotations
        let actionAnnotations = thingDescription.actions[action]['@type'];
        if (!actionAnnotations) actionAnnotations = [];
        if (typeof actionAnnotations === 'string') actionAnnotations = [actionAnnotations];

        // filter based on accepted types
        if (!thingDescription.actions[action].output && !filters.acceptedTypes.includes('null')) continue;
        else if (thingDescription.actions[action].output && !filters.acceptedTypes.includes(thingDescription.actions[action].output.type)) {
            if (thingDescription.actions[action].output.type) continue;
            else if (!thingDescription.actions[action].output.type && !filters.acceptedTypes.includes('null')) continue;
        }

        // filter interactions with unwanted annotations
        if (filters.forbiddenAnnotations) {
            let forbiddenFound = false;
            for (const annotation of actionAnnotations) {
                if (filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === 'action-read')) {
                    forbiddenFound = true;
                    break;
                }
            }
            if (forbiddenFound) continue;
        }

        // filter unwanted interactions
        if (filters.forbiddenInteractions) {
            if (filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id &&
                inter.name === action && inter.type === 'action-read')) continue;
        }

        actionReads.push({
            interactionType: 'action-read',
            name: action,
            object: thingDescription.actions[action],
            from: 'Agent',
            to: thingDescription.title,
            thingId: thingDescription.id,
            id: ''
        });
    }
    return { events, properties: propertyReads, actions: actionReads, observations: propertyObservations };
}

/** Parse a TD to return all interactions that can serve as an output
 * 
 * @param thingDescription a parsed JSON object representing the TD
 * @param {MAGE.FiltersInterface} filters an object containing the filters and constraints which were defined in the generation form
 * @returns {{ actions: MAGE.InteractionInterface[], properties: MAGE.InteractionInterface[] }} an object containing two arrays of all output interaction found in the TD that conform to the specified constraints
 */
function getOutputInteractions(thingDescription: any, filters: MAGE.FiltersInterface): { actions: MAGE.InteractionInterface[]; properties: MAGE.InteractionInterface[]; } {
    const actions: MAGE.InteractionInterface[] = [];
    const propertyWrites: MAGE.InteractionInterface[] = [];
    for (const prop in thingDescription.properties) {
        // extract annotations
        let propAnnotations = thingDescription.properties[prop]['@type'];
        if (!propAnnotations) propAnnotations = [];
        if (typeof propAnnotations === 'string') propAnnotations = [propAnnotations];

        if (!thingDescription.properties[prop].readOnly) {
            // filter based on accepted types
            if (!filters.acceptedTypes.includes(thingDescription.properties[prop].type)) {
                if (thingDescription.properties[prop].type) continue;
                else if (!thingDescription.properties[prop].type && !filters.acceptedTypes.includes('null')) continue;
            }
            // filter interactions with unwanted annotations
            if (filters.forbiddenAnnotations) {
                let forbiddenFound = false;
                for (const annotation of propAnnotations) {
                    if (filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === 'property-write')) {
                        forbiddenFound = true;
                        break;
                    }
                }
                if (forbiddenFound) continue;
            }

            // filter unwanted interactions
            if (filters.forbiddenInteractions) {
                if (filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id &&
                    inter.name === prop && inter.type === 'property-write')) continue;
            }

            propertyWrites.push({
                interactionType: 'property-write',
                name: prop,
                object: thingDescription.properties[prop],
                from: 'Agent',
                to: thingDescription.title,
                id: Crypto.createHash('sha1').update(thingDescription.id + prop).digest('hex'),
                thingId: thingDescription.id
            });
        }
    }

    for (const action in thingDescription.actions) {
        // extract annotations
        let actionAnnotations = thingDescription.actions[action]['@type'];
        if (!actionAnnotations) actionAnnotations = [];
        if (typeof actionAnnotations === 'string') actionAnnotations = [actionAnnotations];

        // filter based on accepted types
        if (!thingDescription.actions[action].input && !filters.acceptedTypes.includes('null')) continue;
        else if (thingDescription.actions[action].input && !filters.acceptedTypes.includes(thingDescription.actions[action].input.type)) {
            if (thingDescription.actions[action].input.type) continue;
            else if (!thingDescription.actions[action].input.type && !filters.acceptedTypes.includes('null')) continue;
        }

        // filter interactions with unwanted annotations
        if (filters.forbiddenAnnotations) {
            let forbiddenFound = false;
            for (const annotation of actionAnnotations) {
                if (filters.forbiddenAnnotations.some(a => a.annotation === annotation && a.type === 'action-invoke')) {
                    forbiddenFound = true;
                    break;
                }
            }
            if (forbiddenFound) continue;
        }

        // filter unwanted interactions
        if (filters.forbiddenInteractions) {
            if (filters.forbiddenInteractions.some(inter => inter.thingId === thingDescription.id &&
                inter.name === action && inter.type === 'action-invoke')) continue;
        }

        actions.push({
            interactionType: 'action-invoke',
            name: action,
            object: thingDescription.actions[action],
            from: 'Agent',
            to: thingDescription.title,
            id: Crypto.createHash('sha1').update(thingDescription.id + action).digest('hex'),
            thingId: thingDescription.id
        });
    }
    return { actions, properties: propertyWrites };
}

/** Filter a list of output affordances to match a given input affordance.
 * 
 * @param {MAGE.InputInteractionInterface} input the input affordance
 * @param {MAGE.InteractionInterface[]} outputs an array containing all output affordances
 * @param {MAGE.FiltersInterface} filters an object containing filters and constraints 
 * @returns {Promise<MAGE.InteractionInterface[]>} an array containing the filtered output affordances
 */
async function getMatchingOutputs(
    input: MAGE.InputInteractionInterface,
    outputs: MAGE.InteractionInterface[],
    filters: MAGE.FiltersInterface): Promise<MAGE.InteractionInterface[]> {
        if (filters.onlySameType) {
            outputs = outputs.filter(element => Filters.sameType(input, element));
        }
        if (filters.onlySimilarNames && filters.similarityThresholdNames) {
            // since filter cannot by async, we have to filter manually.
            const newOutputs: MAGE.InteractionInterface[] = [];
            for (const element of outputs) {
                const filterResults = await Filters.similar(input.name, element.name, filters.similarityThresholdNames);
                if (filterResults) newOutputs.push(element);
            }
            return newOutputs;
        }
        if (filters.onlySimilarDescriptions && filters.similarityThresholdDescriptions) {
            // since filter cannot by async, we have to filter manually.
            const newOutputs: MAGE.InteractionInterface[] = [];
            for (const element of outputs) {
                const filterResults = await Filters.similarDescription((input.object as any).description,
                    (element.object as any).description, filters.similarityThresholdDescriptions);
                if (filterResults) newOutputs.push(element);
            }
            return newOutputs;
        }
        if (filters.semanticMatch) {
            outputs = outputs.filter(element => Filters.sameSemantics(input, element));
        }
    return outputs;
}
/** For a list of inputs, return all possible input/output combinations
 * 
 * @param {MAGE.InputInteractionInterface[]} inputs an array containing all inputs
 * @param {MAGE.GenerationFormInterface} form an object representing the generation form
 * @returns {MAGE.InteractionInterface[][]} a 2-dimensional array containing the input-output combinations
 */
function getFinalCombinations(inputs: MAGE.InputInteractionInterface[], form: MAGE.GenerationFormInterface): MAGE.InteractionInterface[][] {
    let interactionCombinations: MAGE.InteractionInterface[][] = [];
    // calculate all input combinations
    let allInputCombinations: MAGE.InputInteractionInterface[][] = [];
    for (let i = form.minInputs; i <= form.maxInputs; i++) {
        if (i > inputs.length) break;
        allInputCombinations.push(...Combinatorics.bigCombination(inputs, i).toArray());
    }
    // filter input combinations that have more things than allowed
    if (form.maxThings && form.maxThings > 0) allInputCombinations = allInputCombinations.filter(inputs_c => {if (form.maxThings) return getNumberOfThings(inputs_c) <= form.maxThings; });
    // filtering of mixed template inputs
    if (!form.filters.allowMixedTemplates)  allInputCombinations = allInputCombinations.filter(inputs_c => isMixedInputTemplate(inputs_c));
    // filter input based on must-have interactions
    if (form.filters.mustHaveInteractions && form.filters.mustHaveInteractions.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if (form.filters.mustHaveInteractions) return mashupIncludesInteractions(mashup,
            form.filters.mustHaveInteractions.filter(i => i.type === 'property-read' || i.type === 'property-observe' || i.type === 'event-subscribe' || i.type === 'action-read')); });
    }
    // filter input based on must-have annotations
    if (form.filters.mustHaveAnnotations && form.filters.mustHaveAnnotations.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if (form.filters.mustHaveAnnotations) return mashupIncludesAnnotations(mashup,
            form.filters.mustHaveAnnotations.filter(a => a.type === 'property-read' || a.type === 'property-observe' || a.type === 'event-subscribe' || a.type === 'action-read')); });
    }
    // filter input based on must-have TD annotations
    if (form.filters.mustHaveTdAnnotations && form.filters.mustHaveTdAnnotations.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if (form.filters.mustHaveTdAnnotations) return mashupIncludesTdAnnotations(mashup,
            form.filters.mustHaveTdAnnotations.filter(a => a.type === 'input' || a.type === 'io'), form); });
    }
    allInputCombinations.forEach(inputs_c => {
        const availableOutputs: MAGE.InteractionInterface[][][] = [];
        inputs_c.forEach(input => {if (input.matchingOutputCombinations) availableOutputs.push(input.matchingOutputCombinations); });
        Utils.modifiedCartesianProduct(...availableOutputs)
        .filter(outputs_c => (outputs_c.length <= form.maxOutputs) && (outputs_c.length >= form.minOutputs))
        .forEach(outputs_c => {
            interactionCombinations.push([...inputs_c, ...outputs_c]);
        });
    });
    // filter final combinations that have more things than allowed
    if (form.maxThings && form.maxThings > 0) interactionCombinations = interactionCombinations.filter( mashup => {if (form.maxThings) return getNumberOfThings(mashup) <= form.maxThings; });
    // filter based on must-have interactions
    if (form.filters.mustHaveInteractions && form.filters.mustHaveInteractions.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if (form.filters.mustHaveInteractions) return mashupIncludesInteractions(mashup, form.filters.mustHaveInteractions); });
    }
    // filter-based on must-have annotations
    if (form.filters.mustHaveAnnotations && form.filters.mustHaveAnnotations.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if (form.filters.mustHaveAnnotations) return mashupIncludesAnnotations(mashup, form.filters.mustHaveAnnotations); });
    }
    // filter-based on must-have TD annotations
    if (form.filters.mustHaveTdAnnotations && form.filters.mustHaveTdAnnotations.length > 0) {
        interactionCombinations = interactionCombinations.filter(mashup => {if (form.filters.mustHaveTdAnnotations) return mashupIncludesTdAnnotations(mashup, form.filters.mustHaveTdAnnotations, form); });
    }
    return interactionCombinations;
}

/** Check if a mashup includes a specific interaction or not
 * 
 * @param {MAGE.InteractionInterface[]} mashup an array of the mashup's interactions
 * @param {MAGE.VueInteractionInterface[]} mustHaveInteractions an array of the interactions that must be included in the mashup
 * @returns {boolean} returns `true` if the mashup contains all interactions in `mustHaveInteractions`, otherwise returns `false`
 */
function mashupIncludesInteractions(mashup: MAGE.InteractionInterface[], mustHaveInteractions: MAGE.VueInteractionInterface[]): boolean {
    let isIncluded: boolean = true;
    for (const mustHaveInteraction of mustHaveInteractions) {
        for (const [index, interaction] of mashup.entries()) {
            if (interaction.thingId ===  mustHaveInteraction.thingId && interaction.name === mustHaveInteraction.name &&
                interaction.interactionType === mustHaveInteraction.type) break;
            if (index === mashup.length - 1) isIncluded = false;
        }
    }
    return isIncluded;
}

/** Checks if a mashup includes at least one interaction from TDs annotated with top-level annotations
 * 
 * @param {MAGE.InteractionInterface[]} mashup an array containing the interactions of the mashup
 * @param {MAGE.VueAnnotationInterface[]} mustHaveTdAnnotations an array containing the must-have top-level annotations
 * @param {MAGE.GenerationFormInterface} form the generation form
 * @returns {boolean} returns `true` if the mashup contains at least one interaction for each top-level annotation specified in `mustHaveTdAnnotations`, otherwise returns `false`
 */
function mashupIncludesTdAnnotations(
    mashup: MAGE.InteractionInterface[],
    mustHaveTdAnnotations: MAGE.VueAnnotationInterface[],
    form: MAGE.GenerationFormInterface): boolean {
        let isIncluded: boolean = true;
        for (const mustHaveTdAnnotation of mustHaveTdAnnotations) {
            innerLoop: for (const [index, interaction] of mashup.entries()) {
                let resultTd: WADE.TDElementInterface | WADE.MashupElementInterface | undefined;
                let parsedTd = null;
                let types: string | string[] | undefined;
                switch (interaction.interactionType) {
                    case 'property-read':
                    case 'property-observe':
                    case 'action-read':
                    case 'event-subscribe':
                        resultTd = form.things.inputs.find(td => {if (td.content) return JSON.parse(td.content).id === interaction.thingId; });
                        if (resultTd && resultTd.content) parsedTd = JSON.parse(resultTd.content);
                        if (parsedTd) types = parsedTd['@type'];
                        if (!types) types = [];
                        if (typeof types === 'string') types = [types];
                        if (types.includes(mustHaveTdAnnotation.annotation)) break innerLoop;
                        break;

                    case 'property-write':
                    case 'action-invoke':
                        resultTd = form.things.outputs.find(td => {if (td.content) return JSON.parse(td.content).id === interaction.thingId; });
                        if (resultTd && resultTd.content) parsedTd = JSON.parse(resultTd.content);
                        if (parsedTd) types = parsedTd['@type'];
                        if (!types) types = [];
                        if (typeof types === 'string') types = [types];
                        if (types.includes(mustHaveTdAnnotation.annotation)) break innerLoop;
                        break;
                }
                if (index === mashup.length - 1) isIncluded = false;
            }
            if (!isIncluded) return isIncluded;
        }
        return isIncluded;
}

/** Checks if a mashup includes interactions that are annotated with a set of specified annotations
 * 
 * @param {MAGE.InteractionInterface[]} mashup an array containing the interactions of the mashup
 * @param {MAGE.VueAnnotationInterface[]} mustHaveAnnotations an array containing the must-have interaction-annotation 
 * @returns {boolean} returns `true` if there is at least one interaction for each annotation in `mustHaveAnnotations`, otherwise returns `false`
 */
function mashupIncludesAnnotations(mashup: MAGE.InteractionInterface[],
                                   mustHaveAnnotations: MAGE.VueAnnotationInterface[]): boolean {
        let isIncluded: boolean = true;
        for (const mustHaveAnnotation of mustHaveAnnotations) {
            for (const [index, interaction] of mashup.entries()) {
                let interactionAnnotations = interaction.object['@type'];
                if (!interactionAnnotations) interactionAnnotations = [];
                if (typeof interactionAnnotations === 'string') interactionAnnotations = [interactionAnnotations];
                if (interactionAnnotations.some(a => {return mustHaveAnnotation.annotation === a &&
                    mustHaveAnnotation.type === interaction.interactionType; })) break;
                if (index === mashup.length - 1) isIncluded = false;
            }
            if (!isIncluded) return isIncluded;
        }
        return isIncluded;
}

/** Checks if a mashup uses mixed input templates (uses different types of input interactions)
 * 
 * @param {MAGE.InputInteractionInterface[]} inputs array of input interactions
 * @returns {boolean} returns `true` if mashup uses mixed input templates, else returns `false`
 */
function isMixedInputTemplate(inputs: MAGE.InputInteractionInterface[]): boolean {
    let template: string = '';
    for (const [index, input] of inputs.entries()) {
        if (index === 0) {template = input.interactionType; continue; }
        if (input.interactionType !== template) return false;
        if (index === inputs.length - 1) return true;
    }
    return true;
}

/** Returns the number of Things that participate in a given list on interactions
 * 
 * @param {MAGE.InteractionInterface[]} interactions an array containing the interactions
 * @returns {number} the number of Things participating in `interactions`
 */
function getNumberOfThings(interactions: MAGE.InteractionInterface[]): number {
    const thingIds: string[] = [];
    interactions.forEach(inter => {
        if (!thingIds.includes(inter.thingId)) thingIds.push(inter.thingId);
    });
    return thingIds.length;
}

/** Generates an mermaid.js textual code for sequence diagram representation of the mashup
 *
 * @param {{mashupName: string, interactions: MAGE.InteractionInterface[], numberOfInputInteractions: number, numberOfOutputInteractions: number}} mashupObject - an object containing the mashup and additional metadata (mashup name, number of input and output interactions)
 * @returns {string} an SD-compliant PlantUML textual code for a mashup
 */
function generateMermaidSeqDiagram(mashupObject: {mashupName: string, interactions: MAGE.InteractionInterface[], numberOfInputInteractions: number, numberOfOutputInteractions: number}): string {
    let seqDiagram = 'sequenceDiagram\n';
    const interactions = mashupObject.interactions;
    let inputsDone = 0;
    let outputsDone = 0;
    interactions.forEach( interaction => {
        // Determine interaction label and return path
        if (interaction.interactionType === 'property-read') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : readProperty: "${interaction.name}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'action-read') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : invokeAction: "${interaction.name}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'event-subscribe') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : subscribeEvent: "${interaction.name}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'property-observe') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->>+ ${interaction.to} : observeProperty: "${interaction.name}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'property-write') {
            if (outputsDone == 0) seqDiagram += `par\n`;
            if (outputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->> ${interaction.to} : writeProperty: "${interaction.name}"\n`;
            outputsDone++;
            if (outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === 'action-invoke') {
            if (outputsDone == 0) seqDiagram += `par\n`;
            if (outputsDone > 0) seqDiagram += `and\n`;
            seqDiagram += `${interaction.from} ->> ${interaction.to} : invokeAction: "${interaction.name}"\n`;
            outputsDone++;
            if (outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        }


        // determine return path
        if (interaction.interactionType === 'property-read') {
            seqDiagram += `${interaction.to} -->>- ${interaction.from} : response\n`;
            if (inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === 'event-subscribe' || interaction.interactionType === 'property-observe') {
            seqDiagram += `${interaction.to} -->> ${interaction.from} : confirmation\n`;
            seqDiagram += `${interaction.to} ->>- ${interaction.from} : data-pushed\n`;
            if (inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === 'action-read') {
            seqDiagram += `${interaction.to} -->>- ${interaction.from} : output\n`;
            if (inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        }
    });
    seqDiagram += '\n';
    return seqDiagram;
}

/** Generates an SD-compliant PlantUML textual code for a mashup
 *
 * @param {{mashupName: string, interactions: MAGE.InteractionInterface[], numberOfInputInteractions: number, numberOfOutputInteractions: number}} mashupObject - an object containing the mashup and additional metadata (mashup name, number of input and output interactions)
 * @returns {string} an SD-compliant PlantUML textual code for a mashup
 */
function generatePlantUmlSeqDiagram(mashupObject: {mashupName: string, interactions: MAGE.InteractionInterface[], numberOfInputInteractions: number, numberOfOutputInteractions: number}): string {
    let seqDiagram = `@startuml ${mashupObject.mashupName}\n`;
    seqDiagram += `[->"Agent": top:${mashupObject.mashupName}()\nactivate "Agent"\n`;
    seqDiagram += 'group strict\n';
    const interactions = mashupObject.interactions;
    let inputsDone = 0;
    let outputsDone = 0;
    interactions.forEach( interaction => {
        // Determine interaction label and return path
        if (interaction.interactionType === 'property-read') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : readProperty: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'action-read') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : invokeAction: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'event-subscribe') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : subscribeEvent: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'property-observe') {
            if (inputsDone == 0) seqDiagram += `par\n`;
            if (inputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : observeProperty: "${interaction.name}"\n`;
            seqDiagram += `activate "${interaction.to}"\n`;
            inputsDone++;
        } else if (interaction.interactionType === 'property-write') {
            if (outputsDone == 0) seqDiagram += `par\n`;
            if (outputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : writeProperty: "${interaction.name}"\n`;
            outputsDone++;
            if (outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === 'action-invoke') {
            if (outputsDone == 0) seqDiagram += `par\n`;
            if (outputsDone > 0) seqDiagram += `else\n`;
            seqDiagram += `"${interaction.from}" -> "${interaction.to}" : invokeAction: "${interaction.name}"\n`;
            outputsDone++;
            if (outputsDone == mashupObject.numberOfOutputInteractions) seqDiagram += `end\n`;
        }


        // determine return path
        if (interaction.interactionType === 'property-read') {
            seqDiagram += `"${interaction.to}" --> "${interaction.from}" : response\n`;
            seqDiagram += `deactivate "${interaction.to}"\n`;
            if (inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === 'event-subscribe' || interaction.interactionType === 'property-observe') {
            seqDiagram += `"${interaction.to}" --> "${interaction.from}" : confirmation\n`;
            seqDiagram += `"${interaction.to}" ->> "${interaction.from}" : data-pushed\n`;
            if (inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        } else if (interaction.interactionType === 'action-read') {
            seqDiagram += `"${interaction.to}" --> "${interaction.from}" : response\n`;
            seqDiagram += `deactivate "${interaction.to}"\n`;
            if (inputsDone == mashupObject.numberOfInputInteractions) seqDiagram += `end\n`;
        }
    });
    seqDiagram += `end\n[<-"Agent"\ndeactivate "Agent"\n`;
    seqDiagram += '@enduml\n';
    return seqDiagram;
}

/** Calculates size of design space, i.e. how many mashups would be possible without any rules or filters
 * 
 * @param {MAGE.GenerationFormInterface} generationForm an object representation of the generation form
 * @returns {number} the maximum number of mashups that can be generated
 */
function getDesignSpaceSize(generationForm: MAGE.GenerationFormInterface): number {
    let designSpaceSize = 0;
    let nInputs = 0;
    let nOutputs = 0;
    const things = generationForm.things;

    const tdIds: string[] = [];
    const uniqueTds: WADE.TDElementInterface[] = [];
    things.inputs.concat(things.outputs).forEach(td => {
        if (!tdIds.includes(td.id)) {
            uniqueTds.push(td);
            tdIds.push(td.id);
        }
    });

    things.inputs.forEach(element => {
        let parsedTd: any;
        if (!element.content) return;
        parsedTd = JSON.parse(element.content);
        for (const prop in parsedTd.properties) {
            if (parsedTd.properties[prop].writeOnly) continue;
            nInputs++;
            if (parsedTd.properties[prop].observable) nInputs++;
        }
        if (parsedTd.actions) nInputs += Object.keys(parsedTd.actions).length;
        if (parsedTd.events) nInputs += Object.keys(parsedTd.events).length;
    });

    things.outputs.forEach(element => {
        let parsedTd: any;
        if (!element.content) return;
        parsedTd = JSON.parse(element.content);
        for (const prop in parsedTd.properties) {
            if (parsedTd.properties[prop].readOnly) continue;
            nOutputs++;
        }
        if (parsedTd.actions) nOutputs += Object.keys(parsedTd.actions).length;
    });

    let max_k = generationForm.maxInputs + generationForm.maxOutputs;
    const min_k =  generationForm.minInputs + generationForm.minOutputs;
    const nTotal = nInputs + nOutputs;
    if (max_k > nTotal) max_k = nTotal;
    for (let i = generationForm.minInputs; i <= generationForm.maxInputs; i++) {
        for (let j = generationForm.minOutputs; j <= generationForm.maxOutputs; j++)
        designSpaceSize += (Utils.factorial(nInputs) * Utils.factorial(nOutputs)) / (Utils.factorial(i) * Utils.factorial(j) * Utils.factorial(nInputs - i) * Utils.factorial(nOutputs - j));
    }

    return Math.round(designSpaceSize);
}

/** A function that generates mashups based on TDs, filters, and constraints specified in the generation form
 * 
 * @param {MAGE.GenerationFormInterface} generationForm an object representation of the generation form
 * @returns {Promise<MAGE.MashupGenerationResult>} a Promise containing the results of the mashup generation encapsulated in an object. `designSpaceSize` contains the maximum number of mashups that can be generated. `mashupsGenerated` is the number of generated mashups. `imagesMD` is an array containing the strings used for mermaid.js. `plantUmls` is an array containing PlantUML textual code. `mashups` is a 2-dimensional array containing all generated mashups as arrays of interactions.
 */
export default async function generateMashups(generationForm: MAGE.GenerationFormInterface): Promise<MAGE.MashupGenerationResult> {
    // let start = hrtime.bigint();
    const start = hrtime();
    const interactionCombinations = await generateInteractionCombinations(generationForm);
    const designSpaceSize = getDesignSpaceSize(generationForm);

    const imagesMDs: string[] = [];
    const plantUmls: string[] = [];
    for (const combi of interactionCombinations) {
        let numberOfInputInteractions = 0;
        let numberOfOutputInteractions = 0;
        for (const interaction of combi) {
            switch (interaction.interactionType) {
                case 'property-read':
                case 'event-subscribe':
                case 'action-read':
                case 'property-observe':
                    numberOfInputInteractions++; break;
                case 'property-write':
                case 'action-invoke':
                    numberOfOutputInteractions++; break;
            }
        }
        const combiObject = {
            mashupName: generationForm.mashupName,
            interactions: combi,
            numberOfInputInteractions,
            numberOfOutputInteractions
        };
        const mermaidUml = generateMermaidSeqDiagram(combiObject);
        imagesMDs.push(mermaidUml);
        const plantUml = generatePlantUmlSeqDiagram(combiObject);
        plantUmls.push(plantUml);
    }

    const end = hrtime(start);
    // let end = hrtime.bigint();
    const totalMashups =  interactionCombinations.length;

    const results = {
        designSpaceSize,
        mashupsGenerated: totalMashups,
        imagesMDs,
        plantUmls,
        mashups: interactionCombinations,
        executionTime: end
    };

    return results;
}

/** A class of the GenerationForm 
 * 
 */
export class GenerationForm implements MAGE.GenerationFormInterface {
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
        'use-event-template': boolean;
        'use-action-template': boolean;
        'use-read-template': boolean;
    };
    public filters: {
          acceptedTypes: string[],
          allowMixedTemplates: boolean,
          acceptedOutputInteractionTypes: string[],
          onlySameType: boolean,
          onlySimilarNames: boolean,
          onlySimilarDescriptions: boolean,
          similarityThresholdNames: number | null,
          similarityThresholdDescriptions: number | null,
          semanticMatch: boolean
    };
    public generation: {
          generateCode: boolean,
          includeFunctionSkeletons: boolean
    };
    /**
     * @constructor
     */
    constructor() {
        this.mashupName = '';
        this.things = {
            inputs: [],
            outputs: [],
        };
        this.minInputs = 1,
        this.maxInputs = 1,
        this.minOutputs = 1,
        this.maxOutputs = 1,
        this.maxThings = null,
        this.templates = {
            'use-event-template': true,
            'use-action-template': false,
            'use-read-template': true,
        },
        this.filters = {
            acceptedTypes: [],
            acceptedOutputInteractionTypes: [],
            onlySameType: false,
            onlySimilarNames: false,
            onlySimilarDescriptions: false,
            similarityThresholdNames: null,
            similarityThresholdDescriptions: null,
            semanticMatch: false,
            allowMixedTemplates: false,

        },
        this.generation = {
            generateCode: false,
            includeFunctionSkeletons: false
        };
    }
}
