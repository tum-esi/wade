import { Mashup, TD } from '@/lib/classes';
import generateMashups from "@/backend/MaGe/generator";
import generateCode from "@/backend/MaGe/codeGenerator";

export default {
    namespaced: true,
    state: {
        // ===== STATIC STORE STATE ===== //
        mashupTabbar: [
            {
                tabId: 'editor',
                tabTitle: 'Editor',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/editor',
                tabIsActive: false
            },
            {
                tabId: 'mage',
                tabTitle: 'MaGe',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/mage',
                iconSrcPath: 'mage',
                tabIsActive: false
            }
        ],
        // ===== DYNAMIC STORE STATE ===== //
        isTabSelected: false,
        resultReady: false,
        numberOfActiveTabs: 0,
        mashupTd: "",
        currentMashup: null as Mashup | null,
        inputs:     null as Array<TD|Mashup> | null,
        outputs:    null as Array<TD|Mashup> | null,
        ios:        null as Array<TD|Mashup> | null,
        allInteractions: {propertyReads: [], propertyWrites: [], eventSubs:[], actionReads:[], actionInvokes: []},
        allAnnotations: {propertyReads: [], propertyWrites: [], eventSubs:[], actionReads:[], actionInvokes: []},
        generationForm: null as MAGE.GenerationFormInterace | null,
        result: null as Object | null
    },
    getters: {
        getMashupTd(state: any): string {
            return state.mashupTd;
        },
        getMashupTabbar(state: any) {
            return state.mashupTabbar;
        },
        getMashupChildren(state): Array<TD | Mashup> {
            return (state.currentMashup as Mashup).children;
        },
        getMashupChildrenForDropdown(state): Array<TD|Mashup> | null{
            const mashup = state.currentMashup as Mashup;
            const result = [] as any;
            for (const element of mashup.children) {
                result.push({title: element.id, key: element.id});
            }
            return result;
        },
        getInputsIds(state): string[] {
            const ids: string[] = [];
            for (const input of state.inputs as Array<TD|Mashup>) {
                ids.push(input.id);
            }
            return ids;
        },
        getOutputsIds(state): string[] {
            const ids: string[] = [];
            for (const output of state.outputs as Array<TD|Mashup>) {
                ids.push(output.id);
            }
            return ids;
        },
        getIosIds(state): string[] {
            const ids: string[] = [];
            for (const io of state.ios as Array<TD|Mashup>) {
                ids.push(io.id);
            }
            return ids;
        },
        getResult(state) {
            return state.result;
        },
        getAllInteractions(state){
            return state.allInteractions;
        },
        getAllAnnotations(state){
            return state.allAnnotations;
        },
        getPropertyReads(state) {
            return state.allInteractions.propertyReads;
        },
        getPropertyWrites(state) {
            return state.allInteractions.propertyWrites;
        },
        getEventSubs(state) {
            return state.allInteractions.eventSubs;
        },
        getActionReads(state) {
            return state.allInteractions.actionReads;
        },
        getActionInvokes(state){
            return state.allInteractions.actionInvokes;
        },
        getPropertyReadAnnotations(state) {
            return state.allAnnotations.propertyReads;
        },
        getPropertyWriteAnnotations(state) {
            return state.allAnnotations.propertyWrites;
        },
        getEventSubAnnotations(state) {
            return state.allAnnotations.eventSubs;
        },
        getActionReadAnnotations(state) {
            return state.allAnnotations.actionReads;
        },
        getActionInvokeAnnotations(state){
            return state.allAnnotations.actionInvokes;
        },
        isResultReady(state) {
            return state.resultReady;
        },
        isMashupSelected(state): boolean {
            return state.isMashupSelected;
        },
    },
    actions: {
        async generateMashups({commit, state},
            generationPayload: {
                generationForm: MAGE.GenerationFormInterace, 
            }) {
                let inputs: (TD|Mashup)[] = [];
                let outputs: (TD|Mashup)[] = [];
                inputs.push(...state.inputs);
                outputs.push(...state.outputs);
                
                generationPayload.generationForm.things.inputs = inputs;
                generationPayload.generationForm.things.outputs = outputs;
                for (let io of state.ios){
                    generationPayload.generationForm.things.inputs.push(io);
                    generationPayload.generationForm.things.outputs.push(io);
                }
                let forbiddenInteractions: MAGE.VueInteractionInterface[] = [];
                let mustHaveInteractions: MAGE.VueInteractionInterface[] = [];
                for(let interactionType in state.allInteractions) {
                    for(let interaction of state.allInteractions[interactionType]) {
                        switch (interaction.restriction) {
                            case "forbidden":
                                forbiddenInteractions.push(interaction);
                                break;
                            case "mustHave":
                                mustHaveInteractions.push(interaction);
                                break;
                            case "none":
                                continue;
                            default:
                                break;
                        }
                    }
                }
                let forbiddenAnnotations: MAGE.VueAnnotationInterface[] = [];
                let mustHaveAnnotations: MAGE.VueAnnotationInterface[] = [];
                for(let interactionType in state.allAnnotations) {
                    for(let annotation of state.allAnnotations[interactionType]) {
                        switch (annotation.restriction) {
                            case "forbidden":
                                forbiddenAnnotations.push(annotation);
                                break;
                            case "mustHave":
                                mustHaveAnnotations.push(annotation);
                                break;
                            case "none":
                                continue;
                            default:
                                break;
                        }
                    }
                }

                generationPayload.generationForm.filters.forbiddenInteractions = forbiddenInteractions;
                generationPayload.generationForm.filters.mustHaveInteractions = mustHaveInteractions;
                generationPayload.generationForm.filters.forbiddenAnnotations = forbiddenAnnotations;
                generationPayload.generationForm.filters.mustHaveAnnotations = mustHaveAnnotations;
                commit('setResultReady', false);
                commit('setGenerationForm', generationPayload.generationForm);
                generateMashups(generationPayload.generationForm).then((result) => {
                    commit('setResult', result);
                    commit('toggleResultReady');
                });
        },
        async generateMashupCode({commit, state}, mashupNr: number) {
            let gen = {"mashup": state.result.mashups[mashupNr], "tds": {}};

            // get all relevant TDs for the selected mashup
            let idsUsed: string[] = []
            let outputs = state.generationForm.things.outputs;
            let inputs = state.generationForm.things.inputs;
            gen.mashup.forEach(element => {
                if (!idsUsed.includes(element.thingId)) idsUsed.push(element.thingId);
            });
            outputs.concat(inputs).forEach(td => {
                let parsedTd = JSON.parse((td as WADE.TDElementInterface).content);
                if (idsUsed.includes(parsedTd.id)) gen.tds[td.id] = td.content;
            });
            let mashupTd = generateCode(gen.mashup, Object.values(gen.tds));
            commit("setMashupTd", mashupTd);
            commit("setTabActive", "editor");


        }
    },
    mutations: {
        setMashupTd(state: any, mashupTd: string) {
            state.mashupTd = mashupTd;
        },
        setCurrentMashup(state: any, mashup: Mashup) {
            (state.currentMashup as Mashup) = mashup;
            (state.inputs as Array<TD|Mashup>) = [];
            (state.outputs as Array<TD|Mashup>) = [];
            (state.ios as Array<TD|Mashup>) = [];
            state.allInteractions = {
                propertyReads: [],
                propertyWrites: [],
                eventSubs: [],
                actionInvokes: [],
                actionReads: []
            }
            state.allAnnotations = {
                propertyReads: [],
                propertyWrites: [],
                eventSubs: [],
                actionInvokes: [],
                actionReads: []
            }
        },
        setGenerationForm(state: any, generationForm: MAGE.GenerationFormInterace){
            state.generationForm = generationForm;
        },
        setResult(state: any, result: object){
            state.result = result;
        },
        setResultReady(state: any, ready: boolean){
            state.resultReady = ready
        },
        addToInputs(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            for (const element of elementsFiltered) {
                if ((state.inputs as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            (state.inputs as Array<TD|Mashup>).push(...elementsFiltered);
            for (const element of elementsFiltered) {
                let indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromOutputs", indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromIos", indexToDelete);
                (this as any).commit("MashupStore/categorizeTdInteractions", {element: element, io:"input"});
            }
        },
        addToOutputs(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            for (const element of elementsFiltered) {
                if ((state.outputs as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            (state.outputs as Array<TD|Mashup>).push(...elementsFiltered);
            for (const element of elementsFiltered) {
                let indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromInputs", indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromIos", indexToDelete);
                (this as any).commit("MashupStore/categorizeTdInteractions", {element: element, io:"output"});
            }
        },
        addToIos(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            for (const element of elementsFiltered) {
                if ((state.ios as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            (state.ios as Array<TD|Mashup>).push(...elementsFiltered);
            for (const element of elementsFiltered) {
                let indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromInputs", indexToDelete);
                indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromOutputs", indexToDelete);
                (this as any).commit("MashupStore/categorizeTdInteractions", {element: element, io:"io"});
            }
        },
        categorizeTdInteractions(state: any, payload: {element: TD|Mashup, io: string}){
            let parsedTd = JSON.parse(payload.element.content);
            for(let prop in parsedTd.properties){
                let description = parsedTd.properties[prop].description ? parsedTd.properties[prop].description : null;
                let annotations = parsedTd.properties[prop]["@type"] as string | string[] | undefined;
                // put all annotations in string array
                if(typeof annotations == "string") annotations = [annotations];
                // construct VueAnnotation objects
                let readAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                let writeAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                if(annotations) for(let annotation of annotations) {
                    readAnnotationsToPush.push({
                        annotation: annotation,
                        type: 'property-read',
                        numberOfAccurance: 1,
                        restriction: "none"
                    });
                    writeAnnotationsToPush.push({
                        annotation: annotation,
                        type: 'property-write',
                        numberOfAccurance: 1,
                        restriction: "none"
                    });
                }
                // construct VueInteraction objects
                let readInteractionToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title, 
                    thingId: parsedTd.id, 
                    name: prop, 
                    description: description, 
                    type: "property-read",
                    restriction: "none" 
                }; 
                let writeInteractionToPush: MAGE.VueInteractionInterface= {
                    title: payload.element.title, 
                    thingId: parsedTd.id, 
                    name: prop,
                    description: description, 
                    type: "property-write",
                    restriction: "none"
                };
                if(payload.io == "input" && !parsedTd.properties[prop].writeOnly) {
                    // push interaction 
                    state.allInteractions.propertyReads.push(readInteractionToPush);
                    // push annotations if not already present
                    for(let annotation of readAnnotationsToPush) {
                        let index = state.allAnnotations.propertyReads.findIndex(a => {return a.annotation === annotation.annotation});
                        if(index !== -1) {
                            state.allAnnotations.propertyReads[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.propertyReads.push(annotation);
                        }
                    }
                }
                else if(payload.io == "output" && !parsedTd.properties[prop].readOnly) {
                    // push interaction 
                    state.allInteractions.propertyWrites.push(writeInteractionToPush);
                    // push annotations if not already present 
                    for(let annotation of writeAnnotationsToPush) {
                        let index = state.allAnnotations.propertyWrites.findIndex(a => {return a.annotation === annotation.annotation});
                        if(index !== -1) {
                            state.allAnnotations.propertyWrites[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.propertyWrites.push(annotation);
                        }
                    }
                }
                else if(payload.io == "io"){
                    if(!parsedTd.properties[prop].writeOnly) {
                        // push interaction 
                        state.allInteractions.propertyReads.push(readInteractionToPush);
                        // push annotations if not already present
                        for(let annotation of readAnnotationsToPush) {
                            let index = state.allAnnotations.propertyReads.findIndex(a => {return a.annotation === annotation.annotation});
                            if(index !== -1) {
                                state.allAnnotations.propertyReads[index].numberOfAccurance++;
                            } else {
                                state.allAnnotations.propertyReads.push(annotation);
                            }
                        }
                    }
                    if(!parsedTd.properties[prop].readOnly) {
                        // push interaction 
                        state.allInteractions.propertyWrites.push(writeInteractionToPush);
                        // push annotations if not already present
                        for(let annotation of writeAnnotationsToPush) {
                            let index = state.allAnnotations.propertyWrites.findIndex(a => {return a.annotation === annotation.annotation});
                            if(index !== -1) {
                                state.allAnnotations.propertyWrites[index].numberOfAccurance++;
                            } else {
                                state.allAnnotations.propertyWrites.push(annotation);
                            }
                        }
                    }
                }
            }
            for(let event in parsedTd.events){
                let description = parsedTd.events[event].description ? parsedTd.events[event].description : null;
                let annotations = parsedTd.events[event]["@type"] as string | string[] | undefined;
                // put all annotations in string array
                if(typeof annotations == "string") annotations = [annotations];
                // construct VueAnnotation objects
                let annotationsToPush: MAGE.VueAnnotationInterface[] = [];
                if(annotations) for(let annotation of annotations) {
                    annotationsToPush.push({
                        annotation: annotation,
                        type: 'event-subscribe',
                        numberOfAccurance: 1,
                        restriction: "none"
                    });
                }
                // construct VueInteraction objects
                let interactionToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title, 
                    thingId: parsedTd.id, name: event, 
                    description: description, 
                    type: "event-subscribe",
                    restriction: "none"
                };
                // push interaction 
                state.allInteractions.eventSubs.push(interactionToPush);
                // push annotations if not already present
                for(let annotation of annotationsToPush) {
                    let index = state.allAnnotations.eventSubs.findIndex(a => {return a.annotation === annotation.annotation});
                    if(index !== -1) {
                        state.allAnnotations.eventSubs[index].numberOfAccurance++;
                    } else {
                        state.allAnnotations.eventSubs.push(annotation);
                    }
                }
            }
            for(let action in parsedTd.actions){
                let description = parsedTd.actions[action].description ? parsedTd.actions[action].description : null;
                let annotations = parsedTd.actions[action]["@type"] as string | string[] | undefined;
                // put all annotations in string array
                if(typeof annotations == "string") annotations = [annotations];
                // construct VueAnnotation objects
                let readAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                let writeAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                if(annotations) for(let annotation of annotations) {
                    readAnnotationsToPush.push({
                        annotation: annotation,
                        type: 'action-read',
                        numberOfAccurance: 1,
                        restriction: "none"
                    });
                    writeAnnotationsToPush.push({
                        annotation: annotation,
                        type: 'action-invoke',
                        numberOfAccurance: 1,
                        restriction: "none"
                    });
                }
                // construct VueInteraction objects
                let actionInvokeToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title, 
                    thingId: parsedTd.id, 
                    name: action, 
                    description: description, 

                    type: "action-invoke",
                    restriction: "none"
                };
                let actionReadToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title, 
                    thingId: parsedTd.id, 
                    name: action, 
                    description: description, 
                    type: "action-read",
                    restriction: "none"
                };
                if(payload.io == "input") {
                    // push interaction
                    state.allInteractions.actionReads.push(actionReadToPush);
                    // push annotations if not already present
                    for(let annotation of readAnnotationsToPush) {
                        let index = state.allAnnotations.actionReads.findIndex(a => {return a.annotation === annotation.annotation});
                        if(index !== -1) {
                            state.allAnnotations.actionReads[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionReads.push(annotation);
                        }
                    }
                }
                else if(payload.io == "output") {
                    // push interaction
                    state.allInteractions.actionInvokes.push(actionInvokeToPush);
                    // push annotations if not already present
                    for(let annotation of writeAnnotationsToPush) {
                        let index = state.allAnnotations.actionInvokes.findIndex(a => {return a.annotation === annotation.annotation});
                        if(index !== -1) {
                            state.allAnnotations.actionInvokes[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionInvokes.push(annotation);
                        }
                    }
                }
                else if(payload.io == "io"){
                    // push interaction
                    state.allInteractions.actionReads.push(actionReadToPush);
                    // push interaction
                    state.allInteractions.actionInvokes.push(actionInvokeToPush);
                    // push annotations if not already present
                    for(let annotation of readAnnotationsToPush) {
                        let index = state.allAnnotations.actionReads.findIndex(a => {return a.annotation === annotation.annotation});
                        if(index !== -1) {
                            state.allAnnotations.actionReads[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionReads.push(annotation);
                        }
                    }

                    for(let annotation of writeAnnotationsToPush) {
                        let index = state.allAnnotations.actionInvokes.findIndex(a => {return a.annotation === annotation.annotation});
                        if(index !== -1) {
                            state.allAnnotations.actionInvokes[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionInvokes.push(annotation);
                        }
                    }
                }
            }
        },
        setInteractionRestriction(state: any, payload: {interaction: MAGE.VueInteractionInterface, restriction: "none" | "forbidden" | "mustHave"}){
            let index: number;
            let interaction = payload.interaction;
            let restriction = payload.restriction;
            switch(interaction.type) {
                case "property-read":
                    index = (state.allInteractions.propertyReads as MAGE.VueInteractionInterface[]).findIndex(prop => prop.thingId === interaction.thingId &&
                        prop.name === interaction.name);
                    if(index !== -1) (state.allInteractions.propertyReads as MAGE.VueInteractionInterface[])[index].restriction = restriction;
                case "property-write":
                    index = (state.allInteractions.propertyWrites as MAGE.VueInteractionInterface[]).findIndex(prop => prop.thingId === interaction.thingId &&
                        prop.name === interaction.name);
                    if(index !== -1) (state.allInteractions.propertyWrites as MAGE.VueInteractionInterface[])[index].restriction = restriction;
                case "event-subscribe":
                    index = (state.allInteractions.eventSubs as MAGE.VueInteractionInterface[]).findIndex(event => event.thingId === interaction.thingId &&
                        event.name === interaction.name);
                    if(index !== -1) (state.allInteractions.eventSubs as MAGE.VueInteractionInterface[])[index].restriction = restriction;
                case "action-invoke":
                    index = (state.allInteractions.actionInvokes as MAGE.VueInteractionInterface[]).findIndex(action => action.thingId === interaction.thingId &&
                        action.name === interaction.name);
                    if(index !== -1) (state.allInteractions.actionInvokes as MAGE.VueInteractionInterface[])[index].restriction = restriction;
                case "action-read":
                        index = (state.allInteractions.actionReads as MAGE.VueInteractionInterface[]).findIndex(action => action.thingId === interaction.thingId &&
                            action.name === interaction.name);
                        if(index !== -1) (state.allInteractions.actionReads as MAGE.VueInteractionInterface[])[index].restriction = restriction;
            }
            
        },
        setAnnotationRestriction(state: any, payload: {annotation: MAGE.VueAnnotationInterface, restriction: "none" | "forbidden" | "mustHave"}){
            let index: number;
            let annotation = payload.annotation;
            let restriction = payload.restriction;
            switch(annotation.type) {
                case "property-read":
                    index = (state.allAnnotations.propertyReads as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if(index !== -1) (state.allAnnotations.propertyReads as MAGE.VueAnnotationInterface[])[index].restriction = restriction;
                case "property-write":
                    index = (state.allAnnotations.propertyWrites as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if(index !== -1) (state.allAnnotations.propertyWrites as MAGE.VueAnnotationInterface[])[index].restriction = restriction;
                case "event-subscribe":
                    index = (state.allAnnotations.eventSubs as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if(index !== -1) (state.allAnnotations.eventSubs as MAGE.VueAnnotationInterface[])[index].restriction = restriction;
                case "action-invoke":
                    index = (state.allAnnotations.actionInvokes as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if(index !== -1) (state.allAnnotations.actionInvokes as MAGE.VueAnnotationInterface[])[index].restriction = restriction;
                case "action-read":
                    index = (state.allAnnotations.actionReads as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if(index !== -1) (state.allAnnotations.actionReads as MAGE.VueAnnotationInterface[])[index].restriction = restriction;
            }   
        },
        removeFromInputs(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (this as any).commit("MashupStore/removeInteractions", state.inputs[element]);
                (state.inputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit("MashupStore/removeInteractions", element);
                const indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                (state.inputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromOutputs(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (this as any).commit("MashupStore/removeInteractions", state.outputs[element]);
                (state.outputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit("MashupStore/removeInteractions", element);
                const indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                (state.outputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromIos(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (this as any).commit("MashupStore/removeInteractions", state.ios[element]);
                (state.ios as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit("MashupStore/removeInteractions", element);
                const indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                (state.ios as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeInteractions(state: any, element: TD|Mashup){
            let parsedTd = JSON.parse(element.content);
            function removeAnnotations(
                interaction: MAGE.VueInteractionInterface,
                type: "properties" | "events" | "actions",
                category: "propertyReads" | "propertyWrites" | "eventSubs" | "actionReads" | "actionInvokes") {
                    let interactionName = interaction.name
                    let annotations = parsedTd[type][interactionName]["@type"] as string | string[] | undefined;
                    // put all annotations in string array
                    if(typeof annotations == "string") annotations = [annotations];
                    if(annotations) {
                        for(let annotation of annotations) {
                            let aIndex = state.allAnnotations[category].findIndex(a => {return a.annotation === annotation});
                            if(aIndex !== -1) {
                                state.allAnnotations[category][aIndex].numberOfAccurance = --state.allAnnotations[category][aIndex].numberOfAccurance;
                                if(state.allAnnotations[category][aIndex].numberOfAccurance === 0) state.allAnnotations[category].splice(aIndex, 1);
                            } 
                            
                        }
                    }
            }
            let index = 0;
            for(index = 0; index < state.allInteractions.propertyReads.length; index++) {
                if(state.allInteractions.propertyReads[index].thingId === parsedTd.id) {
                    let prop = state.allInteractions.propertyReads[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(prop, "properties", "propertyReads");
                    state.allInteractions.propertyReads.splice(index,1); 
                    index--
                };
            }
            for(index = 0; index < state.allInteractions.propertyWrites.length; index++) {
                if(state.allInteractions.propertyWrites[index].thingId === parsedTd.id) {
                    let prop = state.allInteractions.propertyWrites[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(prop, "properties", "propertyWrites");
                    state.allInteractions.propertyWrites.splice(index,1); 
                    index--;
                };
            }
            for(index = 0; index < state.allInteractions.eventSubs.length; index++) {
                if(state.allInteractions.eventSubs[index].thingId === parsedTd.id) {
                    let event = state.allInteractions.eventSubs[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(event, "events", "eventSubs");
                    state.allInteractions.eventSubs.splice(index,1);
                    index--;
                };
            }
            for(index = 0; index < state.allInteractions.actionInvokes.length; index++) {
                if(state.allInteractions.actionInvokes[index].thingId === parsedTd.id) {
                    let action = state.allInteractions.actionInvokes[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(action, "actions", "actionInvokes");
                    state.allInteractions.actionInvokes.splice(index,1);
                    index--;
                };
            }
            for(index = 0; index < state.allInteractions.actionReads.length; index++) {
                if(state.allInteractions.actionReads[index].thingId === parsedTd.id) {
                    let action = state.allInteractions.actionReads[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(action, "actions", "actionReads");
                    state.allInteractions.actionReads.splice(index,1);
                    index--;
                };
            }
        },
        toggleTab(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    tab.tabIsActive = !tab.tabIsActive;
                    state.numberOfActiveTabs = tab.tabIsActive ? ++state.numberOfActiveTabs : --state.numberOfActiveTabs;
                    break;
                }
            }
        },
        toggleResultReady(state) {
            state.resultReady = !state.resultReady;
        },
        setTabActive(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId){
                    if(tab.tabIsActive == true) return;
                    tab.tabIsActive = true;
                    ++state.numberOfActiveTabs;
                    break;
                }    
            }
        },
        setTabInactive(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    if(tab.tabIsActive == false) return;
                    tab.tabIsActive = false;
                    --state.numberOfActiveTabs
                    break;
                }
            }
        }
    }
};
